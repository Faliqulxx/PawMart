import {
  PrinterConfig,
  PrintResult,
  PrinterConnectionStatus,
  ThermalTransaction,
} from "./types";
import { formatThermalReceiptText, formatTestPrintText } from "./escpos";
import { Transaction } from "@/data/transactions";
import { initialStoreProfile } from "@/data/settings";

const CONFIG_STORAGE_KEY = "pawmart_printer_config";

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  printerType: "thermal",
  paperWidth: "58mm",
  autoPrint: false,
  bridgeUrl:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL
      ? process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL
      : "http://localhost:18080",
  timeoutMs: 3500,
};

/**
 * Membaca konfigurasi printer yang tersimpan
 */
export function getPrinterConfig(): PrinterConfig {
  if (typeof window === "undefined") return DEFAULT_PRINTER_CONFIG;

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PRINTER_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn("Gagal membaca konfigurasi printer:", e);
  }

  return DEFAULT_PRINTER_CONFIG;
}

/**
 * Menyimpan pembaruan konfigurasi printer
 */
export function savePrinterConfig(updates: Partial<PrinterConfig>): PrinterConfig {
  const current = getPrinterConfig();
  const nextConfig = { ...current, ...updates };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    } catch (e) {
      console.error("Gagal menyimpan konfigurasi printer:", e);
    }
  }

  return nextConfig;
}

/**
 * Mengonversi model Transaction PawMart ke struktur ThermalTransaction
 */
export function normalizeTransactionToThermal(
  tx: Transaction | ThermalTransaction
): ThermalTransaction {
  // Jika sudah berformat ThermalTransaction
  if ("items" in tx && Array.isArray(tx.items) && tx.items.length > 0 && "name" in tx.items[0]) {
    return tx as ThermalTransaction;
  }

  const rawTx = tx as Transaction;
  return {
    transactionNumber: rawTx.noTransaksi || rawTx.id,
    dateTime: `${rawTx.tanggal || new Date().toISOString().split("T")[0]}, ${
      rawTx.waktu || "14:30"
    } WIB`,
    cashier: rawTx.kasir || "Admin",
    customer: rawTx.pelangganNama || "Pelanggan Umum",
    items: (rawTx.items || []).map((it) => ({
      name: it.produkNama,
      quantity: it.qty,
      price: it.harga,
      subtotal: it.subtotal,
    })),
    subtotal: rawTx.subtotal,
    discount: rawTx.diskon || 0,
    tax: rawTx.pajak || 0,
    total: rawTx.total,
    paymentMethod: rawTx.metodeBayar,
    amountPaid: rawTx.nominalBayar || rawTx.total,
    change: rawTx.kembalian || 0,
    loyaltyPoints: Math.floor(rawTx.total / 10000),
    store: {
      name: initialStoreProfile.namaToko,
      address: initialStoreProfile.alamat,
      phone: initialStoreProfile.telepon,
      headerNote: initialStoreProfile.slogan,
      footerNote: initialStoreProfile.catatanStruk,
    },
  };
}

/**
 * Mengirim request HTTP dengan timeout terkontrol
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Cek status koneksi printer / print bridge
 */
export async function checkPrinterStatus(
  customConfig?: Partial<PrinterConfig>
): Promise<PrinterConnectionStatus> {
  const config = { ...getPrinterConfig(), ...customConfig };
  const targetUrl = config.bridgeUrl.replace(/\/+$/, "") + "/status";

  try {
    const res = await fetchWithTimeout(
      targetUrl,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      config.timeoutMs || 2500
    );

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === "ok" || data.status === "ready" || data.connected === true) {
        return "connected";
      }
    }
    return "disconnected";
  } catch {
    return "disconnected";
  }
}

/**
 * Cetak Struk Transaksi ke Printer Thermal (Direct Printing via Print Bridge)
 * TIDAK memanggil window.print()
 */
export async function printThermalReceipt(
  transaction: Transaction | ThermalTransaction,
  customConfig?: Partial<PrinterConfig>
): Promise<PrintResult> {
  if (!transaction) {
    return {
      success: false,
      message: "Data transaksi tidak valid.",
    };
  }

  const config = { ...getPrinterConfig(), ...customConfig };
  const normalizedTx = normalizeTransactionToThermal(transaction);
  const formattedText = formatThermalReceiptText(normalizedTx, config.paperWidth);

  const payload = {
    type: "receipt",
    paperWidth: config.paperWidth,
    transactionNumber: normalizedTx.transactionNumber,
    rawText: formattedText,
    transaction: normalizedTx,
    timestamp: new Date().toISOString(),
  };

  const primaryUrl = config.bridgeUrl.replace(/\/+$/, "") + "/print";

  try {
    const response = await fetchWithTimeout(
      primaryUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
      config.timeoutMs || 3500
    );

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: true,
        message: result.message || "Struk berhasil dikirim ke printer.",
        printerStatus: "connected",
        timestamp: new Date().toISOString(),
      };
    } else {
      const errorJson = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorJson.message || "Printer merespons dengan status error.",
        printerStatus: "disconnected",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message:
        "Printer thermal tidak terhubung atau print bridge belum dijalankan di " +
        config.bridgeUrl +
        ".",
      printerStatus: "disconnected",
    };
  }
}

/**
 * Uji Coba Printer Thermal (Test Print)
 */
export async function testThermalPrinter(
  customConfig?: Partial<PrinterConfig>
): Promise<PrintResult> {
  const config = { ...getPrinterConfig(), ...customConfig };
  const testText = formatTestPrintText(config.paperWidth, {
    name: initialStoreProfile.namaToko,
    address: initialStoreProfile.alamat,
    phone: initialStoreProfile.telepon,
  });

  const payload = {
    type: "test",
    paperWidth: config.paperWidth,
    rawText: testText,
    timestamp: new Date().toISOString(),
  };

  const primaryUrl = config.bridgeUrl.replace(/\/+$/, "") + "/print";

  try {
    const response = await fetchWithTimeout(
      primaryUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      config.timeoutMs || 3500
    );

    if (response.ok) {
      return {
        success: true,
        message: "Test print berhasil dikirim ke printer!",
        printerStatus: "connected",
      };
    } else {
      return {
        success: false,
        message: "Gagal mencetak test print.",
        printerStatus: "disconnected",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message:
        "Printer thermal tidak terhubung atau print bridge belum dijalankan di " +
        config.bridgeUrl +
        ".",
      printerStatus: "disconnected",
    };
  }
}
