-- ==============================================================================
-- 0004_rls_policies.sql
-- PawMart POS - Keamanan Akses Baris (Row Level Security / RLS)
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA SELURUH TABEL
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boarding_stays ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. KEBIJAKAN TABEL PROFILES
-- ==============================================================================
-- Pengguna authenticated dapat membaca profil diri sendiri dan staf aktif
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Pengguna dapat mengupdate profil diri sendiri
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin memiliki akses penuh kelola profil staf
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
ON public.profiles FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- ==============================================================================
-- 3. KEBIJAKAN TABEL STORE_SETTINGS
-- ==============================================================================
-- Semua pengguna terautentikasi dapat membaca konfigurasi toko
DROP POLICY IF EXISTS "store_settings_read_authenticated" ON public.store_settings;
CREATE POLICY "store_settings_read_authenticated"
ON public.store_settings FOR SELECT
TO authenticated
USING (true);

-- Hanya Admin yang boleh memodifikasi pengaturan toko
DROP POLICY IF EXISTS "store_settings_admin_modify" ON public.store_settings;
CREATE POLICY "store_settings_admin_modify"
ON public.store_settings FOR UPDATE
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- ==============================================================================
-- 4. KEBIJAKAN TABEL CATEGORIES & PRODUCTS
-- ==============================================================================
-- Semua staf authenticated boleh melihat kategori dan produk aktif
DROP POLICY IF EXISTS "categories_read_all" ON public.categories;
CREATE POLICY "categories_read_all"
ON public.categories FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "categories_admin_manage" ON public.categories;
CREATE POLICY "categories_admin_manage"
ON public.categories FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "products_read_all" ON public.products;
CREATE POLICY "products_read_all"
ON public.products FOR SELECT
TO authenticated
USING (true);

-- Hanya Admin yang boleh menambah, mengubah harga/nama, atau menghapus produk
DROP POLICY IF EXISTS "products_admin_manage" ON public.products;
CREATE POLICY "products_admin_manage"
ON public.products FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- ==============================================================================
-- 5. KEBIJAKAN TABEL CUSTOMERS, PETS, & PET_VACCINATIONS
-- ==============================================================================
-- Seluruh staf (Admin, Kasir, Groomer) boleh membaca data pelanggan dan anabul
DROP POLICY IF EXISTS "customers_select_all" ON public.customers;
CREATE POLICY "customers_select_all"
ON public.customers FOR SELECT
TO authenticated
USING (true);

-- Admin dan Kasir boleh menambah dan mengubah data pelanggan
DROP POLICY IF EXISTS "customers_insert_kasir_admin" ON public.customers;
CREATE POLICY "customers_insert_kasir_admin"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (get_my_role() IN ('admin', 'kasir'));

DROP POLICY IF EXISTS "customers_update_kasir_admin" ON public.customers;
CREATE POLICY "customers_update_kasir_admin"
ON public.customers FOR UPDATE
TO authenticated
USING (get_my_role() IN ('admin', 'kasir'))
WITH CHECK (get_my_role() IN ('admin', 'kasir'));

-- Hanya Admin yang boleh menghapus data pelanggan
DROP POLICY IF EXISTS "customers_delete_admin" ON public.customers;
CREATE POLICY "customers_delete_admin"
ON public.customers FOR DELETE
TO authenticated
USING (get_my_role() = 'admin');

-- Pets & Vaksinasi: Admin, Kasir, dan Groomer boleh membaca & mengelola
DROP POLICY IF EXISTS "pets_select_all" ON public.pets;
CREATE POLICY "pets_select_all"
ON public.pets FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "pets_insert_all_staff" ON public.pets;
CREATE POLICY "pets_insert_all_staff"
ON public.pets FOR INSERT
TO authenticated
WITH CHECK (get_my_role() IN ('admin', 'kasir', 'groomer'));

DROP POLICY IF EXISTS "pets_update_all_staff" ON public.pets;
CREATE POLICY "pets_update_all_staff"
ON public.pets FOR UPDATE
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'))
WITH CHECK (get_my_role() IN ('admin', 'kasir', 'groomer'));

DROP POLICY IF EXISTS "pets_delete_admin" ON public.pets;
CREATE POLICY "pets_delete_admin"
ON public.pets FOR DELETE
TO authenticated
USING (get_my_role() = 'admin');

DROP POLICY IF EXISTS "vaccinations_select_all" ON public.pet_vaccinations;
CREATE POLICY "vaccinations_select_all"
ON public.pet_vaccinations FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "vaccinations_manage_all" ON public.pet_vaccinations;
CREATE POLICY "vaccinations_manage_all"
ON public.pet_vaccinations FOR ALL
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'))
WITH CHECK (get_my_role() IN ('admin', 'kasir', 'groomer'));

-- ==============================================================================
-- 6. KEBIJAKAN TABEL VOUCHERS
-- ==============================================================================
DROP POLICY IF EXISTS "vouchers_read_authenticated" ON public.vouchers;
CREATE POLICY "vouchers_read_authenticated"
ON public.vouchers FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "vouchers_admin_manage" ON public.vouchers;
CREATE POLICY "vouchers_admin_manage"
ON public.vouchers FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- ==============================================================================
-- 7. KEBIJAKAN TABEL TRANSACTIONS, ITEMS, & STOCK_MOVEMENTS
-- ATURAN KETAT: Client dilarang INSERT/UPDATE/DELETE langsung; wajib lewat RPC!
-- ==============================================================================
-- Pembacaan Transaksi: Admin & Kasir boleh membaca faktur riwayat
DROP POLICY IF EXISTS "transactions_read_admin_kasir" ON public.transactions;
CREATE POLICY "transactions_read_admin_kasir"
ON public.transactions FOR SELECT
TO authenticated
USING (get_my_role() IN ('admin', 'kasir'));

DROP POLICY IF EXISTS "transaction_items_read_admin_kasir" ON public.transaction_items;
CREATE POLICY "transaction_items_read_admin_kasir"
ON public.transaction_items FOR SELECT
TO authenticated
USING (get_my_role() IN ('admin', 'kasir'));

-- DILARANG INSERT/UPDATE/DELETE langsung dari client pada transaksi dan mutasi stok
-- (Semua operasi mutasi harus dieksekusi melalui RPC security definer create_transaction/void_transaction)
DROP POLICY IF EXISTS "transactions_prevent_client_write" ON public.transactions;
CREATE POLICY "transactions_prevent_client_write"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (false); -- Block direct client insert

DROP POLICY IF EXISTS "transaction_items_prevent_client_write" ON public.transaction_items;
CREATE POLICY "transaction_items_prevent_client_write"
ON public.transaction_items FOR INSERT
TO authenticated
WITH CHECK (false);

-- Stock Movements: Hanya Admin yang boleh melihat audit pergerakan stok
DROP POLICY IF EXISTS "stock_movements_read_admin" ON public.stock_movements;
CREATE POLICY "stock_movements_read_admin"
ON public.stock_movements FOR SELECT
TO authenticated
USING (get_my_role() IN ('admin', 'kasir'));

DROP POLICY IF EXISTS "stock_movements_prevent_client_write" ON public.stock_movements;
CREATE POLICY "stock_movements_prevent_client_write"
ON public.stock_movements FOR INSERT
TO authenticated
WITH CHECK (false);

-- ==============================================================================
-- 8. KEBIJAKAN LAYANAN JASA, CAGES, BOOKING, & BOARDING
-- ==============================================================================
DROP POLICY IF EXISTS "services_read_all" ON public.services;
CREATE POLICY "services_read_all"
ON public.services FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "services_admin_manage" ON public.services;
CREATE POLICY "services_admin_manage"
ON public.services FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "service_addons_read_all" ON public.service_addons;
CREATE POLICY "service_addons_read_all"
ON public.service_addons FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "service_addons_admin_manage" ON public.service_addons;
CREATE POLICY "service_addons_admin_manage"
ON public.service_addons FOR ALL
TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "cages_read_all" ON public.cages;
CREATE POLICY "cages_read_all"
ON public.cages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "cages_admin_kasir_manage" ON public.cages;
CREATE POLICY "cages_admin_kasir_manage"
ON public.cages FOR ALL
TO authenticated
USING (get_my_role() IN ('admin', 'kasir'))
WITH CHECK (get_my_role() IN ('admin', 'kasir'));

DROP POLICY IF EXISTS "bookings_read_all" ON public.bookings;
CREATE POLICY "bookings_read_all"
ON public.bookings FOR SELECT
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'));

DROP POLICY IF EXISTS "bookings_manage_all" ON public.bookings;
CREATE POLICY "bookings_manage_all"
ON public.bookings FOR ALL
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'))
WITH CHECK (get_my_role() IN ('admin', 'kasir', 'groomer'));

DROP POLICY IF EXISTS "boarding_stays_read_all" ON public.boarding_stays;
CREATE POLICY "boarding_stays_read_all"
ON public.boarding_stays FOR SELECT
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'));

DROP POLICY IF EXISTS "boarding_stays_manage_all" ON public.boarding_stays;
CREATE POLICY "boarding_stays_manage_all"
ON public.boarding_stays FOR ALL
TO authenticated
USING (get_my_role() IN ('admin', 'kasir', 'groomer'))
WITH CHECK (get_my_role() IN ('admin', 'kasir', 'groomer'));
