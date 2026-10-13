export interface CashierShift {
  id: string; // e.g. "SHF-20261011-001"
  shiftNumber: number; // 1, 2, 3
  cashierId: string; // "USR-002"
  cashierName: string; // "Maya Kasir"
  startTime: string; // ISO string / format "2026-10-11T08:00:00"
  endTime: string | null; // ISO string or null if still active
  status: "open" | "closed";

  // Finansial
  startingCash: number; // Modal awal kas fisik di laci (e.g. 500.000)
  cashSales: number; // Penjualan Tunai yang diterima kasir
  nonCashSales: number; // Penjualan Non-Tunai (QRIS, Transfer, Kartu)
  totalSales: number; // Total Penjualan (cashSales + nonCashSales)
  transactionCount: number; // Jumlah transaksi/struk kasir

  // Rekonsiliasi Kas Fisik saat Tutup Shift
  expectedCash: number; // startingCash + cashSales
  actualCash: number | null; // Uang tunai fisik yang dihitung kasir
  cashDifference: number | null; // actualCash - expectedCash (0 = pas, minus = tekor, plus = lebih)

  notes?: string; // Catatan kasir saat buka atau tutup shift
}

export const initialShiftHistory: CashierShift[] = [
  {
    id: "SHF-20261010-001",
    shiftNumber: 1,
    cashierId: "USR-002",
    cashierName: "Maya Kasir",
    startTime: "2026-10-10T08:00:00",
    endTime: "2026-10-10T15:00:00",
    status: "closed",
    startingCash: 500000,
    cashSales: 1520000,
    nonCashSales: 890000,
    totalSales: 2410000,
    transactionCount: 18,
    expectedCash: 2020000,
    actualCash: 2000000,
    cashDifference: -20000, // Selisih kurang Rp 20.000
    notes: "Uang kembalian koin kurang pecahan Rp 5.000 dan Rp 2.000 saat jam ramai.",
  },
  {
    id: "SHF-20261010-002",
    shiftNumber: 2,
    cashierId: "USR-004",
    cashierName: "Andi Saputra",
    startTime: "2026-10-10T15:00:00",
    endTime: "2026-10-10T22:00:00",
    status: "closed",
    startingCash: 2000000,
    cashSales: 2150000,
    nonCashSales: 1450000,
    totalSales: 3600000,
    transactionCount: 24,
    expectedCash: 4150000,
    actualCash: 4155000,
    cashDifference: 5000, // Selisih lebih Rp 5.000
    notes: "Ada pelanggan tidak mengambil kembalian Rp 5.000.",
  },
  {
    id: "SHF-20261011-001",
    shiftNumber: 3,
    cashierId: "USR-002",
    cashierName: "Maya Kasir",
    startTime: "2026-10-11T08:00:00",
    endTime: null, // Shift aktif saat ini
    status: "open",
    startingCash: 500000,
    cashSales: 980000,
    nonCashSales: 870000,
    totalSales: 1850000,
    transactionCount: 14,
    expectedCash: 1480000, // 500.000 + 980.000
    actualCash: null,
    cashDifference: null,
    notes: "Shift pagi akhir pekan, modal awal uang receh siap di laci kasir.",
  },
];
