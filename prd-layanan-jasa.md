# PRD: PawMart POS, Modul Layanan Jasa, Booking, dan Loyalitas (UI Only)

**Versi:** 1.0
**Tanggal:** 11 Oktober 2026
**Status:** Draft
**Lingkup:** Frontend saja dengan data dummy (tanpa backend dan database)
**Dokumen terkait:** `prd.md` (PRD utama PawMart POS). Dokumen ini adalah tambahan dan memakai design system, tech stack, dan struktur folder yang sama.

---

## 1. Ringkasan

Modul ini menambahkan tiga kelompok fitur ke PawMart POS:

1. **Layanan Jasa:** grooming dan penitipan hewan (pet hotel).
2. **Booking:** pemesanan jadwal layanan lewat kalender dan daftar antrean.
3. **Loyalitas:** poin, tingkatan member, dan voucher untuk pelanggan.

Seperti tahap sebelumnya, pekerjaan hanya pada **tampilan dengan data dummy**. Semua aksi (simpan, ubah status, tukar poin) hanya mengubah state lokal dan tidak dikirim ke server.

## 2. Tujuan dan Non-Tujuan

### Tujuan
- Menyediakan alur lengkap dari membuat booking sampai layanan selesai dan dibayar lewat kasir.
- Memperlihatkan status layanan secara visual (menunggu, proses, selesai) agar mudah dipantau staf.
- Menampilkan program loyalitas yang terhubung ke data pelanggan dan transaksi.
- Menjaga tampilan konsisten dengan dashboard PawMart dan responsif di laptop, tablet, handphone.

### Non-Tujuan
- Pengiriman pengingat WhatsApp sungguhan (hanya tombol dan pratinjau pesan).
- Pembayaran online dan deposit sungguhan.
- Sinkronisasi kalender eksternal (Google Calendar dan sejenisnya).
- Perhitungan poin dan harga yang divalidasi server.

## 3. Pengguna dan Peran

| Peran | Kebutuhan di modul ini |
|---|---|
| Owner / Admin | Mengatur layanan, harga, paket, aturan poin; melihat laporan |
| Kasir | Membuat booking, check-in/check-out, menagih layanan, menukar poin |
| Groomer | Melihat jadwal dan antrean sendiri, mengubah status layanan |
| Dokter hewan (opsional) | Melihat booking konsultasi dan vaksin |

Pada tahap tampilan, peran hanya mengatur menu yang tampil (switch peran dummy di Pengaturan).

## 4. Perubahan Navigasi

Tambahkan menu baru di sidebar, di antara **Transaksi** dan **Produk**:

1. Dashboard
2. Transaksi
3. **Layanan** (baru, berisi sub-tab Katalog, Antrean, Penitipan)
4. **Booking** (baru)
5. Produk
6. Stok
7. Pelanggan
8. **Loyalitas** (baru)
9. Laporan
10. Pengaturan

**Handphone:** bottom navigation tetap (Beranda, Transaksi, Produk, Lainnya). Menu Layanan, Booking, dan Loyalitas masuk ke menu grid "Lainnya" dan menu cepat di Beranda.

**Dashboard:** tambahkan dua kartu ringkas dan satu daftar baru:
- Kartu "Booking Hari Ini" (jumlah dan yang sedang berlangsung).
- Kartu "Hewan Dititipkan" (jumlah yang sedang menginap).
- Daftar "Jadwal Berikutnya" (3 sampai 5 booking terdekat).

## 5. Design System (Tambahan)

Pakai token warna dari `prd.md`. Tambahan khusus modul ini:

| Token | Hex (perkiraan) | Penggunaan |
|---|---|---|
| `status-waiting` | `#F59E0B` / bg `#FEF3C7` | Badge "Menunggu" |
| `status-progress` | `#2563EB` / bg `#DBEAFE` | Badge "Diproses" |
| `status-done` | `#16A34A` / bg `#DCFCE7` | Badge "Selesai" |
| `status-cancel` | `#6B7280` / bg `#F3F4F6` | Badge "Dibatalkan" |
| `status-late` | `#E5484D` / bg `#FEE2E2` | Badge "Terlambat" / "Tidak Hadir" |
| `tier-bronze` | `#B87333` | Level Bronze |
| `tier-silver` | `#9CA3AF` | Level Silver |
| `tier-gold` | `#D4A017` | Level Gold |

**Komponen baru:**
- **Kalender** (tampilan hari, minggu, bulan) dengan blok jadwal berwarna per layanan.
- **Time slot picker** (chip jam, misalnya 09:00, 10:00).
- **Kartu layanan** (ikon, nama, durasi, harga mulai dari).
- **Stepper** untuk alur booking per langkah.
- **Kartu member** bergaya kartu loyalitas dengan level dan progres poin.
- **Kartu voucher** dengan potongan garis putus-putus.

## 6. Spesifikasi Fitur

### 6.1 Layanan Jasa

#### 6.1.1 Katalog Layanan
- Grid kartu layanan: Grooming, Penitipan, Vaksinasi, Konsultasi Dokter Hewan.
- Filter jenis hewan (Kucing, Anjing, Lainnya) dan pencarian.
- Tiap layanan memiliki: nama, deskripsi singkat, durasi, harga berdasarkan **jenis dan ukuran hewan**, dan status aktif.
- Tombol **+ Tambah Layanan** membuka modal form (nama, kategori, durasi, tabel harga per ukuran, deskripsi).
- **Paket layanan** (misalnya "Paket Grooming Lengkap") ditampilkan sebagai kartu terpisah berisi daftar isi paket dan harga hemat.

#### 6.1.2 Grooming
Layanan yang ada pada data dummy:
- Mandi Biasa
- Mandi Anti Kutu / Jamur
- Potong Rambut dan Styling
- Potong Kuku dan Bersih Telinga
- Paket Grooming Lengkap

Aturan harga (dummy): berbeda per jenis hewan dan ukuran (Kecil, Sedang, Besar). Tambahan biaya untuk bulu panjang atau kusut ditampilkan sebagai opsi **add-on** yang dicentang.

#### 6.1.3 Antrean Layanan (Papan Status)
- Tampilan **papan kanban** tiga kolom: **Menunggu**, **Diproses**, **Selesai**.
- Kartu berisi: nama hewan dan foto/emoji, nama pemilik, jenis layanan, jam mulai, staf yang menangani, dan estimasi selesai.
- Ubah status lewat tombol (atau seret kartu antar kolom di laptop). Perubahan hanya di state lokal.
- Filter berdasarkan staf (groomer) dan tanggal.
- Tombol **Tagih ke Kasir** pada kartu "Selesai" yang memindahkan layanan ke keranjang di halaman Transaksi.
- **Handphone:** kolom diganti tab status di atas, daftar kartu vertikal.

#### 6.1.4 Penitipan (Pet Hotel)
- **Ringkasan kapasitas:** kandang terisi dan kosong, misalnya "8 / 12 terisi".
- **Peta kandang:** grid kotak nomor kandang berwarna (kosong hijau, terisi oranye, perlu dibersihkan abu-abu). Klik kotak untuk melihat detail penghuni.
- **Daftar hewan menginap:** nama hewan, pemilik, tanggal masuk, tanggal keluar (rencana), tipe kandang, dan jumlah malam.
- **Form check-in:** pilih pelanggan dan hewan, tanggal masuk dan keluar, tipe kandang (Standar, Premium, VIP), makanan bawaan, obat, catatan khusus (alergi, perilaku), dan kontak darurat.
- **Check-out:** ringkasan lama menginap, biaya kandang, add-on (grooming, makan khusus), total, lalu tombol **Tagih ke Kasir**.
- **Catatan harian:** jurnal singkat per hewan (makan, minum, bermain, kondisi) dengan tanda waktu.
- Tarif per malam berdasarkan tipe kandang dan ukuran hewan.

#### 6.1.5 Vaksinasi dan Konsultasi (Ringkas)
- Muncul sebagai layanan di katalog dan booking.
- Setelah selesai, ada tombol **Catat ke Riwayat Hewan** dan **Jadwalkan Vaksin Berikutnya** yang membuka modal dengan tanggal pengingat (dummy).

### 6.2 Booking

#### 6.2.1 Halaman Booking
- **Tampilan kalender** dengan pilihan Hari, Minggu, Bulan.
- Blok jadwal diberi warna sesuai jenis layanan dan menampilkan jam, nama hewan, dan staf.
- Panel kanan (laptop) atau bottom sheet (handphone) menampilkan detail booking saat diklik.
- Filter berdasarkan staf, jenis layanan, dan status.
- **Tampilan daftar** sebagai alternatif kalender: tabel No. Booking, Tanggal & Jam, Pelanggan, Hewan, Layanan, Staf, Status.
- Ringkasan di atas halaman: booking hari ini, menunggu konfirmasi, dan slot kosong tersisa.

#### 6.2.2 Alur Buat Booking (Stepper 4 Langkah)
1. **Pelanggan dan hewan:** cari pelanggan, pilih hewan peliharaan, atau tambah baru lewat modal singkat.
2. **Layanan:** pilih satu atau beberapa layanan, add-on, dan paket. Harga dan durasi dihitung otomatis.
3. **Jadwal dan staf:** pilih tanggal, slot jam yang tersedia, dan staf. Slot yang bentrok ditampilkan nonaktif.
4. **Konfirmasi:** ringkasan lengkap, catatan khusus, opsi DP (dummy), dan checkbox "Kirim pengingat WhatsApp".

Setelah dikonfirmasi: muncul toast sukses, booking masuk ke kalender (state lokal), dan tampil kartu **bukti booking** yang bisa dicetak (tampilan saja).

#### 6.2.3 Status Booking
`Menunggu Konfirmasi` → `Terkonfirmasi` → `Check-in` → `Diproses` → `Selesai`
Cabang lain: `Dibatalkan`, `Tidak Hadir`.

- Aksi per booking: Konfirmasi, Jadwal Ulang, Batalkan (dengan alasan), Check-in.
- Saat **Check-in**, booking otomatis muncul di kolom "Menunggu" pada Antrean Layanan.
- Booking yang lewat jadwal tanpa check-in diberi badge "Terlambat" (merah).

#### 6.2.4 Pengingat (Pratinjau)
- Tombol **Kirim Pengingat** membuka modal pratinjau pesan WhatsApp yang sudah terisi (nama pelanggan, hewan, layanan, tanggal dan jam). Tombol kirim hanya menampilkan toast "Pengingat terkirim (simulasi)".
- Halaman **Pengingat Otomatis** di Pengaturan: pilihan H-1 dan H-3 jam, edit templat pesan, dan toggle aktif.
- Daftar **Pengingat Vaksin Jatuh Tempo** (7 hari ke depan) dengan tombol hubungi.

### 6.3 Loyalitas

#### 6.3.1 Ringkasan Program
- Kartu statistik: total member, poin beredar, poin ditukar bulan ini, dan voucher aktif.
- Grafik pertumbuhan member 6 bulan terakhir.
- Daftar **Top Member** berdasarkan total belanja.

#### 6.3.2 Aturan Poin (Dummy)
| Aturan | Nilai |
|---|---|
| Perolehan poin | 1 poin tiap belanja Rp 10.000 |
| Bonus layanan jasa | Poin 2x untuk grooming dan penitipan |
| Bonus ulang tahun hewan | +50 poin |
| Masa berlaku poin | 12 bulan sejak diperoleh |

Aturan bisa diedit pada form di halaman Loyalitas (hanya tampilan).

#### 6.3.3 Level Member
| Level | Syarat total belanja | Keuntungan |
|---|---|---|
| Bronze | Rp 0 | Poin standar |
| Silver | Rp 2.000.000 | Poin 1,25x, diskon grooming 5% |
| Gold | Rp 5.000.000 | Poin 1,5x, diskon grooming 10%, prioritas booking |

Kartu member menampilkan nama, level, saldo poin, progres menuju level berikutnya (progress bar oranye), dan kode member (QR dummy).

#### 6.3.4 Voucher
- Daftar voucher: kode, nama, jenis (nominal atau persen), nilai, minimum belanja, masa berlaku, kuota, dan status (aktif, habis, kedaluwarsa).
- **Buat Voucher** lewat modal form.
- **Tukar Poin:** katalog hadiah (voucher Rp 10.000, gratis potong kuku, diskon 15% grooming) dengan harga dalam poin dan tombol Tukar yang mengurangi saldo (state lokal).
- Pelanggan dapat melihat voucher miliknya di halaman detail pelanggan.

#### 6.3.5 Integrasi dengan Kasir
- Di halaman **Transaksi**, tambahkan: pilih pelanggan menampilkan level dan saldo poin, kolom input kode voucher atau tombol **Pakai Voucher**, opsi **Tukar Poin** sebagai potongan, dan baris "Poin yang akan didapat" pada ringkasan.
- Pada modal struk, tampilkan poin diperoleh dan saldo poin terbaru.

#### 6.3.6 Riwayat Poin
Tabel per pelanggan: tanggal, keterangan (belanja, bonus, penukaran, kedaluwarsa), perubahan poin (+/−), dan saldo.

### 6.4 Pembaruan Halaman yang Sudah Ada

| Halaman | Perubahan |
|---|---|
| Dashboard | Kartu Booking Hari Ini, Hewan Dititipkan, daftar Jadwal Berikutnya |
| Transaksi | Item layanan di keranjang (bukan hanya produk), voucher, dan poin |
| Pelanggan | Tab baru: **Booking**, **Riwayat Layanan**, **Loyalitas**; badge level member di daftar |
| Laporan | Tab baru: Pendapatan Layanan, Okupansi Penitipan, Performa Staf, dan Penggunaan Voucher |
| Pengaturan | Tab baru: **Layanan & Tarif**, **Jam Operasional & Slot**, **Pengingat**, **Aturan Loyalitas** |

## 7. Data Dummy

Simpan di `/data` dan ketik dengan TypeScript.

### 7.1 Layanan (`services.ts`)
| Layanan | Kategori | Durasi | Harga Kecil | Harga Sedang | Harga Besar |
|---|---|---|---|---|---|
| Mandi Biasa | Grooming | 45 mnt | Rp 50.000 | Rp 70.000 | Rp 100.000 |
| Mandi Anti Kutu / Jamur | Grooming | 60 mnt | Rp 80.000 | Rp 100.000 | Rp 140.000 |
| Potong Rambut & Styling | Grooming | 90 mnt | Rp 90.000 | Rp 120.000 | Rp 170.000 |
| Potong Kuku & Bersih Telinga | Grooming | 20 mnt | Rp 30.000 | Rp 40.000 | Rp 50.000 |
| Paket Grooming Lengkap | Paket | 120 mnt | Rp 150.000 | Rp 200.000 | Rp 280.000 |
| Vaksinasi | Kesehatan | 30 mnt | Rp 120.000 | Rp 150.000 | Rp 180.000 |
| Konsultasi Dokter Hewan | Kesehatan | 30 mnt | Rp 100.000 | Rp 100.000 | Rp 100.000 |

Add-on: Bulu Kusut (+Rp 25.000), Parfum (+Rp 15.000), Obat Kutu Tetes (+Rp 45.000).

### 7.2 Tarif Penitipan (`boarding.ts`)
| Tipe Kandang | Per Malam |
|---|---|
| Standar | Rp 60.000 |
| Premium | Rp 90.000 |
| VIP (ber-AC) | Rp 130.000 |

Kapasitas: 12 kandang (6 Standar, 4 Premium, 2 VIP). Contoh data: 8 kandang terisi, 3 kosong, 1 perlu dibersihkan.

### 7.3 Staf (`staff.ts`)
| Nama | Peran |
|---|---|
| Dewi Lestari | Groomer |
| Bagas Setiawan | Groomer |
| drh. Maya Putri | Dokter Hewan |
| Rudi Hartono | Kasir |

### 7.4 Hewan dan Pelanggan (perluasan `customers.ts`)
Gunakan pelanggan dari `prd.md` (Rina Sari, Andri Pratama, Siti Nurhaliza) dan tambah hewan, misalnya:
- Rina Sari: **Mochi** (Kucing, Persia, 2 th, Kecil), **Luna** (Kucing, Domestik, 1 th, Kecil)
- Andri Pratama: **Bruno** (Anjing, Golden Retriever, 3 th, Besar)
- Siti Nurhaliza: **Kiko** (Anjing, Pomeranian, 4 th, Kecil), catatan: alergi shampo tertentu

### 7.5 Booking (`bookings.ts`), minimal 15 data
| No. Booking | Tanggal | Jam | Pelanggan | Hewan | Layanan | Staf | Status |
|---|---|---|---|---|---|---|---|
| BK-0021 | 11 Okt 2026 | 09:00 | Rina Sari | Mochi | Mandi Biasa | Dewi Lestari | Selesai |
| BK-0022 | 11 Okt 2026 | 10:30 | Andri Pratama | Bruno | Paket Grooming Lengkap | Bagas Setiawan | Diproses |
| BK-0023 | 11 Okt 2026 | 13:00 | Siti Nurhaliza | Kiko | Vaksinasi | drh. Maya Putri | Terkonfirmasi |
| BK-0024 | 11 Okt 2026 | 15:00 | Rina Sari | Luna | Potong Kuku & Bersih Telinga | Dewi Lestari | Menunggu Konfirmasi |
| BK-0025 | 12 Okt 2026 | 10:00 | Andri Pratama | Bruno | Mandi Anti Kutu / Jamur | Bagas Setiawan | Terkonfirmasi |

Lengkapi sampai 15 data dengan variasi status (Dibatalkan, Tidak Hadir, Terlambat) dan tanggal beberapa hari ke depan dan ke belakang.

### 7.6 Penitipan Aktif (`boarding-stays.ts`), minimal 8 data
Contoh: Bruno (Kandang V-1, VIP, masuk 9 Okt, keluar 13 Okt), Mochi (Kandang P-2, Premium, masuk 10 Okt, keluar 12 Okt), lengkap dengan catatan dan jurnal harian dummy.

### 7.7 Loyalitas (`loyalty.ts`)
**Saldo member:**
| Pelanggan | Level | Poin | Total Belanja |
|---|---|---|---|
| Rina Sari | Gold | 820 | Rp 6.200.000 |
| Andri Pratama | Silver | 410 | Rp 2.750.000 |
| Siti Nurhaliza | Bronze | 120 | Rp 850.000 |

**Voucher:**
| Kode | Nama | Nilai | Min. Belanja | Berlaku s/d | Status |
|---|---|---|---|---|---|
| PAW10K | Diskon Rp 10.000 | Rp 10.000 | Rp 100.000 | 31 Des 2026 | Aktif |
| GROOM15 | Diskon Grooming 15% | 15% | Rp 80.000 | 30 Nov 2026 | Aktif |
| NEWMEMBER | Member Baru | Rp 15.000 | Rp 75.000 | 31 Okt 2026 | Aktif |
| HALLOWEEN | Promo Halloween | 10% | Rp 150.000 | 31 Okt 2026 | Aktif |
| LEBARAN25 | Promo Lebaran | 20% | Rp 200.000 | 5 Apr 2026 | Kedaluwarsa |

**Katalog tukar poin:** Voucher Rp 10.000 (100 poin), Gratis Potong Kuku (150 poin), Diskon 15% Grooming (250 poin), Gratis Mandi Biasa (400 poin).

**Riwayat poin:** minimal 10 baris contoh untuk satu pelanggan.

## 8. Struktur Folder (Tambahan)

```
app/(dashboard)/
├── layanan/
│   ├── page.tsx                 # Katalog
│   ├── antrean/page.tsx
│   └── penitipan/page.tsx
├── booking/
│   ├── page.tsx                 # Kalender dan daftar
│   └── baru/page.tsx            # Stepper buat booking
└── loyalitas/
    ├── page.tsx                 # Ringkasan
    ├── voucher/page.tsx
    └── member/page.tsx

components/
├── layanan/     (ServiceCard, PackageCard, QueueBoard, BoardingMap, CheckInForm)
├── booking/     (CalendarView, SlotPicker, BookingStepper, BookingDetail, ReminderModal)
└── loyalty/     (MemberCard, TierProgress, VoucherCard, RewardCatalog, PointHistory)

data/
├── services.ts  boarding.ts  staff.ts  bookings.ts  boarding-stays.ts  loyalty.ts
```

Library tambahan yang disarankan: `date-fns` untuk tanggal dan opsi kalender buatan sendiri dengan Tailwind (atau `react-big-calendar`) agar gaya tetap seragam.

## 9. Alur Pengguna Utama

**A. Booking grooming sampai bayar**
Buat Booking → Konfirmasi → Check-in → Antrean "Menunggu" → "Diproses" → "Selesai" → Tagih ke Kasir → Pilih voucher/poin → Bayar → Struk dengan poin diperoleh.

**B. Penitipan**
Check-in (form) → Hewan muncul di peta kandang → Catatan harian → Check-out dengan ringkasan biaya → Tagih ke Kasir → Bayar.

**C. Loyalitas**
Pelanggan belanja → Poin bertambah (tampil di struk) → Naik level saat total belanja mencapai syarat → Tukar poin menjadi voucher → Pakai voucher di kasir.

## 10. Kebutuhan Non-Fungsional
- Semua teks dalam Bahasa Indonesia; format uang `Rp 150.000`, tanggal `11 Okt 2026`, jam 24 jam (`13:00`).
- Responsif di 360px, 768px, dan 1280px tanpa scroll horizontal.
- Kalender tetap bisa dipakai di handphone (tampilan hari dan daftar sebagai default).
- Area sentuh minimal 44px; warna status tidak hanya mengandalkan warna (sertakan teks atau ikon).
- Kontras teks memenuhi WCAG AA.
- Tidak ada panggilan jaringan ke backend.
- Interaksi (ubah status, pilih slot, tukar poin) terasa langsung, dengan state lokal dan toast konfirmasi.

## 11. Kriteria Penerimaan
- [ ] Menu **Layanan**, **Booking**, dan **Loyalitas** muncul di sidebar dan menu handphone, dan masing-masing halaman dapat dibuka.
- [ ] Katalog layanan menampilkan harga sesuai jenis dan ukuran hewan, serta paket dan add-on.
- [ ] Alur booking 4 langkah dapat diselesaikan dan booking baru muncul di kalender dan daftar.
- [ ] Slot yang bentrok dengan booking lain tidak bisa dipilih.
- [ ] Papan antrean dapat mengubah status layanan, dan tombol **Tagih ke Kasir** memasukkan layanan ke keranjang.
- [ ] Peta kandang penitipan menampilkan status kandang dan detail penghuni; check-in dan check-out menghitung total biaya otomatis.
- [ ] Halaman Loyalitas menampilkan kartu member, level, progres, voucher, dan katalog tukar poin yang mengurangi saldo.
- [ ] Halaman Transaksi mendukung voucher dan penukaran poin, serta menampilkan poin yang diperoleh.
- [ ] Dashboard menampilkan kartu Booking Hari Ini, Hewan Dititipkan, dan Jadwal Berikutnya.
- [ ] Pratinjau pengingat WhatsApp tampil dengan data booking yang benar.
- [ ] Tampilan sesuai design system PawMart di laptop, tablet, dan handphone.

## 12. Rencana Pengerjaan

| Tahap | Pekerjaan |
|---|---|
| 1 | Data dummy dan komponen baru (kalender, slot picker, badge status, kartu member) |
| 2 | Halaman Layanan: katalog, paket, dan form layanan |
| 3 | Halaman Booking: kalender, daftar, dan stepper buat booking |
| 4 | Antrean layanan (papan status) dan integrasi Tagih ke Kasir |
| 5 | Penitipan: peta kandang, check-in/check-out, catatan harian |
| 6 | Loyalitas: ringkasan, level, voucher, tukar poin, riwayat poin |
| 7 | Integrasi ke Dashboard, Transaksi, Pelanggan, Laporan, dan Pengaturan |
| 8 | Poles responsif, aksesibilitas, dan pengujian alur A, B, dan C |

## 13. Tahap Selanjutnya (di Luar Lingkup)
- Backend Supabase: tabel layanan, booking, penitipan, member, voucher, dan riwayat poin.
- Pengingat WhatsApp sungguhan lewat WhatsApp Business API.
- DP dan pembayaran online untuk booking.
- Booking mandiri oleh pelanggan lewat halaman publik atau aplikasi.
- Notifikasi real-time antrean untuk staf.
- Foto sebelum dan sesudah grooming serta laporan harian penitipan yang dikirim ke pemilik.

## 14. Risiko dan Catatan
- Harga, durasi, dan aturan poin hanya contoh dan perlu disesuaikan dengan kebijakan toko.
- Logika bentrok jadwal pada tahap ini sederhana (sama staf dan sama jam), belum mempertimbangkan durasi bertumpuk secara penuh. Perlu diperkuat saat backend dibuat.
- Tahun pada data dummy mengikuti tanggal berjalan (Oktober 2026), berbeda dengan `prd.md` yang masih memakai tahun 2025 dari gambar referensi. Sebaiknya diseragamkan saat implementasi.
