export interface StockMutation {
  id: string;
  tanggal: string;
  produkId: string;
  produkNama: string;
  jenis: "Masuk" | "Keluar" | "Penyesuaian";
  jumlah: number;
  stokSebelum: number;
  stokSesudah: number;
  alasan: "Pembelian / Restock" | "Penjualan Kasir" | "Barang Rusak / Bocor" | "Stok Opname" | "Kedaluwarsa";
  keterangan: string;
  petugas: string;
}

export const initialStockMutations: StockMutation[] = [
  {
    id: "MUT-001",
    tanggal: "2025-10-18 16:45",
    produkId: "PROD-001",
    produkNama: "Royal Canin Adult Cat 1kg",
    jenis: "Keluar",
    jumlah: 1,
    stokSebelum: 19,
    stokSesudah: 18,
    alasan: "Penjualan Kasir",
    keterangan: "Transaksi TRX-0018",
    petugas: "Admin",
  },
  {
    id: "MUT-002",
    tanggal: "2025-10-18 11:30",
    produkId: "PROD-006",
    produkNama: "Pasir Kucing Bento Gumpal Apel 10L",
    jenis: "Keluar",
    jumlah: 6,
    stokSebelum: 10,
    stokSesudah: 4,
    alasan: "Penjualan Kasir",
    keterangan: "Penjualan borongan pelanggan",
    petugas: "Admin",
  },
  {
    id: "MUT-003",
    tanggal: "2025-10-17 14:00",
    produkId: "PROD-014",
    produkNama: "Kandang Kucing 2 Tingkat Roda",
    jenis: "Keluar",
    jumlah: 2,
    stokSebelum: 2,
    stokSesudah: 0,
    alasan: "Penjualan Kasir",
    keterangan: "Terjual habis di toko",
    petugas: "Admin",
  },
  {
    id: "MUT-004",
    tanggal: "2025-10-17 09:15",
    produkId: "PROD-010",
    produkNama: "Nutri-Plus Gel Virbac 120g",
    jenis: "Penyesuaian",
    jumlah: -1,
    stokSebelum: 4,
    stokSesudah: 3,
    alasan: "Barang Rusak / Bocor",
    keterangan: "Segel tutup tube retak saat display",
    petugas: "Kasir Maya",
  },
  {
    id: "MUT-005",
    tanggal: "2025-10-16 10:00",
    produkId: "PROD-009",
    produkNama: "Me-O Creamy Treats Salmon",
    jenis: "Masuk",
    jumlah: 30,
    stokSebelum: 25,
    stokSesudah: 55,
    alasan: "Pembelian / Restock",
    keterangan: "PO Restock Distributor Me-O #PO-882",
    petugas: "Admin",
  },
  {
    id: "MUT-006",
    tanggal: "2025-10-15 13:40",
    produkId: "PROD-007",
    produkNama: "Pasir Tofu Soya Kopi 7L",
    jenis: "Penyesuaian",
    jumlah: -1,
    stokSebelum: 3,
    stokSesudah: 2,
    alasan: "Stok Opname",
    keterangan: "Selisih hitung fisik saat audit mingguan",
    petugas: "Admin",
  },
];
