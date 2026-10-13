-- ==============================================================================
-- 0002_core_tables.sql
-- PawMart POS - Tabel Inti, CRM, Inventaris, Transaksi, dan Layanan Jasa
-- ==============================================================================

-- 1. TABEL PENGATURAN TOKO (SINGLETON - HANYA 1 BARIS)
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_singleton BOOLEAN NOT NULL DEFAULT true CHECK (is_singleton = true),
    store_name TEXT NOT NULL DEFAULT 'PawMart Pet Care & Shop',
    slogan TEXT DEFAULT 'Pusat Kebutuhan Anabul Terlengkap & Terpercaya',
    address TEXT NOT NULL DEFAULT 'Jl. Kemang Raya No. 42A, Jakarta Selatan',
    phone TEXT NOT NULL DEFAULT '021-7890123 / 0812-9988-7766',
    email TEXT DEFAULT 'support@pawmart.id',
    website TEXT DEFAULT 'www.pawmart.id',
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 11.00 CHECK (tax_percentage >= 0),
    is_tax_enabled BOOLEAN NOT NULL DEFAULT false,
    service_fee NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (service_fee >= 0),
    is_service_fee_enabled BOOLEAN NOT NULL DEFAULT false,
    receipt_paper_size TEXT NOT NULL DEFAULT '80mm' CHECK (receipt_paper_size IN ('58mm', '80mm')),
    receipt_footer TEXT DEFAULT 'Terima kasih telah berbelanja di PawMart! Barang yang sudah dibeli dapat ditukar maksimal 2 hari dengan membawa struk.',
    points_per_amount NUMERIC(14,2) NOT NULL DEFAULT 10000.00 CHECK (points_per_amount > 0),
    point_value NUMERIC(14,2) NOT NULL DEFAULT 100.00 CHECK (point_value > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_store_settings_singleton UNIQUE (is_singleton)
);
COMMENT ON TABLE store_settings IS 'Pengaturan global toko PawMart (alamat, pajak, konfigurasi struk, aturan poin). Dibatasi hanya 1 baris.';

-- 2. TABEL PROFIL PENGGUNA (TERHUBUNG KE auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'kasir',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE profiles IS 'Profil pengguna yang terhubung langsung dengan akun otentikasi Supabase (auth.users)';

-- 3. TABEL KATEGORI PRODUK
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE categories IS 'Kategori produk ritel toko (Makanan Kucing, Makanan Anjing, Aksesoris, Pasir, Obat & Vitamin, Kandang)';

-- 4. TABEL PRODUK RITEL
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    barcode TEXT UNIQUE, -- Boleh null jika produk belum memiliki barcode fisik
    buy_price NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (buy_price >= 0),
    sell_price NUMERIC(14,2) NOT NULL CHECK (sell_price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INT NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
    unit TEXT NOT NULL DEFAULT 'Pcs',
    image_url TEXT,
    expiry_date DATE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE products IS 'Master data barang inventaris toko pet shop';

-- 5. TABEL PELANGGAN (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    tier member_tier NOT NULL DEFAULT 'bronze',
    points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
    total_spent NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
    last_visit_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE customers IS 'Data pelanggan pemilik anabul dan saldo poin loyalitas';

-- 6. TABEL HEWAN PELIHARAAN (PETS)
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species pet_species NOT NULL DEFAULT 'kucing',
    breed TEXT,
    birth_date DATE, -- Menggunakan tanggal lahir agar umur dinamis dan tidak basi
    gender pet_gender,
    weight_kg NUMERIC(5,2) CHECK (weight_kg > 0),
    size pet_size DEFAULT 'kecil',
    special_notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE pets IS 'Profil anabul yang terikat dengan pelanggan';

-- 7. TABEL REKAM MEDIS & JADWAL VAKSINASI ANABUL
CREATE TABLE IF NOT EXISTS pet_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    given_at DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_at DATE NOT NULL,
    veterinarian_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_vaccination_dates CHECK (next_due_at >= given_at)
);
COMMENT ON TABLE pet_vaccinations IS 'Riwayat vaksinasi dan pengingat tanggal vaksin berikutnya untuk anabul';

-- 8. TABEL VOUCHER PROMO LOYALITAS
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type voucher_type NOT NULL DEFAULT 'nominal',
    value NUMERIC(14,2) NOT NULL CHECK (value > 0),
    min_spend NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (min_spend >= 0),
    quota INT NOT NULL DEFAULT 100 CHECK (quota >= 0),
    used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    valid_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vouchers IS 'Katalog voucher diskon belanja Kasir POS';

-- 9. TABEL TRANSAKSI KASIR (BILLING HEADER)
-- Sequence untuk nomor faktur TRX-XXXX berurutan
CREATE SEQUENCE IF NOT EXISTS transaction_invoice_seq START WITH 1;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Boleh NULL untuk walk-in customer (Pelanggan Umum)
    cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status transaction_status NOT NULL DEFAULT 'selesai',
    payment_method payment_method NOT NULL DEFAULT 'tunai',
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    points_redeemed INT NOT NULL DEFAULT 0 CHECK (points_redeemed >= 0),
    points_discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (points_discount_amount >= 0),
    tax NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
    amount_paid NUMERIC(14,2) NOT NULL CHECK (amount_paid >= 0),
    change_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (change_amount >= 0),
    points_earned INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_total_consistency CHECK (total = GREATEST(0, subtotal - discount - points_discount_amount) + tax),
    CONSTRAINT chk_amount_paid CHECK (status != 'selesai' OR amount_paid >= total)
);
COMMENT ON TABLE transactions IS 'Header transaksi penjualan kasir POS';

-- 10. TABEL ITEM DETAIL TRANSAKSI (BILLING ITEMS)
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Null jika produk telah dihapus atau item jasa ad-hoc
    product_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(14,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    buy_price_snapshot NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (buy_price_snapshot >= 0), -- Snapshot HPP untuk hitung laba kotor akurat
    quantity INT NOT NULL CHECK (quantity > 0),
    discount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    line_total NUMERIC(14,2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE transaction_items IS 'Rincian item barang pada setiap struk transaksi';

-- 11. TABEL MUTASI & LOG PERSEDIAAN STOK (INVENTORY MOVEMENTS)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    type stock_movement_type NOT NULL,
    quantity INT NOT NULL, -- Negatif untuk keluar, positif untuk masuk
    stock_before INT NOT NULL CHECK (stock_before >= 0),
    stock_after INT NOT NULL CHECK (stock_after >= 0),
    reason TEXT NOT NULL,
    notes TEXT,
    reference_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE stock_movements IS 'Audit log pergerakan stok barang fisik (penjualan kasir, restock, rusak, opname)';

-- ==============================================================================
-- MODUL LAYANAN JASA, BOOKING, DAN PET HOTEL (Berdasarkan prd-layanan-jasa.md)
-- ==============================================================================

-- 12. TABEL KATALOG LAYANAN JASA
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Grooming', 'Paket', 'Kesehatan', 'Penitipan')),
    duration_minutes INT NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    price_small NUMERIC(14,2) NOT NULL CHECK (price_small >= 0),
    price_medium NUMERIC(14,2) NOT NULL CHECK (price_medium >= 0),
    price_large NUMERIC(14,2) NOT NULL CHECK (price_large >= 0),
    description TEXT,
    package_items TEXT[], -- Daftar rincian isi jika kategori = Paket
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE services IS 'Katalog paket grooming, spa, dan tindakan medis hewan';

-- 13. TABEL ADDON LAYANAN
CREATE TABLE IF NOT EXISTS service_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE service_addons IS 'Add-on tambahan pengerjaan jasa (detangling, parfum khusus, sikat gigi)';

-- 14. TABEL KAMAR / KANDANG PET HOTEL
CREATE TABLE IF NOT EXISTS cages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- S-01, P-01, V-01
    name TEXT NOT NULL,
    type cage_type NOT NULL DEFAULT 'standar',
    rate_per_night NUMERIC(14,2) NOT NULL CHECK (rate_per_night >= 0),
    status cage_status NOT NULL DEFAULT 'tersedia',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE cages IS 'Kamar inap / kandang pet hotel';

-- 15. TABEL RESERVASI & BOOKING JASA
CREATE SEQUENCE IF NOT EXISTS booking_no_seq START WITH 1;

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_no TEXT NOT NULL UNIQUE,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Groomer / Dokter yang ditugaskan
    total_price NUMERIC(14,2) NOT NULL CHECK (total_price >= 0),
    down_payment NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (down_payment >= 0),
    status booking_status NOT NULL DEFAULT 'menunggu_konfirmasi',
    notes TEXT,
    reference_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE bookings IS 'Jadwal reservasi grooming dan konsultasi dokter hewan';

-- 16. TABEL INAP PET HOTEL (BOARDING STAYS)
CREATE SEQUENCE IF NOT EXISTS stay_no_seq START WITH 1;

CREATE TABLE IF NOT EXISTS boarding_stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_no TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
    cage_id UUID NOT NULL REFERENCES cages(id) ON DELETE RESTRICT,
    rate_per_night NUMERIC(14,2) NOT NULL CHECK (rate_per_night >= 0),
    check_in_date DATE NOT NULL,
    expected_check_out_date DATE NOT NULL,
    actual_check_out_date DATE,
    emergency_contact TEXT NOT NULL,
    bringing_food TEXT,
    special_notes TEXT,
    status boarding_stay_status NOT NULL DEFAULT 'menginap',
    reference_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_stay_dates CHECK (expected_check_out_date >= check_in_date)
);
COMMENT ON TABLE boarding_stays IS 'Pencatatan check-in/out tamu inap anabul di pet hotel PawMart';
