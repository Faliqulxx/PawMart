export type MemberTier = "Bronze" | "Silver" | "Gold";

export interface TierBenefit {
  tier: MemberTier;
  minBelanja: number;
  multiplierPoin: number;
  diskonGrooming: number;
  keuntungan: string[];
  color: string;
  badgeBg: string;
}

export const memberTiers: Record<MemberTier, TierBenefit> = {
  Bronze: {
    tier: "Bronze",
    minBelanja: 0,
    multiplierPoin: 1.0,
    diskonGrooming: 0,
    keuntungan: ["1 poin tiap belanja Rp 10.000", "Poin ulang tahun anabul +50"],
    color: "text-[#B87333]",
    badgeBg: "bg-[#FBEBDD] text-[#B87333] border-[#B87333]/30",
  },
  Silver: {
    tier: "Silver",
    minBelanja: 2000000,
    multiplierPoin: 1.25,
    diskonGrooming: 5,
    keuntungan: ["Poin 1.25x lebih cepat", "Diskon grooming 5%", "Bonus voucher bulanan Rp 10.000"],
    color: "text-slate-600",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
  },
  Gold: {
    tier: "Gold",
    minBelanja: 5000000,
    multiplierPoin: 1.5,
    diskonGrooming: 10,
    keuntungan: [
      "Poin 1.5x lipat per transaksi",
      "Diskon grooming 10%",
      "Prioritas booking slot weekend",
      "Free konsultasi dokter hewan 1x/tahun",
    ],
    color: "text-[#D4A017]",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
  },
};

export interface VoucherItem {
  kode: string;
  nama: string;
  tipe: "nominal" | "persen";
  nilai: number; // nominal Rp atau persentase
  minBelanja: number;
  berlakuSampai: string;
  kuota: number;
  status: "Aktif" | "Habis" | "Kedaluwarsa";
  deskripsi: string;
}

export const initialVouchers: VoucherItem[] = [
  {
    kode: "PAW10K",
    nama: "Potongan Langsung Rp 10.000",
    tipe: "nominal",
    nilai: 10000,
    minBelanja: 100000,
    berlakuSampai: "2026-12-31",
    kuota: 85,
    status: "Aktif",
    deskripsi: "Berlaku untuk semua transaksi produk dan layanan di PawMart.",
  },
  {
    kode: "GROOM15",
    nama: "Diskon Khusus Grooming 15%",
    tipe: "persen",
    nilai: 15,
    minBelanja: 80000,
    berlakuSampai: "2026-11-30",
    kuota: 40,
    status: "Aktif",
    deskripsi: "Potongan 15% untuk semua paket grooming anabul kesayangan.",
  },
  {
    kode: "NEWMEMBER",
    nama: "Voucher Sambutan Member Baru Rp 15.000",
    tipe: "nominal",
    nilai: 15000,
    minBelanja: 75000,
    berlakuSampai: "2026-10-31",
    kuota: 120,
    status: "Aktif",
    deskripsi: "Hadiah selamat datang untuk pendaftaran member pertama.",
  },
  {
    kode: "HALLOWEEN",
    nama: "Promo Spesial Kostum & Treats 10%",
    tipe: "persen",
    nilai: 10,
    minBelanja: 150000,
    berlakuSampai: "2026-10-31",
    kuota: 30,
    status: "Aktif",
    deskripsi: "Diskon 10% untuk perlengkapan pesta dan snack anabul.",
  },
  {
    kode: "LEBARAN25",
    nama: "Promo Mudik Lebaran Penitipan 20%",
    tipe: "persen",
    nilai: 20,
    minBelanja: 200000,
    berlakuSampai: "2026-04-05",
    kuota: 0,
    status: "Kedaluwarsa",
    deskripsi: "Diskon paket pet hotel musim liburan.",
  },
];

export interface MemberBalance {
  id: string; // e.g. "CUST-002"
  nama: string;
  telepon: string;
  nomorKartu: string;
  tier: MemberTier;
  poin: number;
  totalBelanja: number;
  tanggalBergabung: string;
}

export const initialMemberBalances: MemberBalance[] = [
  {
    id: "CUST-002",
    nama: "Rina Sari",
    telepon: "0812-3456-7890",
    nomorKartu: "PAW-GOLD-002",
    tier: "Gold",
    poin: 820,
    totalBelanja: 6200000,
    tanggalBergabung: "2025-01-15",
  },
  {
    id: "CUST-003",
    nama: "Andri Pratama",
    telepon: "0813-8899-1122",
    nomorKartu: "PAW-SLVR-003",
    tier: "Silver",
    poin: 410,
    totalBelanja: 2750000,
    tanggalBergabung: "2025-03-20",
  },
  {
    id: "CUST-004",
    nama: "Siti Nurhaliza",
    telepon: "0817-5544-3322",
    nomorKartu: "PAW-BRNZ-004",
    tier: "Bronze",
    poin: 120,
    totalBelanja: 850000,
    tanggalBergabung: "2025-06-10",
  },
  {
    id: "CUST-005",
    nama: "Budi Santoso",
    telepon: "0856-1234-9988",
    nomorKartu: "PAW-BRNZ-005",
    tier: "Bronze",
    poin: 95,
    totalBelanja: 950000,
    tanggalBergabung: "2025-07-02",
  },
];

export interface RewardItem {
  id: string;
  nama: string;
  poinRequired: number;
  poinDibutuhkan: number;
  kategori: "Voucher" | "Layanan Gratis" | "Diskon";
  icon: string;
  deskripsi: string;
  voucherCodeGenerated: string;
}

export const rewardCatalog: RewardItem[] = [
  {
    id: "RWD-01",
    nama: "Voucher Belanja Rp 10.000",
    poinRequired: 100,
    poinDibutuhkan: 100,
    kategori: "Voucher",
    icon: "🎟️",
    deskripsi: "Klaim potongan Rp 10.000 untuk belanja apa saja di kasir.",
    voucherCodeGenerated: "REWARD10K",
  },
  {
    id: "RWD-02",
    nama: "Gratis Potong Kuku & Bersih Telinga",
    poinRequired: 150,
    poinDibutuhkan: 150,
    kategori: "Layanan Gratis",
    icon: "🐾",
    deskripsi: "Layanan grooming potong kuku gratis senilai Rp 30.000.",
    voucherCodeGenerated: "FREENAIL",
  },
  {
    id: "RWD-03",
    nama: "Diskon 15% Semua Paket Grooming",
    poinRequired: 250,
    poinDibutuhkan: 250,
    kategori: "Diskon",
    icon: "✂️",
    deskripsi: "Kupon diskon 15% untuk paket grooming tanpa minimum belanja.",
    voucherCodeGenerated: "RWDGROOM15",
  },
  {
    id: "RWD-04",
    nama: "Gratis Mandi Biasa (Basic Bath)",
    poinRequired: 400,
    poinDibutuhkan: 400,
    kategori: "Layanan Gratis",
    icon: "🛁",
    deskripsi: "Satu sesi mandi lengkap anabul gratis senilai hingga Rp 100.000.",
    voucherCodeGenerated: "FREEBATH",
  },
];

export interface PointHistoryRecord {
  id: string;
  tanggal: string;
  pelangganId: string;
  memberId?: string;
  keterangan: string;
  perubahanPoin: number; // positif atau negatif
  perubahan: number;
  saldoAkhir: number;
  tipe: "Belanja" | "Layanan Jasa (2x)" | "Bonus Ultah" | "Penukaran Hadiah" | "Kedaluwarsa";
}

export const initialPointHistory: PointHistoryRecord[] = [
  { id: "LOG-01", tanggal: "2026-10-11 14:15", pelangganId: "CUST-002", memberId: "CUST-002", keterangan: "Belanja Produk Kasir TRX-0018", perubahanPoin: 24, perubahan: 24, saldoAkhir: 820, tipe: "Belanja" },
  { id: "LOG-02", tanggal: "2026-10-10 11:30", pelangganId: "CUST-002", memberId: "CUST-002", keterangan: "Layanan Grooming Mandi Biasa (Poin 2x)", perubahanPoin: 10, perubahan: 10, saldoAkhir: 796, tipe: "Layanan Jasa (2x)" },
  { id: "LOG-03", tanggal: "2026-10-05 16:00", pelangganId: "CUST-002", memberId: "CUST-002", keterangan: "Tukar Hadiah Voucher Diskon 15%", perubahanPoin: -250, perubahan: -250, saldoAkhir: 786, tipe: "Penukaran Hadiah" },
  { id: "LOG-04", tanggal: "2026-09-20 10:00", pelangganId: "CUST-002", memberId: "CUST-002", keterangan: "Bonus Ulang Tahun Anabul 'Mochi'", perubahanPoin: 50, perubahan: 50, saldoAkhir: 1036, tipe: "Bonus Ultah" },
  { id: "LOG-05", tanggal: "2026-09-12 13:45", pelangganId: "CUST-002", memberId: "CUST-002", keterangan: "Penitipan Kucing 3 Malam (Poin 2x)", perubahanPoin: 54, perubahan: 54, saldoAkhir: 986, tipe: "Layanan Jasa (2x)" },
  { id: "LOG-06", tanggal: "2026-08-15 15:20", pelangganId: "CUST-003", memberId: "CUST-003", keterangan: "Belanja Pakan Anjing Pro Plan", perubahanPoin: 26, perubahan: 26, saldoAkhir: 410, tipe: "Belanja" },
  { id: "LOG-07", tanggal: "2026-08-01 09:30", pelangganId: "CUST-003", memberId: "CUST-003", keterangan: "Paket Grooming Lengkap Bruno (2x)", perubahanPoin: 56, perubahan: 56, saldoAkhir: 384, tipe: "Layanan Jasa (2x)" },
  { id: "LOG-08", tanggal: "2026-07-22 17:00", pelangganId: "CUST-004", memberId: "CUST-004", keterangan: "Vaksinasi Luna di PawMart", perubahanPoin: 24, perubahan: 24, saldoAkhir: 120, tipe: "Layanan Jasa (2x)" },
];
