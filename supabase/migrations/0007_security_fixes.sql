-- ==============================================================================
-- 0007_security_fixes.sql
-- PawMart POS - Perbaikan Keamanan Kritis, Privilese Akses, RLS, & Hardening RPC
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STRUKTUR: TAMBAH max_cashier_discount_percent PADA store_settings
-- ------------------------------------------------------------------------------
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS max_cashier_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00 
CHECK (max_cashier_discount_percent >= 0 AND max_cashier_discount_percent <= 100);

COMMENT ON COLUMN public.store_settings.max_cashier_discount_percent IS 'Batas persentase diskon manual maksimal yang diizinkan untuk kasir tanpa persetujuan Admin';

-- ------------------------------------------------------------------------------
-- 2. KRITIS #1: handle_new_user TIDAK BOLEH MEMBACA ROLE DARI METADATA CLIENT
-- Seluruh user baru diwajibkan role 'kasir'. Kenaikan ke admin hanya via SQL.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    -- KEAMANAN KRITIS: Selalu tetapkan role 'kasir' untuk user baru.
    -- Abaikan raw_user_meta_data->>'role' untuk mencegah eskalasi hak akses (privilege escalation).
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, full_name, role, phone, is_active)
    VALUES (NEW.id, v_full_name, 'kasir', NEW.raw_user_meta_data->>'phone', true)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Pasang ulang trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. KRITIS #2: CEGAH MODIFIKASI role & is_active PADA profiles KECUALI OLEH ADMIN
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika role atau status aktif mengalami perubahan:
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
        IF public.get_my_role() != 'admin' THEN
            RAISE EXCEPTION 'Akses ditolak: Hanya Admin yang berhak mengubah role atau status aktif akun pengguna.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- ------------------------------------------------------------------------------
-- 4. TINGGI #5: PROTEKSI PERUBAHAN POIN, TOTAL_SPENT, & TIER PADA customers
-- Hanya diizinkan melalui panggilan internal fungsi RPC atau oleh role Admin
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_customer_loyalty_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_is_internal TEXT;
BEGIN
    IF (NEW.points IS DISTINCT FROM OLD.points OR 
        NEW.total_spent IS DISTINCT FROM OLD.total_spent OR 
        NEW.tier IS DISTINCT FROM OLD.tier) THEN
        
        -- Cek flag internal yang diset dalam transaksi RPC
        v_is_internal := current_setting('pawmart.internal_call', true);
        
        IF v_is_internal = 'true' OR public.get_my_role() = 'admin' THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Akses ditolak: Poin, total belanja, dan tier pelanggan hanya dapat diperbarui secara otomatis lewat transaksi kasir resmi atau oleh Admin.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_customer_loyalty_fields ON public.customers;
CREATE TRIGGER trg_protect_customer_loyalty_fields
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.protect_customer_loyalty_fields();

-- ------------------------------------------------------------------------------
-- 5. TINGGI #4: BATASI SELECT TABEL products & transaction_items HANYA KE ADMIN
-- & BUAT VIEW DEFINER AMAN (TANPA buy_price) UNTUK KASIR & DASHBOARD
-- ------------------------------------------------------------------------------

-- Cabut akses SELECT publik ke tabel products fisik, batasi ke admin saja
DROP POLICY IF EXISTS "products_read_all" ON public.products;
DROP POLICY IF EXISTS "products_select_admin_only" ON public.products;
CREATE POLICY "products_select_admin_only"
ON public.products FOR SELECT
TO authenticated
USING (public.get_my_role() = 'admin');

-- Batasi SELECT langsung ke tabel fisik transaction_items hanya ke admin
DROP POLICY IF EXISTS "transaction_items_read_admin_kasir" ON public.transaction_items;
DROP POLICY IF EXISTS "transaction_items_select_admin_only" ON public.transaction_items;
CREATE POLICY "transaction_items_select_admin_only"
ON public.transaction_items FOR SELECT
TO authenticated
USING (public.get_my_role() = 'admin');

-- View Katalog Publik Tanpa HPP (buy_price):
-- Dibuat TANPA security_invoker agar berjalan dengan privilese view owner (definer)
-- sehingga kasir terautentikasi dapat melihat katalog tanpa membocorkan buy_price.
CREATE OR REPLACE VIEW public.v_products_public AS
SELECT 
    p.id,
    p.category_id,
    c.name AS category_name,
    p.name,
    p.sku,
    p.barcode,
    p.sell_price,
    p.stock,
    p.min_stock,
    p.unit,
    p.image_url,
    p.expiry_date,
    p.description,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.is_active = true;

COMMENT ON VIEW public.v_products_public IS 'Katalog produk publik aman untuk Kasir dan POS tanpa kolom harga beli (HPP)';

-- View Rincian Item Transaksi Publik (Tanpa buy_price_snapshot) untuk Kasir & Cetak Struk
CREATE OR REPLACE VIEW public.v_transaction_items_public AS
SELECT 
    ti.id,
    ti.transaction_id,
    ti.product_id,
    ti.product_name_snapshot,
    ti.unit_price_snapshot,
    ti.quantity,
    ti.discount,
    ti.line_total,
    ti.created_at
FROM public.transaction_items ti;

COMMENT ON VIEW public.v_transaction_items_public IS 'Rincian item transaksi tanpa harga beli snapshot untuk tampilan kasir dan cetak struk';

-- Re-create View Analitik Dashboard (Definer View, aman dari pembatasan RLS products)
CREATE OR REPLACE VIEW public.v_dashboard_today AS
SELECT
    COALESCE(SUM(t.total), 0.00) AS total_sales_today,
    COUNT(t.id) AS total_transactions_today,
    COALESCE(SUM(ti.total_items_sold), 0) AS total_products_sold_today,
    (SELECT COUNT(*) FROM public.products WHERE stock <= min_stock AND is_active = true) AS low_stock_count
FROM public.transactions t
LEFT JOIN (
    SELECT transaction_id, SUM(quantity) AS total_items_sold
    FROM public.transaction_items
    GROUP BY transaction_id
) ti ON t.id = ti.transaction_id
WHERE t.status = 'selesai'
  AND timezone('Asia/Jakarta', t.created_at)::date = timezone('Asia/Jakarta', now())::date;

CREATE OR REPLACE VIEW public.v_daily_sales AS
SELECT
    timezone('Asia/Jakarta', t.created_at)::date AS sales_date,
    TO_CHAR(timezone('Asia/Jakarta', t.created_at)::date, 'DD Mon') AS label_date,
    COALESCE(SUM(t.total), 0.00) AS total_revenue,
    COUNT(t.id) AS transaction_count,
    COALESCE(SUM(t.subtotal), 0.00) AS subtotal_sales,
    COALESCE(SUM(t.discount), 0.00) AS total_discount,
    COALESCE(SUM(t.tax), 0.00) AS total_tax
FROM public.transactions t
WHERE t.status = 'selesai'
GROUP BY timezone('Asia/Jakarta', t.created_at)::date
ORDER BY sales_date DESC;

CREATE OR REPLACE VIEW public.v_top_products AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.image_url,
    p.sell_price,
    COALESCE(SUM(ti.quantity), 0) AS total_sold,
    COALESCE(SUM(ti.line_total), 0.00) AS total_revenue
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.transaction_items ti ON p.id = ti.product_id
JOIN public.transactions t ON ti.transaction_id = t.id
WHERE t.status = 'selesai'
GROUP BY p.id, p.name, c.name, p.image_url, p.sell_price
ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW public.v_low_stock AS
SELECT
    p.id,
    p.name,
    p.sku,
    p.barcode,
    c.name AS category_name,
    p.stock,
    p.min_stock,
    p.unit,
    p.image_url,
    CASE 
        WHEN p.stock = 0 THEN 'Habis'
        ELSE 'Menipis'
    END AS stock_status
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = true
ORDER BY p.stock ASC;

CREATE OR REPLACE VIEW public.v_expiring_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    c.name AS category_name,
    p.stock,
    p.unit,
    p.expiry_date,
    (p.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.expiry_date IS NOT NULL 
  AND p.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
  AND p.stock > 0
  AND p.is_active = true
ORDER BY p.expiry_date ASC;

CREATE OR REPLACE VIEW public.v_sales_by_category AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(SUM(ti.quantity), 0) AS total_units_sold,
    COALESCE(SUM(ti.line_total), 0.00) AS total_revenue
FROM public.categories c
JOIN public.products p ON c.id = p.category_id
JOIN public.transaction_items ti ON p.id = ti.product_id
JOIN public.transactions t ON ti.transaction_id = t.id
WHERE t.status = 'selesai'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- Beri hak akses SELECT view kepada authenticated users
GRANT SELECT ON public.v_products_public TO authenticated;
GRANT SELECT ON public.v_transaction_items_public TO authenticated;
GRANT SELECT ON public.v_dashboard_today TO authenticated;
GRANT SELECT ON public.v_daily_sales TO authenticated;
GRANT SELECT ON public.v_top_products TO authenticated;
GRANT SELECT ON public.v_low_stock TO authenticated;
GRANT SELECT ON public.v_expiring_products TO authenticated;
GRANT SELECT ON public.v_sales_by_category TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. SEDANG #10: RAPIKAN NAMA POLICY STOCK_MOVEMENTS & LOOP TRIGGER updated_at
-- ------------------------------------------------------------------------------
-- Ganti nama policy stock_movements_read_admin menjadi stock_movements_read_staff
DROP POLICY IF EXISTS "stock_movements_read_admin" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_read_staff" ON public.stock_movements;
CREATE POLICY "stock_movements_read_staff"
ON public.stock_movements FOR SELECT
TO authenticated
USING (public.get_my_role() IN ('admin', 'kasir'));

-- Perbaiki loop trigger updated_at agar hanya untuk BASE TABLE (bukan VIEW)
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c 
          ON t.table_schema = c.table_schema AND t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
          AND t.table_type = 'BASE TABLE'
          AND c.column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_touch_updated_at ON %I;
            CREATE TRIGGER trg_touch_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 7. TINGGI #3 & SEDANG #6, #7, #8, #9: HARDENING create_transaction,
--    adjust_stock, & void_transaction
-- ------------------------------------------------------------------------------

-- FUNGSI: adjust_stock (WAJIB ADMIN & HAPUS VARIABEL v_type YANG TIDAK TERPAKAI)
CREATE OR REPLACE FUNCTION public.adjust_stock(
    p_product_id UUID,
    p_new_stock INT,
    p_reason TEXT DEFAULT 'Stok Opname',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_prod products%ROWTYPE;
    v_delta INT;
BEGIN
    -- Validasi hak akses: Hanya Admin
    IF public.get_my_role() != 'admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin yang berhak melakukan penyesuaian stok opname.';
    END IF;

    IF p_new_stock < 0 THEN
        RAISE EXCEPTION 'Jumlah stok baru tidak boleh negatif.';
    END IF;

    SELECT * INTO v_prod FROM public.products WHERE id = p_product_id FOR UPDATE;
    IF v_prod.id IS NULL THEN
        RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan.', p_product_id;
    END IF;

    v_delta := p_new_stock - v_prod.stock;
    IF v_delta = 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'Tidak ada perubahan jumlah stok.');
    END IF;

    -- Perbarui stok produk
    UPDATE public.products 
    SET stock = p_new_stock 
    WHERE id = p_product_id;

    -- Catat log mutasi
    INSERT INTO public.stock_movements (
        product_id,
        type,
        quantity,
        stock_before,
        stock_after,
        reason,
        notes,
        created_by
    ) VALUES (
        p_product_id,
        'penyesuaian',
        v_delta,
        v_prod.stock,
        p_new_stock,
        p_reason,
        p_notes,
        auth.uid()
    );

    RETURN jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_prod.name,
        'old_stock', v_prod.stock,
        'new_stock', p_new_stock,
        'delta', v_delta
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FUNGSI: void_transaction (KURANGI used_count VOUCHER & KOREKSI POIN DENGAN FLAG INTERNAL)
CREATE OR REPLACE FUNCTION public.void_transaction(
    p_transaction_id UUID,
    p_reason TEXT DEFAULT 'Pembatalan Transaksi Kasir'
)
RETURNS JSONB AS $$
DECLARE
    v_tx transactions%ROWTYPE;
    v_item RECORD;
    v_current_stock INT;
BEGIN
    -- Validasi hak akses: Hanya Admin
    IF public.get_my_role() != 'admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin yang dapat membatalkan transaksi.';
    END IF;

    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
    IF v_tx.id IS NULL THEN
        RAISE EXCEPTION 'Transaksi dengan ID % tidak ditemukan.', p_transaction_id;
    END IF;

    IF v_tx.status = 'dibatalkan' THEN
        RAISE EXCEPTION 'Transaksi % sudah dibatalkan sebelumnya.', v_tx.invoice_no;
    END IF;

    -- Pasang flag sesi lokal internal agar lolos trigger perlindungan pelanggan
    PERFORM set_config('pawmart.internal_call', 'true', true);

    -- 1. Kembalikan stok setiap produk
    FOR v_item IN 
        SELECT product_id, quantity, product_name_snapshot 
        FROM public.transaction_items 
        WHERE transaction_id = p_transaction_id AND product_id IS NOT NULL
        ORDER BY product_id ASC -- Urutan konsisten cegah deadlock
    LOOP
        SELECT stock INTO v_current_stock FROM public.products WHERE id = v_item.product_id FOR UPDATE;
        
        UPDATE public.products 
        SET stock = stock + v_item.quantity 
        WHERE id = v_item.product_id;

        INSERT INTO public.stock_movements (
            product_id,
            type,
            quantity,
            stock_before,
            stock_after,
            reason,
            notes,
            reference_transaction_id,
            created_by
        ) VALUES (
            v_item.product_id,
            'masuk',
            v_item.quantity,
            v_current_stock,
            v_current_stock + v_item.quantity,
            'Pembatalan Transaksi (Void)',
            'Void Faktur ' || v_tx.invoice_no || ': ' || p_reason,
            v_tx.id,
            auth.uid()
        );
    END LOOP;

    -- 2. Kurangi used_count voucher jika transaksi memakai voucher
    IF v_tx.voucher_id IS NOT NULL THEN
        UPDATE public.vouchers
        SET used_count = GREATEST(0, used_count - 1)
        WHERE id = v_tx.voucher_id;
    END IF;

    -- 3. Koreksi poin & total belanja pelanggan jika ada
    IF v_tx.customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET total_spent = GREATEST(0.00, total_spent - v_tx.total),
            points = GREATEST(0, points - v_tx.points_earned + v_tx.points_redeemed)
        WHERE id = v_tx.customer_id;
    END IF;

    -- 4. Ubah status transaksi
    UPDATE public.transactions 
    SET status = 'dibatalkan',
        notes = COALESCE(notes || ' | ', '') || 'Dibatalkan: ' || p_reason
    WHERE id = v_tx.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Transaksi ' || v_tx.invoice_no || ' berhasil dibatalkan dan stok dikembalikan.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FUNGSI: create_transaction (ROLE CHECK, MERGE DUPLICATE ITEMS, DEADLOCK PREVENTION,
-- LPAD OVERFLOW FIX, VOUCHER STRICT VALIDATION, DISCOUNT LIMITATION)
CREATE OR REPLACE FUNCTION public.create_transaction(
    p_customer_id UUID DEFAULT NULL,
    p_payment_method payment_method DEFAULT 'tunai',
    p_discount NUMERIC(14,2) DEFAULT 0.00,
    p_voucher_id UUID DEFAULT NULL,
    p_redeem_points BOOLEAN DEFAULT false,
    p_amount_paid NUMERIC(14,2) DEFAULT 0.00,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cashier_id UUID;
    v_user_role user_role;
    v_settings store_settings%ROWTYPE;
    v_invoice_seq BIGINT;
    v_invoice_no TEXT;
    v_transaction_id UUID;
    v_item RECORD;
    v_prod products%ROWTYPE;
    v_subtotal NUMERIC(14,2) := 0.00;
    v_total_item_discount NUMERIC(14,2) := 0.00;
    v_max_cashier_discount NUMERIC(14,2);
    v_line_total NUMERIC(14,2);
    v_tax_amount NUMERIC(14,2) := 0.00;
    v_voucher_discount NUMERIC(14,2) := 0.00;
    v_points_discount NUMERIC(14,2) := 0.00;
    v_points_to_redeem INT := 0;
    v_total NUMERIC(14,2);
    v_change_amount NUMERIC(14,2);
    v_points_earned INT := 0;
    v_cust customers%ROWTYPE;
    v_multiplier NUMERIC(3,2) := 1.0;
    v_voucher vouchers%ROWTYPE;
BEGIN
    -- 1. Validasi Autentikasi & Role: Wajib Admin atau Kasir
    v_cashier_id := auth.uid();
    IF v_cashier_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    v_user_role := public.get_my_role();
    IF v_user_role NOT IN ('admin', 'kasir') THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin atau Kasir yang dapat memproses transaksi penjualan kasir.';
    END IF;

    -- Validasi kelengkapan item keranjang
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja tidak boleh kosong.';
    END IF;

    -- Validasi diskon transaksi tidak boleh negatif
    IF p_discount < 0 THEN
        RAISE EXCEPTION 'Diskon transaksi tidak boleh bernilai negatif.';
    END IF;

    -- Ambil konfigurasi toko
    SELECT * INTO v_settings FROM public.store_settings LIMIT 1;
    IF v_settings.id IS NULL THEN
        INSERT INTO public.store_settings (is_singleton) VALUES (true) RETURNING * INTO v_settings;
    END IF;

    -- Pasang flag sesi lokal internal agar update pelanggan diizinkan oleh trigger proteksi
    PERFORM set_config('pawmart.internal_call', 'true', true);

    -- 2. Ambil data pelanggan jika terdaftar
    IF p_customer_id IS NOT NULL THEN
        SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id FOR UPDATE;
        IF v_cust.id IS NULL THEN
            RAISE EXCEPTION 'Pelanggan dengan ID % tidak ditemukan.', p_customer_id;
        END IF;

        IF v_cust.tier = 'platinum' THEN v_multiplier := 2.0;
        ELSIF v_cust.tier = 'gold' THEN v_multiplier := 1.5;
        ELSIF v_cust.tier = 'silver' THEN v_multiplier := 1.25;
        ELSE v_multiplier := 1.0;
        END IF;
    END IF;

    -- 3. Nomor faktur aman overflow (lpad GREATEST 4 atau panjang angka sebenarnya)
    v_invoice_seq := nextval('transaction_invoice_seq');
    v_invoice_no := 'TRX-' || lpad(v_invoice_seq::TEXT, GREATEST(4, length(v_invoice_seq::TEXT)), '0');

    -- 4. KUNCI PRODUK SECARA KONSISTEN BERDASARKAN ID (ORDER BY product_id ASC)
    -- Ini MENJAMIN pencegahan deadlock antar transaksi konkuren
    PERFORM p.id
    FROM public.products p
    WHERE p.id IN (
        SELECT DISTINCT (elem->>'product_id')::UUID 
        FROM jsonb_array_elements(p_items) AS elem
    )
    ORDER BY p.id ASC
    FOR UPDATE;

    -- 5. TAHAP AGREGASI: GABUNGKAN ITEM DUPLIKAT & HITUNG SUBTOTAL
    FOR v_item IN 
        SELECT 
            (elem->>'product_id')::UUID AS product_id,
            SUM(COALESCE((elem->>'qty')::INT, 1)) AS qty,
            SUM(COALESCE((elem->>'discount')::NUMERIC(14,2), 0.00)) AS discount
        FROM jsonb_array_elements(p_items) AS elem
        GROUP BY (elem->>'product_id')::UUID
        ORDER BY (elem->>'product_id')::UUID ASC
    LOOP
        IF v_item.qty <= 0 THEN
            RAISE EXCEPTION 'Jumlah item untuk produk % harus lebih dari 0.', v_item.product_id;
        END IF;

        IF v_item.discount < 0 THEN
            RAISE EXCEPTION 'Diskon item produk tidak boleh bernilai negatif.';
        END IF;

        SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;

        IF v_prod.id IS NULL THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan di katalog.', v_item.product_id;
        END IF;

        IF NOT v_prod.is_active THEN
            RAISE EXCEPTION 'Produk "%" sedang berstatus nonaktif.', v_prod.name;
        END IF;

        -- Validasi stok fisik setelah kuantitas duplikat digabungkan
        IF v_prod.stock < v_item.qty THEN
            RAISE EXCEPTION 'Stok untuk "%" tidak mencukupi! Tersedia: % %, Total Permintaan: % %.', 
                v_prod.name, v_prod.stock, v_prod.unit, v_item.qty, v_prod.unit;
        END IF;

        v_line_total := GREATEST(0.00, (v_prod.sell_price * v_item.qty) - v_item.discount);
        v_subtotal := v_subtotal + v_line_total;
        v_total_item_discount := v_total_item_discount + v_item.discount;
    END LOOP;

    -- 6. VALIDASI BATAS MAKSIMAL DISKON MANUAL KASIR
    IF v_user_role = 'kasir' THEN
        v_max_cashier_discount := round((v_subtotal * v_settings.max_cashier_discount_percent / 100), 2);
        IF (p_discount + v_total_item_discount) > v_max_cashier_discount THEN
            RAISE EXCEPTION 'Diskon manual kasir (Rp %) melebihi batas maksimal % persen (Maks. Rp %). Persetujuan Admin diperlukan.',
                (p_discount + v_total_item_discount), v_settings.max_cashier_discount_percent, v_max_cashier_discount;
        END IF;
    END IF;

    -- 7. VALIDASI KETAT VOUCHER PROMO
    IF p_voucher_id IS NOT NULL THEN
        SELECT * INTO v_voucher FROM public.vouchers WHERE id = p_voucher_id FOR UPDATE;
        
        IF v_voucher.id IS NULL THEN
            RAISE EXCEPTION 'Voucher dengan ID % tidak ditemukan.', p_voucher_id;
        END IF;
        
        IF NOT v_voucher.is_active THEN
            RAISE EXCEPTION 'Voucher "%" (%) saat ini sedang nonaktif.', v_voucher.name, v_voucher.code;
        END IF;
        
        IF v_voucher.valid_until < CURRENT_DATE THEN
            RAISE EXCEPTION 'Voucher "%" (%) telah kedaluwarsa pada tanggal %.', v_voucher.name, v_voucher.code, v_voucher.valid_until;
        END IF;
        
        IF v_voucher.quota > 0 AND v_voucher.used_count >= v_voucher.quota THEN
            RAISE EXCEPTION 'Kuota pemakaian voucher "%" (%) telah habis.', v_voucher.name, v_voucher.code;
        END IF;
        
        IF v_subtotal < v_voucher.min_spend THEN
            RAISE EXCEPTION 'Total belanja (Rp %) belum memenuhi syarat minimum voucher "%" (Min. Rp %).', 
                v_subtotal, v_voucher.name, v_voucher.min_spend;
        END IF;

        IF v_voucher.type = 'persen' THEN
            v_voucher_discount := round((v_subtotal * v_voucher.value / 100), 2);
        ELSE
            v_voucher_discount := LEAST(v_subtotal, v_voucher.value);
        END IF;

        -- Tambah pemakaian voucher
        UPDATE public.vouchers 
        SET used_count = used_count + 1 
        WHERE id = v_voucher.id;
    END IF;

    -- 8. PENUKARAN POIN MEMBER
    IF p_redeem_points AND v_cust.id IS NOT NULL AND v_cust.points > 0 THEN
        DECLARE
            v_max_potongan NUMERIC(14,2);
            v_sisa_tagihan NUMERIC(14,2);
        BEGIN
            v_sisa_tagihan := GREATEST(0.00, v_subtotal - p_discount - v_voucher_discount);
            v_max_potongan := v_cust.points * v_settings.point_value;
            v_points_discount := LEAST(v_sisa_tagihan, v_max_potongan);
            v_points_to_redeem := CEIL(v_points_discount / v_settings.point_value);
        END;
    END IF;

    -- 9. KALKULASI PAJAK, TOTAL, & KEMBALIAN
    DECLARE
        v_dpp NUMERIC(14,2);
    BEGIN
        v_dpp := GREATEST(0.00, v_subtotal - p_discount - v_voucher_discount - v_points_discount);
        IF v_settings.is_tax_enabled AND v_settings.tax_percentage > 0 THEN
            v_tax_amount := round((v_dpp * v_settings.tax_percentage / 100), 2);
        END IF;
        v_total := v_dpp + v_tax_amount;
    END;

    IF p_amount_paid < v_total THEN
        RAISE EXCEPTION 'Pembayaran kurang! Total Tagihan: Rp %, Uang Diterima: Rp %', v_total, p_amount_paid;
    END IF;
    v_change_amount := p_amount_paid - v_total;

    -- Poin yang diperoleh dari transaksi baru
    IF v_cust.id IS NOT NULL AND v_total > 0 THEN
        v_points_earned := round((floor(v_total / v_settings.points_per_amount) * v_multiplier));
    END IF;

    -- 10. SIMPAN HEADER TRANSAKSI
    INSERT INTO public.transactions (
        invoice_no,
        customer_id,
        cashier_id,
        status,
        payment_method,
        subtotal,
        discount,
        voucher_id,
        points_redeemed,
        points_discount_amount,
        tax,
        total,
        amount_paid,
        change_amount,
        points_earned,
        notes
    ) VALUES (
        v_invoice_no,
        p_customer_id,
        v_cashier_id,
        'selesai',
        p_payment_method,
        v_subtotal,
        p_discount + v_voucher_discount,
        p_voucher_id,
        v_points_to_redeem,
        v_points_discount,
        v_tax_amount,
        v_total,
        p_amount_paid,
        v_change_amount,
        v_points_earned,
        p_notes
    ) RETURNING id INTO v_transaction_id;

    -- 11. INSERT DETAIL ITEM TERGABUNG, POTONG STOK, & CATAT MUTASI
    FOR v_item IN 
        SELECT 
            (elem->>'product_id')::UUID AS product_id,
            SUM(COALESCE((elem->>'qty')::INT, 1)) AS qty,
            SUM(COALESCE((elem->>'discount')::NUMERIC(14,2), 0.00)) AS discount
        FROM jsonb_array_elements(p_items) AS elem
        GROUP BY (elem->>'product_id')::UUID
        ORDER BY (elem->>'product_id')::UUID ASC
    LOOP
        SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;
        v_line_total := GREATEST(0.00, (v_prod.sell_price * v_item.qty) - v_item.discount);

        INSERT INTO public.transaction_items (
            transaction_id,
            product_id,
            product_name_snapshot,
            unit_price_snapshot,
            buy_price_snapshot,
            quantity,
            discount,
            line_total
        ) VALUES (
            v_transaction_id,
            v_prod.id,
            v_prod.name,
            v_prod.sell_price,
            v_prod.buy_price,
            v_item.qty,
            v_item.discount,
            v_line_total
        );

        -- Potong stok fisik
        UPDATE public.products 
        SET stock = stock - v_item.qty 
        WHERE id = v_prod.id;

        -- Catat log mutasi
        INSERT INTO public.stock_movements (
            product_id,
            type,
            quantity,
            stock_before,
            stock_after,
            reason,
            notes,
            reference_transaction_id,
            created_by
        ) VALUES (
            v_prod.id,
            'keluar',
            -v_item.qty,
            v_prod.stock,
            v_prod.stock - v_item.qty,
            'Penjualan Kasir',
            'Faktur ' || v_invoice_no,
            v_transaction_id,
            v_cashier_id
        );
    END LOOP;

    -- 12. PERBARUI TOTAL BELANJA & POIN PELANGGAN
    IF v_cust.id IS NOT NULL THEN
        DECLARE
            v_new_total_spent NUMERIC(14,2);
            v_new_tier member_tier;
        BEGIN
            v_new_total_spent := v_cust.total_spent + v_total;
            
            IF v_new_total_spent >= 5000000.00 THEN v_new_tier := 'platinum';
            ELSIF v_new_total_spent >= 3000000.00 THEN v_new_tier := 'gold';
            ELSIF v_new_total_spent >= 1500000.00 THEN v_new_tier := 'silver';
            ELSE v_new_tier := v_cust.tier;
            END IF;

            UPDATE public.customers
            SET total_spent = v_new_total_spent,
                points = GREATEST(0, points - v_points_to_redeem) + v_points_earned,
                tier = v_new_tier,
                last_visit_at = now()
            WHERE id = v_cust.id;
        END;
    END IF;

    -- Return JSON sukses
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'invoice_no', v_invoice_no,
        'subtotal', v_subtotal,
        'discount', p_discount + v_voucher_discount + v_points_discount,
        'tax', v_tax_amount,
        'total', v_total,
        'amount_paid', p_amount_paid,
        'change_amount', v_change_amount,
        'points_earned', v_points_earned
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 8. TINGGI #3: BATASI HAK EKSEKUSI RPC (REVOKE PUBLIC/ANON, GRANT AUTHENTICATED)
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.create_transaction FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_transaction TO authenticated;

REVOKE EXECUTE ON FUNCTION public.void_transaction FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.void_transaction TO authenticated;

REVOKE EXECUTE ON FUNCTION public.adjust_stock FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_stock TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_my_role FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;
