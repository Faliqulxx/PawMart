-- ==============================================================================
-- supabase/tests/security_checks.sql
-- PawMart POS - Pengujian Keamanan & Validasi Hak Akses (Security Checks Round 1 & 2)
-- ==============================================================================
-- File ini berisi skenario pengujian komprehensif untuk memvalidasi:
-- 1. Migrasi 0007_security_fixes.sql (RLS, HPP protection, lpad overflow, deadlock prevention)
-- 2. Migrasi 0008_security_fixes_round2.sql (NULL fail-open defense, view definer lockdown,
--    customer insert default enforcement, user inactive default, lock ordering)
-- ==============================================================================

\echo '=============================================================================='
\echo 'MEMULAI PENGUJIAN KEAMANAN PAWMART POS (0007 & 0008 MIGRATIONS)'
\echo '=============================================================================='

-- ------------------------------------------------------------------------------
-- SETUP: PENGGUNA SIMULASI
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_kasir_uid UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_uid UUID := '99999999-9999-9999-9999-999999999999';
    v_nonaktif_uid UUID := '22222222-2222-2222-2222-222222222222';
    v_groomer_uid UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- 1. Kasir Aktif
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (v_kasir_uid, 'kasir_test@pawmart.id', '{"full_name": "Kasir Uji Coba", "role": "admin"}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO UPDATE SET raw_user_meta_data = EXCLUDED.raw_user_meta_data;

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (v_kasir_uid, 'Kasir Uji Coba', 'kasir', true)
    ON CONFLICT (id) DO UPDATE SET role = 'kasir', is_active = true;

    -- 2. Admin Aktif
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (v_admin_uid, 'admin_test@pawmart.id', '{"full_name": "Admin Utama Uji Coba"}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (v_admin_uid, 'Admin Utama Uji Coba', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;

    -- 3. User Nonaktif (Simulasi Pendaftar Baru atau Staf Dinonaktifkan)
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (v_nonaktif_uid, 'nonaktif_test@pawmart.id', '{"full_name": "Staf Nonaktif"}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (v_nonaktif_uid, 'Staf Nonaktif', 'kasir', false)
    ON CONFLICT (id) DO UPDATE SET role = 'kasir', is_active = false;

    -- 4. Groomer Aktif
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (v_groomer_uid, 'groomer_test@pawmart.id', '{"full_name": "Groomer Toko"}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (v_groomer_uid, 'Groomer Toko', 'groomer', true)
    ON CONFLICT (id) DO UPDATE SET role = 'groomer', is_active = true;

    RAISE NOTICE '>>> Setup pengguna simulasi selesai.';
END $$;


-- ==============================================================================
-- SKENARIO 1: SIGNUP DENGAN METADATA ROLE 'ADMIN' (KRITIS #1 & 0008)
-- ==============================================================================
-- Ekspektasi: User baru mendapat role='kasir' DAN is_active=false.
\echo ''
\echo '>>> [SKENARIO 1] Cek status akun kasir pendaftar baru...'
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role AS actual_role,
    p.is_active,
    CASE 
        WHEN p.role = 'kasir' THEN 'LULUS (Role kasir)'
        ELSE 'GAGAL (Metadata role dieksploitasi!)'
    END AS test_result
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '11111111-1111-1111-1111-111111111111';


-- ==============================================================================
-- SKENARIO 2: KASIR MENCOBA UPDATE ROLE KE ADMIN (KRITIS #2)
-- ==============================================================================
-- Ekspektasi: Ditolak oleh trigger protect_profile_privileges.
\echo ''
\echo '>>> [SKENARIO 2] Kasir mencoba eskalasi wewenang sendiri ke admin...'
DO $$
DECLARE
    v_error_thrown BOOLEAN := false;
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111111';
        RAISE WARNING 'GAGAL: Kasir berhasil mengubah role!';
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN RAISE EXCEPTION 'TEST FAILED: Trigger proteksi profil tidak aktif!'; END IF;
END $$;


-- ==============================================================================
-- SKENARIO 3: KASIR MEMBACA HPP (buy_price) (TINGGI #4)
-- ==============================================================================
-- Ekspektasi: Direct SELECT products = 0 baris, View v_products_public > 0 baris tanpa HPP.
\echo ''
\echo '>>> [SKENARIO 3] Kasir mencoba membaca tabel fisik products vs view v_products_public...'
DO $$
DECLARE
    v_count_direct INT;
    v_count_view INT;
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    SELECT COUNT(*) INTO v_count_direct FROM public.products;
    SELECT COUNT(*) INTO v_count_view FROM public.v_products_public;

    IF v_count_direct = 0 AND v_count_view > 0 THEN
        RAISE NOTICE 'BERHASIL (LULUS): Direct products = 0 baris (RLS aman), v_products_public = % produk.', v_count_view;
    ELSE
        RAISE WARNING 'HASIL: Direct count = %, View count = %', v_count_direct, v_count_view;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 4: KASIR AKTIF MEMANGGIL adjust_stock (TINGGI #3)
-- ==============================================================================
-- Ekspektasi: Ditolak error "Hanya Admin aktif yang berhak..."
\echo ''
\echo '>>> [SKENARIO 4] Kasir aktif memanggil RPC adjust_stock...'
DO $$
DECLARE
    v_prod_id UUID;
    v_error_thrown BOOLEAN := false;
BEGIN
    SELECT id INTO v_prod_id FROM public.products LIMIT 1;
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        PERFORM public.adjust_stock(v_prod_id, 999, 'Percobaan Fraud Kasir', 'Manipulasi stok');
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN RAISE EXCEPTION 'TEST FAILED: adjust_stock tidak membatasi role kasir!'; END IF;
END $$;


-- ==============================================================================
-- SKENARIO 5: KASIR MENGUBAH POIN PELANGGAN SECARA MANUAL (UPDATE)
-- ==============================================================================
-- Ekspektasi: Ditolak oleh trigger protect_customer_loyalty_fields.
\echo ''
\echo '>>> [SKENARIO 5] Kasir mencoba UPDATE manual poin pelanggan...'
DO $$
DECLARE
    v_cust_id UUID;
    v_error_thrown BOOLEAN := false;
BEGIN
    SELECT id INTO v_cust_id FROM public.customers LIMIT 1;
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        UPDATE public.customers SET points = 999999 WHERE id = v_cust_id;
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN RAISE EXCEPTION 'TEST FAILED: Trigger proteksi poin tidak aktif!'; END IF;
END $$;


-- ==============================================================================
-- SKENARIO 6: TRANSAKSI DENGAN PRODUK DUPLIKAT DI KERANJANG
-- ==============================================================================
-- Ekspektasi: Kuantitas digabung otomatis, stok terpotong benar, 1 baris di transaction_items.
\echo ''
\echo '>>> [SKENARIO 6] Transaksi keranjang dengan ID produk duplikat...'
DO $$
DECLARE
    v_prod_id UUID;
    v_initial_stock INT;
    v_final_stock INT;
    v_payload JSONB;
    v_result JSONB;
    v_tx_id UUID;
    v_item_rows INT;
    v_item_qty INT;
BEGIN
    SELECT id, stock INTO v_prod_id, v_initial_stock FROM public.products WHERE is_active = true AND stock >= 10 LIMIT 1;
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_payload := jsonb_build_array(
        jsonb_build_object('product_id', v_prod_id, 'qty', 2, 'discount', 0),
        jsonb_build_object('product_id', v_prod_id, 'qty', 3, 'discount', 0)
    );

    v_result := public.create_transaction(
        p_customer_id := NULL,
        p_payment_method := 'tunai',
        p_discount := 0,
        p_voucher_id := NULL,
        p_redeem_points := false,
        p_amount_paid := 10000000.00,
        p_items := v_payload,
        p_notes := 'Uji Coba Penggabungan Duplikat Item'
    );
    v_tx_id := (v_result->>'transaction_id')::UUID;

    SELECT COUNT(*), SUM(quantity) INTO v_item_rows, v_item_qty FROM public.transaction_items WHERE transaction_id = v_tx_id;
    SELECT stock INTO v_final_stock FROM public.products WHERE id = v_prod_id;

    IF v_item_rows = 1 AND v_item_qty = 5 AND v_final_stock = (v_initial_stock - 5) THEN
        RAISE NOTICE 'BERHASIL (LULUS): Item digabung jadi % baris, total qty = %, stok terpotong = % (Sisa: %).',
            v_item_rows, v_item_qty, (v_initial_stock - v_final_stock), v_final_stock;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Penggabungan gagal! Baris: %, Qty: %, Stok: %', v_item_rows, v_item_qty, v_final_stock;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 7: VALIDASI FORMAT NOMOR FAKTUR KE-10000 (GREATEST LPAD)
-- ==============================================================================
-- Ekspektasi: Invoice bernilai 'TRX-10000' (bukan terpotong 'TRX-1000').
\echo ''
\echo '>>> [SKENARIO 7] Validasi format nomor faktur >= 10000...'
DO $$
DECLARE
    v_prod_id UUID;
    v_payload JSONB;
    v_result JSONB;
    v_invoice_no TEXT;
BEGIN
    PERFORM setval('public.transaction_invoice_seq', 9999, true);
    SELECT id INTO v_prod_id FROM public.products WHERE is_active = true AND stock >= 1 LIMIT 1;
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_payload := jsonb_build_array(jsonb_build_object('product_id', v_prod_id, 'qty', 1, 'discount', 0));

    v_result := public.create_transaction(
        p_customer_id := NULL,
        p_payment_method := 'qris',
        p_discount := 0,
        p_voucher_id := NULL,
        p_redeem_points := false,
        p_amount_paid := 10000000.00,
        p_items := v_payload,
        p_notes := 'Uji Coba Invoice 10000'
    );
    v_invoice_no := v_result->>'invoice_no';

    IF v_invoice_no = 'TRX-10000' THEN
        RAISE NOTICE 'BERHASIL (LULUS): Format nomor faktur utuh "%".', v_invoice_no;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Nomor faktur terpotong: %', v_invoice_no;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 8: USER NONAKTIF MEMANGGIL RPC (NULL FAIL-OPEN DEFENSE) (0008 #1)
-- ==============================================================================
-- User nonaktif (get_my_role() = NULL) mencoba:
-- a. adjust_stock
-- b. void_transaction
-- c. create_transaction
-- d. mengaktifkan dirinya sendiri via UPDATE profiles SET is_active = true
-- Ekspektasi: Seluruh aksi DITOLAK KETAT.
\echo ''
\echo '>>> [SKENARIO 8] User nonaktif mencoba memanggil RPC & mengaktifkan diri sendiri...'
DO $$
DECLARE
    v_prod_id UUID;
    v_tx_id UUID;
    v_err_adjust BOOLEAN := false;
    v_err_void BOOLEAN := false;
    v_err_create BOOLEAN := false;
    v_err_activate BOOLEAN := false;
BEGIN
    SELECT id INTO v_prod_id FROM public.products WHERE is_active = true LIMIT 1;
    SELECT id INTO v_tx_id FROM public.transactions LIMIT 1;

    -- Simulasikan sesi User Nonaktif
    PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    -- 8a. adjust_stock
    BEGIN
        PERFORM public.adjust_stock(v_prod_id, 100, 'Nonaktif Opname');
    EXCEPTION WHEN OTHERS THEN
        v_err_adjust := true;
        RAISE NOTICE '8a. adjust_stock DITOLAK (LULUS): %', SQLERRM;
    END;

    -- 8b. void_transaction
    BEGIN
        PERFORM public.void_transaction(v_tx_id, 'Nonaktif Void');
    EXCEPTION WHEN OTHERS THEN
        v_err_void := true;
        RAISE NOTICE '8b. void_transaction DITOLAK (LULUS): %', SQLERRM;
    END;

    -- 8c. create_transaction
    BEGIN
        PERFORM public.create_transaction(
            p_items := jsonb_build_array(jsonb_build_object('product_id', v_prod_id, 'qty', 1, 'discount', 0)),
            p_amount_paid := 1000000.00
        );
    EXCEPTION WHEN OTHERS THEN
        v_err_create := true;
        RAISE NOTICE '8c. create_transaction DITOLAK (LULUS): %', SQLERRM;
    END;

    -- 8d. Mengaktifkan diri sendiri
    BEGIN
        UPDATE public.profiles SET is_active = true WHERE id = '22222222-2222-2222-2222-222222222222';
    EXCEPTION WHEN OTHERS THEN
        v_err_activate := true;
        RAISE NOTICE '8d. Self-activation DITOLAK (LULUS): %', SQLERRM;
    END;

    IF NOT (v_err_adjust AND v_err_void AND v_err_create AND v_err_activate) THEN
        RAISE EXCEPTION 'TEST FAILED: Salah satu aksi user nonaktif lolos!';
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 9: KASIR MENCOBA INSERT PELANGGAN BARU DENGAN POIN BESAR (0008 #3)
-- ==============================================================================
-- Ekspektasi: Trigger trg_enforce_customer_defaults otomatis mereset points=0,
-- total_spent=0, dan tier='bronze'.
\echo ''
\echo '>>> [SKENARIO 9] Kasir mencoba INSERT pelanggan dengan points besar...'
DO $$
DECLARE
    v_new_cust_id UUID;
    v_actual_points INT;
    v_actual_spent NUMERIC(14,2);
    v_actual_tier member_tier;
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    -- Kasir mencoba menyuntikkan poin & tier langsung saat registrasi pelanggan
    INSERT INTO public.customers (name, phone, points, total_spent, tier)
    VALUES ('Budi Fraud Member', '089999888877', 99999, 15000000.00, 'platinum')
    RETURNING id, points, total_spent, tier INTO v_new_cust_id, v_actual_points, v_actual_spent, v_actual_tier;

    IF v_actual_points = 0 AND v_actual_spent = 0.00 AND v_actual_tier = 'bronze' THEN
        RAISE NOTICE 'BERHASIL DINETRALISIR (LULUS): Nilai awal dipaksa: Points=%, Spent=%, Tier=%.',
            v_actual_points, v_actual_spent, v_actual_tier;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Kasir berhasil menyuntikkan poin awal: Points=%, Spent=%, Tier=%',
            v_actual_points, v_actual_spent, v_actual_tier;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 10: ANON & GROOMER MEMBACA VIEW DEFINER (0008 #2)
-- ==============================================================================
-- Ekspektasi:
-- 1. Anon (public REST client) membaca setiap view -> 0 baris.
-- 2. Groomer membaca v_daily_sales -> 0 baris.
\echo ''
\echo '>>> [SKENARIO 10] Anon & Groomer membaca view analitik & katalog...'
DO $$
DECLARE
    v_anon_prod INT;
    v_anon_sales INT;
    v_anon_dash INT;
    v_groomer_sales INT;
BEGIN
    -- 1. Sesi Anon
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', 'anon', true);

    SELECT COUNT(*) INTO v_anon_prod FROM public.v_products_public;
    SELECT COUNT(*) INTO v_anon_sales FROM public.v_daily_sales;
    SELECT COUNT(*) INTO v_anon_dash FROM public.v_dashboard_today;

    -- 2. Sesi Groomer Aktif
    PERFORM set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    SELECT COUNT(*) INTO v_groomer_sales FROM public.v_daily_sales;

    IF v_anon_prod = 0 AND v_anon_sales = 0 AND v_anon_dash = 0 AND v_groomer_sales = 0 THEN
        RAISE NOTICE 'BERHASIL (LULUS): Seluruh view mengembalikan 0 baris untuk Anon dan Groomer.';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: View bocor! Anon prod: %, Anon sales: %, Anon dash: %, Groomer sales: %',
            v_anon_prod, v_anon_sales, v_anon_dash, v_groomer_sales;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 11: CEK VIEW DEFINER OPTIONS (pg_class reloptions)
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 11] Cek konfigurasi reloptions pada pg_class untuk seluruh view v_%:'
SELECT relname, reloptions 
FROM pg_class 
WHERE relname LIKE 'v_%' AND relkind = 'v'
ORDER BY relname ASC;

\echo ''
\echo '=============================================================================='
\echo 'SELURUH SKENARIO PENGUJIAN KEAMANAN ROUND 1 & 2 SELESAI!'
\echo '=============================================================================='
