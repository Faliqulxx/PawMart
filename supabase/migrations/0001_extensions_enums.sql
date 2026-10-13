-- ==============================================================================
-- 0001_extensions_enums.sql
-- PawMart POS - Ekstensi PostgreSQL dan Definisi Tipe Enum
-- ==============================================================================

-- 1. AKTIFKAN EKSTENSI
-- pgcrypto untuk hashing dan fungsi uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- pg_trgm untuk indexing dan pencarian teks cepat (fuzzy/trigram search pada nama & sku)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUM ROLE PENGGUNA
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'groomer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE user_role IS 'Hak akses pengguna sistem: admin (owner/pengelola penuh), kasir (transaksi POS), groomer (layanan jasa anabul)';

-- 3. ENUM METODE PEMBAYARAN KASIR
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('tunai', 'qris', 'transfer', 'kartu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE payment_method IS 'Metode pembayaran yang didukung di Kasir POS PawMart';

-- 4. ENUM STATUS TRANSAKSI
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('selesai', 'ditahan', 'dibatalkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE transaction_status IS 'Status transaksi: selesai (lunas), ditahan (hold bill), dibatalkan (void)';

-- 5. ENUM JENIS PERGERAKAN STOK
DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM ('masuk', 'keluar', 'penyesuaian');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE stock_movement_type IS 'Arah mutasi persediaan: masuk (restock/retur beli), keluar (penjualan kasir/rusak), penyesuaian (stok opname)';

-- 6. ENUM SPESIES HEWAN (ANABUL)
DO $$ BEGIN
    CREATE TYPE pet_species AS ENUM ('kucing', 'anjing', 'kelinci', 'hamster', 'burung', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE pet_species IS 'Kategori jenis hewan peliharaan pelanggan';

-- 7. ENUM GENDER HEWAN
DO $$ BEGIN
    CREATE TYPE pet_gender AS ENUM ('jantan', 'betina');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. ENUM UKURAN HEWAN (Untuk tarif jasa grooming & hotel)
DO $$ BEGIN
    CREATE TYPE pet_size AS ENUM ('kecil', 'sedang', 'besar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE pet_size IS 'Ukuran anabul: kecil (<5kg), sedang (5-15kg), besar (>15kg)';

-- 9. ENUM STATUS BOOKING & RESERVASI JASA
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'menunggu_konfirmasi',
        'terkonfirmasi',
        'check_in',
        'diproses',
        'selesai',
        'terlambat',
        'dibatalkan',
        'tidak_hadir'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
COMMENT ON TYPE booking_status IS 'Alur status pengerjaan booking salon grooming dan klinik';

-- 10. ENUM FASILITAS PET HOTEL / KANDANG
DO $$ BEGIN
    CREATE TYPE cage_type AS ENUM ('standar', 'premium', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cage_status AS ENUM ('tersedia', 'terisi', 'perlu_dibersihkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE boarding_stay_status AS ENUM ('menunggu_check_in', 'menginap', 'check_out', 'dibatalkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. ENUM PROGRAM LOYALITAS & VOUCHER
DO $$ BEGIN
    CREATE TYPE member_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voucher_type AS ENUM ('nominal', 'persen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
