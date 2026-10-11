export interface StaffMember {
  id: string;
  nama: string;
  peran: "Groomer" | "Dokter Hewan" | "Kasir" | "Owner / Admin";
  avatar: string;
  spesialisasi: string;
  rating: number;
  totalLayananSelesai: number;
  isAvailable: boolean;
}

export const initialStaffMembers: StaffMember[] = [
  {
    id: "STF-01",
    nama: "Dewi Lestari",
    peran: "Groomer",
    avatar: "✂️",
    spesialisasi: "Grooming Kucing & Styling Bulu Halus",
    rating: 4.9,
    totalLayananSelesai: 342,
    isAvailable: true,
  },
  {
    id: "STF-02",
    nama: "Bagas Setiawan",
    peran: "Groomer",
    avatar: "🛁",
    spesialisasi: "Grooming Anjing Ras Besar & Treatment Anti Kutu",
    rating: 4.8,
    totalLayananSelesai: 289,
    isAvailable: true,
  },
  {
    id: "STF-03",
    nama: "drh. Maya Putri",
    peran: "Dokter Hewan",
    avatar: "🩺",
    spesialisasi: "Vaksinasi, Kesehatan Kulit, & Nutrisi",
    rating: 5.0,
    totalLayananSelesai: 175,
    isAvailable: true,
  },
  {
    id: "STF-04",
    nama: "Rudi Hartono",
    peran: "Kasir",
    avatar: "👩‍💼",
    spesialisasi: "Kasir POS, Reservasi, & Customer Service",
    rating: 4.9,
    totalLayananSelesai: 512,
    isAvailable: true,
  },
];
