# Panduan Database Supabase - PawMart POS

Dokumen ini berisi panduan teknis bagi developer dan administrator untuk menginisialisasi skema basis data PostgreSQL di Supabase untuk proyek **PawMart POS**, serta panduan implementasi keamanan dan pengujian privilese sistem.

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
   * Membuat view analitik dasbor dan laporan (`v_dashboard_today`, `v_daily_sales`, `v_top_products`, `v_low_stock`, `v_expiring_products`, `v_sales_by_category`).
   * Membuat indeks pencarian cepat B-Tree dan Trigram GIN untuk barcode, SKU, nomor telepon, dan nama produk.
6. **`0006_storage.sql`**
   * Mendaftarkan bucket penyimpanan foto produk `product-images` (maks. 5MB).
   * Kebijakan RLS storage (publik dapat melihat foto, hanya admin yang boleh mengunggah atau menghapus).
7. **`0007_security_fixes.sql` (Hardening & Security Patch)**
   * **Role & User Registration**: Memastikan `handle_new_user()` mengabaikan metadata user dan memaksa role default `'kasir'`. Penambahan trigger `protect_profile_privileges` pada `profiles` yang menolak perubahan kolom `role` dan `is_active` oleh siapapun selain `admin`.
   * **Proteksi Poin Pelanggan**: Trigger `protect_customer_loyalty_fields` pada `customers` memblokir manipulasi langsung kolom `points`, `total_spent`, dan `tier` kecuali dipanggil secara internal oleh RPC transaksi atau admin.
   * **Kerahasiaan HPP Produk**: Mengunci akses langsung `SELECT` pada tabel fisik `products` dan `transaction_items` khusus untuk `admin`. Kasir mengakses katalog lewat view terproteksi `v_products_public` dan `v_transaction_items_public` (tanpa kolom harga beli).
   * **RPC Hardening**: `REVOKE EXECUTE` pada fungsi sensitif dari `PUBLIC` dan `anon`, hanya memberikan izin ke `authenticated`. Validasi role kasir/admin di `create_transaction`, role admin di `adjust_stock` dan `void_transaction`.
   * **Pencegahan Concurrency Issue & Deadlock**: Penggabungan item keranjang duplikat sebelum validasi stok, dan penguncian baris `products` terurut `ORDER BY id ASC`.
   * **Validasi Diskon & Voucher**: Batas persentase diskon kasir (`max_cashier_discount_percent` di `store_settings`, default 10%), pencegahan diskon negatif, validasi ketat masa aktif/kuota/minimal belanja voucher, dan dekremen `used_count` saat transaksi dibatalkan (void).
   * **Perbaikan Format Faktur**: Penyesuaian `lpad` dengan `GREATEST(4, length(n::text))` untuk nomor faktur >= 10000 agar tidak terpotong.
8. **`supabase/seed.sql`**
   * Data awal: 1 baris store settings, 6 kategori, 20 produk ritel dengan barcode unik, 10 pelanggan, 12 anabul, jadwal vaksinasi, voucher promo, katalog jasa, dan kamar pet hotel.

---

## 2. Cara Menjalankan Migration

### Opsi A: Melalui Supabase Web Dashboard (SQL Editor)
1. Buka dashboard proyek Supabase Anda: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Pilih proyek PawMart POS Anda, lalu masuk ke menu **SQL Editor** pada navigasi kiri.
3. Buka dan jalankan file migrasi secara berurutan dari `0001_extensions_enums.sql` hingga `0007_security_fixes.sql`.
4. Klik tombol **Run** pada setiap skrip.
5. Terakhir, tempel dan jalankan isi file `supabase/seed.sql`.

### Opsi B: Melalui Supabase CLI (Local / Staging / Production)
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

## 3. Penonaktifan Signup Publik di Supabase Auth (Wajib untuk POS)

Dalam arsitektur aplikasi POS kasir toko fisik, **pendaftaran publik pengguna baru tidak boleh dibuka secara bebas untuk publik**. Akun kasir dan staf hanya boleh didaftarkan oleh Administrator / Pemilik Toko.

### Langkah-langkah Mematikan Public Signup di Supabase Dashboard:
1. Buka **Supabase Dashboard** -> Proyek Anda.
2. Di sidebar navigasi sebelah kiri, klik menu **Authentication** (ikon gembok).
3. Klik submenu **Configuration** -> **Sign In / Up** (atau **Providers** / **Email** tergantung versi dashboard Supabase).
4. Cari opsi toggle bertuliskan **"Allow new users to sign up"** atau **"Enable Signups"**.
5. **Matikan toggle tersebut (Disable / Turn Off)**.
6. Klik tombol **Save Changes**.

> **Dampak Keamanan:**  
> Setelah opsi ini dimatikan, endpoint Supabase Auth `auth.signUp()` tidak dapat dipanggil dari luar oleh publik. Penambahan staf kasir baru hanya dapat dilakukan melalui:
> * Dashboard Supabase Auth (**Authentication** -> **Users** -> **Add User** -> **Create User**), atau
> * API khusus Admin menggunakan *Supabase Service Role Key* (`supabase.auth.admin.createUser()`).

---

## 4. Cara Membuat User Admin Pertama

Setiap pengguna yang didaftarkan ke sistem Supabase Auth akan otomatis tercatat di `public.profiles` dengan role default `'kasir'` demi keamanan (*least privilege principle*).

Untuk menaikkan peran pengguna pertama menjadi **Admin / Owner**:

### Langkah 1: Buat User di Supabase Auth
* Buka **Authentication** -> **Users** di Supabase Dashboard.
* Klik **Add User** -> **Create User**.
* Masukkan email (contoh: `owner@pawmart.id`) dan kata sandi yang aman.

### Langkah 2: Naikkan Role Pengguna Menjadi Admin via SQL Editor
Jalankan perintah SQL berikut di **SQL Editor**:

```sql
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

---

## 5. Pengujian Keamanan (Security Checks)

File pengujian otomatis berbasis SQL telah disediakan di `supabase/tests/security_checks.sql` untuk memvalidasi seluruh batasan keamanan dan skenario privilese.

### Cara Menjalankan Uji Coba:
Buka file `supabase/tests/security_checks.sql` di Supabase SQL Editor atau jalankan menggunakan terminal `psql`:

```bash
psql -h <db.host> -U postgres -d postgres -f supabase/tests/security_checks.sql
```

### Skenario Uji Coba & Hasil yang Diharapkan:

| No | Skenario Pengujian | Aksi Kasir / Penyerang | Hasil yang Diharapkan |
|:---|:---|:---|:---|
| 1 | **Pendaftaran User Baru** | Mendaftar dengan menyisipkan `raw_user_meta_data = {"role": "admin"}` | **Role tetap `'kasir'`**. Nilai metadata `admin` diabaikan oleh trigger `handle_new_user`. |
| 2 | **Eskalasi Role Sendiri** | Kasir menjalankan `UPDATE profiles SET role = 'admin'` | **Ditolak (Error)**: *"Akses ditolak: Hanya Admin yang berhak mengubah role atau status aktif akun pengguna."* |
| 3 | **Kerahasiaan Harga Beli (HPP)** | Kasir menjalankan `SELECT buy_price FROM products` | **0 baris data** terambil (terhalang RLS). Kasir wajib memakai `v_products_public` yang tidak memiliki kolom `buy_price`. |
| 4 | **Penyesuaian Stok (Stock Opname)** | Kasir memanggil fungsi `adjust_stock(...)` | **Ditolak (Error)**: *"Akses ditolak: Hanya Admin yang berhak melakukan penyesuaian stok opname."* |
| 5 | **Manipulasi Poin Pelanggan** | Kasir menjalankan direct `UPDATE customers SET points = 99999` | **Ditolak (Error)**: *"Akses ditolak: Poin, total belanja, dan tier pelanggan hanya dapat diperbarui secara otomatis lewat transaksi kasir resmi atau oleh Admin."* |
| 6 | **Keranjang Produk Duplikat** | Memanggil `create_transaction` dengan array item berisi `product_id` sama berulang kali | **Berhasil diproses**: Kuantitas digabungkan otomatis, validasi stok akurat, dan baris produk dikunci berurutan (`ORDER BY id ASC`) untuk mencegah deadlock. |
| 7 | **Nomor Faktur >= 10000** | Transaksi saat sequence mencapai angka `10000` | **Nomor faktur utuh `TRX-10000`**, tidak terpotong menjadi `TRX-1000` akibat bug `lpad`. |
| 8 | **Batas Diskon Manual Kasir** | Kasir memberikan diskon manual melebihi persentase toko (> 10%) | **Ditolak (Error)**: *"Diskon manual kasir (...) melebihi batas maksimal 10.00 persen (...). Persetujuan Admin diperlukan."* |
| 9 | **Pembatalan Faktur (Void)** | Kasir mencoba membatalkan transaksi | **Ditolak (Error)**: Hanya Admin yang diizinkan melakukan void transaksi. Saat dibatalkan oleh Admin, stok barang kembali dan kuota voucher (`used_count`) dipulihkan. |
