# Dokumentasi Skema Database PostgreSQL / Supabase - PawMart POS

Dokumen ini mendokumentasikan spesifikasi teknis arsitektur basis data, diagram relasi entitas (ERD), asumsi desain, dan pemetaan data dummy ke tabel Supabase.

---

## 1. Diagram Relasi Entitas (Entity Relationship Diagram)

```mermaid
erDiagram
    store_settings {
        uuid id PK
        boolean is_singleton UK
        text store_name
        text address
        numeric tax_percentage
        boolean is_tax_enabled
        numeric points_per_amount
        numeric point_value
    }

    profiles {
        uuid id PK,FK "auth.users"
        text full_name
        user_role role
        text phone
        boolean is_active
        timestamptz created_at
    }

    categories {
        uuid id PK
        text name UK
        text slug UK
        text description
        int display_order
    }

    products {
        uuid id PK
        uuid category_id FK
        text name
        text sku UK
        text barcode UK
        numeric buy_price
        numeric sell_price
        int stock
        int min_stock
        text unit
        text image_url
        date expiry_date
        boolean is_active
    }

    customers {
        uuid id PK
        text customer_code UK
        text name
        text phone
        text email
        member_tier tier
        int points
        numeric total_spent
        timestamptz last_visit_at
    }

    pets {
        uuid id PK
        uuid customer_id FK
        text name
        pet_species species
        text breed
        date birth_date
        pet_gender gender
        numeric weight_kg
        pet_size size
        text special_notes
    }

    pet_vaccinations {
        uuid id PK
        uuid pet_id FK
        text vaccine_name
        date given_at
        date next_due_at
        text veterinarian_name
    }

    vouchers {
        uuid id PK
        text code UK
        text name
        voucher_type type
        numeric value
        numeric min_spend
        int quota
        int used_count
        date valid_until
        boolean is_active
    }

    transactions {
        uuid id PK
        text invoice_no UK
        uuid customer_id FK
        uuid cashier_id FK
        transaction_status status
        payment_method payment_method
        numeric subtotal
        numeric discount
        uuid voucher_id FK
        int points_redeemed
        numeric points_discount_amount
        numeric tax
        numeric total
        numeric amount_paid
        numeric change_amount
        int points_earned
        timestamptz created_at
    }

    transaction_items {
        uuid id PK
        uuid transaction_id FK
        uuid product_id FK
        text product_name_snapshot
        numeric unit_price_snapshot
        numeric buy_price_snapshot
        int quantity
        numeric discount
        numeric line_total
    }

    stock_movements {
        uuid id PK
        uuid product_id FK
        stock_movement_type type
        int quantity
        int stock_before
        int stock_after
        text reason
        uuid reference_transaction_id FK
        uuid created_by FK
        timestamptz created_at
    }

    services {
        uuid id PK
        text name
        text category
        int duration_minutes
        numeric price_small
        numeric price_medium
        numeric price_large
        boolean is_active
    }

    cages {
        uuid id PK
        text code UK
        text name
        cage_type type
        numeric rate_per_night
        cage_status status
    }

    bookings {
        uuid id PK
        text booking_no UK
        date booking_date
        time time_slot
        uuid customer_id FK
        uuid pet_id FK
        uuid service_id FK
        uuid staff_id FK
        numeric total_price
        booking_status status
        uuid reference_transaction_id FK
    }

    boarding_stays {
        uuid id PK
        text stay_no UK
        uuid customer_id FK
        uuid pet_id FK
        uuid cage_id FK
        numeric rate_per_night
        date check_in_date
        date expected_check_out_date
        date actual_check_out_date
        boarding_stay_status status
        uuid reference_transaction_id FK
    }

    categories ||--o{ products : "mengelompokkan"
    products ||--o{ transaction_items : "dibeli dalam"
    products ||--o{ stock_movements : "mengalami mutasi"
    customers ||--o{ pets : "memiliki"
    pets ||--o{ pet_vaccinations : "menerima"
    customers ||--o{ transactions : "melakukan"
    profiles ||--o{ transactions : "melayani sebagai kasir"
    transactions ||--|{ transaction_items : "memuat rincian"
    transactions ||--o{ stock_movements : "memicu mutasi"
    vouchers ||--o{ transactions : "diterapkan pada"
    customers ||--o{ bookings : "membuat reservasi"
    pets ||--o{ bookings : "menjadi subjek"
    services ||--o{ bookings : "dipilih dalam"
    profiles ||--o{ bookings : "dikerjakan oleh staf"
    customers ||--o{ boarding_stays : "menitipkan anabul"
    pets ||--o{ boarding_stays : "menginap dalam"
    cages ||--o{ boarding_stays : "menempati kamar"
```

---

## 2. Asumsi Teknis Desain Basis Data

Dalam perancangan skema ini, diambil beberapa keputusan teknis dan asumsi berikut:

1. **Format Finansial (`numeric(14,2)`):**
   * Seluruh nilai moneter (harga jual, harga beli, subtotal, diskon, pajak, total, kembalian) menggunakan `numeric(14,2)`.
   * *Alasan:* Mencegah *rounding error* yang sering terjadi pada tipe data *floating point* (`float`/`double`), serta mendukung nilai hingga puluhan miliar rupiah dengan presisi 2 desimal standar pembukuan akuntansi.

2. **Pelanggan Walk-In (Umum):**
   * Kolom `customer_id` pada tabel `transactions` bersifat nullable (`UUID NULL`).
   * Jika kasir bertransaksi dengan pembeli langsung tanpa pendaftaran member, `customer_id` bernilai `NULL`. Pada saat yang sama, data dummy memiliki entitas fallback `CUST-001` (Pelanggan Umum).

3. **Integritas Historis Finansial (Price Snapshotting):**
   * Tabel `transaction_items` mencatat snapshot nama produk (`product_name_snapshot`), harga jual saat transaksi (`unit_price_snapshot`), dan harga beli modal (`buy_price_snapshot`).
   * *Alasan:* Jika data master produk di kemudian hari mengalami kenaikan harga atau perubahan nama, laporan laba rugi dan cetak ulang struk historis tidak akan mengalami distorsi.

4. **Usia Hewan Peliharaan (`birth_date` vs Umur):**
   * Pada data dummy UI, umur tersimpan dalam format teks statis (misal `"2 Tahun"`). Pada skema PostgreSQL, disimpan kolom `birth_date DATE`.
   * *Alasan:* Umur anabul dapat dihitung secara dinamis (`AGE(CURRENT_DATE, birth_date)`) sehingga data tidak menjadi basi seiring berjalannya waktu.

5. **Pemisahan Hak Akses HPP Produk via RLS & View:**
   * Kasir dilarang melihat modal harga beli (`buy_price`). Untuk mengamankan ini di sisi API, disediakan view `v_products_public` yang mengecualikan kolom `buy_price`.

6. **Integritas Mutasi Stok Atomik:**
   * Seluruh pengurangan stok ritel dikunci di tingkat basis data menggunakan fungsi RPC `create_transaction` dengan klausa `SELECT ... FOR UPDATE`. Client frontend dilarang melakukan `INSERT` langsung ke tabel `transactions` atau `stock_movements`.

---

## 3. Tabel Pemetaan: File `/data` Dummy → Tabel Supabase

Gunakan tabel pemetaan ini saat melakukan integrasi kode frontend:

| File Dummy di `/data` | Tabel Supabase Terkait | Catatan Perubahan & Transformasi |
|---|---|---|
| `data/settings.ts` | `store_settings` | Objek `initialStoreProfile`, `ReceiptSettings`, `TaxSettings` disatukan ke dalam 1 baris tabel singleton. |
| `context/UserContext.tsx` & `data/staff.ts` | `profiles` & `auth.users` | Entitas `currentUser` dan `initialStaff` dipetakan ke `profiles` yang terikat dengan Supabase Auth UID. |
| `data/products.ts` (`categories`) | `categories` | Array string kategori diubah menjadi tabel referensi relasional berelasi ke produk. |
| `data/products.ts` (`initialProducts`) | `products` | Properti camelCase (`hargaBeli`, `hargaJual`, `stokMin`) diubah ke snake_case (`buy_price`, `sell_price`, `min_stock`). |
| `data/customers.ts` (`initialCustomers`) | `customers` | Data profil pemilik anabul, total belanja, dan poin member. |
| `data/customers.ts` (`pets`) | `pets` | Array anabul yang sebelumnya *nested* di pelanggan kini dinormalisasi ke tabel relasional terpisah ber-FK `customer_id`. |
| `data/customers.ts` (`vaksinTerakhir`, `jadwalVaksinBerikutnya`) | `pet_vaccinations` | Riwayat vaksinasi dinormalisasi ke tabel catatan medis dengan tanggal jatuh tempo (`next_due_at`). |
| `data/transactions.ts` (`initialTransactions`) | `transactions` & `transaction_items` | Header struk masuk ke `transactions`, array item barang masuk ke `transaction_items`. |
| `data/stockMutations.ts` | `stock_movements` | Log pergerakan stok fisik dengan referensi transaksi penjualan atau opname. |
| `data/loyalty.ts` (`initialVouchers`) | `vouchers` | Voucher kupon diskon kasir dengan batas kuota dan masa berlaku. |
| `data/services.ts` (`initialServices`) | `services` & `service_addons` | Katalog paket salon grooming dan tindakan medis hewan. |
| `data/boarding.ts` (`initialCages`) | `cages` | Daftar kamar inap dan kandang pet hotel berserta tarif per malam. |
| `data/bookings.ts` (`initialBookings`) | `bookings` | Reservasi antrean pengerjaan grooming dan konsultasi dokter hewan. |
| `data/boardingStays.ts` | `boarding_stays` | Pencatatan tamu inap, kontak darurat, dan durasi menginap di pet hotel. |

---

## 4. Hal-Hal yang Perlu Keputusan & Tahapan Selanjutnya

Berikut adalah beberapa hal yang direkomendasikan untuk keputusan lanjutan:

1. **Mekanisme Pendaftaran Akun Staf Pertama Kali:**
   * Saat ini, staf kasir/groomer dapat didaftarkan lewat Supabase Auth dashboard atau form admin. Perlu ditentukan apakah pembuatan akun staf di masa depan akan menggunakan email verifikasi atau *magic link*.
2. **Koneksi Integrasi Frontend (`@supabase/supabase-js`):**
   * Disarankan membuat client wrapper di `lib/supabaseClient.ts` untuk menggantikan pemanggilan array dummy `/data` secara bertahap dimulai dari modul Kasir POS dan Katalog Produk.
3. **Penyimpanan Gambar Produk:**
   * Di frontend saat ini gambar diunggah sebagai Base64 di `localStorage`. Saat migrasi ke Supabase, gunakan bucket `product-images` (dari migrasi `0006_storage.sql`) dan simpan public URL-nya ke kolom `products.image_url`.
