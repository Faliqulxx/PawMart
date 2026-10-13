# Panduan Database Supabase - PawMart POS

Dokumen ini berisi panduan teknis bagi developer dan administrator untuk menginisialisasi skema basis data PostgreSQL di Supabase untuk proyek **PawMart POS**.

---

## 1. Urutan Menjalankan Migration

File migrasi berada di folder `supabase/migrations/` dan harus dijalankan secara berurutan sesuai nomor:

1. **`0001_extensions_enums.sql`**
   * Mengaktifkan ekstensi `pgcrypto` dan `pg_trgm`.
   * Membuat tipe enum (`user_role`, `payment_method`, `transaction_status`, `stock_movement_type`, dll).
2. **`0002_core_tables.sql`**
   * Membuat tabel pengaturan toko (`store_settings`), profil staf (`profiles`), kategori, produk, pelanggan (`customers`), hewan peliharaan (`pets`), rekam vaksinasi, voucher, transaksi, detail item, log mutasi stok, serta layanan jasa, booking, dan pet hotel.
3. **`0003_functions_triggers.sql`**
   * Memasang trigger `touch_updated_at` otomatis.
   * Trigger pendaftaran pengguna baru (`on_auth_user_created` -> `profiles`).
   * Fungsi RPC atomik `create_transaction` (mengunci baris, validasi stok, catat mutasi, hitung diskon/pajak, dan update poin).
   * Fungsi pembatalan faktur `void_transaction` (mengembalikan stok fisik dan poin).
   * Fungsi penyesuaian stok opname `adjust_stock`.
4. **`0004_rls_policies.sql`**
   * Mengaktifkan *Row Level Security* (RLS) di seluruh tabel.
   * Menerapkan pembatasan peran (`admin`, `kasir`, `groomer`).
   * Mencegah manipulasi langsung tabel transaksi dan mutasi stok dari sisi client tanpa melewati fungsi RPC.
5. **`0005_views_indexes.sql`**
   * Membuat view analitik dasbor dan laporan (`v_dashboard_today`, `v_daily_sales`, `v_top_products`, `v_low_stock`, `v_expiring_products`, `v_sales_by_category`, `v_products_public`).
   * Membuat indeks pencarian cepat B-Tree dan Trigram GIN untuk barcode, SKU, nomor telepon, dan nama produk.
6. **`0006_storage.sql`**
   * Mendaftarkan bucket penyimpanan foto produk `product-images` (maks. 5MB).
   * Kebijakan RLS storage (publik dapat melihat foto, hanya admin yang boleh mengunggah atau menghapus).
7. **`supabase/seed.sql`**
   * Data awal: 1 baris store settings, 6 kategori, 20 produk ritel dengan barcode unik, 10 pelanggan, 12 anabul, jadwal vaksinasi, voucher promo, katalog jasa, dan kamar pet hotel.

---

## 2. Cara Menjalankan Migration

### Opsi A: Melalui Supabase Web Dashboard (SQL Editor)
1. Buka dashboard proyek Supabase Anda: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Pilih proyek PawMart POS Anda, lalu masuk ke menu **SQL Editor** pada navigasi kiri.
3. Buka file migrasi satu per satu dari file `0001_extensions_enums.sql` hingga `0006_storage.sql`.
4. Tempel (*paste*) isi SQL ke editor dan klik tombol **Run**.
5. Terakhir, tempel dan jalankan isi file `supabase/seed.sql`.

### Opsi B: Melalui Supabase CLI (Local / Staging / Production)
Jika Anda menggunakan Supabase CLI:

```bash
# 1. Login ke akun Supabase Anda
supabase login

# 2. Link ke remote project Anda
supabase link --project-ref <PROJECT_ID_ANDA>

# 3. Jalankan seluruh migration secara otomatis
supabase db push

# 4. Jalankan seed data
supabase db reset   # Untuk local development
# atau jalankan manual file seed via psql:
# psql -h <db.host> -U postgres -d postgres -f supabase/seed.sql
```

---

## 3. Cara Membuat User Admin Pertama

Ketika pengguna mendaftar melalui aplikasi atau dashboard Supabase Auth, trigger `on_auth_user_created` akan otomatis membuat baris profil di tabel `public.profiles` dengan role default `'kasir'`.

Untuk menaikkan peran pengguna pertama menjadi **Admin / Owner**:

### Langkah 1: Daftarkan User Baru di Supabase
* Buka menu **Authentication** -> **Users** di Supabase Dashboard.
* Klik **Add User** -> **Create User**.
* Masukkan email (misal: `owner@pawmart.id`) dan password yang kuat.

### Langkah 2: Ubah Role di SQL Editor
Jalankan perintah SQL berikut di **SQL Editor**:

```sql
-- Ganti 'owner@pawmart.id' dengan email yang Anda daftarkan
UPDATE public.profiles
SET 
    role = 'admin',
    full_name = 'Budi Hartono (Owner)'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'owner@pawmart.id'
);
```

### Langkah 3: Verifikasi Hak Akses
Periksa profil dengan menjalankan:

```sql
SELECT p.id, u.email, p.full_name, p.role, p.is_active
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'owner@pawmart.id';
```

Jika kolom `role` bernilai `'admin'`, user tersebut telah memiliki hak akses penuh ke seluruh modul, pengaturan toko, harga beli produk, dan fungsi pembatalan transaksi.
