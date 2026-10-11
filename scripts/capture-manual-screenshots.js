const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'Manual book', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  const page = await browser.newPage();

  async function takeSnap(urlPath, filename, actionFn = null) {
    console.log(`Navigating to ${urlPath}...`);
    await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);
    if (actionFn) {
      try {
        await actionFn(page);
        await sleep(600);
      } catch (err) {
        console.warn(`Action failed on ${urlPath}:`, err.message);
      }
    }
    const dest = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // 1. Dashboard
    await takeSnap('/', '01_dashboard.png');

    // 2. Kasir POS
    await takeSnap('/transaksi', '02_kasir_pos.png');

    // 3. Kasir Pembayaran / Quick Cash Modal
    await takeSnap('/transaksi', '03_kasir_bayar.png', async (p) => {
      // Click first product to add to cart
      const productCard = await p.$('button[title*="tambah"], div[role="button"], .cursor-pointer');
      if (productCard) await productCard.click();
      await sleep(500);
      // Click "Bayar" button
      const buttons = await p.$$('button');
      for (const btn of buttons) {
        const text = await p.evaluate(el => el.textContent, btn);
        if (text && text.includes('Bayar')) {
          await btn.click();
          break;
        }
      }
    });

    // 4. Produk
    await takeSnap('/produk', '04_produk.png');

    // 5. Stok
    await takeSnap('/stok', '05_stok.png');

    // 6. Layanan Katalog
    await takeSnap('/layanan', '06_layanan_katalog.png');

    // 7. Layanan Antrean Kanban
    await takeSnap('/layanan/antrean', '07_layanan_antrean.png');

    // 8. Layanan Penitipan Pet Hotel Peta Kandang
    await takeSnap('/layanan/penitipan', '08_penitipan_peta.png');

    // 9. Penitipan Detail / Jurnal
    await takeSnap('/layanan/penitipan', '09_penitipan_detail.png', async (p) => {
      // Click a cage that is "Terisi"
      const cageEl = await p.$('div.border-amber-300, div:has-text("STAY"), div[class*="amber"]');
      if (cageEl) {
        await cageEl.click();
      } else {
        const cards = await p.$$('div[class*="rounded-2xl"]');
        if (cards.length > 2) await cards[2].click();
      }
    });

    // 10. Booking Kalender
    await takeSnap('/booking', '10_booking_kalender.png');

    // 11. Booking Baru Stepper
    await takeSnap('/booking/baru', '11_booking_stepper.png');

    // 12. Loyalitas Ringkasan & Kartu Digital
    await takeSnap('/loyalitas', '12_loyalitas_ringkasan.png');

    // 13. Loyalitas Member
    await takeSnap('/loyalitas/member', '13_loyalitas_member.png');

    // 14. Loyalitas Voucher
    await takeSnap('/loyalitas/voucher', '14_loyalitas_voucher.png');

    // 15. Pelanggan
    await takeSnap('/pelanggan', '15_pelanggan.png');

    // 16. Laporan
    await takeSnap('/laporan', '16_laporan.png');

    // 17. Pengaturan
    await takeSnap('/pengaturan', '17_pengaturan.png');

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
