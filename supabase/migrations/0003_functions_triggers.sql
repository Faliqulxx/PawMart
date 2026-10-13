-- ==============================================================================
-- 0003_functions_triggers.sql
-- PawMart POS - Fungsi Bisnis Atomik, Trigger, dan RPC Supabase
-- ==============================================================================

-- 1. TRIGGER FUNGSI: AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger updated_at pada tabel-tabel utama
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_touch_updated_at ON %I;
            CREATE TRIGGER trg_touch_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
        ', tbl, tbl);
    END LOOP;
END $$;

-- 2. TRIGGER FUNGSI: AUTO BUAT PROFIL SAAT USER MENDAFTAR (auth.users -> profiles)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role := 'kasir';
    v_full_name TEXT;
BEGIN
    -- Baca role dari metadata jika ada, default 'kasir'
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        v_role := 'admin';
    ELSIF NEW.raw_user_meta_data->>'role' = 'groomer' THEN
        v_role := 'groomer';
    END IF;

    -- Ambil nama lengkap dari metadata atau potong dari email
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, full_name, role, phone, is_active)
    VALUES (NEW.id, v_full_name, v_role, NEW.raw_user_meta_data->>'phone', true)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. HELPER FUNCTION: DAPATKAN ROLE USER YANG SEDANG LOGIN
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid() AND is_active = true;
    
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
COMMENT ON FUNCTION get_my_role() IS 'Mengembalikan user_role pengguna yang sedang login untuk evaluasi RLS';

-- 4. RPC FUNCTION ATOMIK: CREATE_TRANSACTION
-- Fungsi transaksi kasir POS lengkap dan atomik dengan penguncian baris (FOR UPDATE)
CREATE OR REPLACE FUNCTION create_transaction(
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
    v_settings store_settings%ROWTYPE;
    v_invoice_no TEXT;
    v_transaction_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_qty INT;
    v_item_discount NUMERIC(14,2);
    v_prod products%ROWTYPE;
    v_subtotal NUMERIC(14,2) := 0.00;
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
    -- Validasi kasir
    v_cashier_id := auth.uid();
    IF v_cashier_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
    END IF;

    -- Validasi kelengkapan item
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja tidak boleh kosong.';
    END IF;

    -- Ambil pengaturan toko
    SELECT * INTO v_settings FROM public.store_settings LIMIT 1;
    IF v_settings.id IS NULL THEN
        -- Fallback default jika belum ada baris pengaturan
        INSERT INTO public.store_settings (is_singleton) VALUES (true) RETURNING * INTO v_settings;
    END IF;

    -- Ambil data pelanggan jika terdaftar
    IF p_customer_id IS NOT NULL THEN
        SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id FOR UPDATE;
        IF v_cust.id IS NULL THEN
            RAISE EXCEPTION 'Pelanggan dengan ID % tidak ditemukan.', p_customer_id;
        END IF;

        -- Tentukan multiplier poin berdasarkan tier member
        IF v_cust.tier = 'platinum' THEN v_multiplier := 2.0;
        ELSIF v_cust.tier = 'gold' THEN v_multiplier := 1.5;
        ELSIF v_cust.tier = 'silver' THEN v_multiplier := 1.25;
        ELSE v_multiplier := 1.0;
        END IF;
    END IF;

    -- Buat nomor faktur baru (format: TRX-0001)
    v_invoice_no := 'TRX-' || lpad(nextval('transaction_invoice_seq')::TEXT, 4, '0');

    -- TAHAP 1: VALIDASI PRODUK, KUNCI BARIS (FOR UPDATE), DAN HITUNG SUBTOTAL
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := COALESCE((v_item->>'qty')::INT, 1);
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC(14,2), 0.00);

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Jumlah item untuk produk % harus lebih dari 0.', v_product_id;
        END IF;

        -- Kunci baris produk di tabel products (Mencegah Race Condition)
        SELECT * INTO v_prod FROM public.products WHERE id = v_product_id FOR UPDATE;

        IF v_prod.id IS NULL THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan di katalog.', v_product_id;
        END IF;

        IF NOT v_prod.is_active THEN
            RAISE EXCEPTION 'Produk "%" sedang berstatus nonaktif.', v_prod.name;
        END IF;

        -- Validasi stok cukup
        IF v_prod.stock < v_qty THEN
            RAISE EXCEPTION 'Stok untuk "%" tidak mencukupi! Tersedia: % %, Diminta: % %.', 
                v_prod.name, v_prod.stock, v_prod.unit, v_qty, v_prod.unit;
        END IF;

        -- Hitung subtotal baris
        v_line_total := GREATEST(0.00, (v_prod.sell_price * v_qty) - v_item_discount);
        v_subtotal := v_subtotal + v_line_total;
    END LOOP;

    -- TAHAP 2: PROSES VOUCHER & POIN
    IF p_voucher_id IS NOT NULL THEN
        SELECT * INTO v_voucher FROM public.vouchers WHERE id = p_voucher_id FOR UPDATE;
        IF v_voucher.id IS NOT NULL AND v_voucher.is_active AND v_voucher.valid_until >= CURRENT_DATE THEN
            IF v_subtotal >= v_voucher.min_spend AND (v_voucher.quota = 0 OR v_voucher.used_count < v_voucher.quota) THEN
                IF v_voucher.type = 'persen' THEN
                    v_voucher_discount := round((v_subtotal * v_voucher.value / 100), 2);
                ELSE
                    v_voucher_discount := LEAST(v_subtotal, v_voucher.value);
                END IF;
                -- Update kuota terpakai voucher
                UPDATE public.vouchers SET used_count = used_count + 1 WHERE id = v_voucher.id;
            END IF;
        END IF;
    END IF;

    -- Potongan Poin Member (1 Poin = Rp 100)
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

    -- TAHAP 3: KALKULASI PAJAK & TOTAL
    DECLARE
        v_dpp NUMERIC(14,2);
    BEGIN
        v_dpp := GREATEST(0.00, v_subtotal - p_discount - v_voucher_discount - v_points_discount);
        IF v_settings.is_tax_enabled AND v_settings.tax_percentage > 0 THEN
            v_tax_amount := round((v_dpp * v_settings.tax_percentage / 100), 2);
        END IF;
        v_total := v_dpp + v_tax_amount;
    END;

    -- Validasi nominal bayar
    IF p_amount_paid < v_total THEN
        RAISE EXCEPTION 'Pembayaran kurang! Total: Rp %, Uang Diterima: Rp %', v_total, p_amount_paid;
    END IF;
    v_change_amount := p_amount_paid - v_total;

    -- Poin yang diperoleh (1 Poin per Rp 10.000)
    IF v_cust.id IS NOT NULL AND v_total > 0 THEN
        v_points_earned := round((floor(v_total / v_settings.points_per_amount) * v_multiplier));
    END IF;

    -- TAHAP 4: SIMPAN TRANSAKSI
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

    -- TAHAP 5: INSERT ITEMS, KURANGI STOK, & CATAT MUTASI
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := COALESCE((v_item->>'qty')::INT, 1);
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC(14,2), 0.00);

        SELECT * INTO v_prod FROM public.products WHERE id = v_product_id;
        v_line_total := GREATEST(0.00, (v_prod.sell_price * v_qty) - v_item_discount);

        -- Insert detail item transaksi
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
            v_qty,
            v_item_discount,
            v_line_total
        );

        -- Kurangi stok barang
        UPDATE public.products 
        SET stock = stock - v_qty 
        WHERE id = v_prod.id;

        -- Catat pada log mutasi persediaan
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
            -v_qty,
            v_prod.stock,
            v_prod.stock - v_qty,
            'Penjualan Kasir',
            'Faktur ' || v_invoice_no,
            v_transaction_id,
            v_cashier_id
        );
    END LOOP;

    -- TAHAP 6: UPDATE TOTAL BELANJA & POIN PELANGGAN
    IF v_cust.id IS NOT NULL THEN
        DECLARE
            v_new_total_spent NUMERIC(14,2);
            v_new_tier member_tier;
        BEGIN
            v_new_total_spent := v_cust.total_spent + v_total;
            
            -- Evaluasi kenaikan tier
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

    -- KEMBALIKAN RESUMÉ TRANSAKSI SUKSES
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
COMMENT ON FUNCTION create_transaction IS 'RPC transaksi kasir POS atomik: validasi stok, kunci baris, kurangi stok, catat mutasi, hitung diskon/pajak/kembalian, dan update poin';

-- 5. FUNCTION: VOID TRANSAKSI (BATALKAN TRANSAKSI - ADMIN ONLY)
CREATE OR REPLACE FUNCTION void_transaction(
    p_transaction_id UUID,
    p_reason TEXT DEFAULT 'Pembatalan Transaksi Kasir'
)
RETURNS JSONB AS $$
DECLARE
    v_role user_role;
    v_tx transactions%ROWTYPE;
    v_item RECORD;
    v_current_stock INT;
BEGIN
    v_role := get_my_role();
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Admin yang dapat membatalkan transaksi.';
    END IF;

    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
    IF v_tx.id IS NULL THEN
        RAISE EXCEPTION 'Transaksi dengan ID % tidak ditemukan.', p_transaction_id;
    END IF;

    IF v_tx.status = 'dibatalkan' THEN
        RAISE EXCEPTION 'Transaksi % sudah dibatalkan sebelumnya.', v_tx.invoice_no;
    END IF;

    -- 1. Kembalikan stok setiap produk
    FOR v_item IN 
        SELECT product_id, quantity, product_name_snapshot 
        FROM public.transaction_items 
        WHERE transaction_id = p_transaction_id AND product_id IS NOT NULL
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

    -- 2. Koreksi poin & total belanja pelanggan jika ada
    IF v_tx.customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET total_spent = GREATEST(0.00, total_spent - v_tx.total),
            points = GREATEST(0, points - v_tx.points_earned + v_tx.points_redeemed)
        WHERE id = v_tx.customer_id;
    END IF;

    -- 3. Ubah status transaksi
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
COMMENT ON FUNCTION void_transaction IS 'Membatalkan transaksi penjualan kasir, mengembalikan stok fisik, mencatat mutasi, dan memulihkan poin pelanggan';

-- 6. FUNCTION: PENYESUAIAN STOK (STOCK OPNAME)
CREATE OR REPLACE FUNCTION adjust_stock(
    p_product_id UUID,
    p_new_stock INT,
    p_reason TEXT DEFAULT 'Stok Opname',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_prod products%ROWTYPE;
    v_delta INT;
    v_type stock_movement_type;
BEGIN
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

    IF v_delta > 0 THEN
        v_type := 'masuk';
    ELSE
        v_type := 'keluar';
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
COMMENT ON FUNCTION adjust_stock IS 'Penyesuaian stok opname manual yang mencatat riwayat mutasi persediaan secara otomatis';
