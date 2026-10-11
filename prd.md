# PRD: PawMart POS (Tahap Tampilan / UI Only)

**Versi:** 1.0
**Tanggal:** 11 Oktober 2026
**Status:** Draft
**Lingkup:** Frontend saja dengan data dummy (tanpa backend dan database)

---

## 1. Ringkasan

PawMart POS adalah aplikasi web kasir untuk toko pet shop. Tahap ini hanya membangun **tampilan (UI)** yang responsif untuk laptop, tablet, dan handphone, dengan **data dummy statis**. Tujuannya untuk validasi desain dan alur sebelum backend dibuat.

Tampilan mengacu pada gambar referensi: gaya bersih, latar krem hangat, aksen oranye, kartu putih bersudut membulat.

## 2. Tujuan dan Non-Tujuan

### Tujuan
- Membuat seluruh halaman utama sesuai menu sidebar dengan tampilan konsisten.
- Responsif di tiga ukuran layar: laptop, tablet, handphone.
- Semua data berasal dari file dummy lokal agar mudah diganti dengan API nanti.
- Komponen reusable supaya mudah disambungkan ke Supabase pada tahap berikutnya.

### Non-Tujuan (tidak dikerjakan sekarang)
- Autentikasi sungguhan, database, dan API.
- Integrasi printer, scanner barcode, dan payment gateway.
- Mode offline dan sinkronisasi data.
- Logika bisnis kompleks (perhitungan pajak nyata, validasi stok sungguhan).

## 3. Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + React |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Ikon | lucide-react |
| Grafik | Recharts |
| State | React state / Zustand (ringan, untuk keranjang POS) |
| Data | File dummy di `/data/*.ts` |
| Supabase | Disiapkan untuk tahap berikutnya, belum dipakai |

## 4. Design System (Referensi Gambar)

### 4.1 Warna

| Token | Hex (perkiraan) | Penggunaan |
|---|---|---|
| `primary` | `#C9772E` | Menu sidebar aktif, tombol utama, logo, ikon aktif |
| `primary-hover` | `#B56A27` | Hover tombol utama |
| `primary-soft` | `#FBEBDD` | Latar badge "WEB APPLICATION", highlight ringan |
| `chart-bar` | `#E9A464` | Batang grafik penjualan |
| `bg-page` | `#F7F5F1` | Latar halaman (krem) |
| `bg-card` | `#FFFFFF` | Kartu, tabel, topbar |
| `border` | `#ECE8E1` | Garis kartu dan pemisah tabel |
| `text-primary` | `#1F2937` | Judul dan angka utama |
| `text-secondary` | `#6B7280` | Label, subjudul, teks pendukung |
| `success` | `#16A34A` | Teks persentase naik, status selesai |
| `success-soft` | `#DCFCE7` | Latar badge "Selesai" |
| `danger` | `#E5484D` | Peringatan "Perlu diperiksa", stok menipis |
| `danger-soft` | `#FEE2E2` | Latar badge bahaya |
| `warning` | `#F59E0B` | Status pending / ditahan |

> Warna adalah perkiraan dari gambar. Boleh disesuaikan sedikit selama nuansa oranye hangat dan krem tetap terjaga.

### 4.2 Tipografi
- Font: **Inter** (atau Plus Jakarta Sans sebagai alternatif).
- Judul halaman: 24px, semibold.
- Angka statistik: 24 sampai 28px, bold.
- Label dan teks tabel: 12 sampai 14px, regular.
- Teks sekunder: 12px, warna `text-secondary`.

### 4.3 Komponen Dasar
- **Kartu:** latar putih, radius 12px, border `border`, bayangan sangat tipis.
- **Tombol utama:** latar `primary`, teks putih, radius 8px.
- **Badge status:** pill kecil, latar lembut dan teks tebal sewarna.
- **Input pencarian:** radius penuh, ikon kaca pembesar di kiri, latar putih.
- **Sidebar aktif:** blok oranye penuh dengan ikon dan teks putih.
- **Tabel:** header abu muda, baris dipisah garis tipis, tanpa zebra.

### 4.4 Breakpoint

| Perangkat | Lebar | Layout |
|---|---|---|
| Laptop / desktop | ≥ 1024px | Sidebar tetap + konten penuh |
| Tablet | 640 sampai 1023px | Sidebar ringkas (ikon + teks kecil) atau bisa dilipat, grid 2 kolom |
| Handphone | < 640px | Tanpa sidebar, **bottom navigation** dan menu grid |

## 5. Struktur Navigasi

### Sidebar (laptop dan tablet)
1. Dashboard
2. Transaksi
3. Produk
4. Stok
5. Pelanggan
6. Laporan
7. Pengaturan

### Topbar
- Logo **PawMart** (ikon telapak oranye)
- Kolom pencarian: "Cari produk, pelanggan, atau transaksi..."
- Ikon notifikasi (bell)
- Avatar dan nama pengguna ("Admin") dengan dropdown

### Bottom Navigation (handphone)
Beranda, Transaksi, Produk, Lainnya

## 6. Spesifikasi Halaman

### 6.1 Dashboard (sesuai referensi)
**Header:** "Halo, Admin 👋" dan subjudul "Selamat datang kembali di PawMart."

**Empat kartu statistik:**

| Kartu | Nilai | Keterangan |
|---|---|---|
| Total Penjualan Hari Ini | Rp 2.450.000 | ↑ 12% dari kemarin (hijau) |
| Jumlah Transaksi | 18 | ↑ 25% dari kemarin |
| Produk Terjual | 45 | ↑ 18% dari kemarin |
| Stok Menipis | 6 | "Perlu diperiksa" (merah) |

**Grafik Penjualan:** bar chart 7 hari terakhir, dengan dropdown filter periode ("7 Hari Terakhir", "30 Hari", "Bulan Ini"). Sumbu Y dalam juta (1 jt sampai 4 jt).

**Produk Terlaris:** daftar 5 produk dengan gambar, nama, kategori, dan jumlah terjual.

**Transaksi Terbaru:** tabel dengan kolom No. Transaksi, Tanggal, Pelanggan, Total, Status. Ada tautan "Lihat semua".

**Responsif:**
- Laptop: statistik 4 kolom, grafik dan produk terlaris berdampingan, tabel di bawah grafik.
- Tablet: statistik 4 kolom kecil, grafik di atas, produk terlaris dan tabel disusun ulang ke bawah.
- Handphone: menu cepat grid 3x2 (Transaksi POS, Produk, Stok, Pelanggan, Laporan, Pengaturan), kartu "Penjualan Hari Ini", lalu daftar transaksi terbaru ringkas.

### 6.2 Transaksi (Kasir / POS)
- Layout dua panel: **katalog produk** (kiri) dan **keranjang** (kanan).
- Katalog: pencarian, filter kategori (chip), grid kartu produk (gambar, nama, harga, stok), tombol tambah.
- Keranjang: daftar item dengan tombol plus/minus, hapus item, input diskon, ringkasan subtotal, pajak, dan total.
- Pilih pelanggan (dropdown dari data dummy) dan metode bayar (Tunai, QRIS, Transfer, Kartu).
- Tombol **Bayar** membuka modal pembayaran dummy: input uang diterima, kembalian otomatis, tombol selesai yang menampilkan modal struk.
- Tombol **Tahan Transaksi** (hanya mengubah state lokal).
- Handphone: keranjang tampil sebagai bottom sheet.
- Tab tambahan: **Riwayat Transaksi** berupa tabel dengan filter tanggal dan status, klik baris membuka detail struk.

### 6.3 Produk
- Tabel/daftar produk: gambar, nama, SKU, kategori, harga beli, harga jual, stok, status.
- Pencarian, filter kategori, dan tombol **+ Tambah Produk**.
- Modal form tambah/ubah produk (nama, SKU, barcode, kategori, harga, stok, satuan, tanggal kedaluwarsa). Data hanya disimpan di state lokal.
- Handphone: tampilan kartu bertumpuk menggantikan tabel.

### 6.4 Stok
- Ringkasan: total produk, stok menipis, hampir kedaluwarsa, stok habis.
- Tabel stok dengan indikator warna (aman, menipis, habis).
- Daftar peringatan kedaluwarsa (makanan dan obat).
- Tombol **Penyesuaian Stok** membuka modal dummy.
- Tab Riwayat Mutasi Stok (masuk, keluar, penyesuaian).

### 6.5 Pelanggan
- Daftar pelanggan: nama, nomor HP, total belanja, poin, kunjungan terakhir.
- Halaman detail pelanggan: profil, **daftar hewan peliharaan** (nama, jenis, ras, umur), riwayat belanja, dan jadwal vaksin berikutnya.
- Tombol **+ Tambah Pelanggan**.

### 6.6 Laporan
- Filter periode (hari ini, 7 hari, 30 hari, kustom).
- Kartu ringkasan: omzet, laba kotor, jumlah transaksi, rata-rata nilai transaksi.
- Grafik penjualan (garis atau batang), grafik penjualan per kategori (donut), dan tabel produk terlaris.
- Tombol **Ekspor** (tampilan saja, menampilkan toast "Fitur segera hadir").

### 6.7 Pengaturan
- Tab: Profil Toko, Pengguna & Peran, Struk, Pajak, Tampilan.
- Form dengan data dummy. Tombol simpan hanya menampilkan toast sukses.

## 7. Data Dummy

Simpan di folder `/data` dan semuanya diketik dengan TypeScript.

### 7.1 Statistik Dashboard
```ts
export const stats = {
  penjualanHariIni: 2450000,
  jumlahTransaksi: 18,
  produkTerjual: 45,
  stokMenipis: 6,
  perubahan: { penjualan: 12, transaksi: 25, produk: 18 },
};
```

### 7.2 Grafik Penjualan 7 Hari
| Tanggal | Nilai (Rp) |
|---|---|
| 12 Okt | 1.700.000 |
| 13 Okt | 2.400.000 |
| 14 Okt | 1.900.000 |
| 15 Okt | 3.200.000 |
| 16 Okt | 2.000.000 |
| 16 Okt* | 2.400.000 |
| 17 Okt | 3.000.000 |
| 18 Okt | 2.350.000 |

*Pada referensi terdapat dua label "16 Okt"; gunakan 7 titik data yang berurutan saja (12 sampai 18 Okt).

### 7.3 Produk Terlaris
| Produk | Kategori | Terjual |
|---|---|---|
| Royal Canin Adult | Makanan Kucing 1kg | 32 |
| Whiskas Tuna | Makanan Kucing 1kg | 28 |
| Pedigree Adult | Makanan Anjing 1kg | 20 |
| Tempat Makan | Aksesoris | 15 |
| Mainan Kucing | Aksesoris | 12 |

### 7.4 Transaksi Terbaru
| No. Transaksi | Tanggal | Pelanggan | Total | Status |
|---|---|---|---|---|
| TRX-0018 | 18 Okt 2025 | Pelanggan Umum | Rp 245.000 | Selesai |
| TRX-0017 | 18 Okt 2025 | Rina Sari | Rp 420.000 | Selesai |
| TRX-0016 | 17 Okt 2025 | Andri Pratama | Rp 190.000 | Selesai |
| TRX-0015 | 17 Okt 2025 | Siti Nurhaliza | Rp 350.000 | Selesai |

### 7.5 Data Tambahan yang Perlu Dibuat
- **Produk:** minimal 20 item dalam kategori Makanan Kucing, Makanan Anjing, Aksesoris, Pasir, Obat & Vitamin, Kandang. Setiap item punya id, nama, SKU, harga beli, harga jual, stok, stok minimum, satuan, gambar, tanggal kedaluwarsa.
- **Pelanggan:** minimal 10 orang, masing-masing punya 1 sampai 2 hewan peliharaan.
- **Transaksi:** minimal 30 riwayat, lengkap dengan item dan metode bayar.
- **Pengguna:** Admin, Kasir, Groomer (untuk halaman Pengaturan).
- Gambar produk memakai placeholder ilustrasi atau emoji agar tidak bergantung aset eksternal.

## 8. Struktur Folder yang Disarankan

```
pawmart-pos/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # sidebar + topbar + bottom nav
│   │   ├── page.tsx            # Dashboard
│   │   ├── transaksi/page.tsx
│   │   ├── produk/page.tsx
│   │   ├── stok/page.tsx
│   │   ├── pelanggan/page.tsx
│   │   ├── laporan/page.tsx
│   │   └── pengaturan/page.tsx
│   └── globals.css
├── components/
│   ├── layout/   (Sidebar, Topbar, BottomNav)
│   ├── ui/       (Card, Button, Badge, Table, Modal, Input, Toast)
│   ├── dashboard/(StatCard, SalesChart, TopProducts, RecentTransactions)
│   └── pos/      (ProductGrid, Cart, PaymentModal, Receipt)
├── data/         (stats.ts, products.ts, customers.ts, transactions.ts)
├── lib/          (format.ts untuk rupiah dan tanggal, utils.ts)
└── tailwind.config.ts            # token warna dari bagian 4.1
```

## 9. Kebutuhan Non-Fungsional
- Waktu muat halaman awal di bawah 2 detik pada koneksi normal.
- Skor Lighthouse minimal 90 untuk performa dan aksesibilitas.
- Kontras teks memenuhi standar WCAG AA.
- Area sentuh minimal 44px pada handphone.
- Semua teks antarmuka dalam **Bahasa Indonesia**.
- Format uang `Rp 2.450.000` dan tanggal `18 Okt 2025` lewat helper terpusat.
- Dukungan peramban modern: Chrome, Edge, Safari, Firefox (dua versi terakhir).

## 10. Kriteria Penerimaan
- [ ] Dashboard sama dengan referensi dalam hal tata letak, warna, dan konten di laptop, tablet, dan handphone.
- [ ] Seluruh 7 menu sidebar dapat dibuka dan menampilkan halaman berisi data dummy.
- [ ] Kasir bisa menambah produk ke keranjang, mengubah jumlah, menghitung total, dan menampilkan modal bayar serta struk (dummy).
- [ ] Pencarian dan filter pada halaman Produk, Stok, dan Pelanggan bekerja pada data dummy.
- [ ] Tidak ada panggilan jaringan ke backend.
- [ ] Tidak ada scroll horizontal pada lebar layar 360px.
- [ ] Token warna dipusatkan di konfigurasi Tailwind, tidak ditulis ulang di komponen.

## 11. Rencana Pengerjaan

| Tahap | Pekerjaan |
|---|---|
| 1 | Setup proyek, token desain, dan komponen UI dasar |
| 2 | Layout: sidebar, topbar, bottom navigation, responsif |
| 3 | Halaman Dashboard sesuai referensi |
| 4 | Halaman Transaksi (POS) dan modal pembayaran |
| 5 | Halaman Produk dan Stok |
| 6 | Halaman Pelanggan, Laporan, Pengaturan |
| 7 | Poles responsif, aksesibilitas, dan pengujian di tiga ukuran layar |

## 12. Tahap Selanjutnya (di Luar Lingkup)
- Sambungkan Supabase: auth, tabel produk, transaksi, pelanggan, dan stok.
- Ganti file dummy dengan query nyata, komponen UI tetap dipakai ulang.
- Tambahkan fitur layanan jasa (grooming, penitipan), booking, dan loyalitas.
- Integrasi printer struk dan scanner barcode.

## 13. Risiko dan Catatan
- Warna hex di dokumen ini perkiraan dari gambar, perlu dicek ulang di desain asli bila tersedia.
- Data dummy memakai tahun 2025 sesuai gambar; bisa disesuaikan ke tahun berjalan.
- Pada referensi terdapat label tanggal ganda di grafik; diselesaikan dengan data 7 hari berurutan.
