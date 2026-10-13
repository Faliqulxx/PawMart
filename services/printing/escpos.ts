import { PaperWidth, ThermalTransaction, StoreInfo } from "./types";
import { formatRupiah } from "@/lib/format";

/**
 * Utilitas pemformatan ESC/POS dan teks thermal receipt
 * 58mm: 32 karakter per baris (Font A)
 * 80mm: 48 karakter per baris (Font A)
 */

export function getColumnWidth(width: PaperWidth): number {
  return width === "80mm" ? 48 : 32;
}

/**
 * Format baris kiri dan kanan (misal "Subtotal" di kiri, "Rp 150.000" di kanan)
 */
export function formatRow(left: string, right: string, maxLen: number): string {
  const leftStr = left.trim();
  const rightStr = right.trim();
  const availableSpace = maxLen - leftStr.length - rightStr.length;

  if (availableSpace >= 1) {
    return leftStr + " ".repeat(availableSpace) + rightStr;
  }

  // Jika terlalu panjang, potong kiri secukupnya
  const maxLeftLen = Math.max(10, maxLen - rightStr.length - 2);
  const truncatedLeft = leftStr.substring(0, maxLeftLen);
  const space = Math.max(1, maxLen - truncatedLeft.length - rightStr.length);
  return truncatedLeft + " ".repeat(space) + rightStr;
}

/**
 * Pusatkan teks (Center align)
 */
export function centerText(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length >= maxLen) return trimmed.substring(0, maxLen);
  const leftPadding = Math.floor((maxLen - trimmed.length) / 2);
  const rightPadding = maxLen - trimmed.length - leftPadding;
  return " ".repeat(leftPadding) + trimmed + " ".repeat(rightPadding);
}

/**
 * Bungkus teks panjang menjadi array baris (Word wrapping)
 */
export function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + " " + word).length <= maxLen) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

/**
 * Buat separator garis
 */
export function createSeparator(char: string = "-", maxLen: number): string {
  return char.repeat(maxLen);
}

/**
 * Format Transaksi menjadi String Struk Thermal Rapi (58mm / 80mm)
 */
export function formatThermalReceiptText(
  tx: ThermalTransaction,
  paperWidth: PaperWidth = "58mm"
): string {
  const width = getColumnWidth(paperWidth);
  const lines: string[] = [];

  // 1. Header Toko
  lines.push(centerText(tx.store.name.toUpperCase(), width));
  if (tx.store.address) {
    wrapText(tx.store.address, width).forEach((l) => lines.push(centerText(l, width)));
  }
  if (tx.store.phone) {
    lines.push(centerText(tx.store.phone, width));
  }
  lines.push(createSeparator("-", width));

  // 2. Metadata Transaksi
  lines.push(formatRow("No. Transaksi", tx.transactionNumber, width));
  lines.push(formatRow("Waktu", tx.dateTime, width));
  lines.push(formatRow("Kasir", tx.cashier, width));
  lines.push(formatRow("Pelanggan", tx.customer, width));
  lines.push(createSeparator("-", width));

  // 3. Daftar Produk
  tx.items.forEach((item) => {
    // Baris Nama Produk (Wrap jika panjang)
    const nameLines = wrapText(item.name, width);
    nameLines.forEach((n) => lines.push(n));

    // Baris Qty x Harga di kiri, Subtotal di kanan
    const qtyPrice = `${item.quantity} x ${formatRupiah(item.price)}`;
    const subtotalStr = formatRupiah(item.subtotal);
    lines.push(formatRow(`  ${qtyPrice}`, subtotalStr, width));
  });

  lines.push(createSeparator("-", width));

  // 4. Subtotal & Diskon & TOTAL
  lines.push(formatRow("Subtotal", formatRupiah(tx.subtotal), width));
  if (tx.discount > 0) {
    lines.push(formatRow("Diskon", `-${formatRupiah(tx.discount)}`, width));
  }
  if (tx.tax && tx.tax > 0) {
    lines.push(formatRow("PPN (11%)", formatRupiah(tx.tax), width));
  }

  lines.push(createSeparator("=", width));
  lines.push(formatRow("TOTAL", formatRupiah(tx.total), width));
  lines.push(createSeparator("=", width));

  // 5. Pembayaran
  lines.push(formatRow("Metode Bayar", tx.paymentMethod, width));
  lines.push(formatRow("Bayar (Diterima)", formatRupiah(tx.amountPaid || tx.total), width));
  lines.push(formatRow("Kembalian", formatRupiah(tx.change || 0), width));
  lines.push(createSeparator("-", width));

  // 6. Loyalitas Poin
  const points = tx.loyaltyPoints !== undefined ? tx.loyaltyPoints : Math.floor(tx.total / 10000);
  lines.push(formatRow("Poin Diperoleh", `+${points} Poin`, width));
  lines.push(formatRow("Status Member", "PawMart VIP Club", width));
  lines.push(createSeparator("-", width));

  // 7. Footer
  lines.push(centerText("TERIMA KASIH ATAS KUNJUNGAN ANDA! 🐾", width));
  lines.push("");
  wrapText("Barang yang dibeli dapat ditukar 2 hari dengan membawa struk resmi ini.", width).forEach(
    (l) => lines.push(centerText(l, width))
  );
  lines.push("");
  lines.push(centerText("*** PAWMART SYSTEM POS ***", width));

  return lines.join("\n");
}

/**
 * Format Test Print Struk untuk Pengujian Printer Thermal
 */
export function formatTestPrintText(
  paperWidth: PaperWidth = "58mm",
  store: StoreInfo = {
    name: "PAWMART PET SHOP",
    address: "Jl. Kemang Raya No. 42A, Jakarta Selatan",
    phone: "021-7890123 / 0812-9988-7766",
  }
): string {
  const width = getColumnWidth(paperWidth);
  const lines: string[] = [];

  lines.push(centerText(store.name.toUpperCase(), width));
  lines.push(createSeparator("=", width));
  lines.push(centerText("*** TEST PRINT BERHASIL ***", width));
  lines.push(centerText("Printer thermal terhubung normal.", width));
  lines.push("");
  lines.push(formatRow("Ukuran Kertas", paperWidth, width));
  lines.push(formatRow("Status Koneksi", "ONLINE / OK", width));
  lines.push(formatRow("Waktu Uji", new Date().toLocaleTimeString("id-ID"), width));
  lines.push(createSeparator("=", width));
  lines.push(centerText("PAWMART DIRECT PRINT BRIDGE", width));

  return lines.join("\n");
}

/**
 * Konversi String Text ke Buffer ESC/POS Raw Command (Bytes)
 */
export function textToEscPosBytes(text: string): Uint8Array {
  const encoder = new TextEncoder();
  const initCmd = new Uint8Array([0x1b, 0x40]); // ESC @ (Initialize)
  const textBytes = encoder.encode(text + "\n\n\n");
  const cutCmd = new Uint8Array([0x1d, 0x56, 0x42, 0x00]); // GS V B 0 (Feed & Cut)

  const combined = new Uint8Array(initCmd.length + textBytes.length + cutCmd.length);
  combined.set(initCmd, 0);
  combined.set(textBytes, initCmd.length);
  combined.set(cutCmd, initCmd.length + textBytes.length);

  return combined;
}
