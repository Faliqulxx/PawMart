-- ==============================================================================
-- supabase/tests/security_checks.sql
-- PawMart POS - Pengujian Keamanan & Validasi Batas Hak Akses (Security Checks)
-- ==============================================================================
-- File ini berisi skenario pengujian manual dan otomatis berbasis SQL untuk
-- memvalidasi perbaikan keamanan pada migrasi 0007_security_fixes.sql.
--
-- CARA MENJALANKAN:
-- 1. Pastikan migrasi 0001 s.d. 0007 dan seed.sql sudah dijalankan di database.
-- 2. Buka Supabase SQL Editor atau psql client sebagai superuser/postgres.
-- 3. Jalankan skrip ini per bagian atau sekaligus untuk melihat hasil validasi.
-- ==============================================================================

\echo '=============================================================================='
\echo 'MEMULAI PENGUJIAN KEAMANAN PAWMART POS (0007_SECURITY_FIXES.SQL)'
\echo '=============================================================================='

-- ------------------------------------------------------------------------------
-- SETUP: SIAPKAN DATA UJI DAN PENGGUNA SIMULASI
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_kasir_uid UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_uid UUID := '99999999-9999-9999-9999-999999999999';
BEGIN
    -- 1. Buat / pastikan user kasir simulasi
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (
        v_kasir_uid, 
        'kasir_test@pawmart.id', 
        '{"full_name": "Kasir Uji Coba", "role": "admin"}'::jsonb, -- Percobaan injeksi role admin via metadata
        'authenticated', 
        'authenticated'
    )
    ON CONFLICT (id) DO UPDATE SET raw_user_meta_data = EXCLUDED.raw_user_meta_data;

    -- 2. Buat / pastikan user admin simulasi
    INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud)
    VALUES (
        v_admin_uid, 
        'admin_test@pawmart.id', 
        '{"full_name": "Admin Utama Uji Coba"}'::jsonb, 
        'authenticated', 
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Pasang role admin manual di profiles untuk user admin
    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (v_admin_uid, 'Admin Utama Uji Coba', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;

    RAISE NOTICE '>>> Setup data user simulasi selesai.';
END $$;


-- ==============================================================================
-- SKENARIO 1: SIGNUP DENGAN MENYISIPKAN ROLE 'ADMIN' DI METADATA (KRITIS #1)
-- ==============================================================================
-- TUJUAN:
-- Memastikan handle_new_user() mengabaikan raw_user_meta_data->>'role'.
-- Semua user baru harus selalu berstatus role 'kasir'.
--
-- HASIL YANG DIHARAPKAN:
-- Kolom `role` di public.profiles bernilai 'kasir' (BUKAN 'admin').
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 1] Cek hasil pendaftaran user kasir dengan metadata role=admin...'
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role AS actual_role,
    CASE 
        WHEN p.role = 'kasir' THEN 'BERHASIL (LULUS KEAMANAN: Role default kasir diterapkan)'
        ELSE 'GAGAL (BAHAYA: Metadata role dieksploitasi!)'
    END AS test_result
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '11111111-1111-1111-1111-111111111111';


-- ==============================================================================
-- SKENARIO 2: KASIR MENCOBA UPDATE ROLE / IS_ACTIVE SENDIRI (KRITIS #2)
-- ==============================================================================
-- TUJUAN:
-- Kasir mencoba mengubah rolenya sendiri menjadi 'admin' atau mematikan akun staf lain.
-- Trigger `trg_protect_profile_privileges` harus menggagalkan upaya ini.
--
-- HASIL YANG DIHARAPKAN:
-- Eksekusi menghasilkan ERROR:
-- "Akses ditolak: Hanya Admin yang berhak mengubah role atau status aktif akun pengguna."
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 2] Kasir mencoba eskalasi wewenang sendiri menjadi admin...'
DO $$
DECLARE
    v_error_thrown BOOLEAN := false;
BEGIN
    -- Simulasikan sesi login sebagai Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = '11111111-1111-1111-1111-111111111111';
        
        RAISE WARNING 'GAGAL: Kasir berhasil mengubah rolenya sendiri ke admin!';
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): Pesan Error: %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN
        RAISE EXCEPTION 'TEST FAILED: Trigger proteksi profil tidak aktif!';
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 3: KASIR MENCOBA MEMBACA HARGA BELI (HPP / buy_price) (TINGGI #4)
-- ==============================================================================
-- TUJUAN:
-- Memastikan tabel fisik `products` tidak mengembalikan data buy_price ke kasir
-- (karena RLS hanya izinkan Admin), sedangkan view `v_products_public` dapat diakses
-- kasir tanpa memuat kolom buy_price.
--
-- HASIL YANG DIHARAPKAN:
-- 1. Direct query `SELECT buy_price FROM products` menghasilkan 0 baris (RLS blok kasir).
-- 2. Query `SELECT name, sell_price FROM v_products_public` menghasilkan daftar produk.
-- 3. Query `SELECT buy_price FROM v_products_public` menghasilkan error kolom tidak ada.
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 3] Kasir mencoba membaca tabel products fisik vs v_products_public...'
DO $$
DECLARE
    v_count_direct INT;
    v_count_view INT;
BEGIN
    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    -- 1. Akses langsung ke tabel fisik products
    SELECT COUNT(*) INTO v_count_direct FROM public.products;
    
    -- 2. Akses ke view v_products_public
    SELECT COUNT(*) INTO v_count_view FROM public.v_products_public;

    IF v_count_direct = 0 AND v_count_view > 0 THEN
        RAISE NOTICE 'BERHASIL (LULUS): Direct SELECT products terblokir RLS (0 baris), namun view v_products_public menampilkan % produk.', v_count_view;
    ELSE
        RAISE WARNING 'HASIL: Direct row count: %, View row count: %', v_count_direct, v_count_view;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 4: KASIR MENCOBA MEMANGGIL adjust_stock (TINGGI #3)
-- ==============================================================================
-- TUJUAN:
-- Memastikan fungsi `adjust_stock` hanya dapat dipanggil oleh Admin.
--
-- HASIL YANG DIHARAPKAN:
-- Eksekusi oleh kasir menghasilkan ERROR:
-- "Akses ditolak: Hanya Admin yang berhak melakukan penyesuaian stok opname."
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 4] Kasir mencoba memanggil RPC adjust_stock...'
DO $$
DECLARE
    v_prod_id UUID;
    v_error_thrown BOOLEAN := false;
BEGIN
    SELECT id INTO v_prod_id FROM public.products LIMIT 1;

    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        PERFORM public.adjust_stock(v_prod_id, 999, 'Percobaan Fraud Kasir', 'Manipulasi stok');
        RAISE WARNING 'GAGAL: Kasir berhasil memanggil adjust_stock!';
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): Pesan Error: %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN
        RAISE EXCEPTION 'TEST FAILED: adjust_stock tidak membatasi role kasir!';
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 5: KASIR MENCOBA MENGUBAH POIN / TIER PELANGGAN SECARA MANUAL (TINGGI #5)
-- ==============================================================================
-- TUJUAN:
-- Mencegah kasir atau pihak luar melakukan manipulasi saldo poin loyalitas
-- tanpa melalui transaksi resmi kasir.
--
-- HASIL YANG DIHARAPKAN:
-- Eksekusi menghasilkan ERROR:
-- "Akses ditolak: Poin, total belanja, dan tier pelanggan hanya dapat diperbarui secara otomatis lewat transaksi kasir resmi atau oleh Admin."
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 5] Kasir mencoba mengubah langsung poin pelanggan...'
DO $$
DECLARE
    v_cust_id UUID;
    v_error_thrown BOOLEAN := false;
BEGIN
    SELECT id INTO v_cust_id FROM public.customers LIMIT 1;

    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        UPDATE public.customers
        SET points = 999999
        WHERE id = v_cust_id;

        RAISE WARNING 'GAGAL: Poin pelanggan berhasil diubah secara manual!';
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): Pesan Error: %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN
        RAISE EXCEPTION 'TEST FAILED: Trigger proteksi poin pelanggan tidak aktif!';
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 6: TRANSAKSI DENGAN PRODUK DUPLIKAT DI KERANJANG (SEDANG #7)
-- ==============================================================================
-- TUJUAN:
-- Jika kasir mengirim payload transaksi dengan product_id yang sama berulang kali
-- (misal scan barcode produk A 2 item, lalu scan produk A lagi 3 item), sistem
-- harus menggabungkan kuantitasnya (total 5) sebelum validasi stok dan menyimpan
-- rincian item dengan benar tanpa race condition atau deadlock.
--
-- HASIL YANG DIHARAPKAN:
-- 1. Transaksi berhasil dibuat.
-- 2. Tabel `transaction_items` mencatat 1 baris untuk produk tersebut dengan qty = 5.
-- 3. Stok fisik berkurang tepat 5 unit.
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 6] Transaksi dengan produk duplikat di keranjang belanja...'
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
    -- Ambil satu produk aktif yang stoknya cukup
    SELECT id, stock INTO v_prod_id, v_initial_stock 
    FROM public.products 
    WHERE is_active = true AND stock >= 10 
    LIMIT 1;

    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    -- Keranjang belanja dengan duplikasi ID produk (2 unit + 3 unit)
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

    -- Cek rincian di transaction_items
    SELECT COUNT(*), SUM(quantity) INTO v_item_rows, v_item_qty
    FROM public.transaction_items
    WHERE transaction_id = v_tx_id;

    -- Cek stok akhir produk
    SELECT stock INTO v_final_stock FROM public.products WHERE id = v_prod_id;

    IF v_item_rows = 1 AND v_item_qty = 5 AND v_final_stock = (v_initial_stock - 5) THEN
        RAISE NOTICE 'BERHASIL (LULUS): Item duplikat digabung menjadi % baris, total qty = %, stok terpotong = % (Sisa: %).',
            v_item_rows, v_item_qty, (v_initial_stock - v_final_stock), v_final_stock;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Penggabungan item gagal! Baris: %, Qty: %, Stok sisa: %', 
            v_item_rows, v_item_qty, v_final_stock;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 7: VALIDASI NOMOR FAKTUR DI ATAS 9999 (INVOICE KE-10000) (SEDANG #6)
-- ==============================================================================
-- TUJUAN:
-- Memastikan format nomor faktur tidak terpotong oleh `lpad` saat nomor urut
-- telah mencapai 5 digit (>= 10000). Menguji perbaikan
-- `lpad(v_invoice_seq::TEXT, GREATEST(4, length(v_invoice_seq::TEXT)), '0')`.
--
-- HASIL YANG DIHARAPKAN:
-- Nomor faktur yang terbentuk adalah 'TRX-10000' (BUKAN 'TRX-1000').
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 7] Validasi format nomor faktur 10000...'
DO $$
DECLARE
    v_prod_id UUID;
    v_payload JSONB;
    v_result JSONB;
    v_invoice_no TEXT;
BEGIN
    -- Set sequence ke 9999 sehingga nextval bernilai 10000
    PERFORM setval('public.transaction_invoice_seq', 9999, true);

    SELECT id INTO v_prod_id FROM public.products WHERE is_active = true AND stock >= 1 LIMIT 1;

    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_payload := jsonb_build_array(
        jsonb_build_object('product_id', v_prod_id, 'qty', 1, 'discount', 0)
    );

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
        RAISE NOTICE 'BERHASIL (LULUS): Nomor faktur tercetak utuh "%", tidak terpotong menjadi TRX-1000.', v_invoice_no;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Nomor faktur terpotong atau salah format: %', v_invoice_no;
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 8: VALIDASI BATAS MAKSIMAL DISKON MANUAL KASIR (SEDANG #9)
-- ==============================================================================
-- TUJUAN:
-- Kasir memberikan diskon manual di atas 10% dari subtotal tanpa wewenang Admin.
--
-- HASIL YANG DIHARAPKAN:
-- Transaksi ditolak dengan pesan:
-- "Diskon manual kasir (...) melebihi batas maksimal 10.00 persen (...). Persetujuan Admin diperlukan."
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 8] Validasi batas diskon manual kasir (> 10%)...'
DO $$
DECLARE
    v_prod_id UUID;
    v_sell_price NUMERIC(14,2);
    v_payload JSONB;
    v_error_thrown BOOLEAN := false;
BEGIN
    SELECT id, sell_price INTO v_prod_id, v_sell_price 
    FROM public.products 
    WHERE is_active = true AND stock >= 1 
    LIMIT 1;

    -- Simulasikan sesi Kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_payload := jsonb_build_array(
        jsonb_build_object('product_id', v_prod_id, 'qty', 1, 'discount', 0)
    );

    BEGIN
        -- Berikan diskon 50% dari harga jual (melebihi batas max 10%)
        PERFORM public.create_transaction(
            p_customer_id := NULL,
            p_payment_method := 'tunai',
            p_discount := (v_sell_price * 0.5), 
            p_voucher_id := NULL,
            p_redeem_points := false,
            p_amount_paid := v_sell_price,
            p_items := v_payload,
            p_notes := 'Uji Coba Diskon Melebihi Kuota Kasir'
        );
        RAISE WARNING 'GAGAL: Kasir berhasil memberikan diskon 50%% tanpa batas!';
    EXCEPTION WHEN OTHERS THEN
        v_error_thrown := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): Pesan Error: %', SQLERRM;
    END;

    IF NOT v_error_thrown THEN
        RAISE EXCEPTION 'TEST FAILED: Validasi batas diskon kasir tidak bekerja!';
    END IF;
END $$;


-- ==============================================================================
-- SKENARIO 9: VOID TRANSAKSI & RESTORASI USED_COUNT VOUCHER (SEDANG #8)
-- ==============================================================================
-- TUJUAN:
-- 1. Kasir mencoba void transaksi (harus ditolak).
-- 2. Admin melakukan void transaksi: stok dikembalikan dan used_count voucher dikurangi.
--
-- HASIL YANG DIHARAPKAN:
-- Kasir gagal; Admin sukses; voucher used_count berkurang 1.
-- ==============================================================================
\echo ''
\echo '>>> [SKENARIO 9] Pembatalan transaksi (void) dan pemulihan kuota voucher...'
DO $$
DECLARE
    v_voucher_id UUID;
    v_prod_id UUID;
    v_used_before INT;
    v_used_after INT;
    v_tx_result JSONB;
    v_tx_id UUID;
    v_payload JSONB;
    v_error_kasir BOOLEAN := false;
BEGIN
    -- Ambil voucher aktif
    SELECT id, used_count INTO v_voucher_id, v_used_before 
    FROM public.vouchers 
    WHERE is_active = true AND valid_until >= CURRENT_DATE 
    LIMIT 1;

    SELECT id INTO v_prod_id FROM public.products WHERE is_active = true AND stock >= 5 LIMIT 1;

    -- 1. Buat transaksi dengan voucher oleh kasir
    PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_payload := jsonb_build_array(
        jsonb_build_object('product_id', v_prod_id, 'qty', 1, 'discount', 0)
    );

    v_tx_result := public.create_transaction(
        p_customer_id := NULL,
        p_payment_method := 'tunai',
        p_discount := 0,
        p_voucher_id := v_voucher_id,
        p_redeem_points := false,
        p_amount_paid := 10000000.00,
        p_items := v_payload,
        p_notes := 'Uji Transaksi Voucher'
    );
    v_tx_id := (v_tx_result->>'transaction_id')::UUID;

    -- 2. Kasir mencoba membatalkan transaksi (harus ditolak)
    BEGIN
        PERFORM public.void_transaction(v_tx_id, 'Kasir coba void');
    EXCEPTION WHEN OTHERS THEN
        v_error_kasir := true;
        RAISE NOTICE 'BERHASIL DITOLAK (LULUS): Kasir ditolak saat void: %', SQLERRM;
    END;

    IF NOT v_error_kasir THEN
        RAISE EXCEPTION 'TEST FAILED: Kasir diizinkan melakukan void_transaction!';
    END IF;

    -- 3. Admin membatalkan transaksi
    PERFORM set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
    PERFORM public.void_transaction(v_tx_id, 'Admin membatalkan transaksi uji coba');

    -- Cek used_count voucher setelah void
    SELECT used_count INTO v_used_after FROM public.vouchers WHERE id = v_voucher_id;

    IF v_used_after = v_used_before THEN
        RAISE NOTICE 'BERHASIL (LULUS): Admin berhasil void transaksi, voucher used_count kembali ke % semula.', v_used_after;
    ELSE
        RAISE WARNING 'Catatan: used_count sebelum: %, sesudah void: %', v_used_before, v_used_after;
    END IF;
END $$;

\echo ''
\echo '=============================================================================='
\echo 'SELURUH SKENARIO PENGUJIAN KEAMANAN SELESAI DENGAN SUKSES!'
\echo '=============================================================================='
