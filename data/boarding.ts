export type CageType = "Standar" | "Premium" | "VIP";
export type CageStatus = "Terisi" | "Kosong" | "Tersedia" | "Perlu Dibersihkan";

export interface CagePenghuni {
  stayId: string;
  pelangganNama: string;
  hewanNama: string;
  tanggalKeluar: string;
}

export interface CageRoom {
  id: string; // e.g., "S-1", "P-1", "V-1"
  nomor: string;
  nama: string;
  tipe: CageType;
  tarifPerMalam: number;
  status: CageStatus;
  currentStayId?: string; // id dari BoardingStay jika terisi
  penghuniSaatIni?: CagePenghuni;
}

export type Cage = CageRoom;
export type CageRecord = CageRoom;

export const cageRates: Record<CageType, { label: string; perMalam: number; deskripsi: string; fasilitas: string[] }> = {
  Standar: {
    label: "Standar",
    perMalam: 60000,
    deskripsi: "Kandang besi luas 70x60cm, matras empuk, dan sirkulasi udara baik.",
    fasilitas: ["Matras busa", "Tempat makan stainless", "Litter box bersih"],
  },
  Premium: {
    label: "Premium",
    perMalam: 90000,
    deskripsi: "Kamar bertingkat 90x80cm, area bermain mini, dan sesi jalan santai.",
    fasilitas: ["Kamar 2 tingkat", "Sesi main 2x sehari", "Update foto harian"],
  },
  VIP: {
    label: "VIP (Ber-AC)",
    perMalam: 130000,
    deskripsi: "Kamar kaca privat eksklusif ber-AC 24 jam dengan live camera monitoring.",
    fasilitas: ["Ruangan ber-AC 24 jam", "Kasur ortopedi", "CCTV monitoring", "Grooming gratis > 5 malam"],
  },
};

export const initialCages: CageRoom[] = [
  {
    id: "S-1",
    nomor: "Kandang S-01",
    nama: "Kandang Standar 1",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Terisi",
    currentStayId: "STAY-01",
    penghuniSaatIni: {
      stayId: "STAY-01",
      pelangganNama: "Siti Nurhaliza",
      hewanNama: "Luna",
      tanggalKeluar: "2026-10-14",
    },
  },
  {
    id: "S-2",
    nomor: "Kandang S-02",
    nama: "Kandang Standar 2",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Terisi",
    currentStayId: "STAY-02",
    penghuniSaatIni: {
      stayId: "STAY-02",
      pelangganNama: "Budi Santoso",
      hewanNama: "Milo",
      tanggalKeluar: "2026-10-12",
    },
  },
  {
    id: "S-3",
    nomor: "Kandang S-03",
    nama: "Kandang Standar 3",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Terisi",
    currentStayId: "STAY-03",
    penghuniSaatIni: {
      stayId: "STAY-03",
      pelangganNama: "Dewi Lestari",
      hewanNama: "Simba",
      tanggalKeluar: "2026-10-13",
    },
  },
  {
    id: "S-4",
    nomor: "Kandang S-04",
    nama: "Kandang Standar 4",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Terisi",
    currentStayId: "STAY-04",
    penghuniSaatIni: {
      stayId: "STAY-04",
      pelangganNama: "Maya Angelia",
      hewanNama: "Chiki",
      tanggalKeluar: "2026-10-15",
    },
  },
  {
    id: "S-5",
    nomor: "Kandang S-05",
    nama: "Kandang Standar 5",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Kosong",
  },
  {
    id: "S-6",
    nomor: "Kandang S-06",
    nama: "Kandang Standar 6",
    tipe: "Standar",
    tarifPerMalam: 60000,
    status: "Perlu Dibersihkan",
  },
  {
    id: "P-1",
    nomor: "Kandang P-01",
    nama: "Kandang Premium 1",
    tipe: "Premium",
    tarifPerMalam: 90000,
    status: "Terisi",
    currentStayId: "STAY-05",
    penghuniSaatIni: {
      stayId: "STAY-05",
      pelangganNama: "Hendra Wijaya",
      hewanNama: "Thor",
      tanggalKeluar: "2026-10-12",
    },
  },
  {
    id: "P-2",
    nomor: "Kandang P-02",
    nama: "Kandang Premium 2",
    tipe: "Premium",
    tarifPerMalam: 90000,
    status: "Terisi",
    currentStayId: "STAY-06",
    penghuniSaatIni: {
      stayId: "STAY-06",
      pelangganNama: "Rina Sari",
      hewanNama: "Mochi",
      tanggalKeluar: "2026-10-12",
    },
  },
  {
    id: "P-3",
    nomor: "Kandang P-03",
    nama: "Kandang Premium 3",
    tipe: "Premium",
    tarifPerMalam: 90000,
    status: "Terisi",
    currentStayId: "STAY-07",
    penghuniSaatIni: {
      stayId: "STAY-07",
      pelangganNama: "Natasha Clarissa",
      hewanNama: "Bella",
      tanggalKeluar: "2026-10-13",
    },
  },
  {
    id: "P-4",
    nomor: "Kandang P-04",
    nama: "Kandang Premium 4",
    tipe: "Premium",
    tarifPerMalam: 90000,
    status: "Kosong",
  },
  {
    id: "V-1",
    nomor: "Kamar VIP-01",
    nama: "Kamar VIP 1 (AC)",
    tipe: "VIP",
    tarifPerMalam: 130000,
    status: "Terisi",
    currentStayId: "STAY-08",
    penghuniSaatIni: {
      stayId: "STAY-08",
      pelangganNama: "Andri Pratama",
      hewanNama: "Bruno",
      tanggalKeluar: "2026-10-13",
    },
  },
  {
    id: "V-2",
    nomor: "Kamar VIP-02",
    nama: "Kamar VIP 2 (AC)",
    tipe: "VIP",
    tarifPerMalam: 130000,
    status: "Kosong",
  },
];
