-- ==============================================================================
-- 0008_security_fixes_round2.sql
-- PawMart POS - Perbaikan Keamanan Lanjutan (Security Hardening Round 2)
-- ==============================================================================
-- 1. NULL Fail-Open Defense: get_my_role() IS NULL handling
-- 2. Definer Views Role-Filtering (admin/kasir only) & Revoke Anon/Public
-- 3. Customer Points/Tier Enforce on INSERT
-- 4. Inactive by default for new users (is_active = false)
-- 5. Deadlock-free Lock Ordering in void_transaction (Customer -> Products -> Voucher)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. KRITIS: PERBAIKAN TRIGGER PENGGUNA BARU (is_active = false secara default)
-- Staf baru wajib diaktifkan secara manual oleh Admin melalui SQL / Dashboard
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- KEAMANAN: Role selalu 'kasir' DAN is_active = false
    -- Pengguna baru tidak dapat bertransaksi sebelum disetujui & diaktifkan Admin
    INSERT INTO public.profiles (id, full_name, role, phone, is_active)
    VALUES (NEW.id, v_full_name, 'kasir', NEW.raw_user_meta_data->>'phone', false)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. KRITIS: PERBAIKAN PROTEKSI PROFIL TERHADAP NULL FAIL-OPEN
-- Pengecualian: hanya memblokir jika auth.uid() IS NOT NULL (agar promosi via SQL Editor bisa)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role user_role;
BEGIN
    -- Jika dieksekusi langsung via SQL Editor / Service Role (auth.uid() IS NULL), izinkan
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- Jika ada perubahan kolom role atau is_active
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
        v_caller_role := public.get_my_role();
        
        -- Pertahanan NULL Fail-Open:
        -- Jika role NULL (user tanpa profil / nonaktif) atau BUKAN 'admin', tolak secara tegas
        IF v_caller_role IS NULL OR v_caller_role IS DISTINCT FROM 'admin' THEN
            RAISE EXCEPTION 'Akses ditolak: Hanya Admin aktif yang berhak mengubah role atau status aktif akun pengguna.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 3. TINGGI: TRIGGER PROTEKSI PELANGGAN PADA INSERT & UPDATE
-- Menolak penyisipan poin/spent/tier instan oleh kasir atau pihak luar
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_customer_defaults()
RETURNS TRIGGER AS $$
DECLARE
    v_is_internal TEXT;
    v_caller_role user_role;
BEGIN
    v_is_internal := current_setting('pawmart.internal_call', true);
    v_caller_role := public.get_my_role();

    -- Jika bukan pemanggilan internal dan pemanggil BUKAN admin aktif
    IF v_is_internal IS DISTINCT FROM 'true' AND (v_caller_role IS NULL OR v_caller_role IS DISTINCT FROM 'admin') THEN
        NEW.points := 0;
        NEW.total_spent := 0.00;
        NEW.tier := 'bronze';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_customer_defaults ON public.customers;
CREATE TRIGGER trg_enforce_customer_defaults
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.enforce_customer_defaults();

CREATE OR REPLACE FUNCTION public.protect_customer_loyalty_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_is_internal TEXT;
    v_caller_role user_role;
BEGIN
    IF (NEW.points IS DISTINCT FROM OLD.points OR 
        NEW.total_spent IS DISTINCT FROM OLD.total_spent OR 
        NEW.tier IS DISTINCT FROM OLD.tier) THEN
        
        v_is_internal := current_setting('pawmart.internal_call', true);
        v_caller_role := public.get_my_role();
        
        -- Izinkan jika panggilan transaksi internal ATAU admin aktif
        IF v_is_internal = 'true' OR (v_caller_role IS NOT NULL AND v_caller_role = 'admin') THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Akses ditolak: Poin, total belanja, dan tier pelanggan hanya dapat diperbarui secara otomatis lewat transaksi kasir resmi atau oleh Admin aktif.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 4. HARDENING RPC: NULL FAIL-OPEN DEFENSE & LOCK ORDERING VOID TRANSAKSI
-- ------------------------------------------------------------------------------

-- FUNGSI: adjust_stock (NULL role atau non-admin pasti ditolak)
CREATE OR REPLACE FUNCTION public.adjust_stock(
    p_product_id UUID,
    p_new_stock INT,
    p_reason TEXT DEFAULT 'Stok Opname',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_caller_role user_role;
    v_prod products%ROWTYPE;
    v_delta INT;
BEGIN
    v_caller_role := public.get_my_role();
    
    -- Pertahanan NULL Fail-Open: Role NULL atau bukan admin ditolak
    IF v_caller_role IS NULL OR v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin aktif yang berhak melakukan penyesuaian stok opname.';
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

    UPDATE public.products 
    SET stock = p_new_stock 
    WHERE id = p_product_id;

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

-- FUNGSI: void_transaction
-- Urutan Lock Disamakan: Pelanggan -> Produk (urut id ASC) -> Voucher
CREATE OR REPLACE FUNCTION public.void_transaction(
    p_transaction_id UUID,
    p_reason TEXT DEFAULT 'Pembatalan Transaksi Kasir'
)
RETURNS JSONB AS $$
DECLARE
    v_caller_role user_role;
    v_tx transactions%ROWTYPE;
    v_item RECORD;
    v_current_stock INT;
BEGIN
    v_caller_role := public.get_my_role();
    
    -- Pertahanan NULL Fail-Open: Role NULL atau bukan admin ditolak
    IF v_caller_role IS NULL OR v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin aktif yang dapat membatalkan transaksi.';
    END IF;

    -- 1. Kunci baris transaksi terlebih dahulu
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
    IF v_tx.id IS NULL THEN
        RAISE EXCEPTION 'Transaksi dengan ID % tidak ditemukan.', p_transaction_id;
    END IF;

    IF v_tx.status = 'dibatalkan' THEN
        RAISE EXCEPTION 'Transaksi % sudah dibatalkan sebelumnya.', v_tx.invoice_no;
    END IF;

    -- 2. Kunci PELANGGAN terlebih dahulu (Konsisten dengan create_transaction)
    IF v_tx.customer_id IS NOT NULL THEN
        PERFORM id FROM public.customers WHERE id = v_tx.customer_id FOR UPDATE;
    END IF;

    -- 3. Kunci seluruh PRODUK yang terlibat terurut berdasarkan ID ASC
    PERFORM id 
    FROM public.products 
    WHERE id IN (
        SELECT DISTINCT product_id 
        FROM public.transaction_items 
        WHERE transaction_id = p_transaction_id AND product_id IS NOT NULL
    )
    ORDER BY id ASC
    FOR UPDATE;

    -- 4. Kunci VOUCHER (jika transaksi memakai voucher)
    IF v_tx.voucher_id IS NOT NULL THEN
        PERFORM id FROM public.vouchers WHERE id = v_tx.voucher_id FOR UPDATE;
    END IF;

    -- Pasang flag sesi lokal internal
    PERFORM set_config('pawmart.internal_call', 'true', true);

    -- 5. Eksekusi pengembalian stok produk & mutasi
    FOR v_item IN 
        SELECT product_id, quantity, product_name_snapshot 
        FROM public.transaction_items 
        WHERE transaction_id = p_transaction_id AND product_id IS NOT NULL
        ORDER BY product_id ASC
    LOOP
        SELECT stock INTO v_current_stock FROM public.products WHERE id = v_item.product_id;
        
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

    -- 6. Kurangi used_count voucher
    IF v_tx.voucher_id IS NOT NULL THEN
        UPDATE public.vouchers
        SET used_count = GREATEST(0, used_count - 1)
        WHERE id = v_tx.voucher_id;
    END IF;

    -- 7. Koreksi total belanja & poin pelanggan
    IF v_tx.customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET total_spent = GREATEST(0.00, total_spent - v_tx.total),
            points = GREATEST(0, points - v_tx.points_earned + v_tx.points_redeemed)
        WHERE id = v_tx.customer_id;
    END IF;

    -- 8. Ubah status transaksi
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

-- FUNGSI: create_transaction
-- NULL Fail-Open Defense & Batas Diskon Kasir Terproteksi saat Role bukan Admin
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
    v_cashier_id := auth.uid();
    IF v_cashier_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    v_user_role := public.get_my_role();
    
    -- Pertahanan NULL Fail-Open:
    -- Jika user tidak aktif atau tidak punya profil (v_user_role IS NULL), tolak!
    IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'kasir') THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin atau Kasir yang aktif yang dapat memproses transaksi penjualan kasir.';
    END IF;

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja tidak boleh kosong.';
    END IF;

    IF p_discount < 0 THEN
        RAISE EXCEPTION 'Diskon transaksi tidak boleh bernilai negatif.';
    END IF;

    SELECT * INTO v_settings FROM public.store_settings LIMIT 1;
    IF v_settings.id IS NULL THEN
        INSERT INTO public.store_settings (is_singleton) VALUES (true) RETURNING * INTO v_settings;
    END IF;

    -- Pasang flag sesi lokal internal
    PERFORM set_config('pawmart.internal_call', 'true', true);

    -- 1. KUNCI PELANGGAN (jika ada)
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

    -- 2. KUNCI PRODUK TERURUT BERDASARKAN ID ASC (Pencegahan Deadlock)
    PERFORM p.id
    FROM public.products p
    WHERE p.id IN (
        SELECT DISTINCT (elem->>'product_id')::UUID 
        FROM jsonb_array_elements(p_items) AS elem
    )
    ORDER BY p.id ASC
    FOR UPDATE;

    -- 3. KUNCI VOUCHER (jika ada)
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
    END IF;

    -- 4. AGREGASI ITEM KERANJANG DUPLIKAT & HITUNG SUBTOTAL
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

        IF v_prod.stock < v_item.qty THEN
            RAISE EXCEPTION 'Stok untuk "%" tidak mencukupi! Tersedia: % %, Total Permintaan: % %.', 
                v_prod.name, v_prod.stock, v_prod.unit, v_item.qty, v_prod.unit;
        END IF;

        v_line_total := GREATEST(0.00, (v_prod.sell_price * v_item.qty) - v_item.discount);
        v_subtotal := v_subtotal + v_line_total;
        v_total_item_discount := v_total_item_discount + v_item.discount;
    END LOOP;

    -- 5. VALIDASI BATAS MAKSIMAL DISKON (Semua role selain Admin wajib dibatasi)
    IF v_user_role IS DISTINCT FROM 'admin' THEN
        v_max_cashier_discount := round((v_subtotal * v_settings.max_cashier_discount_percent / 100), 2);
        IF (p_discount + v_total_item_discount) > v_max_cashier_discount THEN
            RAISE EXCEPTION 'Diskon manual kasir (Rp %) melebihi batas maksimal % persen (Maks. Rp %). Persetujuan Admin diperlukan.',
                (p_discount + v_total_item_discount), v_settings.max_cashier_discount_percent, v_max_cashier_discount;
        END IF;
    END IF;

    -- 6. VALIDASI MINIMAL BELANJA VOUCHER & KALKULASI DISKON VOUCHER
    IF p_voucher_id IS NOT NULL THEN
        IF v_subtotal < v_voucher.min_spend THEN
            RAISE EXCEPTION 'Total belanja (Rp %) belum memenuhi syarat minimum voucher "%" (Min. Rp %).', 
                v_subtotal, v_voucher.name, v_voucher.min_spend;
        END IF;

        IF v_voucher.type = 'persen' THEN
            v_voucher_discount := round((v_subtotal * v_voucher.value / 100), 2);
        ELSE
            v_voucher_discount := LEAST(v_subtotal, v_voucher.value);
        END IF;

        UPDATE public.vouchers 
        SET used_count = used_count + 1 
        WHERE id = v_voucher.id;
    END IF;

    -- 7. PENUKARAN POIN PELANGGAN
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

    -- 8. KALKULASI PAJAK, TOTAL, & KEMBALIAN
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

    IF v_cust.id IS NOT NULL AND v_total > 0 THEN
        v_points_earned := round((floor(v_total / v_settings.points_per_amount) * v_multiplier));
    END IF;

    -- 9. NOMOR FAKTUR & SIMPAN TRANSAKSI
    v_invoice_seq := nextval('transaction_invoice_seq');
    v_invoice_no := 'TRX-' || lpad(v_invoice_seq::TEXT, GREATEST(4, length(v_invoice_seq::TEXT)), '0');

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

    -- 10. INSERT TRANSACTION ITEMS & POTONG STOK
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

        UPDATE public.products 
        SET stock = stock - v_item.qty 
        WHERE id = v_prod.id;

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

    -- 11. UPDATE PELANGGAN
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
-- 5. VIEW DEFINER: ROLE FILTER (ADMIN & KASIR ONLY) & REVOKE ANON/PUBLIC
-- Anon, groomer, dan user nonaktif (get_my_role() IS NULL) mendapat TEPAT 0 BARIS
-- ------------------------------------------------------------------------------

-- 1. v_products_public
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
WHERE p.is_active = true
  AND public.get_my_role() IN ('admin', 'kasir');

-- 2. v_transaction_items_public
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
FROM public.transaction_items ti
WHERE public.get_my_role() IN ('admin', 'kasir');

-- 3. v_dashboard_today (0 baris jika bukan admin/kasir aktif)
CREATE OR REPLACE VIEW public.v_dashboard_today AS
SELECT * FROM (
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
      AND timezone('Asia/Jakarta', t.created_at)::date = timezone('Asia/Jakarta', now())::date
) d
WHERE public.get_my_role() IN ('admin', 'kasir');

-- 4. v_daily_sales
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
  AND public.get_my_role() IN ('admin', 'kasir')
GROUP BY timezone('Asia/Jakarta', t.created_at)::date
ORDER BY sales_date DESC;

-- 5. v_top_products
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
  AND public.get_my_role() IN ('admin', 'kasir')
GROUP BY p.id, p.name, c.name, p.image_url, p.sell_price
ORDER BY total_sold DESC;

-- 6. v_low_stock
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
WHERE p.stock <= p.min_stock 
  AND p.is_active = true
  AND public.get_my_role() IN ('admin', 'kasir')
ORDER BY p.stock ASC;

-- 7. v_expiring_products
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
  AND public.get_my_role() IN ('admin', 'kasir')
ORDER BY p.expiry_date ASC;

-- 8. v_sales_by_category
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
  AND public.get_my_role() IN ('admin', 'kasir')
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- ------------------------------------------------------------------------------
-- 6. REVOKE DARI ANON & PUBLIC, GRANT SELECT KE AUTHENTICATED
-- ------------------------------------------------------------------------------
REVOKE ALL ON public.v_products_public FROM anon, PUBLIC;
REVOKE ALL ON public.v_transaction_items_public FROM anon, PUBLIC;
REVOKE ALL ON public.v_dashboard_today FROM anon, PUBLIC;
REVOKE ALL ON public.v_daily_sales FROM anon, PUBLIC;
REVOKE ALL ON public.v_top_products FROM anon, PUBLIC;
REVOKE ALL ON public.v_low_stock FROM anon, PUBLIC;
REVOKE ALL ON public.v_expiring_products FROM anon, PUBLIC;
REVOKE ALL ON public.v_sales_by_category FROM anon, PUBLIC;

GRANT SELECT ON public.v_products_public TO authenticated;
GRANT SELECT ON public.v_transaction_items_public TO authenticated;
GRANT SELECT ON public.v_dashboard_today TO authenticated;
GRANT SELECT ON public.v_daily_sales TO authenticated;
GRANT SELECT ON public.v_top_products TO authenticated;
GRANT SELECT ON public.v_low_stock TO authenticated;
GRANT SELECT ON public.v_expiring_products TO authenticated;
GRANT SELECT ON public.v_sales_by_category TO authenticated;
