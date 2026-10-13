export interface DashboardStats {
  penjualanHariIni: number;
  jumlahTransaksi: number;
  produkTerjual: number;
  stokMenipis: number;
  perubahan: {
    penjualan: number;
    transaksi: number;
    produk: number;
  };
}

export const stats: DashboardStats = {
  penjualanHariIni: 2450000,
  jumlahTransaksi: 18,
  produkTerjual: 45,
  stokMenipis: 6,
  perubahan: {
    penjualan: 12,
    transaksi: 25,
    produk: 18,
  },
};

export interface ChartDataPoint {
  label: string;
  nilai: number;
  transaksi: number;
}

export const salesChart7Days: ChartDataPoint[] = [
  { label: "12 Okt", nilai: 1700000, transaksi: 14 },
  { label: "13 Okt", nilai: 2400000, transaksi: 19 },
  { label: "14 Okt", nilai: 1900000, transaksi: 15 },
  { label: "15 Okt", nilai: 3200000, transaksi: 26 },
  { label: "16 Okt", nilai: 2000000, transaksi: 16 },
  { label: "17 Okt", nilai: 3000000, transaksi: 22 },
  { label: "18 Okt", nilai: 2450000, transaksi: 18 },
];

export const salesChart30Days: ChartDataPoint[] = [
  { label: "Minggu 1", nilai: 12500000, transaksi: 95 },
  { label: "Minggu 2", nilai: 14800000, transaksi: 112 },
  { label: "Minggu 3", nilai: 16200000, transaksi: 128 },
  { label: "Minggu 4", nilai: 18950000, transaksi: 145 },
];

export const salesChartMonth: ChartDataPoint[] = [
  { label: "Jul", nilai: 48000000, transaksi: 380 },
  { label: "Agu", nilai: 52500000, transaksi: 420 },
  { label: "Sep", nilai: 59000000, transaksi: 460 },
  { label: "Okt (Bln Ini)", nilai: 64200000, transaksi: 512 },
];

export interface TopProductSummary {
  id: string;
  nama: string;
  kategori: string;
  terjual: number;
  pendapatan: number;
  gambar: string;
  icon: string;
}

export const topSellingProducts: TopProductSummary[] = [
  {
    id: "PROD-001",
    nama: "Royal Canin Adult Cat",
    kategori: "Makanan Kucing 1kg",
    terjual: 32,
    pendapatan: 4640000,
    gambar: "/images/products/royal-canin-cat.svg",
    icon: "/images/products/royal-canin-cat.svg",
  },
  {
    id: "PROD-002",
    nama: "Whiskas Tuna Adult",
    kategori: "Makanan Kucing 1kg",
    terjual: 28,
    pendapatan: 1820000,
    gambar: "/images/products/whiskas-tuna.svg",
    icon: "/images/products/whiskas-tuna.svg",
  },
  {
    id: "PROD-003",
    nama: "Pedigree Adult Beef & Veg",
    kategori: "Makanan Anjing 1kg",
    terjual: 20,
    pendapatan: 1500000,
    gambar: "/images/products/pedigree-beef.svg",
    icon: "/images/products/pedigree-beef.svg",
  },
  {
    id: "PROD-005",
    nama: "Tempat Makan Stainless Anti-Semut",
    kategori: "Aksesoris",
    terjual: 15,
    pendapatan: 675000,
    gambar: "/images/products/bowl-stainless.svg",
    icon: "/images/products/bowl-stainless.svg",
  },
  {
    id: "PROD-006",
    nama: "Mainan Kucing Laser & Bulu",
    kategori: "Aksesoris",
    terjual: 12,
    pendapatan: 420000,
    gambar: "/images/products/toy-laser.svg",
    icon: "/images/products/toy-laser.svg",
  },
];

