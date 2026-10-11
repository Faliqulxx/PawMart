const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'Manual book', 'screenshots');
const OUTPUT_PDF = path.join(__dirname, '..', 'Manual book', 'fitur.pdf');

function getImagePath(filename) {
  return `screenshots/${filename}`;
}

async function generatePdf() {
  console.log('Generating HTML content for manual...');

  const img00 = getImagePath('00_login.png');
  const img01 = getImagePath('01_dashboard.png');
  const img02 = getImagePath('02_kasir_pos.png');
  const img03 = getImagePath('03_kasir_bayar.png');
  const img03b = getImagePath('03b_kasir_struk.png');
  const img04 = getImagePath('04_produk.png');
  const img05 = getImagePath('05_stok.png');
  const img06 = getImagePath('06_layanan_katalog.png');
  const img07 = getImagePath('07_layanan_antrean.png');
  const img07b = getImagePath('07b_antrean_modal.png');
  const img08 = getImagePath('08_penitipan_peta.png');
  const img08b = getImagePath('08b_penitipan_checkin.png');
  const img09 = getImagePath('09_penitipan_detail.png');
  const img10 = getImagePath('10_booking_kalender.png');
  const img11 = getImagePath('11_booking_stepper.png');
  const img12 = getImagePath('12_loyalitas_ringkasan.png');
  const img13 = getImagePath('13_loyalitas_member.png');
  const img14 = getImagePath('14_loyalitas_voucher.png');
  const img15 = getImagePath('15_pelanggan.png');
  const img15b = getImagePath('15b_pelanggan_detail.png');
  const img16 = getImagePath('16_laporan.png');
  const img17 = getImagePath('17_pengaturan.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Pengguna PawMart POS</title>
  <style>

    @page {
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      font-size: 9.5pt;
      line-height: 1.5;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 980px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 24px;
      border: 2px solid #FED7AA;
      border-radius: 24px;
      background: linear-gradient(145deg, #FFF7ED 0%, #FFFFFF 50%, #FEF3C7 100%);
      box-shadow: inset 0 0 80px rgba(249, 115, 22, 0.05);
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #F97316, #EA580C);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
      box-shadow: 0 10px 25px rgba(234, 88, 12, 0.3);
    }

    .cover-brand h1 {
      font-size: 26pt;
      font-weight: 800;
      color: #7C2D12;
      letter-spacing: -0.5px;
    }

    .cover-brand p {
      font-size: 11pt;
      font-weight: 600;
      color: #EA580C;
    }

    .cover-hero {
      margin-top: 50px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #FFEDD5;
      color: #C2410C;
      font-weight: 700;
      font-size: 9pt;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      border: 1px solid #FDBA74;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.22;
      margin-bottom: 16px;
    }

    .cover-subtitle {
      font-size: 12pt;
      color: #475569;
      font-weight: 500;
      line-height: 1.55;
      max-width: 92%;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 40px;
    }

    .cover-pill {
      background: white;
      padding: 14px;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .cover-pill-title {
      font-size: 8pt;
      text-transform: uppercase;
      color: #64748B;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .cover-pill-value {
      font-size: 10pt;
      font-weight: 700;
      color: #1E293B;
    }

    .cover-footer {
      border-top: 1px solid #CBD5E1;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #64748B;
      font-weight: 500;
    }

    /* Table of Contents */
    .toc-container {
      padding: 16px 0;
    }

    .section-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 8px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 10pt;
    }

    .toc-item-title {
      font-weight: 700;
      color: #1E293B;
    }

    .toc-item-sub {
      color: #64748B;
      font-size: 8.5pt;
      margin-left: 20px;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #94A3B8;
      margin: 0 12px;
      height: 1px;
    }

    .toc-page {
      font-weight: 700;
      color: #EA580C;
    }

    /* Chapter Header */
    .chapter-header {
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #FED7AA;
    }

    .chapter-tag {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #EA580C;
      margin-bottom: 3px;
    }

    .chapter-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.25;
    }

    .chapter-desc {
      font-size: 9pt;
      color: #475569;
      margin-top: 4px;
      line-height: 1.45;
    }

    /* Feature Block */
    .feature-card {
      margin-bottom: 20px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #F1F5F9;
    }

    .feature-name {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feature-route {
      font-family: monospace;
      font-size: 8pt;
      background: #F1F5F9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Split Feature Layout: Gambar Kiri, Penjelasan Kanan */
    .feature-split-layout {
      display: grid;
      grid-template-columns: 46% 54%;
      gap: 14px;
      align-items: start;
    }

    .feature-left-col {
      display: flex;
      flex-direction: column;
    }

    .feature-left-col .screenshot-frame {
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 6px;
      background: #0F172A;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
    }

    .feature-left-col .screenshot-frame img {
      width: 100%;
      height: auto;
      display: block;
    }

    .feature-left-col .screenshot-caption {
      font-size: 7.5pt;
      color: #64748B;
      font-style: italic;
      text-align: center;
      margin-top: 2px;
      line-height: 1.3;
    }

    .feature-right-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .guide-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
    }

    .guide-box-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .guide-box ul, .guide-box ol {
      padding-left: 16px;
      font-size: 8pt;
      color: #334155;
      line-height: 1.45;
    }

    .guide-box li {
      margin-bottom: 4px;
    }

    .guide-box li strong {
      color: #0F172A;
    }

    /* Callout Alert */
    .callout {
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 8pt;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      line-height: 1.4;
    }

    .callout-info {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1E40AF;
    }

    .callout-tip {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #166534;
    }

    .callout-warning {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
    }

    .callout-icon {
      font-size: 11pt;
      line-height: 1;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 7pt;
      font-weight: 700;
      border-radius: 5px;
    }
    .badge-amber { background: #FEF3C7; color: #B45309; }
    .badge-emerald { background: #D1FAE5; color: #047857; }
    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-purple { background: #F3E8FF; color: #6B21A8; }

    /* Tables */
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      line-height: 1.35;
    }

    .custom-table th {
      background: #F1F5F9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      border: 1px solid #CBD5E1;
    }

    .custom-table td {
      padding: 5px 8px;
      border: 1px solid #CBD5E1;
      color: #1E293B;
    }

    .custom-table tr:nth-child(even) td {
      background: #F8FAFC;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-logo">🐾</div>
      <div class="cover-brand">
        <h1>PawMart POS</h1>
        <p>Sistem Kasir Pintar & Layanan Pet Shop Terintegrasi</p>
      </div>
    </div>

    <div class="cover-hero">
      <span class="cover-badge">Buku Panduan Operasional Resmi (Manual Book)</span>
      <h2 class="cover-title">Panduan Lengkap Fitur & Operasional Kasir</h2>
      <p class="cover-subtitle">
        Dokumentasi visual komprehensif dengan tata letak visual dua kolom (Screenshot di Kiri & Panduan di Kanan). Meliputi Akses Peran RBAC, Kasir POS, Manajemen Produk & Stok, Layanan Grooming & Penitipan Pet Hotel, Sistem Booking Kalender, Program Loyalitas Member & Voucher, serta Laporan Keuangan.
      </p>

      <div class="cover-grid">
        <div class="cover-pill">
          <div class="cover-pill-title">Versi Rilis</div>
          <div class="cover-pill-value">v2.0 (Fase 1 & Fase 2)</div>
        </div>
        <div class="cover-pill">
          <div class="cover-pill-title">Hak Akses Peran</div>
          <div class="cover-pill-value">👑 Owner • 👩‍💼 Kasir • ✂️ Groomer</div>
        </div>
        <div class="cover-pill">
          <div class="cover-pill-title">Format Cetak</div>
          <div class="cover-pill-value">Thermal 58/80mm & PDF Digital</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>© 2026 PawMart Pet Shop & Care System. Hak Cipta Dilindungi Undang-Undang.</div>
      <div>Dokumen Resmi: Manual Book / fitur.pdf</div>
    </div>
  </div>

  <!-- ==================== DAFTAR ISI ==================== -->
  <div class="page-break"></div>
  <div class="toc-container">
    <div class="section-title">📑 Daftar Isi Panduan</div>
    
    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 1: Akses Sistem & Hak Akses Berdasarkan Peran (RBAC)</div>
        <div class="toc-item-sub">Halaman Login Simulasi, Switcher Peran Instan (Owner, Kasir, Groomer) & Matriks Izin Menu</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 3</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 2: Gambaran Umum & Dashboard Operasional</div>
        <div class="toc-item-sub">Metrik KPI Penjualan, Widget Booking Hari Ini & Status Kamar Hewan Dititipkan</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 4</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 3: Modul Transaksi & Kasir POS</div>
        <div class="toc-item-sub">Katalog Cepat, Diskon (RP / %), Tombol Uang Pas & Pecahan Cepat, Struk Thermal</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 5</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 4: Manajemen Produk & Stok Inventori</div>
        <div class="toc-item-sub">Katalog Barcode, Alert Stok Menipis & Riwayat Penyesuaian Mutasi Opname</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 8</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 5: Layanan Jasa Grooming & Antrean Kanban</div>
        <div class="toc-item-sub">Katalog Berjenjang Ukuran Anabul, Papan Real-time & Fitur Tagih ke Kasir POS</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 10</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 6: Penitipan Hewan (Pet Hotel)</div>
        <div class="toc-item-sub">Peta Grid 12 Kamar, SOP Form Check-in, Jurnal Harian Aktivitas & Log Foto WhatsApp</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 13</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 7: Sistem Booking & Kalender Perawatan</div>
        <div class="toc-item-sub">Tampilan Jadwal, Pengingat WhatsApp Terformat Otomatis & Stepper Booking 4 Langkah</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 16</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 8: Program Loyalitas Member & Voucher Diskon</div>
        <div class="toc-item-sub">Kartu Member Digital QR, Aturan Poin Transaksi, Manajemen Kupon & Katalog Hadiah</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 18</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 9: Manajemen Data Pelanggan & Anabul</div>
        <div class="toc-item-sub">Database Relasional Pemilik, Multi-Anabul, Histori Layanan & Catatan Khusus</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 21</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 10: Laporan Analitik Bisnis & Keuangan</div>
        <div class="toc-item-sub">Omzet POS, Okupansi Hotel, Performa Groomer & Ekspor Excel/Thermal Ringkasan Shift</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 23</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 11: Pengaturan & Konfigurasi Sistem</div>
        <div class="toc-item-sub">Profil Toko, Tarif Jasa, Printer Thermal 58/80mm, Slot Jam Booking & Template Pesan WA</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 24</div>
    </div>
  </div>

  <!-- ==================== BAB 1: LOGIN & RBAC ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 1</div>
    <h2 class="chapter-title">Akses Sistem & Hak Akses Berdasarkan Peran (RBAC)</h2>
    <p class="chapter-desc">
      Sistem keamanan dan otorisasi PawMart POS memastikan setiap staf hanya dapat mengakses fitur sesuai wewenang tugasnya melalui antarmuka simulasi login modern dengan pemilihan peran sekali klik.
    </p>
  </div>

  <!-- 1.1 Simulasi Login & Pemilihan Peran -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🔐 1.1 Halaman Login & Switcher Peran Pengguna</div>
      <span class="feature-route">/login</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img00}" alt="Halaman Login PawMart POS" />
        </div>
        <div class="screenshot-caption">Gambar 1.1: Layar Login PawMart POS dengan Tombol Pintas Pemilihan Peran (Owner, Kasir, Groomer)</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">👥 Tiga Tingkatan Peran Pengguna (RBAC)</div>
          <ul>
            <li><strong>👑 Owner / Admin:</strong> Memiliki wewenang mutlak atas seluruh sistem: melihat laporan keuangan omzet & laba, konfigurasi tarif & printer, ubah harga produk, serta diskon bebas.</li>
            <li><strong>👩‍💼 Kasir / Karyawan:</strong> Berfokus pada pelayanan transaksi harian: membuat struk di kasir POS, diskon cepat Rp 1.000, kelola antrean grooming, check-in hotel, dan cek sisa stok produk.</li>
            <li><strong>✂️ Groomer / Staff Perawatan:</strong> Didedikasikan untuk operasional teknis: melihat papan antrean mandi, mengubah status proses perawatan, mengisi jurnal harian hotel, dan kalender booking.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">⚡ Cara Menggunakan Simulasi Login</div>
          <ol>
            <li>Buka alamat web sistem; jika belum login, sistem otomatis mengarahkan ke halaman <code>/login</code>.</li>
            <li>Klik salah satu tombol peran cepat (<strong>👑 Owner</strong>, <strong>👩‍💼 Kasir</strong>, atau <strong>✂️ Groomer</strong>).</li>
            <li>Username dan Password terisi otomatis, lalu klik <strong>"Masuk ke Sistem"</strong>.</li>
            <li>Menu Sidebar, Bottom Nav, dan tombol aksi akan menyesuaikan secara real-time.</li>
          </ol>
        </div>
        <div class="callout callout-info">
          <span class="callout-icon">💡</span>
          <div>
            <strong>Peralihan Cepat:</strong> Anda juga dapat beralih peran kapan saja dari bilah navigasi atas (Topbar) tanpa harus logout terlebih dahulu.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 2: DASHBOARD ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 2</div>
    <h2 class="chapter-title">Gambaran Umum & Dashboard Operasional</h2>
    <p class="chapter-desc">
      Halaman utama sistem yang menyajikan ringkasan performa penjualan harian, status operasional layanan jasa grooming, okupansi penitipan hotel, serta jadwal booking mendatang dalam satu layar responsif.
    </p>
  </div>

  <!-- 2.1 Dashboard -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🖥️ 2.1 Dashboard Ringkasan Eksekutif</div>
      <span class="feature-route">/</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img01}" alt="Dashboard PawMart POS" />
        </div>
        <div class="screenshot-caption">Gambar 2.1: Tampilan Dashboard Interaktif dengan Widget POS & Layanan Anabul</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📊 Metrik Utama (KPI Cards)</div>
          <ul>
            <li><strong>Penjualan Hari Ini:</strong> Menampilkan akumulasi omzet penjualan produk & jasa shift aktif beserta tren persentase dibandingkan hari kemarin.</li>
            <li><strong>Total Transaksi:</strong> Jumlah nota struk yang telah diselesaikan.</li>
            <li><strong>Booking Menunggu:</strong> Jumlah reservasi pelanggan yang perlu konfirmasi.</li>
            <li><strong>Kandang Terisi:</strong> Jumlah anabul yang sedang menginap di Pet Hotel.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">⚡ Widget Operasional Cepat</div>
          <ul>
            <li><strong>Jadwal Booking Hari Ini:</strong> Daftar anabul yang memiliki jadwal salon hari ini beserta jam dan statusnya.</li>
            <li><strong>Hewan Dititipkan (Pet Hotel):</strong> Menampilkan anabul yang menginap, tipe kamar, dan estimasi waktu penjemputan.</li>
            <li><strong>Tombol Pintas Aksi:</strong> Tombol cepat untuk Transaksi Baru, Booking Baru, Antrean Grooming, dan Check-in Hotel.</li>
          </ul>
        </div>
        <div class="callout callout-tip">
          <span class="callout-icon">✨</span>
          <div>
            <strong>Tips Operasional:</strong> Periksa widget "Jadwal Booking Hari Ini" di awal shift kerja untuk menyiapkan bak mandi, handuk, dan tenaga groomer sebelum pelanggan tiba.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 3: KASIR POS ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 3</div>
    <h2 class="chapter-title">Modul Transaksi & Kasir POS</h2>
    <p class="chapter-desc">
      Dirancang untuk kecepatan operasional kasir dengan kemampuan mengelola produk fisik, layanan jasa grooming, penitipan anabul, diskon fleksibel (RP/%), tombol nominal cepat, dan pencetakan struk thermal.
    </p>
  </div>

  <!-- 3.1 Antarmuka Kasir -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🛒 3.1 Antarmuka Kasir & Keranjang Belanja</div>
      <span class="feature-route">/transaksi</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img02}" alt="Antarmuka Kasir POS" />
        </div>
        <div class="screenshot-caption">Gambar 3.1: Layar Kasir POS dengan Grid Produk, Pemilih Kategori, Keranjang, dan Diskon</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🔍 Elemen Panel Kiri (Katalog & Pencarian)</div>
          <ul>
            <li><strong>Pencarian Multi-Metode:</strong> Scan barcode fisik produk atau ketik nama/SKU di kolom pencarian.</li>
            <li><strong>Filter Tab Kategori:</strong> Navigasi cepat Makanan Kucing, Makanan Anjing, Pasir & Litter, Mainan, Aksesoris, dan Obat.</li>
            <li><strong>Indikator Stok Real-Time:</strong> Mencegah penjualan barang yang telah habis di rak etalase.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">📋 Elemen Panel Kanan (Keranjang & Diskon)</div>
          <ul>
            <li><strong>Pilih Pelanggan:</strong> Hubungkan transaksi dengan member untuk mencatat reward poin transaksi.</li>
            <li><strong>Kontrol Kuantitas:</strong> Tombol (+) dan (-) untuk mengatur jumlah barang serta tombol hapus item.</li>
            <li><strong>Voucher & Diskon:</strong> Masukkan diskon rupiah/persen atau gunakan voucher promo yang tersedia.</li>
            <li><strong>Tukar Poin Member:</strong> Checkbox pemotongan tagihan menggunakan saldo poin pelanggan.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 3.2 Modal Pembayaran -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">💵 3.2 Pembayaran Fleksibel & Tombol Nominal Cepat</div>
      <span class="feature-route">/transaksi (Modal Pembayaran)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img03}" alt="Modal Pembayaran Kasir" />
        </div>
        <div class="screenshot-caption">Gambar 3.2: Modal Pembayaran dengan Pilihan Metode, Tombol Uang Pas, dan Pecahan Cepat</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🎯 Fitur Tombol Cepat Uang Tunai</div>
          <ul>
            <li><strong>Tombol Uang Pas:</strong> Sekali klik langsung mengisi uang bayar tepat sama dengan tagihan (Kembalian = Rp 0).</li>
            <li><strong>Tombol Pecahan (Rp 5.000, 10.000, 50.000, 100.000):</strong> Klik berulang kali untuk menjumlahkan nominal secara akumulatif sesuai uang kertas yang diserahkan pelanggan.</li>
            <li><strong>Metode Non-Tunai:</strong> Pilihan metode QRIS, Kartu Debit, Kartu Kredit, dan Transfer Bank.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🏷️ Kebijakan Diskon Sesuai Peran</div>
          <ul>
            <li><strong>Akses Owner/Admin:</strong> Dapat memasukkan nominal potongan diskon secara bebas atau mengubah harga jual.</li>
            <li><strong>Akses Kasir:</strong> Disediakan tombol diskon cepat Rp 1.000 jika pelanggan meminta potongan kecil, menjaga margin laba tetap terlindungi.</li>
          </ul>
        </div>
        <div class="callout callout-tip">
          <span class="callout-icon">✨</span>
          <div>
            <strong>Efisiensi Kasir:</strong> Gunakan kombinasi tombol uang pecahan (contoh: klik Rp 50.000 dua kali untuk uang Rp 100.000) agar kasir tidak perlu mengetik pada numpad keyboard.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3.3 Cetak Struk Thermal -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🧾 3.3 Pratinjau & Cetak Struk Thermal</div>
      <span class="feature-route">/transaksi (Modal Struk)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img03b}" alt="Struk Pembayaran POS" />
        </div>
        <div class="screenshot-caption">Gambar 3.3: Pratinjau Struk Thermal dengan Rincian Produk, Diskon, Poin Member & QR Validasi</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📑 Anatomi Struk Belanja PawMart</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Bagian</th>
                <th>Konten Tercetak</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Header</strong></td>
                <td>Nama Toko, Alamat, No Telepon, No Faktur, Tanggal, Jam, Nama Kasir.</td>
              </tr>
              <tr>
                <td><strong>Item</strong></td>
                <td>Nama barang/jasa, kuantitas, harga satuan, dan subtotal yang rapi sejajar.</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td>Total Belanja, Diskon (RP/Voucher), Tukar Poin, Total Akhir, Bayar, Kembalian.</td>
              </tr>
              <tr>
                <td><strong>Loyalitas</strong></td>
                <td>Tier Member, Poin diperoleh dari belanja ini, dan Total Saldo Poin terkini.</td>
              </tr>
              <tr>
                <td><strong>Footer</strong></td>
                <td>Pesan terima kasih & kode QR faktur belanja resmi.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🖨️ Kompatibilitas Printer Thermal</div>
          <ul>
            <li>Mendukung printer thermal ukuran 58mm (portabel bluetooth) dan 80mm (USB/LAN kasir).</li>
            <li>Dukungan pemotong kertas otomatis (Auto-cutter) dan tombol buka laci uang (Cash Drawer).</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 4: PRODUK & STOK ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 4</div>
    <h2 class="chapter-title">Manajemen Master Produk & Inventori Stok</h2>
    <p class="chapter-desc">
      Mengelola ribuan inventori produk pakan, pasir, vitamin, dan perlengkapan hewan dengan pelacakan harga modal, harga jual, barcode scanner, serta sistem peringatan stok minimum otomatis.
    </p>
  </div>

  <!-- 4.1 Master Produk -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📦 4.1 Katalog & Master Data Produk</div>
      <span class="feature-route">/produk</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img04}" alt="Katalog Produk" />
        </div>
        <div class="screenshot-caption">Gambar 4.1: Halaman Master Produk dengan Pencarian SKU, Kategori, dan Status Stok</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📋 Fitur Pengelolaan Produk</div>
          <ul>
            <li><strong>Master Data Terstruktur:</strong> Form input Barcode/SKU, Nama, Kategori, Satuan (Pcs/Kg/Pack), Harga Beli, dan Harga Jual.</li>
            <li><strong>Kalkulasi Margin Otomatis:</strong> Sistem langsung menghitung persentase margin keuntungan saat harga beli dan harga jual diinput.</li>
            <li><strong>Proteksi Peran:</strong> Tombol Tambah, Edit, dan Hapus Produk hanya aktif untuk akun dengan peran <strong>Owner</strong>. Kasir hanya memiliki hak baca (view-only).</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">💡 Prosedur Penambahan Produk Baru</div>
          <ol>
            <li>Klik tombol <strong>"+ Tambah Produk"</strong> di pojok kanan atas.</li>
            <li>Scan barcode kemasan dengan alat scanner untuk mengisi kode SKU.</li>
            <li>Pilih kategori yang sesuai dan tentukan batas minimum peringatan stok.</li>
            <li>Klik <strong>"Simpan Produk"</strong> untuk mendaftarkan barang ke kasir.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- 4.2 Stok & Opname -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📊 4.2 Manajemen Stok & Opname Inventori</div>
      <span class="feature-route">/stok</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img05}" alt="Manajemen Stok Inventori" />
        </div>
        <div class="screenshot-caption">Gambar 4.2: Daftar Pemantauan Stok, Peringatan Stok Menipis, dan Riwayat Penyesuaian</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">⚠️ Status Indikator Stok</div>
          <ul>
            <li><span class="badge badge-emerald">Aman</span>: Jumlah fisik di atas batas minimum stok.</li>
            <li><span class="badge badge-amber">Menipis</span>: Sisa stok di bawah batas ambang (segera buat order ke supplier).</li>
            <li><span class="badge" style="background:#FEE2E2; color:#DC2626;">Habis</span>: Produk kosong di gudang & etalase (stok = 0).</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🔄 Prosedur Penyesuaian Stock Opname</div>
          <ol>
            <li>Pilih baris produk yang akan dihitung fisik.</li>
            <li>Klik tombol <strong>"Sesuaikan Stok"</strong> (Akses Owner).</li>
            <li>Masukkan jumlah stok fisik hasil hitungan riil di gudang.</li>
            <li>Pilih keterangan alasan: <em>Stok Masuk, Rusak/Kadaluwarsa, atau Selisih Opname</em>.</li>
            <li>Klik simpan untuk mencatat riwayat mutasi ke kartu stok sistem.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 5: LAYANAN GROOMING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 5</div>
    <h2 class="chapter-title">Layanan Jasa Grooming & Antrean Kanban</h2>
    <p class="chapter-desc">
      Solusi lengkap perawatan anabul mencakup penetapan tarif bertingkat berdasarkan ukuran fisik (Kecil/Sedang/Besar), papan antrean pengerjaan real-time, dan integrasi penagihan ke kasir POS.
    </p>
  </div>

  <!-- 5.1 Katalog Layanan -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">✂️ 5.1 Katalog Layanan & Matriks Tarif Ukuran</div>
      <span class="feature-route">/layanan</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img06}" alt="Katalog Layanan Grooming" />
        </div>
        <div class="screenshot-caption">Gambar 5.1: Katalog Layanan Jasa dengan Matriks Tarif Berdasarkan Ukuran Anabul</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📋 Matriks Tarif Jasa Grooming Resmi</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Paket Layanan</th>
                <th>Kecil (&lt;5kg)</th>
                <th>Sedang (5-15kg)</th>
                <th>Besar (&gt;15kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Mandi Biasa</strong></td>
                <td>Rp 50.000</td>
                <td>Rp 70.000</td>
                <td>Rp 100.000</td>
              </tr>
              <tr>
                <td><strong>Grooming Lengkap</strong></td>
                <td>Rp 80.000</td>
                <td>Rp 110.000</td>
                <td>Rp 150.000</td>
              </tr>
              <tr>
                <td><strong>Kutu / Jamur</strong></td>
                <td>Rp 95.000</td>
                <td>Rp 130.000</td>
                <td>Rp 175.000</td>
              </tr>
              <tr>
                <td><strong>Styling / Cukur</strong></td>
                <td>Rp 120.000</td>
                <td>Rp 160.000</td>
                <td>Rp 220.000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🐶 Cakupan Paket Perawatan</div>
          <ul>
            <li><strong>Mandi Biasa:</strong> Shampoo aroma, potong kuku, bersihkan telinga, blow dry steril.</li>
            <li><strong>Grooming Lengkap:</strong> Seluruh paket mandi + cukur bulu telapak & anus + perapian bulu wajah.</li>
            <li><strong>Kutu/Jamur:</strong> Medicated shampoo khusus berformula anti-fungal/parasit.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 5.2 Antrean Kanban -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📋 5.2 Papan Antrean Kanban & Tagih ke Kasir</div>
      <span class="feature-route">/layanan/antrean</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img07}" alt="Papan Antrean Kanban Layanan" />
        </div>
        <div class="screenshot-caption">Gambar 5.2: Papan Kanban Antrean Layanan (Menunggu → Diproses → Selesai)</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🔄 3 Kolom Alur Pengerjaan Grooming</div>
          <ol>
            <li><strong>Menunggu:</strong> Anabul telah tiba. Groomer menekan tombol <em>"Mulai Proses"</em> saat meja mandi siap.</li>
            <li><strong>Diproses:</strong> Anabul sedang dimandikan/dicukur. Kolom menampilkan timer durasi dan nama groomer penanggung jawab.</li>
            <li><strong>Selesai:</strong> Anabul bersih & wangi. Muncul tombol hijau <strong>"Tagih ke Kasir POS"</strong>.</li>
          </ol>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">💳 Mekanisme "Tagih ke Kasir POS"</div>
          <ul>
            <li>Sekali klik, data jasa, add-on, nama pemilik, dan anabul dikirim otomatis ke kasir POS.</li>
            <li>Kasir tidak perlu input ulang harga; nota pembayaran langsung siap diselesaikan.</li>
            <li>Status antrean otomatis diperbarui menjadi selesai dan anabul siap dijemput.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 5.3 Modal Tambah Antrean -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">➕ 5.3 Pendaftaran Antrean Walk-in</div>
      <span class="feature-route">/layanan/antrean (Modal Tambah)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img07b}" alt="Modal Tambah Antrean" />
        </div>
        <div class="screenshot-caption">Gambar 5.3: Formulir Registrasi Antrean Pelanggan Datang Langsung (Walk-in)</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📝 Formulir Registrasi Walk-in</div>
          <ul>
            <li><strong>Data Pelanggan:</strong> Pilih dari pelanggan terdaftar atau ketik nama pelanggan baru.</li>
            <li><strong>Pilih Anabul & Bobot:</strong> Tentukan ukuran anabul agar sistem menerapkan tarif yang akurat.</li>
            <li><strong>Paket & Add-on:</strong> Pilih paket dasar dan layanan tambahan (misal: sikat gigi, vitamin bulu).</li>
            <li><strong>Pilih Staf Groomer:</strong> Tentukan staf yang bertugas menangani anabul.</li>
          </ul>
        </div>
        <div class="callout callout-warning">
          <span class="callout-icon">⚠️</span>
          <div>
            <strong>Catatan Karakter Anabul:</strong> Selalu catat apakah anabul memiliki sifat galak, penakut, atau sensitif air agar groomer dapat mengantisipasi keselamatan kerja.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 6: PET HOTEL ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 6</div>
    <h2 class="chapter-title">Modul Penitipan Hewan (Pet Hotel)</h2>
    <p class="chapter-desc">
      Menghadirkan ketenangan bagi pemilik anabul dengan sistem manajemen 12 kamar kandang visual, checklist kondisi saat check-in, jurnal harian aktivitas, dan check-out otomatis.
    </p>
  </div>

  <!-- 6.1 Peta Kamar -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🏨 6.1 Peta Grid 12 Kamar & Status Okupansi</div>
      <span class="feature-route">/layanan/penitipan</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img08}" alt="Peta Kamar Pet Hotel" />
        </div>
        <div class="screenshot-caption">Gambar 6.1: Peta Visual Kamar Hotel (Standar, Premium, VIP) dengan Indikator Status Warna</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🏠 Tipe Kamar & Fasilitas Hotel</div>
          <ul>
            <li><strong>Standar (S-01 s/d S-06):</strong> Rp 60.000/malam. Kandang besi luas 70x60cm, matras empuk, sirkulasi ventilasi segar.</li>
            <li><strong>Premium (P-01 s/d P-04):</strong> Rp 90.000/malam. Kamar bertingkat 90x80cm, area main mini, update foto harian.</li>
            <li><strong>VIP Ber-AC (VIP-01 & VIP-02):</strong> Rp 130.000/malam. Kamar kaca privat ber-AC 24 jam, kasur ortopedi, CCTV monitoring.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🎨 Kode Warna Status Kamar</div>
          <ul>
            <li><span class="badge badge-emerald">Kosong / Tersedia</span>: Kamar bersih dan siap ditempati anabul baru.</li>
            <li><span class="badge badge-amber">Terisi</span>: Sedang dihuni oleh anabul (menampilkan nama anabul & tgl keluar).</li>
            <li><span class="badge badge-blue">Perlu Dibersihkan</span>: Anabul baru check-out, kandang perlu disterilkan/disinfektan.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 6.2 Check-in -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📝 6.2 Formulir Registrasi Check-in Penitipan</div>
      <span class="feature-route">/layanan/penitipan (Modal Check-in)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img08b}" alt="Form Check-in Pet Hotel" />
        </div>
        <div class="screenshot-caption">Gambar 6.2: Formulir Registrasi Masuk Anabul, Bawaan Pakan, dan Kontak Darurat</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📋 Checklist Wajib Check-in</div>
          <ul>
            <li><strong>Kontak Darurat Pemilik:</strong> Nomor telepon alternatif yang dapat dihubungi segera jika timbul kondisi medis darurat.</li>
            <li><strong>Pakan Bawaan & Porsi:</strong> Merk makanan khusus dan takaran porsi harian anabul.</li>
            <li><strong>Obat / Vitamin Khusus:</strong> Jadwal serta takaran obat jika anabul dalam masa terapi penyembuhan.</li>
            <li><strong>Layanan Mandi Kepulangan:</strong> Opsi booking mandi sehat saat hari check-out agar anabul pulang dalam kondisi segar.</li>
          </ul>
        </div>
        <div class="callout callout-tip">
          <span class="callout-icon">⭐</span>
          <div>
            <strong>Pemeriksaan Fisik Masuk:</strong> Pastikan petugas memeriksa ada/tidaknya kutu, jamur, atau luka luar saat anabul pertama kali diserahkan.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 6.3 Detail Kandang & Jurnal -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🔍 6.3 Detail Penghuni & Log Aktivitas Harian</div>
      <span class="feature-route">/layanan/penitipan (Panel Detail)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img09}" alt="Detail Penghuni dan Jurnal Harian" />
        </div>
        <div class="screenshot-caption">Gambar 6.3: Layar Detail Anabul Menginap Beserta Linimasa Jurnal Perawatan & Tombol Kirim WA</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📖 Jurnal Harian Aktivitas (Daily Log)</div>
          <p style="font-size:8pt; color:#475569; margin-bottom:6px;">
            Setiap petugas shift mencatat perkembangan anabul secara berkala:
          </p>
          <ul>
            <li><strong>Pola Makan & Minum:</strong> Porsi pakan habis atau terdapat penurunan nafsu makan.</li>
            <li><strong>Aktivitas Bermain:</strong> Durasi jalan-jalan santai di area bermain.</li>
            <li><strong>Kondisi Pencernaan:</strong> Tekstur kotoran (normal padat atau lembek).</li>
            <li><strong>Pemberian Obat:</strong> Waktu pemberian vitamin atau obat harian.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">📲 Update Laporan ke WhatsApp Pemilik</div>
          <p style="font-size:8pt; color:#334155;">
            Tombol <strong>"Kirim Laporan WA"</strong> memungkinkan staf mengirim rangkuman aktivitas harian langsung ke chat WhatsApp pemilik beserta foto anabul yang sedang ceria bermain.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 7: SISTEM BOOKING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 7</div>
    <h2 class="chapter-title">Sistem Booking & Kalender Perawatan</h2>
    <p class="chapter-desc">
      Menghindari bentrok jadwal salon dengan visualisasi kalender interaktif, filter per groomer, pengingat janji WhatsApp otomatis, dan formulir booking wizard terstruktur 4 langkah.
    </p>
  </div>

  <!-- 7.1 Kalender Booking -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📅 7.1 Kalender Jadwal Perawatan & Filter</div>
      <span class="feature-route">/booking</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img10}" alt="Kalender Booking Perawatan" />
        </div>
        <div class="screenshot-caption">Gambar 7.1: Kalender Jadwal Booking dengan Tampilan Bulan, Minggu, Hari & Tombol WhatsApp</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🎯 Fitur Manajemen Kalender</div>
          <ul>
            <li><strong>Mode Tampilan:</strong> Beralih fleksibel antara kalender bulanan, mingguan, harian, atau daftar tabel ringkas.</li>
            <li><strong>Filter Multi-Kriteria:</strong> Saring data berdasarkan status (Menunggu, Dikonfirmasi, Selesai) atau staf groomer yang bertugas.</li>
            <li><strong>Kirim Pengingat WA:</strong> Sekali klik membuka pesan WhatsApp otomatis berisi detail tanggal, jam, dan nama anabul.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">📲 Template Pesan WhatsApp Pengingat</div>
          <p style="font-size:7.5pt; background:#F1F5F9; padding:6px; border-radius:6px; font-family:monospace; color:#334155;">
            "Halo Kak [Nama]! Mengingatkan janji perawatan grooming untuk anabul kesayangan [Nama Anabul] di PawMart POS besok pada jam [Jam]. Mohon hadir 10 menit lebih awal. Terima kasih! 🐾"
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- 7.2 Stepper Booking Baru -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🪜 7.2 Wizard Stepper Booking 4 Langkah</div>
      <span class="feature-route">/booking/baru</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img11}" alt="Stepper Booking Baru" />
        </div>
        <div class="screenshot-caption">Gambar 7.2: Wizard Stepper Terpadu: Pelanggan → Layanan → Tanggal & Slot → Konfirmasi</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🪜 Tahapan Booking Wizard</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Langkah</th>
                <th>Tahapan</th>
                <th>Aktivitas & Validasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Langkah 1</strong></td>
                <td>Pelanggan & Anabul</td>
                <td>Pilih pelanggan atau daftar baru. Pilih profil anabul untuk membaca jenis dan bobot badannya.</td>
              </tr>
              <tr>
                <td><strong>Langkah 2</strong></td>
                <td>Layanan & Add-on</td>
                <td>Pilih paket jasa. Sistem menerapkan tarif otomatis sesuai ukuran anabul (Kecil/Sedang/Besar).</td>
              </tr>
              <tr>
                <td><strong>Langkah 3</strong></td>
                <td>Tanggal, Staf & Slot</td>
                <td>Pilih jadwal dan groomer. Dilengkapi <em>Conflict Detection</em> jika jam tersebut sudah terisi.</td>
              </tr>
              <tr>
                <td><strong>Langkah 4</strong></td>
                <td>Konfirmasi & Simpan</td>
                <td>Tinjau total estimasi biaya dan simpan reservasi untuk menerbitkan bukti tanda terima.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="callout callout-info">
          <span class="callout-icon">💡</span>
          <div>
            <strong>Anti Double-Booking:</strong> Sistem otomatis menonaktifkan jam yang telah dipesan untuk groomer yang sama guna mencegah antrean bertumpuk.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 8: PROGRAM LOYALITAS ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 8</div>
    <h2 class="chapter-title">Program Loyalitas Member & Voucher Diskon</h2>
    <p class="chapter-desc">
      Tingkatkan retensi pelanggan dengan sistem tingkatan member (Tier Bronze, Silver, Gold), kartu member digital ber-QR code, akumulasi perolehan poin transaksi, serta katalog kupon promo.
    </p>
  </div>

  <!-- 8.1 Ringkasan Loyalitas -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">👑 8.1 Ringkasan Loyalitas & Kartu Member Digital</div>
      <span class="feature-route">/loyalitas</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img12}" alt="Dashboard Program Loyalitas" />
        </div>
        <div class="screenshot-caption">Gambar 8.1: Ringkasan Program Loyalitas, Aturan Poin & Tampilan Kartu Member Digital</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">💳 Tingkatan Member (Tier Level)</div>
          <ul>
            <li><strong>Bronze (Dasar):</strong> Pelanggan baru (0 - 50 Poin). Mendapatkan akses promo reguler.</li>
            <li><strong>Silver (Menengah):</strong> Belanja &gt; Rp 500.000 (51 - 150 Poin). Diskon khusus produk pakan 2.5%.</li>
            <li><strong>Gold (VIP):</strong> Pelanggan setia &gt; Rp 1.500.000 (&gt; 150 Poin). Antrean prioritas & diskon grooming 5%.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">⚙️ Konfigurasi Perolehan Poin</div>
          <ul>
            <li><strong>Rasio Belanja:</strong> Setiap pembelanjaan Rp 10.000 mendapatkan 1 Poin reward.</li>
            <li><strong>Nilai Tukar Poin:</strong> 1 Poin bernilai potongan harga Rp 1.000 di kasir POS.</li>
            <li><strong>Masa Berlaku:</strong> Poin dapat diatur aktif selamanya atau hangus per tahun.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 8.2 Manajemen Member -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">👥 8.2 Manajemen Member & Penyesuaian Saldo Poin</div>
      <span class="feature-route">/loyalitas/member</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img13}" alt="Manajemen Member Loyalitas" />
        </div>
        <div class="screenshot-caption">Gambar 8.2: Daftar Member Aktif, Tingkatan Tier, dan Riwayat Saldo Mutasi Poin</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🔧 Fitur Mutasi Poin Manual (Akses Owner)</div>
          <p style="font-size:8pt; color:#475569;">
            Owner dapat menambah atau mengurangi saldo poin member secara manual untuk keperluan reward ulang tahun, kompensasi kendala layanan, atau penyesuaian khusus.
          </p>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🔍 Identifikasi Member Cepat</div>
          <p style="font-size:8pt; color:#475569;">
            Kasir dapat memindai barcode kartu digital member di ponsel pelanggan atau mencari dengan mengetik nomor WhatsApp pemilik.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- 8.3 Voucher Diskon -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🎟️ 8.3 Manajemen Voucher Diskon & Tukar Poin</div>
      <span class="feature-route">/loyalitas/voucher</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img14}" alt="Manajemen Voucher Diskon" />
        </div>
        <div class="screenshot-caption">Gambar 8.3: Tiket Voucher Promo Bergaya Kupon Diskon dan Katalog Penukaran Hadiah Poin</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🎁 Mekanisme Kupon Promo & Hadiah Poin</div>
          <ul>
            <li><strong>Kupon Promo Toko:</strong> Buat kode kupon diskon persentase atau potongan nominal dengan batas minimal belanja.</li>
            <li><strong>Katalog Tukar Poin:</strong> Pelanggan dapat menukarkan saldo poin dengan voucher diskon eksklusif (misal: 20 poin = voucher Rp 25.000).</li>
            <li><strong>Validasi Kasir:</strong> Voucher yang valid otomatis mengurangi total tagihan pada keranjang belanja POS.</li>
          </ul>
        </div>
        <div class="callout callout-tip">
          <span class="callout-icon">💡</span>
          <div>
            <strong>Retensi Pelanggan:</strong> Gunakan voucher berkala untuk mengundang pemilik anabul kembali melakukan perawatan grooming rutin tiap bulan.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 9: PELANGGAN ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 9</div>
    <h2 class="chapter-title">Manajemen Data Pelanggan & Rekam Medis Anabul</h2>
    <p class="chapter-desc">
      Pusat database relasional yang menghubungkan profil pemilik dengan seluruh hewan peliharaannya (Multi-anabul), mencakup rekam alergi, riwayat perawatan, dan histori transaksi belanja.
    </p>
  </div>

  <!-- 9.1 Direktori Pelanggan -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🐶 9.1 Direktori Pelanggan & Anabul</div>
      <span class="feature-route">/pelanggan</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img15}" alt="Daftar Pelanggan" />
        </div>
        <div class="screenshot-caption">Gambar 9.1: Tabel Direktori Pelanggan Terdaftar dengan Ringkasan Jumlah Anabul & Saldo Poin</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📋 Fitur Direktori Pelanggan</div>
          <ul>
            <li><strong>Relasi Multi-Anabul:</strong> Satu akun pemilik dapat memiliki banyak anabul (kucing, anjing, kelinci) dengan profil bobot dan riwayat masing-masing.</li>
            <li><strong>Pencarian Cepat:</strong> Temukan pelanggan seketika dengan mengetik nama, nomor telepon WhatsApp, atau nama anabul.</li>
            <li><strong>Indikator Loyalitas:</strong> Melihat total transaksi seumur hidup, tier status member, dan saldo poin yang masih tersimpan.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 9.2 Modal Detail Profil 4 Sub-Tab -->
  <div class="page-break"></div>
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📑 9.2 Modal Detail Profil Pelanggan 4 Sub-Tab</div>
      <span class="feature-route">/pelanggan (Modal Detail Profil)</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img15b}" alt="Detail Profil Pelanggan Sub-Tab" />
        </div>
        <div class="screenshot-caption">Gambar 9.2: Modal Profil Lengkap dengan Tab Anabul, Layanan, Booking & Loyalitas</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📑 4 Sub-Tab Informasi Lengkap Pelanggan</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Sub-Tab</th>
                <th>Informasi yang Ditampilkan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Daftar Anabul</strong></td>
                <td>Profil seluruh anabul, ras, berat badan, ukuran fisik, dan riwayat alergi.</td>
              </tr>
              <tr>
                <td><strong>2. Riwayat Layanan</strong></td>
                <td>Histori perawatan grooming terdahulu, nama groomer, dan catatan hasil mandi.</td>
              </tr>
              <tr>
                <td><strong>3. Booking Mendatang</strong></td>
                <td>Jadwal reservasi mendatang salon dan kamar hotel anabul.</td>
              </tr>
              <tr>
                <td><strong>4. Loyalitas & Voucher</strong></td>
                <td>Status tier, saldo poin aktif, riwayat transaksi poin, dan voucher yang dimiliki.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 10: LAPORAN ANALITIK ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 10</div>
    <h2 class="chapter-title">Laporan Analitik Bisnis & Keuangan</h2>
    <p class="chapter-desc">
      Menyediakan visibilitas menyeluruh bagi pemilik toko untuk memantau laba kotor, arus kas harian/bulanan, kontribusi omzet layanan jasa, tingkat okupansi hotel, serta produktivitas staf salon.
    </p>
  </div>

  <!-- 10.1 Laporan Terpadu -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📈 10.1 Laporan Terintegrasi Penjualan & Layanan</div>
      <span class="feature-route">/laporan</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img16}" alt="Laporan Bisnis Terpadu" />
        </div>
        <div class="screenshot-caption">Gambar 10.1: Modul Laporan dengan Tab Penjualan, Pendapatan Layanan, Okupansi Hotel & Staf</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📊 5 Tab Analitik Bisnis Terpadu</div>
          <ul>
            <li><strong>Penjualan Produk:</strong> Total omzet penjualan barang, margin keuntungan kotor, dan produk terlaris (Best Seller).</li>
            <li><strong>Pendapatan Layanan:</strong> Kontribusi omzet dari Mandi, Grooming Lengkap, Cukur Model, dan Add-on.</li>
            <li><strong>Okupansi Hotel:</strong> Tingkat keterisian kamar hotel per tipe (Standar/Premium/VIP) dan rata-rata durasi menginap.</li>
            <li><strong>Performa Groomer:</strong> Jumlah hewan yang ditangani per staf untuk dasar perhitungan bonus dan komisi.</li>
            <li><strong>Utilisasi Voucher:</strong> Total diskon yang diklaim untuk mengevaluasi efisiensi promosi.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">📥 Opsi Ekspor & Shift Kasir</div>
          <ul>
            <li><strong>Rentang Tanggal:</strong> Saring data Hari Ini, 7 Hari Terakhir, Bulan Ini, atau Kustom.</li>
            <li><strong>Ekspor Dokumen:</strong> Download laporan ke file Excel (.xlsx) atau cetak ringkasan shift kasir via printer thermal.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 11: PENGATURAN ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">Bab 11</div>
    <h2 class="chapter-title">Pengaturan & Konfigurasi Sistem</h2>
    <p class="chapter-desc">
      Sentralisasi pengaturan sistem mulai dari profil toko, konfigurasi printer struk kasir thermal, tarif jasa grooming, jam operasional slot booking, template WhatsApp, hingga rasio poin loyalitas.
    </p>
  </div>

  <!-- 11.1 Panel Konfigurasi -->
  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">⚙️ 11.1 Panel Konfigurasi PawMart POS</div>
      <span class="feature-route">/pengaturan</span>
    </div>
    <div class="feature-split-layout">
      <!-- KIRI: GAMBAR -->
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img17}" alt="Pengaturan Toko dan Sistem" />
        </div>
        <div class="screenshot-caption">Gambar 11.1: Pengaturan Profil Toko, Tarif Jasa, Slot Antrean, Notifikasi WA & Poin Member</div>
      </div>
      <!-- KANAN: PENJELASAN -->
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🏪 Konfigurasi Profil & Perangkat Keras</div>
          <ul>
            <li><strong>Profil Toko:</strong> Nama toko, alamat lengkap, kontak WhatsApp, dan pesan ucapan footer struk kasir.</li>
            <li><strong>Printer & Struk:</strong> Pilihan lebar kertas printer thermal (58mm atau 80mm) dan fitur auto-cutter.</li>
            <li><strong>Tarif Layanan:</strong> Penyesuaian tarif jasa grooming berdasar ukuran anabul.</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">📱 Slot Booking & Notifikasi WhatsApp</div>
          <ul>
            <li><strong>Jam Operasional & Slot:</strong> Pengaturan interval waktu booking dan batas kapasitas harian.</li>
            <li><strong>Template WhatsApp:</strong> Personalisasi format kalimat pengingat booking dan update jurnal hotel harian.</li>
            <li><strong>Aturan Loyalitas:</strong> Rasio perolehan poin dan ambang batas tingkatan tier member.</li>
          </ul>
        </div>
        <div class="callout callout-info">
          <span class="callout-icon">🔒</span>
          <div>
            <strong>Proteksi Otorisasi:</strong> Halaman pengaturan hanya dapat diakses oleh peran <strong>Owner</strong> demi menjaga kerahasiaan tarif dan konfigurasi operasional toko.
          </div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  const htmlPath = path.join(__dirname, '..', 'Manual book', 'manual-preview.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`Saved HTML document to ${htmlPath}`);

  console.log('Launching Chrome to render PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log(`Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Generating PDF at A4 portrait...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 8pt; font-family: 'Plus Jakarta Sans', sans-serif; color: #94A3B8; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm;">
        <span>PawMart POS - Buku Panduan Pengguna v2.0</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '14mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log(`PDF successfully generated at: ${OUTPUT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
