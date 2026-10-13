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
  console.log('Generating comprehensive HTML content for PawMart POS Manual Book...');

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

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Pengguna PawMart POS v2.5</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
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
      font-size: 9pt;
      line-height: 1.48;
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
      padding: 38px 24px;
      border: 2px solid #FED7AA;
      border-radius: 24px;
      background: linear-gradient(145deg, #FFF7ED 0%, #FFFFFF 48%, #FEF3C7 100%);
      box-shadow: inset 0 0 80px rgba(249, 115, 22, 0.05);
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo {
      width: 66px;
      height: 66px;
      background: linear-gradient(135deg, #F97316, #EA580C);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
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
      margin-top: 36px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #FFEDD5;
      color: #C2410C;
      font-weight: 700;
      font-size: 8.5pt;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      border: 1px solid #FDBA74;
    }

    .cover-title {
      font-size: 27pt;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.22;
      margin-bottom: 14px;
    }

    .cover-subtitle {
      font-size: 11pt;
      color: #475569;
      font-weight: 500;
      line-height: 1.55;
      max-width: 95%;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 32px;
    }

    .cover-pill {
      background: white;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .cover-pill-title {
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #64748B;
      font-weight: 700;
      margin-bottom: 3px;
    }

    .cover-pill-value {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1E293B;
    }

    .cover-footer {
      border-top: 1px solid #CBD5E1;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #64748B;
      font-weight: 500;
    }

    /* Section & Chapter */
    .section-title {
      font-size: 17pt;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6.5px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 9.5pt;
    }

    .toc-item-title {
      font-weight: 700;
      color: #1E293B;
    }

    .toc-item-sub {
      color: #64748B;
      font-size: 8pt;
      margin-left: 18px;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #94A3B8;
      margin: 0 10px;
      height: 1px;
    }

    .toc-page {
      font-weight: 700;
      color: #EA580C;
    }

    .chapter-header {
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #FED7AA;
    }

    .chapter-tag {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #EA580C;
      margin-bottom: 2px;
    }

    .chapter-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.25;
    }

    .chapter-desc {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 3px;
      line-height: 1.45;
    }

    /* Feature Block */
    .feature-card {
      margin-bottom: 16px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #F1F5F9;
    }

    .feature-name {
      font-size: 11pt;
      font-weight: 700;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feature-route {
      font-family: monospace;
      font-size: 7.5pt;
      background: #F1F5F9;
      color: #475569;
      padding: 2px 7px;
      border-radius: 5px;
      font-weight: 600;
    }

    /* Split Feature Layout: Gambar Kiri, Penjelasan Kanan */
    .feature-split-layout {
      display: grid;
      grid-template-columns: 46% 54%;
      gap: 12px;
      align-items: start;
    }

    .feature-left-col {
      display: flex;
      flex-direction: column;
    }

    .feature-left-col .screenshot-frame {
      border: 1px solid #CBD5E1;
      border-radius: 9px;
      overflow: hidden;
      margin-bottom: 5px;
      background: #0F172A;
      box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.08);
    }

    .feature-left-col .screenshot-frame img {
      width: 100%;
      height: auto;
      display: block;
    }

    .feature-left-col .screenshot-caption {
      font-size: 7pt;
      color: #64748B;
      font-style: italic;
      text-align: center;
      line-height: 1.3;
    }

    .feature-right-col {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .guide-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 9px;
      padding: 9px 11px;
    }

    .guide-box-title {
      font-size: 8pt;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .guide-box ul, .guide-box ol {
      padding-left: 15px;
      font-size: 7.8pt;
      color: #334155;
      line-height: 1.42;
    }

    .guide-box li {
      margin-bottom: 3.5px;
    }

    .guide-box li strong {
      color: #0F172A;
    }

    /* Callout Alert */
    .callout {
      border-radius: 8px;
      padding: 7px 10px;
      font-size: 7.8pt;
      display: flex;
      gap: 7px;
      align-items: flex-start;
      line-height: 1.38;
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

    .callout-danger {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #991B1B;
    }

    .callout-icon {
      font-size: 10pt;
      line-height: 1;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 6.8pt;
      font-weight: 700;
      border-radius: 4px;
    }
    .badge-amber { background: #FEF3C7; color: #B45309; }
    .badge-emerald { background: #D1FAE5; color: #047857; }
    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-purple { background: #F3E8FF; color: #6B21A8; }
    .badge-red { background: #FEE2E2; color: #B91C1C; }

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
      padding: 5px 7px;
      border: 1px solid #CBD5E1;
    }

    .custom-table td {
      padding: 5px 7px;
      border: 1px solid #CBD5E1;
      color: #1E293B;
    }

    .custom-table tr:nth-child(even) td {
      background: #F8FAFC;
    }

    /* Tech Stack Cards */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .tech-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
    }

    .tech-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .tech-card-title {
      font-size: 9pt;
      font-weight: 800;
      color: #0F172A;
    }

    .tech-badge {
      font-size: 6.8pt;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      background: #E2E8F0;
      color: #475569;
    }

    .code-snippet {
      font-family: 'Consolas', monospace;
      font-size: 7.2pt;
      background: #0F172A;
      color: #E2E8F0;
      padding: 7px 10px;
      border-radius: 7px;
      line-height: 1.4;
      overflow-x: auto;
      margin: 4px 0;
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
        <p>Sistem Kasir Pintar & Manajemen Pet Shop Terintegrasi</p>
      </div>
    </div>

    <div class="cover-hero">
      <span class="cover-badge">Buku Panduan Operasional & Teknis Resmi (Manual Book v2.5)</span>
      <h2 class="cover-title">Buku Panduan Pengguna &amp; Konfigurasi Sistem</h2>
      <p class="cover-subtitle">
        Dokumentasi komprehensif sistem POS PawMart mencakup arsitektur teknologi (Next.js 16 Turbopack, React 19, Supabase RLS), sistem hak akses akun (Fixed RBAC), alur sesi buka/tutup shift kasir, kasir POS &amp; direct thermal ESC/POS printing (58mm/80mm), layanan pet care/hotel, hingga petunjuk konfigurasi perangkat keras hardware toko ritel.
      </p>

      <div class="cover-grid">
        <div class="cover-pill">
          <div class="cover-pill-title">Versi Rilis</div>
          <div class="cover-pill-value">v2.5 (Enterprise POS)</div>
        </div>
        <div class="cover-pill">
          <div class="cover-pill-title">Hak Akses Peran</div>
          <div class="cover-pill-value">👑 Owner • 👩‍💼 Kasir • ✂️ Groomer</div>
        </div>
        <div class="cover-pill">
          <div class="cover-pill-title">Sistem Printing</div>
          <div class="cover-pill-value">Direct ESC/POS &amp; Print Bridge</div>
        </div>
        <div class="cover-pill">
          <div class="cover-pill-title">Lebar Kertas</div>
          <div class="cover-pill-value">58mm (32 col) &amp; 80mm (48 col)</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>© 2026 PawMart Pet Shop &amp; Care System. Hak Cipta Dilindungi Undang-Undang.</div>
      <div>Dokumen Resmi: Manual book / fitur.pdf</div>
    </div>
  </div>

  <!-- ==================== DAFTAR ISI ==================== -->
  <div class="page-break"></div>
  <div class="toc-container">
    <div class="section-title">📑 Daftar Isi Buku Panduan</div>
    
    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 1: Arsitektur Teknologi &amp; Spesifikasi Tech Stack</div>
        <div class="toc-item-sub">Next.js 16 Turbopack, React 19, TypeScript, Supabase RLS, Local Print Bridge ESC/POS</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 3</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 2: Autentikasi &amp; Sistem Hak Akses Akun (Fixed RBAC)</div>
        <div class="toc-item-sub">Login Terikat Akun, Wewenang Owner, Wewenang Kasir &amp; Ketentuan Diskon Rp 1.000, Wewenang Groomer</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 4</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 3: Sesi Shift Kasir &amp; Manajemen Kas Laci (Shift Management)</div>
        <div class="toc-item-sub">Buka Shift (Starting Float), Pelacakan Transaksi Tunai, Tutup Shift &amp; Rekonsiliasi Selisih Fisik Laci</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 5</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 4: Dashboard Utama &amp; Metrik Operasional POS</div>
        <div class="toc-item-sub">Metrik Penjualan Hari Ini, Widget Booking Grooming, Status Okupansi Kamar Pet Hotel</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 6</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 5: Kasir POS, Pembayaran &amp; Transaksi Penjualan</div>
        <div class="toc-item-sub">Katalog Cepat, Barcode, Tahan (Hold) &amp; Pulihkan Transaksi, Diskon (Rp/%), Voucher Promo &amp; Poin</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 7</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 6: Sistem Cetak Struk Thermal (Direct ESC/POS Printing)</div>
        <div class="toc-item-sub">Pemisahan Thermal vs PDF, Tanpa Browser Popup, Loading State, Error Fallback &amp; Fitur Auto Print</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 9</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 7: Panduan Konfigurasi Perangkat Keras POS (Hardware Setup)</div>
        <div class="toc-item-sub">Menjalankan Local Print Bridge (Port 18080), Setup Printer 58mm/80mm, Test Print, Scanner &amp; Cash Drawer</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 11</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 8: Manajemen Produk &amp; Kontrol Stok Inventori</div>
        <div class="toc-item-sub">Katalog SKU, Harga Beli vs Jual, Alert Stok Menipis, Pelacakan Batch Kedaluwarsa &amp; Penyesuaian Stok</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 13</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 9: Layanan Jasa Grooming &amp; Papan Antrean Kanban</div>
        <div class="toc-item-sub">Katalog Tarif Berjenjang Ukuran Anabul, Papan Pengerjaan Real-time, Form Intake &amp; Cetak Tiket Antrean</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 15</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 10: Penitipan Hewan (Pet Hotel &amp; Boarding)</div>
        <div class="toc-item-sub">Peta Grid 12 Kamar (Kucing &amp; Anjing), SOP Check-in, Jurnal Harian Aktivitas, Log Makan &amp; Kirim Update WhatsApp</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 18</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 11: Sistem Booking &amp; Kalender Perawatan Anabul</div>
        <div class="toc-item-sub">Tampilan Jadwal Booking, Reservasi 4 Langkah, Notifikasi Pengingat WhatsApp Otomatis (H-1 &amp; H-3 Jam)</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 21</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 12: Program Loyalitas Member &amp; Kupon Promosi</div>
        <div class="toc-item-sub">Tiering (Silver, Gold, Platinum), Akumulasi Poin Belanja, Penukaran di Kasir &amp; Manajemen Voucher</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 23</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 13: Database Pelanggan &amp; Rekam Medis Anabul</div>
        <div class="toc-item-sub">Database Relasional Pemilik &amp; Multi-Anabul, Histori Transaksi Belanja, Riwayat Vaksin &amp; Catatan Khusus</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 26</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 14: Laporan Keuangan, Analitik Bisnis &amp; Pengaturan Toko</div>
        <div class="toc-item-sub">Omzet POS, Profit Margin, Metode Pembayaran, Profil Toko, Pajak PPN 11% &amp; Konfigurasi Printer</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 28</div>
    </div>

    <div class="toc-item">
      <div>
        <div class="toc-item-title">Bab 15: Panduan Pemecahan Masalah (Troubleshooting &amp; FAQ)</div>
        <div class="toc-item-sub">Diagnostik Printer Offline, Rekonsiliasi Selisih Shift, Scanner Barcode &amp; Panduan Darurat Kasir</div>
      </div>
      <div class="toc-dots"></div>
      <div class="toc-page">Hal 30</div>
    </div>
  </div>

  <!-- ==================== BAB 1: TECH STACK ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 1: ARSITEKTUR TEKNOLOGI</div>
    <div class="chapter-title">Spesifikasi Tech Stack &amp; Arsitektur Sistem PawMart POS</div>
    <div class="chapter-desc">
      PawMart POS dirancang menggunakan fondasi teknologi web modern berkinerja tinggi, menjamin kecepatan transaksi kasir instan, stabilitas data terdistribusi, serta integrasi perangkat keras printer thermal direct bridge.
    </div>
  </div>

  <div class="tech-grid">
    <div class="tech-card">
      <div class="tech-card-header">
        <span style="font-size: 16px;">⚡</span>
        <div>
          <div class="tech-card-title">Next.js 16.4.0 (Turbopack)</div>
          <span class="tech-badge">Framework &amp; Engine</span>
        </div>
      </div>
      <ul style="font-size: 7.6pt; color: #475569; padding-left: 14px; line-height: 1.4;">
        <li><strong>App Router Architecture:</strong> Routing berbasis folder server &amp; client components dengan Partial Prefetching.</li>
        <li><strong>Turbopack Bundler:</strong> Waktu kompilasi super cepat (&lt;1 detik HMR) untuk pengalaman kasir tanpa lag.</li>
        <li><strong>Instant Navigation:</strong> Transisi antar menu POS tanpa reload layar penuh (Zero Flicker).</li>
      </ul>
    </div>

    <div class="tech-card">
      <div class="tech-card-header">
        <span style="font-size: 16px;">⚛️</span>
        <div>
          <div class="tech-card-title">React 19.3 &amp; TypeScript 5.0</div>
          <span class="tech-badge">UI Library &amp; Type Safety</span>
        </div>
      </div>
      <ul style="font-size: 7.6pt; color: #475569; padding-left: 14px; line-height: 1.4;">
        <li><strong>React 19 Hooks:</strong> Pemanfaatan state reaktif modern untuk penghitungan keranjang, diskon, &amp; modal kasir.</li>
        <li><strong>Strict TypeScript:</strong> Jaminan integritas tipe data transaksi, produk, inventori, dan payload ESC/POS.</li>
        <li><strong>Tailwind CSS v4:</strong> Desain antarmuka responsif ramah sentuhan (Touch-Friendly POS) dengan palet oranye hangat.</li>
      </ul>
    </div>

    <div class="tech-card">
      <div class="tech-card-header">
        <span style="font-size: 16px;">🖨️</span>
        <div>
          <div class="tech-card-title">Direct Thermal ESC/POS Bridge</div>
          <span class="tech-badge">Hardware Integration</span>
        </div>
      </div>
      <ul style="font-size: 7.6pt; color: #475569; padding-left: 14px; line-height: 1.4;">
        <li><strong>Local Print Bridge (Port 18080):</strong> Microservice Node.js perantara HTTP ke port USB printer tanpa membuka browser print dialog.</li>
        <li><strong>Dual Paper Formatter:</strong> Generator teks ESC/POS khusus kertas 58mm (32 kolom) dan 80mm (48 kolom).</li>
        <li><strong>Fail-Safe Fallback:</strong> Tetap mendukung browser print dialog (PDF/A4) jika printer thermal sedang offline.</li>
      </ul>
    </div>

    <div class="tech-card">
      <div class="tech-card-header">
        <span style="font-size: 16px;">🛡️</span>
        <div>
          <div class="tech-card-title">Supabase PostgreSQL &amp; RLS</div>
          <span class="tech-badge">Database &amp; Security Layer</span>
        </div>
      </div>
      <ul style="font-size: 7.6pt; color: #475569; padding-left: 14px; line-height: 1.4;">
        <li><strong>Row Level Security (RLS):</strong> Proteksi multi-tier level baris data dengan patch keamanan fail-safe (Security Round 1 &amp; 2).</li>
        <li><strong>Fixed Role Verification:</strong> Otentikasi fungsi database <code>get_my_role()</code> dengan validasi eksplisit role non-null.</li>
        <li><strong>Database Triggers:</strong> Otomasi pemotongan stok barang, mutasi stok fisik, dan log histori transaksi.</li>
      </ul>
    </div>
  </div>

  <div class="guide-box avoid-break" style="margin-top: 10px;">
    <div class="guide-box-title">💻 Spesifikasi Minimum Kebutuhan Perangkat Keras (Hardware Requirements)</div>
    <table class="custom-table">
      <thead>
        <tr>
          <th>Komponen</th>
          <th>Spesifikasi Minimum</th>
          <th>Rekomendasi Toko PawMart</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Komputer Kasir / Terminal</strong></td>
          <td>Intel Celeron / Core i3, RAM 4 GB, Layar 1366x768</td>
          <td>Intel Core i5 / AMD Ryzen 5, RAM 8 GB, Layar Sentuh Touchscreen 15.6" Full HD</td>
        </tr>
        <tr>
          <td><strong>Sistem Operasi &amp; Browser</strong></td>
          <td>Windows 10 64-bit, Google Chrome v120+ / Edge</td>
          <td>Windows 11 Pro 64-bit, Google Chrome terbaru dengan Node.js runtime untuk print bridge</td>
        </tr>
        <tr>
          <td><strong>Printer Thermal POS</strong></td>
          <td>Printer 58mm USB / Bluetooth ESC/POS kompatibel</td>
          <td>Printer Thermal 80mm Auto-Cutter (USB + LAN Ethernet) seperti Epson TM-T82 / Xprinter XP-80C</td>
        </tr>
        <tr>
          <td><strong>Barcode Scanner</strong></td>
          <td>1D Laser Barcode Scanner USB Plug-and-Play</td>
          <td>2D Omnidirectional Barcode &amp; QR Code Scanner (Dapat membaca layar HP pelanggan)</td>
        </tr>
        <tr>
          <td><strong>Cash Drawer (Laci Uang)</strong></td>
          <td>Laci uang manual dengan kunci fisik</td>
          <td>Laci uang otomatis RJ-11 terhubung ke printer thermal (Otomatis membuka saat transaksi tunai selesai)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== BAB 2: RBAC ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 2: HAK AKSES PERAN (RBAC)</div>
    <div class="chapter-title">Autentikasi Akun &amp; Sistem Fixed Role-Based Access Control</div>
    <div class="chapter-desc">
      Sistem otorisasi PawMart POS menggunakan prinsip <em>Fixed RBAC</em> (Role melekat pada akun yang login). Pengguna tidak dapat berpindah role secara sembarangan dari navigasi aplikasi. Hak wewenang dikunci demi keamanan uang dan data toko.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">🔐 Halaman Masuk Akun (Login Berbasis Akun Staf)</div>
      <span class="feature-route">/login</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img00}" alt="Halaman Login Akun PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 2.1: Tampilan login akun staf toko PawMart POS</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">👤 Akun Staf Toko &amp; Hak Akses:</div>
          <ul>
            <li><strong>👑 Owner (Admin Toko - Budi):</strong> Memiliki wewenang penuh tanpa batas di seluruh modul. Berwenang mengatur harga satuan item, memberikan diskon bebas (Rp / %), mengelola staf, dan melihat laporan keuangan toko.</li>
            <li><strong>👩‍💼 Kasir (Karyawan - Maya):</strong> Dikhususkan untuk operasional transaksi POS. Wajib membuka shift sebelum melayani transaksi. Memiliki batasan wewenang diskon (Maksimal Rp 1.000 jika pelanggan meminta diskon).</li>
            <li><strong>✂️ Groomer (Staff Perawatan - Rifki):</strong> Dikhususkan untuk antrean grooming, daftar layanan jasa anabul, dan kontrol kamar pet hotel. Tidak dapat mengakses kasir dan laporan keuangan.</li>
          </ul>
        </div>
        <div class="callout callout-warning">
          <span class="callout-icon">⚠️</span>
          <div>
            <strong>Keamanan Otorisasi:</strong> Tombol switcher role manual di topbar telah dinonaktifkan. Pengguna harus <strong>Keluar (Logout)</strong> dan login dengan akun terkait untuk berganti wewenang operasional.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="guide-box avoid-break">
    <div class="guide-box-title">📋 Matriks Perbandingan Hak Akses Menu &amp; Wewenang</div>
    <table class="custom-table">
      <thead>
        <tr>
          <th>Modul / Fitur Sistem</th>
          <th>👑 Owner (Admin)</th>
          <th>👩‍💼 Kasir (Karyawan)</th>
          <th>✂️ Groomer (Staff Care)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dashboard &amp; Metrik Omzet Toko</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-amber">Terbatas (Shift Saja)</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
        <tr>
          <td>Kasir POS &amp; Pembayaran</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
        <tr>
          <td>Wewenang Diskon Transaksi</td>
          <td><span class="badge badge-emerald">Bebas (Rp &amp; %)</span></td>
          <td><span class="badge badge-amber">Maksimal Rp 1.000</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
        <tr>
          <td>Ubah Harga Satuan di Keranjang</td>
          <td><span class="badge badge-emerald">Diizinkan</span></td>
          <td><span class="badge badge-red">Ditolak (Harga Tetap)</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
        <tr>
          <td>Sesi Shift (Buka &amp; Tutup Kasir)</td>
          <td><span class="badge badge-emerald">Monitoring Semua</span></td>
          <td><span class="badge badge-emerald">Wajib Sesi Shift Sendiri</span></td>
          <td><span class="badge badge-red">Tidak Diperlukan</span></td>
        </tr>
        <tr>
          <td>Layanan Grooming &amp; Antrean</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-blue">Lihat Saja</span></td>
          <td><span class="badge badge-emerald">Akses Penuh (Eksekutor)</span></td>
        </tr>
        <tr>
          <td>Penitipan Pet Hotel (Kamar)</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-blue">Lihat Saja</span></td>
          <td><span class="badge badge-emerald">Akses Penuh (Check-in/Log)</span></td>
        </tr>
        <tr>
          <td>Laporan Keuangan &amp; Laba Rugi</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
        <tr>
          <td>Pengaturan Toko, Pajak, Printer</td>
          <td><span class="badge badge-emerald">Akses Penuh</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
          <td><span class="badge badge-red">Ditolak</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== BAB 3: SHIFT MANAGEMENT ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 3: SESI SHIFT KASIR</div>
    <div class="chapter-title">Sesi Buka/Tutup Shift Kasir &amp; Rekonsiliasi Uang Kas Laci</div>
    <div class="chapter-desc">
      Fitur sesi shift menjamin setiap rupiah uang tunai di laci kasir dapat dipertanggungjawabkan saat pergantian kasir atau penutupan toko di akhir hari.
    </div>
  </div>

  <div class="guide-box avoid-break" style="margin-bottom: 12px;">
    <div class="guide-box-title">🔄 Alur Kerja Siklus Shift Kasir (Shift Life Cycle)</div>
    <div style="font-size: 8pt; color: #334155; line-height: 1.45;">
      <strong>1. Masuk Shift Pagi/Siang:</strong> Kasir login ke PawMart POS → Muncul peringatan bahwa shift belum dibuka → Klik <em>[Buka Shift Sekarang]</em> → Masukkan modal awal kas laci (misal Rp 500.000).<br>
      <strong>2. Masa Operasional Kasir:</strong> Banner shift hijau aktif muncul di atas katalog kasir menampilkan: Shift #, Modal Kas, Jumlah Transaksi, dan Estimasi Uang Kas Laci secara real-time.<br>
      <strong>3. Akhir Shift / Pergantian Karyawan:</strong> Kasir menghitung uang fisik di laci kasir → Klik <em>[Tutup Shift]</em> → Masukkan nominal uang fisik → Sistem menghitung selisih (Kurang / Lebih / Pas) → Cetak Rekap Shift.
    </div>
  </div>

  <div class="feature-split-layout avoid-break">
    <div class="guide-box">
      <div class="guide-box-title">💵 Tahap 1: Prosedur Buka Shift (Starting Float)</div>
      <ol>
        <li>Buka menu <strong>Kasir &amp; Transaksi POS</strong> (<code>/transaksi</code>).</li>
        <li>Jika belum membuka shift, katalog kasir menampilkan banner kuning: <em>"Shift Kasir Belum Dibuka"</em>.</li>
        <li>Klik tombol <strong>[Buka Shift Sekarang]</strong>.</li>
        <li>Modal Buka Shift muncul. Masukkan <strong>Modal Awal Uang Kas (Starting Float)</strong> yang ada di laci (contoh: <code>Rp 500.000</code>).</li>
        <li>Klik tombol <strong>[Buka Sesi Shift Kasir]</strong>. Status kasir kini resmi aktif dan siap menerima pembayaran pelanggan.</li>
      </ol>
      <div class="callout callout-tip" style="margin-top: 6px;">
        <span class="callout-icon">💡</span>
        <div>Uang modal awal kasir bertujuan untuk uang kembalian pecahan kecil pada transaksi pertama di pagi hari.</div>
      </div>
    </div>

    <div class="guide-box">
      <div class="guide-box-title">🔒 Tahap 2: Prosedur Tutup Shift &amp; Rekonsiliasi Kas</div>
      <ol>
        <li>Di akhir jam kerja kasir, klik tombol <strong>[Tutup Shift]</strong> pada banner shift aktif kasir.</li>
        <li>Sistem secara otomatis menampilkan <strong>Kas Seharusnya (Expected Cash)</strong> berdasarkan kalkulasi rumus:<br>
          <div class="code-snippet">Kas Seharusnya = Modal Awal + Total Penjualan Tunai</div>
        </li>
        <li>Hitung seluruh uang kertas dan koin fisik yang ada di laci kasir saat itu. Masukkan nominal ke field <strong>Jumlah Uang Fisik Aktual</strong>.</li>
        <li>Sistem mendeteksi selisih secara otomatis:
          <ul style="margin-top: 3px;">
            <li><strong>🟢 Sesuai / Pas (Rp 0):</strong> Kas fisik seimbang dengan catatan sistem.</li>
            <li><strong>🔴 Selisih Kurang (Minus):</strong> Uang fisik kurang dari sistem (indikasi salah kembalian).</li>
            <li><strong>🟡 Selisih Lebih (Plus):</strong> Uang fisik melebihi catatan sistem.</li>
          </ul>
        </li>
        <li>Klik <strong>[Konfirmasi &amp; Tutup Shift]</strong>. Sesi kasir selesai dan data tersimpan ke riwayat shift.</li>
      </ol>
    </div>
  </div>

  <!-- ==================== BAB 4: DASHBOARD ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 4: DASHBOARD UTAMA</div>
    <div class="chapter-title">Gambaran Umum &amp; Dashboard Operasional PawMart</div>
    <div class="chapter-desc">
      Pusat komando operasional harian toko yang merangkum kesehatan finansial, jadwal perawatan anabul hari ini, dan kapasitas kamar pet hotel dalam satu layar ringkas.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">📊 Dashboard Utama (Ringkasan Bisnis &amp; Operasional)</div>
      <span class="feature-route">/</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img01}" alt="Dashboard Operasional PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 4.1: Tampilan metrik KPI dan monitoring operasional toko</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📈 4 Kartu KPI Keuangan Utama:</div>
          <ul>
            <li><strong>Total Penjualan Hari Ini:</strong> Akumulasi nilai bruto seluruh transaksi POS kasir yang sukses dibayar hari ini.</li>
            <li><strong>Total Transaksi Selesai:</strong> Jumlah struk/antrean pelanggan yang berhasil diproses oleh seluruh kasir.</li>
            <li><strong>Estimasi Laba Kotor:</strong> Selisih antara harga jual produk/jasa dikurangi dengan harga pokok pembelian (HPP/Modal).</li>
            <li><strong>Rata-Rata Keranjang (Basket Size):</strong> Nilai belanja rata-rata per transaksi pelanggan (Membantu evaluasi up-selling toko).</li>
          </ul>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🐕 Widget Layanan Hari Ini:</div>
          <ul>
            <li><strong>Booking Hari Ini:</strong> Menampilkan anabul yang dijadwalkan grooming, nama pemilik, dan jam kedatangan.</li>
            <li><strong>Okupansi Kamar Hotel:</strong> Indikator kapasitas kamar pet hotel terisi vs kamar kosong yang siap dipesan.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 5: KASIR POS ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 5: KASIR &amp; TRANSAKSI</div>
    <div class="chapter-title">Operasional Kasir POS, Manajemen Keranjang &amp; Pembayaran</div>
    <div class="chapter-desc">
      Antarmuka kasir cepat dengan tata letak ganda (Katalog di Kiri &amp; Keranjang Belanja di Kanan). Dilengkapi pencarian barcode, penanganan transaksi tertahan, wewenang diskon multi-level, dan opsi multi-pembayaran.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">🛒 Antarmuka Kasir POS &amp; Keranjang Belanja</div>
      <span class="feature-route">/transaksi</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img02}" alt="Antarmuka Kasir POS PawMart">
        </div>
        <div class="screenshot-caption">Gambar 5.1: Layar transaksi kasir POS ganda (Katalog &amp; Keranjang)</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">⚡ Fitur Operasional Kasir Cepat:</div>
          <ul>
            <li><strong>Filter Kategori &amp; Barcode:</strong> Tombol tab kategori (Makanan, Aksesori, Perawatan, Obat) dan field input pencarian barcode scanner instan.</li>
            <li><strong>Pilih Pelanggan / Member:</strong> Cari nama pelanggan untuk mengaitkan transaksi dengan program loyalitas poin member.</li>
            <li><strong>Wewenang Diskon Owner vs Kasir:</strong>
              <br>• <em>👑 Mode Owner:</em> Berhak input nominal diskon <strong>Rp</strong> atau <strong>%</strong> bebas tanpa batas, serta dapat merubah harga satuan per item di keranjang.
              <br>• <em>👩‍💼 Mode Kasir:</em> Kasir memiliki tombol cepat <strong>[Terapkan Diskon Rp 1.000 (Minta Diskon)]</strong> jika pelanggan menawar/meminta diskon. Sistem membatasi kasir tidak dapat memasukkan diskon lebih dari Rp 1.000 tanpa izin Owner.
            </li>
            <li><strong>Tahan Transaksi (Hold Order):</strong> Klik <em>[Tahan (Hold)]</em> jika pelanggan ingin menambah belanjaan, kasir dapat melayani antrean berikutnya.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">💳 Modal Pembayaran Multi-Metode &amp; Kalkulator Kembalian</div>
      <span class="feature-route">Modal Pembayaran POS</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img03}" alt="Modal Pembayaran Kasir PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 5.2: Pilihan metode bayar dan tombol pecahan uang cepat</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">💵 Tata Cara Memproses Pembayaran:</div>
          <ol>
            <li>Klik tombol <strong>[Bayar Sekarang]</strong> pada keranjang belanja.</li>
            <li>Pilih <strong>Metode Pembayaran:</strong>
              <br>• <strong>Tunai (Cash):</strong> Masukkan uang yang diterima atau klik tombol cepat uang pas / pecahan Rp 50.000, Rp 100.000, Rp 150.000, Rp 200.000.
              <br>• <strong>QRIS (Statik/Dinamis):</strong> Scan barcode pembayaran QRIS toko.
              <br>• <strong>Transfer Bank / Kartu Debit:</strong> Pembayaran non-tunai via EDC/M-Banking.
            </li>
            <li>Sistem otomatis menghitung <strong>Kembalian Uang Tunai</strong> pelanggan secara akurat.</li>
            <li>Klik <strong>[Konfirmasi &amp; Selesaikan Pembayaran]</strong>. Transaksi otomatis tersimpan ke database dan modal struk muncul.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 6: THERMAL PRINTING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 6: SISTEM PRINTING THERMAL</div>
    <div class="chapter-title">Mekanisme Direct Thermal ESC/POS &amp; Cetak Struk POS</div>
    <div class="chapter-desc">
      Sistem pencetakan struk PawMart POS memisahkan secara tegas antara <strong>Cetak Struk Thermal (Direct ESC/POS)</strong> dan <strong>Cetak PDF/A4 (Browser Print)</strong>. Kasir tidak lagi terganggu oleh popup atau print preview browser.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">🧾 Modal Struk Pembayaran &amp; Direct Thermal Printing</div>
      <span class="feature-route">Modal Struk POS</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img03b}" alt="Modal Struk Pembayaran PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 6.1: Modal struk kasir dengan kontrol cetak thermal ESC/POS</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🖨️ Cara Kerja Tombol [Cetak Struk Thermal]:</div>
          <ol>
            <li>Saat kasir mengklik <strong>[Cetak Struk Thermal]</strong>, sistem <strong>TIDAK MEMANGGIL <code>window.print()</code></strong> dan tidak membuka popup browser.</li>
            <li>Tombol masuk ke state <strong>⏳ Mencetak...</strong> dan di-disable sementara untuk mencegah double-click kasir.</li>
            <li>Data transaksi dikonversi ke format string byte ESC/POS (mendukung lebar kertas 58mm atau 80mm).</li>
            <li>Payload dikirimkan via HTTP POST ke <strong>Local Print Bridge (http://localhost:18080/print)</strong>.</li>
            <li>Jika sukses, tombol berubah menjadi <strong>✓ Struk Tercetak</strong> dan muncul notifikasi toast hijau: <em>"Struk berhasil dikirim ke printer."</em></li>
          </ol>
        </div>
        <div class="guide-box">
          <div class="guide-box-title">🛡️ Penanganan Error &amp; Fallback Offline:</div>
          <ul>
            <li>Jika printer belum terhubung atau print bridge belum dijalankan, tombol berubah menjadi <strong>Cetak Gagal</strong>.</li>
            <li>Muncul kotak peringatan merah dengan opsi tombol <strong>[Coba Lagi]</strong> dan <strong>[Cetak PDF (Browser)]</strong>.</li>
            <li>Jika kasir memilih <em>[Cetak PDF (Browser)]</em>, barulah browser print dialog dibuka sebagai cadangan darurat.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="guide-box avoid-break">
    <div class="guide-box-title">📄 Struktur &amp; Anatomi Struk Thermal Resmi PawMart POS</div>
    <div class="feature-split-layout">
      <div>
        <div class="code-snippet" style="font-size: 6.8pt; line-height: 1.35;">
================================<br>
        PAWMART PET SHOP        <br>
Jl. Kemang Raya No. 42A, Jaksel <br>
       Telp: 021-7890123        <br>
================================<br>
No. Trx : TRX-0021              <br>
Waktu   : 14/10/2026, 14:30 WIB <br>
Kasir   : Maya Kasir            <br>
Customer: Pelanggan Umum        <br>
--------------------------------<br>
Royal Canin Maxi Adult 3kg      <br>
  1 x 385.000            385.000<br>
Whiskas Pouch Tuna 85g          <br>
  4 x 9.500               38.000<br>
--------------------------------<br>
Subtotal                 423.000<br>
Diskon                    -1.000<br>
TOTAL                    422.000<br>
--------------------------------<br>
Metode Bayar               Tunai<br>
Bayar                    450.000<br>
Kembalian                 28.000<br>
--------------------------------<br>
Poin Diperoleh          +42 Poin<br>
Program        PawMart Club Gold<br>
================================<br>
 TERIMA KASIH ATAS KUNJUNGANNYA <br>
Barang dapat ditukar maks 2 hari<br>
   dengan membawa struk ini.    <br>
   *** PAWMART SYSTEM POS ***   <br>
================================
        </div>
      </div>
      <div>
        <ul style="font-size: 7.8pt; color: #334155; line-height: 1.45;">
          <li><strong>Header Toko:</strong> Nama toko, alamat, dan nomor telepon resmi.</li>
          <li><strong>Identitas Transaksi:</strong> Nomor faktur TRX, tanggal/jam, nama kasir bertugas, dan nama member.</li>
          <li><strong>Item Belanja:</strong> Nama produk dengan word wrapping otomatis (tidak terpotong), jumlah x harga satuan, dan subtotal rata kanan.</li>
          <li><strong>Rangkuman Finansial:</strong> Subtotal kotor, potongan diskon kasir/owner/voucher, dan TOTAL bersih huruf tebal.</li>
          <li><strong>Rincian Bayar:</strong> Metode pembayaran, nominal uang diserahkan, dan nominal uang kembalian.</li>
          <li><strong>Poin Loyalitas:</strong> Poin reward yang didapat dari transaksi ini beserta tingkatan tier member.</li>
          <li><strong>Footer &amp; Garansi:</strong> Ucapan terima kasih dan ketentuan penukaran barang maksimal 2 hari.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 7: HARDWARE SETUP ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 7: KONFIGURASI PERANGKAT KERAS</div>
    <div class="chapter-title">Panduan Instalasi &amp; Konfigurasi Hardware Toko POS</div>
    <div class="chapter-desc">
      Langkah demi langkah menghubungkan printer thermal, barcode scanner, laci kasir otomatis, serta menjalankan background microservice Local Print Bridge.
    </div>
  </div>

  <div class="guide-box avoid-break" style="margin-bottom: 12px;">
    <div class="guide-box-title">🌉 Menjalankan Local Print Bridge (Node.js Service)</div>
    <p style="font-size: 8pt; color: #334155; margin-bottom: 6px;">
      Print Bridge adalah service perantara lokal yang meneruskan perintah cetak ESC/POS dari aplikasi browser PawMart langsung ke printer thermal fisik di port USB / Serial / LAN.
    </p>
    <div style="font-size: 8pt; color: #334155;">
      <strong>1. Perintah Menjalankan Print Bridge (Mode Siap / Normal):</strong>
      <div class="code-snippet">npm run print-bridge</div>
      Output di terminal:
      <div class="code-snippet">
🐾 PawMart Local Thermal Print Bridge Aktif!<br>
📡 URL Bridge: http://localhost:18080<br>
🔌 Status Printer: 🟢 READY / ONLINE
      </div>
      <strong>2. Perintah Uji Coba Mode Simulasi Offline:</strong>
      <div class="code-snippet">npm run print-bridge:offline</div>
      Bridge akan merespons status <code>503 Service Unavailable</code> untuk menguji penanganan error kasir saat printer mati atau kehabisan kertas.
    </div>
  </div>

  <div class="feature-split-layout avoid-break">
    <div class="guide-box">
      <div class="guide-box-title">🖨️ Konfigurasi Printer di Menu Pengaturan Toko</div>
      <ol>
        <li>Masuk dengan akun <strong>👑 Owner</strong> → Buka menu <strong>Pengaturan</strong> (<code>/pengaturan</code>) → Pilih tab <strong>Format Struk</strong>.</li>
        <li>Pada bagian <strong>Printer Struk</strong>:
          <ul style="margin-top: 3px;">
            <li>Pilih jenis printer: <strong>[Printer Thermal (Direct POS)]</strong>.</li>
            <li>Pilih ukuran kertas: <strong>(•) 58mm</strong> untuk printer mini Bluetooth atau <strong>( ) 80mm</strong> untuk printer desktop standar.</li>
            <li>Centang kotak: <strong>☑ Cetak otomatis setelah pembayaran (Auto Print)</strong> jika ingin struk langsung keluar otomatis setelah kasir menekan tombol bayar.</li>
            <li>URL Print Bridge: Pastikan terisi <code>http://localhost:18080</code>.</li>
          </ul>
        </li>
        <li>Periksa <strong>Status Printer:</strong> Badge hijau bertuliskan <strong>● Terhubung</strong> menandakan print bridge aktif.</li>
        <li>Klik tombol <strong>[Test Print]</strong> untuk mencetak lembar uji coba fisik.</li>
        <li>Klik <strong>[Simpan Pengaturan Struk]</strong>.</li>
      </ol>
    </div>

    <div class="guide-box">
      <div class="guide-box-title">🔌 Setup Scanner Barcode &amp; Cash Drawer RJ-11</div>
      <ul>
        <li><strong>Barcode Scanner (USB HID):</strong>
          <br>1. Tancapkan kabel USB scanner ke port komputer kasir.
          <br>2. Scanner akan terdeteksi otomatis sebagai keyboard input (Plug-and-Play tanpa driver khusus).
          <br>3. Buka halaman kasir POS PawMart, arahkan scanner ke barcode produk. Produk otomatis masuk ke keranjang belanja kasir.
        </li>
        <li><strong>Laci Kasir Otomatis (Cash Drawer RJ-11):</strong>
          <br>1. Sambungkan kabel RJ-11 dari laci uang ke port <em>DK (Drawer Kick)</em> di belakang printer thermal.
          <br>2. Saat printer thermal mencetak struk tunai, printer akan mengirim sinyal listrik kecil (pulse) yang memicu pegas laci uang terbuka secara otomatis.
          <br>3. Kunci laci kasir dapat tetap digunakan secara manual menggunakan anak kunci fisik jika diperlukan.
        </li>
      </ul>
    </div>
  </div>

  <!-- ==================== BAB 8: PRODUK & STOK ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 8: PRODUK &amp; INVENTORI</div>
    <div class="chapter-title">Manajemen Master Produk &amp; Kontrol Stok Inventori</div>
    <div class="chapter-desc">
      Pengelolaan database produk pet shop, varian makanan anabul, aksesoris, pemantauan stok menipis secara otomatis, dan pencatatan tanggal kedaluwarsa.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">📦 Master Produk &amp; Manajemen Harga Jual</div>
      <span class="feature-route">/produk</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img04}" alt="Katalog Master Produk PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 8.1: Daftar produk pet shop dengan harga jual &amp; stok real-time</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📝 Prosedur Tambah &amp; Edit Produk:</div>
          <ol>
            <li>Buka menu <strong>Produk</strong> → Klik tombol <strong>[+ Tambah Produk]</strong>.</li>
            <li>Isi identitas produk: Nama Produk, Kategori (Makanan Kucing, Makanan Anjing, Aksesori, Vitamin &amp; Obat), dan Kode Barcode/SKU.</li>
            <li>Tentukan <strong>Harga Modal (HPP)</strong> dan <strong>Harga Jual Kasir</strong>. Sistem otomatis menghitung margin laba kotor.</li>
            <li>Tentukan batas <strong>Stok Minimum</strong> untuk memicu peringatan otomatis saat stok menipis.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📊 Kontrol Stok, Batch Kedaluwarsa &amp; Mutasi Opname</div>
      <span class="feature-route">/stok</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img05}" alt="Kontrol Stok Inventori PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 8.2: Tabel kontrol stok fisik, status menipis, dan tanggal expire</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">⚠️ Fitur Pengawasan Inventori:</div>
          <ul>
            <li><strong>Status Stok Berwarna:</strong>
              <br>• 🟢 <em>Tersedia:</em> Stok aman di atas batas minimum.
              <br>• 🟡 <em>Menipis (Low Stock):</em> Stok sama atau di bawah batas minimum (Perlu restock segera).
              <br>• 🔴 <em>Habis (Out of Stock):</em> Stok bernilai 0 (Otomatis tidak dapat ditransaksikan di kasir).
            </li>
            <li><strong>Pelacakan Tanggal Kedaluwarsa:</strong> Indikator produk makanan basah/kering yang mendekati masa expired dalam 30 hari ke depan.</li>
            <li><strong>Penyesuaian Stok (Stock Adjustment):</strong> Klik <em>[Sesuaikan Stok]</em> untuk mencatat koreksi opname fisik gudang, barang rusak, atau retur supplier.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 9: LAYANAN GROOMING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 9: LAYANAN GROOMING</div>
    <div class="chapter-title">Layanan Perawatan Anabul &amp; Papan Antrean Kanban</div>
    <div class="chapter-desc">
      Sistem manajemen jasa grooming anabul berjenjang berdasarkan ukuran hewan, alur antrean pengerjaan real-time, checklist intake kondisi fisik, serta penagihan otomatis ke kasir POS.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">✂️ Katalog Jasa Layanan Berjenjang Ukuran Hewan</div>
      <span class="feature-route">/layanan</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img06}" alt="Katalog Layanan Jasa Grooming PawMart">
        </div>
        <div class="screenshot-caption">Gambar 9.1: Katalog tarif grooming berjenjang ukuran anabul</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🐩 Paket Perawatan Anabul:</div>
          <ul>
            <li><strong>Paket Grooming Lengkap:</strong> Grooming Basic (Mandi &amp; Keringkan), Grooming Kutu &amp; Jamur, Grooming Styling/Gunting Bulu, Potong Kuku &amp; Bersih Telinga.</li>
            <li><strong>Matriks Tarif Berjenjang:</strong> Tarif otomatis menyesuaikan jenis anabul: Kucing, Anjing Ras Kecil (&lt;5kg), Anjing Sedang (5-15kg), dan Anjing Besar (&gt;15kg).</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📋 Papan Antrean Groomer &amp; Cetak Tiket Antrean</div>
      <span class="feature-route">/layanan/antrean</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img07}" alt="Papan Antrean Grooming PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 9.2: Papan status antrean grooming real-time</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🔄 3 Kolom Alur Pengerjaan Groomer:</div>
          <ol>
            <li><strong>Menunggu Antrean:</strong> Anabul baru tiba di pet shop. Cetak <em>Tiket Antrean Grooming</em> untuk diserahkan ke pemilik.</li>
            <li><strong>Sedang Dikerjakan:</strong> Groomer menggeser kartu anabul saat mulai memandikan, mengeringkan, dan memotong bulu.</li>
            <li><strong>Selesai Pengerjaan:</strong> Perawatan tuntas. Sistem otomatis mengirim notifikasi WhatsApp ke pemilik dan membuat draf tagihan kasir.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 10: PET HOTEL ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 10: PENITIPAN PET HOTEL</div>
    <div class="chapter-title">Penitipan Hewan (Pet Hotel &amp; Boarding Care)</div>
    <div class="chapter-desc">
      Monitoring kapasitas 12 kamar hotel hewan interaktif, SOP check-in kesehatan anabul, jurnal log harian makan/minum, serta dokumentasi foto via WhatsApp.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">🏨 Peta Grid 12 Kamar Penitipan Hewan</div>
      <span class="feature-route">/layanan/penitipan</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img08}" alt="Peta Kamar Pet Hotel PawMart">
        </div>
        <div class="screenshot-caption">Gambar 10.1: Grid status 12 kamar hotel (Kucing &amp; Anjing)</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🛏️ Status Visual Kamar Hotel:</div>
          <ul>
            <li><strong>🟢 Kamar Kosong:</strong> Siap menerima anabul baru. Klik kartu kamar untuk memulai proses <em>Check-in</em>.</li>
            <li><strong>🔴 Kamar Terisi:</strong> Menampilkan foto anabul, nama hewan, nama pemilik, jenis paket, dan sisa hari inap.</li>
            <li><strong>🟡 Kamar Perlu Pembersihan:</strong> Anabul telah check-out, kamar sedang disterilisasi sebelum tamu berikutnya.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">📝 SOP Check-in &amp; Jurnal Harian Aktivitas Anabul</div>
      <span class="feature-route">Detail Kamar Pet Hotel</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img09}" alt="Detail Kamar dan Jurnal Harian Anabul">
        </div>
        <div class="screenshot-caption">Gambar 10.2: Formulir log harian makan, obat, dan catatan staf</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📸 Fitur Jurnal &amp; Laporan Pemilik:</div>
          <ul>
            <li><strong>Formulir Intake Check-in:</strong> Catat riwayat vaksin, makanan bawaan sendiri / makanan toko, jadwal pemberian obat khusus, dan barang bawaan anabul (kalung, mainan, kandang portabel).</li>
            <li><strong>Jurnal Harian Aktivitas:</strong> Staf mencatat waktu makan pagi/sore, buang air, dan sesi bermain anabul.</li>
            <li><strong>Tombol Kirim Laporan WhatsApp:</strong> Klik <em>[Kirim Update ke WhatsApp Pemilik]</em> untuk menyusun laporan ringkas otomatis dan mengirimkan foto anabul ke nomor pemilik.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 11: BOOKING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 11: SISTEM BOOKING</div>
    <div class="chapter-title">Sistem Booking Kalender &amp; Pengingat Jadwal WhatsApp</div>
    <div class="chapter-desc">
      Manajemen reservasi jadwal perawatan anabul terstruktur, kalender jadwal operasional, alur booking stepper 4 langkah, serta generator pesan pengingat WhatsApp otomatis (H-1 &amp; H-3 jam).
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">📅 Kalender Jadwal Booking Perawatan</div>
      <span class="feature-route">/booking</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img10}" alt="Kalender Jadwal Booking PawMart">
        </div>
        <div class="screenshot-caption">Gambar 11.1: Tampilan kalender reservasi grooming &amp; boarding</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🗓️ Navigasi Kalender Booking:</div>
          <ul>
            <li><strong>Tampilan Bulan / Minggu / Hari:</strong> Menampilkan slot jam sibuk dan kapasitas groomer yang tersedia.</li>
            <li><strong>Pemberian Tanda Warna (Color Coding):</strong>
              <br>• Biru: Reservasi Terkonfirmasi
              <br>• Oranye: Menunggu Konfirmasi Pelanggan
              <br>• Hijau: Selesai Dilayani
            </li>
            <li><strong>Tombol WhatsApp Otomatis:</strong> Tombol kirim pengingat langsung ke nomor WhatsApp pemilik anabul.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">👣 Stepper Pembuatan Booking 4 Langkah Cepat</div>
      <span class="feature-route">/booking/baru</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img11}" alt="Formulir Stepper Booking Baru">
        </div>
        <div class="screenshot-caption">Gambar 11.2: Stepper 4 langkah pembuatan jadwal reservasi baru</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">4 Tahap Pemesanan Booking:</div>
          <ol>
            <li><strong>Langkah 1 (Pilih Pelanggan &amp; Anabul):</strong> Cari pelanggan terdaftar atau daftarkan pelanggan baru.</li>
            <li><strong>Langkah 2 (Pilih Layanan &amp; Paket):</strong> Tentukan paket grooming atau tipe kamar hotel anabul.</li>
            <li><strong>Langkah 3 (Pilih Tanggal &amp; Slot Jam):</strong> Pilih tanggal kunjungan dan jam kedatangan yang masih kosong.</li>
            <li><strong>Langkah 4 (Konfirmasi &amp; Tiket):</strong> Tinjau rincian estimasi biaya, simpan booking, dan cetak tiket reservasi.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 12: LOYALITAS ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 12: PROGRAM LOYALITAS</div>
    <div class="chapter-title">Program Loyalitas Member, Poin Belanja &amp; Voucher Diskon</div>
    <div class="chapter-desc">
      Strategi retensi pelanggan pet shop melalui kartu digital tiering member, akumulasi poin dari setiap pembelanjaan, katalog kupon promosi, dan penukaran diskon langsung di kasir.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">⭐ Kartu Member Digital &amp; Tingkatan Tiering</div>
      <span class="feature-route">/loyalitas/member</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img13}" alt="Kartu Member Digital PawMart Club">
        </div>
        <div class="screenshot-caption">Gambar 12.1: Kartu member digital dengan QR Code &amp; akumulasi poin</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🎖️ 3 Tingkatan Member PawMart Club:</div>
          <ul>
            <li><strong>Silver Member (Member Baru):</strong> Rasio perolehan poin 1 Poin per kelipatan belanja Rp 10.000.</li>
            <li><strong>Gold Member (Akumulasi Belanja &gt; Rp 2 Jt):</strong> Diskon otomatis 5% untuk jasa grooming dan rasio poin 1.5x lebih cepat.</li>
            <li><strong>Platinum Member (Akumulasi Belanja &gt; Rp 5 Jt):</strong> Diskon otomatis 10% untuk jasa grooming, gratis mandi 1x di hari ulang tahun anabul, dan prioritas antrean.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">🏷️ Manajemen Voucher Promosi Toko</div>
      <span class="feature-route">/loyalitas/voucher</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img14}" alt="Daftar Kupon Voucher Diskon Toko">
        </div>
        <div class="screenshot-caption">Gambar 12.2: Katalog voucher promo belanja pet shop</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🎟️ Penggunaan Voucher di Kasir POS:</div>
          <ul>
            <li><strong>Kode Voucher Kupon:</strong> Contoh <code>ANABULNEW</code> (Potongan Rp 15.000) atau <code>GROOM50</code> (Potongan 50% grooming kedua).</li>
            <li><strong>Validasi Syarat Belanja:</strong> Sistem otomatis mengecek syarat minimum belanja sebelum kupon dapat diaplikasikan.</li>
            <li><strong>Satu Voucher Per Transaksi:</strong> Kasir dapat memilih voucher langsung dari modal pop-up keranjang belanja.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 13: PELANGGAN ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 13: DATABASE PELANGGAN</div>
    <div class="chapter-title">Database Pelanggan, Profil Anabul &amp; Rekam Medis</div>
    <div class="chapter-desc">
      Database terpadu hubungan pelanggan (CRM) yang mengaitkan setiap pemilik dengan seluruh hewan peliharaannya (multi-anabul), riwayat pembelian makanan, serta rekam histori kesehatan.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">👥 Daftar Pelanggan &amp; Multi-Anabul Terdaftar</div>
      <span class="feature-route">/pelanggan</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img15}" alt="Daftar Pelanggan PawMart POS">
        </div>
        <div class="screenshot-caption">Gambar 13.1: Tabel data pelanggan, kontak WA, tier, dan jumlah anabul</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🐾 Struktur Data Multi-Anabul:</div>
          <ul>
            <li><strong>Profil Pemilik:</strong> Nama lengkap, nomor WhatsApp aktif, alamat domisili, tier member, dan total belanja sepanjang masa (Lifetime Value).</li>
            <li><strong>Profil Hewan (Multi-Pet):</strong> Satu pemilik dapat memiliki beberapa anabul (misal 2 Kucing &amp; 1 Anjing). Masing-masing memiliki nama, ras, tanggal lahir, jenis bulu, dan berat badan.</li>
            <li><strong>Catatan Alergi / Karakter:</strong> Catatan penting bagi kasir &amp; groomer (misal: <em>"Alergi ayam"</em> atau <em>"Gampang takut hair dryer"</em>).</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 14: LAPORAN & PENGATURAN ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 14: LAPORAN &amp; PENGATURAN</div>
    <div class="chapter-title">Laporan Analitik Bisnis &amp; Konfigurasi Pengaturan Toko</div>
    <div class="chapter-desc">
      Audit transaksi keuangan, analisis produk paling laris, serta pusat pengaturan profil toko, konfigurasi tarif PPN 11%, dan preferensi printer struk thermal.
    </div>
  </div>

  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-name">📈 Laporan Penjualan &amp; Rekap Metode Pembayaran</div>
      <span class="feature-route">/laporan</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img16}" alt="Laporan Penjualan dan Analitik Finansial">
        </div>
        <div class="screenshot-caption">Gambar 14.1: Grafik omzet harian dan breakdown metode pembayaran</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">📊 Rincian Laporan Keuangan:</div>
          <ul>
            <li><strong>Filter Rentang Waktu:</strong> Tampilkan data Hari Ini, 7 Hari Terakhir, Bulan Ini, atau Kustom Tanggal.</li>
            <li><strong>Komposisi Pembayaran:</strong> Proporsi pemasukan Tunai vs QRIS vs Transfer Bank (Membantu rekonsiliasi kas bank toko).</li>
            <li><strong>Produk &amp; Layanan Terlaris:</strong> Ranking 10 barang paling banyak terjual untuk acuan pengadaan restock ke supplier.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="feature-card avoid-break">
    <div class="feature-header">
      <div class="feature-name">⚙️ Pengaturan Toko, Pajak PPN &amp; Preferensi Struk</div>
      <span class="feature-route">/pengaturan</span>
    </div>
    <div class="feature-split-layout">
      <div class="feature-left-col">
        <div class="screenshot-frame">
          <img src="${img17}" alt="Pengaturan Toko dan Konfigurasi POS">
        </div>
        <div class="screenshot-caption">Gambar 14.2: Panel pengaturan profil toko, pajak, dan printer struk</div>
      </div>
      <div class="feature-right-col">
        <div class="guide-box">
          <div class="guide-box-title">🔧 Menu Konfigurasi (Khusus Peran Owner):</div>
          <ul>
            <li><strong>Profil Toko:</strong> Nama toko, slogan, alamat lengkap, no telepon/WA, email, dan catatan kaki struk.</li>
            <li><strong>Pengaturan Printer Thermal:</strong> Pemilihan mode Printer Thermal (Direct Bridge) vs Browser, ukuran kertas 58mm/80mm, checkbox Auto Print, URL Bridge, dan tombol Test Print.</li>
            <li><strong>Pajak PPN 11% &amp; Biaya Layanan:</strong> Opsi mengaktifkan atau menonaktifkan PPN otomatis pada total belanja kasir.</li>
            <li><strong>Template Notifikasi WhatsApp:</strong> Personalisasi format kalimat pengingat booking dan update anabul.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== BAB 15: TROUBLESHOOTING ==================== -->
  <div class="page-break"></div>
  <div class="chapter-header">
    <div class="chapter-tag">BAB 15: PANDUAN PEMECAHAN MASALAH</div>
    <div class="chapter-title">Troubleshooting Perangkat Keras &amp; Tanya Jawab Operasional (FAQ)</div>
    <div class="chapter-desc">
      Panduan cepat mengatasi kendala teknis yang umum dihadapi kasir dan staf toko saat melayani pelanggan sehari-hari.
    </div>
  </div>

  <div class="guide-box avoid-break" style="margin-bottom: 12px;">
    <div class="guide-box-title">❓ Tanya Jawab &amp; Solusi Kendala Cepat (FAQ)</div>
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 32%;">Gejala Masalah</th>
          <th style="width: 28%;">Penyebab Utama</th>
          <th>Langkah Perbaikan / Solusi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Klik "Cetak Struk Thermal", tombol berubah "Cetak Gagal"</strong></td>
          <td>Print Bridge belum berjalan di background komputer kasir atau kabel USB printer terlepas.</td>
          <td>1. Buka terminal komputer kasir dan ketik: <code>npm run print-bridge</code>.<br>2. Pastikan printer menyala dan lampu indikator hijau.<br>3. Klik tombol <strong>[Coba Lagi]</strong> atau gunakan tombol cadangan <strong>[Cetak PDF]</strong> jika sedang buru-buru.</td>
        </tr>
        <tr>
          <td><strong>Kertas struk keluar tapi hasil tulisan putih / kosong polos</strong></td>
          <td>Gulungan kertas thermal terpasang terbalik (sisi kimiawi tidak menghadap head printer).</td>
          <td>Buka penutup printer thermal, balik posisi gulungan kertas agar sisi luar yang sensitif panas menghadap ke head pemanas printer.</td>
        </tr>
        <tr>
          <td><strong>Kasir tidak bisa menginput diskon lebih dari Rp 1.000</strong></td>
          <td>Kebijakan proteksi wewenang kasir (Cashier Discount Limit).</td>
          <td>Ketentuan resmi toko membatasi kasir hanya boleh memberi diskon Rp 1.000 jika pelanggan menawar. Jika pelanggan meminta diskon lebih besar, hubungi <strong>👑 Owner</strong> untuk login dan menerapkan diskon khusus.</td>
        </tr>
        <tr>
          <td><strong>Ada selisih uang saat Tutup Shift di akhir hari</strong></td>
          <td>Salah memberikan uang kembalian tunai atau uang kas belum dihitung teliti.</td>
          <td>1. Hitung ulang uang fisik laci lembar per lembar.<br>2. Periksa apakah ada pengeluaran kas kecil operasional toko (misal beli es batu/sabun) yang belum dicatat.<br>3. Catat nominal selisih pada formulir tutup shift agar terekam di riwayat audit Owner.</td>
        </tr>
        <tr>
          <td><strong>Barcode scanner USB tidak merespons di layar kasir</strong></td>
          <td>Kabel USB longgar atau kursor mouse tidak aktif di jendela kasir.</td>
          <td>1. Cabut dan tancapkan kembali kabel USB scanner.<br>2. Klik sekali pada area halaman kasir PawMart POS untuk memastikan jendela browser dalam kondisi aktif (focus).</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="callout callout-tip avoid-break">
    <span class="callout-icon">📞</span>
    <div>
      <strong>Layanan Bantuan Teknis Toko:</strong> Jika mengalami kendala teknis sistem atau kerusakan perangkat keras printer yang tidak teratasi oleh panduan ini, hubungi Administrator Sistem PawMart POS melalui email: <code>support@pawmart.id</code> atau WhatsApp Hotline Bantuan: <code>0812-9988-7766</code>.
    </div>
  </div>

</body>
</html>`;

  const htmlPath = path.join(__dirname, '..', 'Manual book', 'manual-preview.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`Saved updated HTML document to ${htmlPath}`);

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
  await new Promise(r => setTimeout(r, 1200));

  console.log('Generating PDF at A4 portrait...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Plus Jakarta Sans', sans-serif; color: #94A3B8; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm;">
        <span>PawMart POS - Buku Panduan Pengguna &amp; Teknis v2.5</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  console.log(`PDF successfully generated at: ${OUTPUT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
