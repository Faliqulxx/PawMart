const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'Manual book', 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Penitipan Check-in Modal
  await page.goto('http://localhost:3000/layanan/penitipan', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Check-in Baru'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08b_penitipan_checkin.png') });
  console.log('Saved 08b_penitipan_checkin.png');

  // 2. Penitipan Detail Stay / Jurnal (klik salah satu kandang terisi)
  await page.goto('http://localhost:3000/layanan/penitipan', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div')).filter(el => 
      el.textContent && el.textContent.includes('S-01') && el.textContent.includes('Luna')
    );
    if (cards.length > 0) {
      cards[cards.length - 1].click();
    }
  });
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_penitipan_detail.png') });
  console.log('Saved 09_penitipan_detail.png');

  // 3. Antrean Tambah Modal
  await page.goto('http://localhost:3000/layanan/antrean', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Tambah Antrean'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07b_antrean_modal.png') });
  console.log('Saved 07b_antrean_modal.png');

  // 4. Pelanggan Detail Modal
  await page.goto('http://localhost:3000/pelanggan', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Detail'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15b_pelanggan_detail.png') });
  console.log('Saved 15b_pelanggan_detail.png');

  // 5. Kasir Struk / Receipt Modal
  await page.goto('http://localhost:3000/transaksi', { waitUntil: 'networkidle0' });
  await sleep(1000);
  // Add first item
  await page.evaluate(() => {
    const card = document.querySelector('div[role="button"], div.cursor-pointer, button.cursor-pointer');
    if (card) card.click();
  });
  await sleep(500);
  // Click Bayar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Bayar'));
    if (btn) btn.click();
  });
  await sleep(600);
  // Click Uang Pas
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Uang Pas'));
    if (btn) btn.click();
  });
  await sleep(500);
  // Click Proses Pembayaran
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && (b.textContent.includes('Proses Pembayaran') || b.textContent.includes('Konfirmasi')));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03b_kasir_struk.png') });
  console.log('Saved 03b_kasir_struk.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
