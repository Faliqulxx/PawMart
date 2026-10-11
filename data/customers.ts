export interface Pet {
  id: string;
  nama: string;
  jenis: "Kucing" | "Anjing" | "Kelinci" | "Hamster" | "Burung";
  ras: string;
  umur: string;
  berat: string;
  vaksinTerakhir: string;
  jadwalVaksinBerikutnya: string;
  catatanKhusus?: string;
  icon: string;
}

export interface Customer {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  alamat: string;
  totalBelanja: number;
  poin: number;
  kunjunganTerakhir: string;
  pets: Pet[];
}

export const initialCustomers: Customer[] = [
  {
    id: "CUST-001",
    nama: "Pelanggan Umum",
    telepon: "-",
    email: "-",
    alamat: "Kasir Langsung",
    totalBelanja: 12500000,
    poin: 0,
    kunjunganTerakhir: "2025-10-18",
    pets: [],
  },
  {
    id: "CUST-002",
    nama: "Rina Sari",
    telepon: "0812-3456-7890",
    email: "rina.sari@gmail.com",
    alamat: "Jl. Kemang Raya No. 42, Jakarta Selatan",
    totalBelanja: 4850000,
    poin: 485,
    kunjunganTerakhir: "2025-10-18",
    pets: [
      {
        id: "PET-001",
        nama: "Mochi",
        jenis: "Kucing",
        ras: "British Shorthair",
        umur: "2 Tahun",
        berat: "4.2 kg",
        vaksinTerakhir: "Tricat (12 Mei 2025)",
        jadwalVaksinBerikutnya: "Rabies - 15 Nov 2025",
        catatanKhusus: "Alergi pakan berbahan dasar jagung",
        icon: "🐱",
      },
      {
        id: "PET-002",
        nama: "Oreo",
        jenis: "Kucing",
        ras: "Domestik Mix",
        umur: "1 Tahun",
        berat: "3.5 kg",
        vaksinTerakhir: "Rabies (10 Jun 2025)",
        jadwalVaksinBerikutnya: "Booster Feline - 20 Des 2025",
        catatanKhusus: "Sangat aktif dan gemar bermain bola bulu",
        icon: "🐈",
      },
    ],
  },
  {
    id: "CUST-003",
    nama: "Andri Pratama",
    telepon: "0813-8899-1122",
    email: "andri.pratama@yahoo.com",
    alamat: "Jl. Bangka VII No. 15, Mampang Prapatan",
    totalBelanja: 3200000,
    poin: 320,
    kunjunganTerakhir: "2025-10-17",
    pets: [
      {
        id: "PET-003",
        nama: "Bruno",
        jenis: "Anjing",
        ras: "Golden Retriever",
        umur: "3 Tahun",
        berat: "28.5 kg",
        vaksinTerakhir: "DHPPiL (05 Apr 2025)",
        jadwalVaksinBerikutnya: "Rabies & Cacing - 05 Nov 2025",
        catatanKhusus: "Rutin grooming 2 minggu sekali",
        icon: "🐕",
      },
    ],
  },
  {
    id: "CUST-004",
    nama: "Siti Nurhaliza",
    telepon: "0817-5544-3322",
    email: "siti.nurhaliza@gmail.com",
    alamat: "Jl. Antasari Permai Blok C3, Jakarta Selatan",
    totalBelanja: 2950000,
    poin: 295,
    kunjunganTerakhir: "2025-10-17",
    pets: [
      {
        id: "PET-004",
        nama: "Luna",
        jenis: "Kucing",
        ras: "Persia Medium",
        umur: "1.5 Tahun",
        berat: "3.8 kg",
        vaksinTerakhir: "Tricat (18 Jan 2025)",
        jadwalVaksinBerikutnya: "Tetracat - 10 Des 2025",
        catatanKhusus: "Perlu sisir bulu harian untuk cegah hairball",
        icon: "🐱",
      },
    ],
  },
  {
    id: "CUST-005",
    nama: "Budi Santoso",
    telepon: "0819-0123-4567",
    email: "budi.santoso@outlook.com",
    alamat: "Jl. Ampera Raya No. 8, Cilandak",
    totalBelanja: 5400000,
    poin: 540,
    kunjunganTerakhir: "2025-10-16",
    pets: [
      {
        id: "PET-005",
        nama: "Milo",
        jenis: "Anjing",
        ras: "Pomeranian",
        umur: "4 Tahun",
        berat: "3.1 kg",
        vaksinTerakhir: "Rabies (14 Feb 2025)",
        jadwalVaksinBerikutnya: "Vaksin Tahunan - 14 Feb 2026",
        catatanKhusus: "Gigi sensitif, lebih cocok pakan soft kibble",
        icon: "🐶",
      },
      {
        id: "PET-006",
        nama: "Koko",
        jenis: "Kelinci",
        ras: "Netherland Dwarf",
        umur: "10 Bulan",
        berat: "1.0 kg",
        vaksinTerakhir: "VHD (01 Agu 2025)",
        jadwalVaksinBerikutnya: "Pemeriksaan Gigi - 01 Nov 2025",
        catatanKhusus: "Pemberian rumput timothy hay tanpa batas",
        icon: "🐰",
      },
    ],
  },
  {
    id: "CUST-006",
    nama: "Dewi Lestari",
    telepon: "0815-7766-5544",
    email: "dewi.lestari@gmail.com",
    alamat: "Jl. Fatmawati No. 90, Jakarta Selatan",
    totalBelanja: 1850000,
    poin: 185,
    kunjunganTerakhir: "2025-10-15",
    pets: [
      {
        id: "PET-007",
        nama: "Simba",
        jenis: "Kucing",
        ras: "Maine Coon Mix",
        umur: "8 Bulan",
        berat: "4.8 kg",
        vaksinTerakhir: "Feline 4-in-1 (15 Sep 2025)",
        jadwalVaksinBerikutnya: "Rabies - 20 Nov 2025",
        catatanKhusus: "Nafsu makan sangat tinggi, masa pertumbuhan pesat",
        icon: "🦁",
      },
    ],
  },
  {
    id: "CUST-007",
    nama: "Hendra Wijaya",
    telepon: "0821-4433-2211",
    email: "hendra.w@wjayagroup.id",
    alamat: "Apartemen Kemang Village Tower Infinity 12A",
    totalBelanja: 7600000,
    poin: 760,
    kunjunganTerakhir: "2025-10-15",
    pets: [
      {
        id: "PET-008",
        nama: "Thor",
        jenis: "Anjing",
        ras: "Siberian Husky",
        umur: "2.5 Tahun",
        berat: "24.0 kg",
        vaksinTerakhir: "Eurican (20 Mar 2025)",
        jadwalVaksinBerikutnya: "Rabies Booster - 25 Des 2025",
        catatanKhusus: "Ruangan harus berpendingin AC",
        icon: "🐺",
      },
    ],
  },
  {
    id: "CUST-008",
    nama: "Maya Angelia",
    telepon: "0812-9988-7766",
    email: "maya.angelia@gmail.com",
    alamat: "Jl. Cipete Raya No. 18, Kebayoran Baru",
    totalBelanja: 2150000,
    poin: 215,
    kunjunganTerakhir: "2025-10-14",
    pets: [
      {
        id: "PET-009",
        nama: "Chiki",
        jenis: "Kucing",
        ras: "Scottish Fold",
        umur: "1 Tahun",
        berat: "3.2 kg",
        vaksinTerakhir: "Tricat (10 Jul 2025)",
        jadwalVaksinBerikutnya: "Rabies - 10 Jan 2026",
        catatanKhusus: "Telinga lipat memerlukan pembersihan rutin",
        icon: "🐱",
      },
    ],
  },
  {
    id: "CUST-009",
    nama: "Fajar Nugraha",
    telepon: "0878-1122-3344",
    email: "fajar.nugraha@techcorp.co.id",
    alamat: "Jl. Benda No. 33, Cilandak Timur",
    totalBelanja: 1420000,
    poin: 142,
    kunjunganTerakhir: "2025-10-13",
    pets: [
      {
        id: "PET-010",
        nama: "Cookie",
        jenis: "Hamster",
        ras: "Roborovski",
        umur: "6 Bulan",
        berat: "35 gram",
        vaksinTerakhir: "Pemeriksaan Parasit (12 Agu 2025)",
        jadwalVaksinBerikutnya: "Kontrol Kesehatan - 12 Nov 2025",
        catatanKhusus: "Suka camilan biji bunga matahari",
        icon: "🐹",
      },
    ],
  },
  {
    id: "CUST-010",
    nama: "Natasha Clarissa",
    telepon: "0811-2233-4455",
    email: "natasha.c@gmail.com",
    alamat: "Jl. Bangka Barat No. 5B, Kemang",
    totalBelanja: 6300000,
    poin: 630,
    kunjunganTerakhir: "2025-10-12",
    pets: [
      {
        id: "PET-011",
        nama: "Bella",
        jenis: "Anjing",
        ras: "Toy Poodle",
        umur: "3 Tahun",
        berat: "3.8 kg",
        vaksinTerakhir: "Vanguard Plus 5 (11 Feb 2025)",
        jadwalVaksinBerikutnya: "Booster Tahunan - 11 Feb 2026",
        catatanKhusus: "Grooming model teddy bear setiap 3 minggu",
        icon: "🐩",
      },
      {
        id: "PET-012",
        nama: "Bowie",
        jenis: "Kucing",
        ras: "Ragdoll",
        umur: "1.2 Tahun",
        berat: "4.5 kg",
        vaksinTerakhir: "Nobivac Tricat (05 Mei 2025)",
        jadwalVaksinBerikutnya: "Rabies - 15 Nov 2025",
        catatanKhusus: "Mata biru sensitif sinar matahari langsung",
        icon: "🐈",
      },
    ],
  },
];
