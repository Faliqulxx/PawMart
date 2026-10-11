export interface ServiceTierPrice {
  kecil: number;
  sedang: number;
  besar: number;
}

export interface ServiceAddon {
  id: string;
  nama: string;
  harga: number;
}

export interface ServiceItem {
  id: string;
  nama: string;
  kategori: "Grooming" | "Paket" | "Kesehatan" | "Penitipan";
  durasi: number; // dalam menit
  harga: ServiceTierPrice;
  deskripsi: string;
  icon: string;
  isActive: boolean;
  isiPaket?: string[];
}

export const serviceAddons: ServiceAddon[] = [
  { id: "ADD-01", nama: "Bulu Kusut / Detangling", harga: 25000 },
  { id: "ADD-02", nama: "Parfum Khusus Aroma Strawberry / Vanilla", harga: 15000 },
  { id: "ADD-03", nama: "Obat Kutu Tetes Spot-On", harga: 45000 },
  { id: "ADD-04", nama: "Sikat Gigi & Bersih Karang Gigi Ringan", harga: 30000 },
];

export const initialServices: ServiceItem[] = [
  {
    id: "SRV-001",
    nama: "Mandi Biasa (Basic Bath)",
    kategori: "Grooming",
    durasi: 45,
    harga: { kecil: 50000, sedang: 70000, besar: 100000 },
    deskripsi: "Mandi bersih dengan shampoo herbal, pengeringan blower lembut, dan sisir bulu.",
    icon: "🛁",
    isActive: true,
  },
  {
    id: "SRV-002",
    nama: "Mandi Anti Kutu & Jamur (Medicated)",
    kategori: "Grooming",
    durasi: 60,
    harga: { kecil: 80000, sedang: 100000, besar: 140000 },
    deskripsi: "Terapi mandi dengan shampoo sulfur anti-parasit dan anti-fungal untuk kulit sensitif.",
    icon: "🧼",
    isActive: true,
  },
  {
    id: "SRV-003",
    nama: "Potong Rambut & Styling (Haircut)",
    kategori: "Grooming",
    durasi: 90,
    harga: { kecil: 90000, sedang: 120000, besar: 170000 },
    deskripsi: "Cukur rapi higienis atau potongan model lucu (Teddy Bear, Lion Cut, Summer Cut).",
    icon: "✂️",
    isActive: true,
  },
  {
    id: "SRV-004",
    nama: "Potong Kuku & Bersih Telinga",
    kategori: "Grooming",
    durasi: 20,
    harga: { kecil: 30000, sedang: 40000, besar: 50000 },
    deskripsi: "Perapian kuku anabul agar tidak tajam dan pembersihan ear canal dari ear mite.",
    icon: "🐾",
    isActive: true,
  },
  {
    id: "SRV-005",
    nama: "Paket Grooming Lengkap (Full Spa)",
    kategori: "Paket",
    durasi: 120,
    harga: { kecil: 150000, sedang: 200000, besar: 280000 },
    deskripsi: "Paket hemat lengkap: Mandi medicated + potong rambut styling + potong kuku + bersih telinga + semprot parfum.",
    icon: "⭐",
    isActive: true,
    isiPaket: [
      "Mandi Anti Kutu & Jamur",
      "Potong Rambut & Styling",
      "Potong Kuku & Bersih Telinga",
      "Parfum & Vitamin Bulu",
    ],
  },
  {
    id: "SRV-006",
    nama: "Vaksinasi Anabul",
    kategori: "Kesehatan",
    durasi: 30,
    harga: { kecil: 120000, sedang: 150000, besar: 180000 },
    deskripsi: "Penyuntikan vaksin dasar (Tricat/Tetracat/Eurican/Rabies) oleh dokter hewan bersertifikat.",
    icon: "💉",
    isActive: true,
  },
  {
    id: "SRV-007",
    nama: "Konsultasi Dokter Hewan",
    kategori: "Kesehatan",
    durasi: 30,
    harga: { kecil: 100000, sedang: 100000, besar: 100000 },
    deskripsi: "Pemeriksaan kesehatan fisik, cek suhu, telinga, mata, gigi, dan konsultasi nutrisi anabul.",
    icon: "🩺",
    isActive: true,
  },
];
