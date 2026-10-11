import { CageType } from "./boarding";

export interface DailyLog {
  waktu: string;
  aktivitas: "Makan & Minum" | "Bermain" | "Kondisi Medis / Pup" | "Grooming";
  catatan: string;
  petugas: string;
}

export interface BoardingStay {
  id: string;
  pelangganId: string;
  pelangganNama: string;
  telepon: string;
  kontakDarurat: string;
  hewanNama: string;
  hewanJenis: string;
  hewanRas: string;
  hewanUkuran: "Kecil" | "Sedang" | "Besar";
  hewanIcon: string;
  kandangId: string;
  kandangTipe: CageType;
  tarifPerMalam: number;
  tanggalMasuk: string; // YYYY-MM-DD
  tanggalKeluarRencana: string; // YYYY-MM-DD
  makananBawaan: string;
  obatKhusus?: string;
  catatanKhusus?: string;
  addons: { nama: string; harga: number }[];
  status: "Menginap" | "Check-out" | "Menunggu Check-in";
  jurnalHarian: DailyLog[];
}

export const initialBoardingStays: BoardingStay[] = [
  {
    id: "STAY-08",
    pelangganId: "CUST-003",
    pelangganNama: "Andri Pratama",
    telepon: "0813-8899-1122",
    kontakDarurat: "0812-7777-8888 (Istri)",
    hewanNama: "Bruno",
    hewanJenis: "Anjing",
    hewanRas: "Golden Retriever",
    hewanUkuran: "Besar",
    hewanIcon: "🐕",
    kandangId: "V-1",
    kandangTipe: "VIP",
    tarifPerMalam: 130000,
    tanggalMasuk: "2026-10-09",
    tanggalKeluarRencana: "2026-10-13",
    makananBawaan: "Royal Canin Golden Retriever 2x sehari",
    catatanKhusus: "Sangat ramah, suka diajak lempar bola sore hari",
    addons: [{ nama: "Mandi Biasa saat Check-out", harga: 100000 }],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 08:30", aktivitas: "Makan & Minum", catatan: "Nafsu makan baik, minum 500ml", petugas: "Dewi Lestari" },
      { waktu: "11 Okt 16:00", aktivitas: "Bermain", catatan: "Bermain bola di taman indoor selama 30 menit", petugas: "Bagas Setiawan" },
    ],
  },
  {
    id: "STAY-06",
    pelangganId: "CUST-002",
    pelangganNama: "Rina Sari",
    telepon: "0812-3456-7890",
    kontakDarurat: "0811-2222-3333 (Kakak)",
    hewanNama: "Mochi",
    hewanJenis: "Kucing",
    hewanRas: "British Shorthair",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    kandangId: "P-2",
    kandangTipe: "Premium",
    tarifPerMalam: 90000,
    tanggalMasuk: "2026-10-10",
    tanggalKeluarRencana: "2026-10-12",
    makananBawaan: "Dry food Me-O Salmon & Wet pouch malam",
    catatanKhusus: "Takut suara keras, sediakan selimut favoritnya",
    addons: [],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 09:00", aktivitas: "Makan & Minum", catatan: "Pakan basah habis 1 pouch, pup normal", petugas: "Dewi Lestari" },
    ],
  },
  {
    id: "STAY-01",
    pelangganId: "CUST-004",
    pelangganNama: "Siti Nurhaliza",
    telepon: "0817-5544-3322",
    kontakDarurat: "0819-0000-1111",
    hewanNama: "Luna",
    hewanJenis: "Kucing",
    hewanRas: "Persia Medium",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    kandangId: "S-1",
    kandangTipe: "Standar",
    tarifPerMalam: 60000,
    tanggalMasuk: "2026-10-10",
    tanggalKeluarRencana: "2026-10-14",
    makananBawaan: "Royal Canin Hair & Skin",
    catatanKhusus: "Sisir bulu harian sebelum tidur",
    addons: [{ nama: "Sisir Anti Gumpal", harga: 25000 }],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 10:15", aktivitas: "Makan & Minum", catatan: "Makan teratur, kondisi aktif", petugas: "Dewi Lestari" },
    ],
  },
  {
    id: "STAY-02",
    pelangganId: "CUST-005",
    pelangganNama: "Budi Santoso",
    telepon: "0819-0123-4567",
    kontakDarurat: "0818-4444-5555",
    hewanNama: "Milo",
    hewanJenis: "Anjing",
    hewanRas: "Pomeranian",
    hewanUkuran: "Kecil",
    hewanIcon: "🐶",
    kandangId: "S-2",
    kandangTipe: "Standar",
    tarifPerMalam: 60000,
    tanggalMasuk: "2026-10-09",
    tanggalKeluarRencana: "2026-10-12",
    makananBawaan: "Pro Plan Small Breed",
    catatanKhusus: "Gigi sensitif, kibble dicampur air hangat",
    addons: [],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 07:45", aktivitas: "Makan & Minum", catatan: "Sarapan habis tuntas", petugas: "Bagas Setiawan" },
    ],
  },
  {
    id: "STAY-03",
    pelangganId: "CUST-006",
    pelangganNama: "Dewi Lestari",
    telepon: "0815-7766-5544",
    kontakDarurat: "0816-1234-5678",
    hewanNama: "Simba",
    hewanJenis: "Kucing",
    hewanRas: "Maine Coon Mix",
    hewanUkuran: "Sedang",
    hewanIcon: "🦁",
    kandangId: "S-3",
    kandangTipe: "Standar",
    tarifPerMalam: 60000,
    tanggalMasuk: "2026-10-08",
    tanggalKeluarRencana: "2026-10-13",
    makananBawaan: "Whiskas Tuna & Snack Creamy",
    catatanKhusus: "Nafsu makan besar",
    addons: [],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 08:00", aktivitas: "Makan & Minum", catatan: "Sarapan 1 porsi habis", petugas: "Dewi Lestari" },
    ],
  },
  {
    id: "STAY-04",
    pelangganId: "CUST-008",
    pelangganNama: "Maya Angelia",
    telepon: "0812-9988-7766",
    kontakDarurat: "0813-9876-5432",
    hewanNama: "Chiki",
    hewanJenis: "Kucing",
    hewanRas: "Scottish Fold",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    kandangId: "S-4",
    kandangTipe: "Standar",
    tarifPerMalam: 60000,
    tanggalMasuk: "2026-10-11",
    tanggalKeluarRencana: "2026-10-15",
    makananBawaan: "Royal Canin Kitten",
    catatanKhusus: "Bersihkan lipatan telinga tiap pagi",
    addons: [{ nama: "Bersih Telinga", harga: 30000 }],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 11:30", aktivitas: "Kondisi Medis / Pup", catatan: "Check-in sukses, suhu 38.4 C normal", petugas: "Dewi Lestari" },
    ],
  },
  {
    id: "STAY-05",
    pelangganId: "CUST-007",
    pelangganNama: "Hendra Wijaya",
    telepon: "0821-4433-2211",
    kontakDarurat: "0812-5555-6666",
    hewanNama: "Thor",
    hewanJenis: "Anjing",
    hewanRas: "Siberian Husky",
    hewanUkuran: "Besar",
    hewanIcon: "🐺",
    kandangId: "P-1",
    kandangTipe: "Premium",
    tarifPerMalam: 90000,
    tanggalMasuk: "2026-10-09",
    tanggalKeluarRencana: "2026-10-12",
    makananBawaan: "Raw beef & kibble Pedigree",
    catatanKhusus: "Wajib ruangan sejuk dan air minum dingin berlimpah",
    addons: [],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 15:30", aktivitas: "Bermain", catatan: "Lari santai di lapangan rumput buatan", petugas: "Bagas Setiawan" },
    ],
  },
  {
    id: "STAY-07",
    pelangganId: "CUST-010",
    pelangganNama: "Natasha Clarissa",
    telepon: "0811-2233-4455",
    kontakDarurat: "0812-3333-4444",
    hewanNama: "Bella",
    hewanJenis: "Anjing",
    hewanRas: "Toy Poodle",
    hewanUkuran: "Kecil",
    hewanIcon: "🐩",
    kandangId: "P-3",
    kandangTipe: "Premium",
    tarifPerMalam: 90000,
    tanggalMasuk: "2026-10-10",
    tanggalKeluarRencana: "2026-10-13",
    makananBawaan: "Royal Canin Poodle Adult",
    catatanKhusus: "Sangat manja, minta ditemani saat makan",
    addons: [{ nama: "Parfum Vanilla", harga: 15000 }],
    status: "Menginap",
    jurnalHarian: [
      { waktu: "11 Okt 12:00", aktivitas: "Makan & Minum", catatan: "Makan siang ditemani staf, habis", petugas: "Dewi Lestari" },
    ],
  },
];
