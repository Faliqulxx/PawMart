export interface StoreProfile {
  namaToko: string;
  slogan: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  catatanStruk: string;
}

export interface StaffUser {
  id: string;
  nama: string;
  email: string;
  role: "Admin" | "Kasir" | "Groomer";
  avatar: string;
  status: "Aktif" | "Nonaktif";
  loginTerakhir: string;
}

export interface ReceiptSettings {
  lebarKertas: "58mm" | "80mm";
  tampilkanLogo: boolean;
  tampilkanAlamat: boolean;
  tampilkanKontak: boolean;
  tampilkanPoinPelanggan: boolean;
  pesanPenutup: string;
}

export interface TaxSettings {
  pajakAktif: boolean;
  persentasePajak: number;
  biayaLayananAktif: boolean;
  nominalBiayaLayanan: number;
}

export const initialStoreProfile: StoreProfile = {
  namaToko: "PawMart Pet Care & Shop",
  slogan: "Pusat Kebutuhan Anabul Terlengkap & Terpercaya",
  alamat: "Jl. Kemang Raya No. 42A, Mampang Prapatan, Jakarta Selatan 12730",
  telepon: "021-7890123 / 0812-9988-7766",
  email: "support@pawmart.id",
  website: "www.pawmart.id",
  catatanStruk: "Terima kasih telah berbelanja di PawMart! Barang yang sudah dibeli dapat ditukar maksimal 2 hari dengan membawa struk ini.",
};

export const initialStaff: StaffUser[] = [
  {
    id: "USER-001",
    nama: "Admin Toko (Budi)",
    email: "admin@pawmart.id",
    role: "Admin",
    avatar: "👤",
    status: "Aktif",
    loginTerakhir: "Hari ini, 08:30 WIB",
  },
  {
    id: "USER-002",
    nama: "Maya Kasir",
    email: "maya.kasir@pawmart.id",
    role: "Kasir",
    avatar: "👩‍💼",
    status: "Aktif",
    loginTerakhir: "Hari ini, 07:55 WIB",
  },
  {
    id: "USER-003",
    nama: "Rifki Groomer",
    email: "rifki.grooming@pawmart.id",
    role: "Groomer",
    avatar: "✂️",
    status: "Aktif",
    loginTerakhir: "Kemarin, 17:00 WIB",
  },
];

export const initialReceiptSettings: ReceiptSettings = {
  lebarKertas: "58mm",
  tampilkanLogo: true,
  tampilkanAlamat: true,
  tampilkanKontak: true,
  tampilkanPoinPelanggan: true,
  pesanPenutup: "PawMart — Sahabat Setia Hewan Kesayangan Anda 🐾",
};

export const initialTaxSettings: TaxSettings = {
  pajakAktif: false,
  persentasePajak: 11,
  biayaLayananAktif: false,
  nominalBiayaLayanan: 2000,
};
