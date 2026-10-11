"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle2,
  Receipt,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Phone,
  Calendar,
  MoreVertical,
  Check,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { LayananNav } from "@/components/layanan/LayananNav";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { initialStaffMembers } from "@/data/staff";
import { initialServices, serviceAddons } from "@/data/services";
import { initialCustomers } from "@/data/customers";
import { initialBookings, BookingRecord } from "@/data/bookings";

export interface QueueItem {
  id: string; // e.g. "Q-101"
  bookingId?: string;
  nomorAntrean: string;
  pelangganNama: string;
  pelangganTelepon: string;
  hewanNama: string;
  hewanJenis: "Kucing" | "Anjing" | "Kelinci";
  hewanRas: string;
  hewanUkuran: "Kecil" | "Sedang" | "Besar";
  hewanIcon: string;
  layananNama: string;
  layananKategori: string;
  addons?: { nama: string; harga: number }[];
  stafNama: string;
  jamMulai?: string;
  estimasiSelesai?: string;
  durasiMenit: number;
  totalHarga: number;
  catatan?: string;
  status: "Menunggu" | "Diproses" | "Selesai";
  waktuDibuat: string;
}

const initialQueueList: QueueItem[] = [
  {
    id: "Q-101",
    bookingId: "BK-0024",
    nomorAntrean: "A-01",
    pelangganNama: "Rina Sari",
    pelangganTelepon: "0812-3456-7890",
    hewanNama: "Luna",
    hewanJenis: "Kucing",
    hewanRas: "Persia Medium",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    layananNama: "Potong Kuku & Bersih Telinga",
    layananKategori: "Grooming",
    stafNama: "Dewi Lestari",
    durasiMenit: 20,
    totalHarga: 30000,
    catatan: "Kucing sedikit sensitif saat telinga disentuh",
    status: "Menunggu",
    waktuDibuat: "09:15",
  },
  {
    id: "Q-102",
    nomorAntrean: "A-02",
    pelangganNama: "Siti Nurhaliza",
    pelangganTelepon: "0817-5544-3322",
    hewanNama: "Kiko",
    hewanJenis: "Anjing",
    hewanRas: "Pomeranian",
    hewanUkuran: "Kecil",
    hewanIcon: "🐕",
    layananNama: "Mandi Biasa (Basic Bath)",
    layananKategori: "Grooming",
    addons: [{ nama: "Parfum Khusus Aroma Strawberry", harga: 15000 }],
    stafNama: "Dewi Lestari",
    jamMulai: "10:10",
    estimasiSelesai: "10:55",
    durasiMenit: 45,
    totalHarga: 65000,
    catatan: "Gunakan shampoo hypoallergenic, jangan kena mata",
    status: "Diproses",
    waktuDibuat: "09:45",
  },
  {
    id: "Q-103",
    bookingId: "BK-0022",
    nomorAntrean: "A-03",
    pelangganNama: "Andri Pratama",
    pelangganTelepon: "0813-8899-1122",
    hewanNama: "Bruno",
    hewanJenis: "Anjing",
    hewanRas: "Golden Retriever",
    hewanUkuran: "Besar",
    hewanIcon: "🐕",
    layananNama: "Paket Grooming Lengkap",
    layananKategori: "Paket",
    addons: [{ nama: "Detangling Bulu Kusut", harga: 25000 }],
    stafNama: "Bagas Setiawan",
    jamMulai: "10:30",
    estimasiSelesai: "12:30",
    durasiMenit: 120,
    totalHarga: 305000,
    catatan: "Bulu lebat sekali, potong rapih kuku dan telapak kaki",
    status: "Diproses",
    waktuDibuat: "10:00",
  },
  {
    id: "Q-104",
    bookingId: "BK-0021",
    nomorAntrean: "A-04",
    pelangganNama: "Rina Sari",
    pelangganTelepon: "0812-3456-7890",
    hewanNama: "Mochi",
    hewanJenis: "Kucing",
    hewanRas: "British Shorthair",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    layananNama: "Mandi Biasa (Basic Bath)",
    layananKategori: "Grooming",
    addons: [{ nama: "Parfum Khusus Aroma Strawberry", harga: 15000 }],
    stafNama: "Dewi Lestari",
    jamMulai: "09:00",
    estimasiSelesai: "09:45",
    durasiMenit: 45,
    totalHarga: 65000,
    catatan: "Sudah selesai dikeringkan dan diberi pita biru",
    status: "Selesai",
    waktuDibuat: "08:50",
  },
  {
    id: "Q-105",
    nomorAntrean: "A-05",
    pelangganNama: "Budi Santoso",
    pelangganTelepon: "0856-1234-9988",
    hewanNama: "Oreo",
    hewanJenis: "Kucing",
    hewanRas: "Domestik",
    hewanUkuran: "Kecil",
    hewanIcon: "🐱",
    layananNama: "Mandi Anti Kutu & Jamur",
    layananKategori: "Grooming",
    stafNama: "Bagas Setiawan",
    jamMulai: "08:30",
    estimasiSelesai: "09:30",
    durasiMenit: 60,
    totalHarga: 80000,
    catatan: "Sudah selesai dan siap dijemput pemilik",
    status: "Selesai",
    waktuDibuat: "08:20",
  },
];

export default function AntreanLayananPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [queueList, setQueueList] = useState<QueueItem[]>(initialQueueList);
  const [selectedStaff, setSelectedStaff] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<"Menunggu" | "Diproses" | "Selesai">("Menunggu");

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

  // New Walk-in Modal
  const [isNewWalkinOpen, setIsNewWalkinOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomers[1].id);
  const [selectedPetName, setSelectedPetName] = useState(initialCustomers[1].pets[0]?.nama || "Mochi");
  const [selectedServiceId, setSelectedServiceId] = useState(initialServices[0].id);
  const [selectedStaffName, setSelectedStaffName] = useState(initialStaffMembers[0].nama);
  const [petSize, setPetSize] = useState<"Kecil" | "Sedang" | "Besar">("Kecil");
  const [newCatatan, setNewCatatan] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return queueList.filter((item) => {
      const matchStaff = selectedStaff === "Semua" || item.stafNama === selectedStaff;
      const matchQuery =
        !searchQuery ||
        item.pelangganNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hewanNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.layananNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomorAntrean.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStaff && matchQuery;
    });
  }, [queueList, selectedStaff, searchQuery]);

  const waitingList = filteredQueue.filter((q) => q.status === "Menunggu");
  const inProgressList = filteredQueue.filter((q) => q.status === "Diproses");
  const completedList = filteredQueue.filter((q) => q.status === "Selesai");

  // Move status handler
  const handleUpdateStatus = (id: string, newStatus: "Menunggu" | "Diproses" | "Selesai") => {
    setQueueList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          let jamMulai = item.jamMulai;
          let estimasiSelesai = item.estimasiSelesai;

          if (newStatus === "Diproses" && !jamMulai) {
            jamMulai = timeStr;
            const end = new Date(now.getTime() + item.durasiMenit * 60000);
            estimasiSelesai = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
          }

          return {
            ...item,
            status: newStatus,
            jamMulai,
            estimasiSelesai,
          };
        }
        return item;
      })
    );

    if (newStatus === "Diproses") {
      showToast("Layanan mulai diproses!", "info");
    } else if (newStatus === "Selesai") {
      showToast("Layanan berhasil ditandai selesai!", "success");
    } else {
      showToast("Status dikembalikan ke Menunggu", "info");
    }

    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Tagih ke Kasir
  const handleTagihKasir = (item: QueueItem) => {
    // Store in localStorage / sessionStorage so POS cart can load it
    const pendingService = {
      source: "queue",
      queueId: item.id,
      customerName: item.pelangganNama,
      phone: item.pelangganTelepon,
      petName: item.hewanNama,
      serviceName: `${item.layananNama} (${item.hewanNama} - ${item.hewanUkuran})`,
      price: item.totalHarga,
      staff: item.stafNama,
      addons: item.addons,
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pawmart_pending_service_checkout", JSON.stringify(pendingService));
    }

    showToast(`Layanan ${item.hewanNama} dialihkan ke Kasir POS`, "success");
    router.push(`/transaksi?from=queue&id=${item.id}&name=${encodeURIComponent(item.hewanNama)}`);
  };

  // Handle Add Walk-in
  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = initialCustomers.find((c) => c.id === selectedCustomerId) || initialCustomers[1];
    const srv = initialServices.find((s) => s.id === selectedServiceId) || initialServices[0];
    const addons = serviceAddons.filter((a) => selectedAddonIds.includes(a.id));
    const addonPrice = addons.reduce((sum, a) => sum + a.harga, 0);

    const basePrice =
      petSize === "Kecil" ? srv.harga.kecil : petSize === "Sedang" ? srv.harga.sedang : srv.harga.besar;
    const totalPrice = basePrice + addonPrice;

    const newId = `Q-${Date.now().toString().slice(-3)}`;
    const nextQueueNo = `A-0${queueList.length + 1}`;

    const newQueue: QueueItem = {
      id: newId,
      nomorAntrean: nextQueueNo,
      pelangganNama: cust.nama,
      pelangganTelepon: cust.telepon,
      hewanNama: selectedPetName,
      hewanJenis: srv.kategori === "Grooming" ? "Kucing" : "Anjing",
      hewanRas: "Campuran",
      hewanUkuran: petSize,
      hewanIcon: "🐾",
      layananNama: srv.nama,
      layananKategori: srv.kategori,
      addons: addons.map((a) => ({ nama: a.nama, harga: a.harga })),
      stafNama: selectedStaffName,
      durasiMenit: srv.durasi,
      totalHarga: totalPrice,
      catatan: newCatatan,
      status: "Menunggu",
      waktuDibuat: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setQueueList((prev) => [newQueue, ...prev]);
    setIsNewWalkinOpen(false);
    setNewCatatan("");
    setSelectedAddonIds([]);
    showToast(`Antrean ${nextQueueNo} (${selectedPetName}) berhasil dibuat!`, "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <Scissors size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Layanan & Grooming</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Pantau dan kelola alur pengerjaan antrean grooming dan treatment anabul secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsNewWalkinOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Tambah Antrean Walk-in</span>
          </Button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <LayananNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Menunggu</div>
            <div className="text-xl font-bold text-[#1F2937]">{waitingList.length} Anabul</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            🛁
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Diproses</div>
            <div className="text-xl font-bold text-blue-600">{inProgressList.length} Sedang Dikerjakan</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Selesai</div>
            <div className="text-xl font-bold text-emerald-600">{completedList.length} Siap Ditagih</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#C9772E]/10 text-[#C9772E] flex items-center justify-center font-bold text-lg">
            🐾
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Antrean</div>
            <div className="text-xl font-bold text-[#1F2937]">{queueList.length} Layanan</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari nama anabul, pemilik, no antrean..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#C9772E]/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-[#6B7280] whitespace-nowrap flex items-center gap-1">
            <Filter size={14} /> Groomer:
          </span>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm font-medium text-[#374151] border-none focus:ring-2 focus:ring-[#C9772E]/40"
          >
            <option value="Semua">Semua Staf Groomer</option>
            {initialStaffMembers.map((staff) => (
              <option key={staff.id} value={staff.nama}>
                {staff.nama} ({staff.peran})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Tab Switcher (< 768px) */}
      <div className="flex md:hidden p-1 bg-[#ECE8E1]/60 rounded-xl">
        {(["Menunggu", "Diproses", "Selesai"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMobileTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeMobileTab === tab
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            {tab} (
            {tab === "Menunggu"
              ? waitingList.length
              : tab === "Diproses"
              ? inProgressList.length
              : completedList.length}
            )
          </button>
        ))}
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kolom 1: Menunggu */}
        <div
          className={`space-y-3.5 ${
            activeMobileTab !== "Menunggu" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <h2 className="font-bold text-[#1F2937] text-base">Menunggu</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {waitingList.length}
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF]">Belum Dikerjakan</span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-[#ECE8E1] text-[#9CA3AF] text-sm">
                Tidak ada anabul dalam antrean menunggu
              </div>
            ) : (
              waitingList.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                  primaryAction={
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(item.id, "Diproses");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
                    >
                      <Play size={13} fill="currentColor" /> Mulai Kerjakan
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Diproses */}
        <div
          className={`space-y-3.5 ${
            activeMobileTab !== "Diproses" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <h2 className="font-bold text-[#1F2937] text-base">Diproses</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {inProgressList.length}
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF]">Sedang Grooming</span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {inProgressList.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-[#ECE8E1] text-[#9CA3AF] text-sm">
                Tidak ada pengerjaan yang sedang berjalan
              </div>
            ) : (
              inProgressList.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                  primaryAction={
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(item.id, "Menunggu");
                        }}
                        className="py-1.5 text-xs font-medium text-[#6B7280]"
                      >
                        <ArrowLeft size={13} /> Tunda
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(item.id, "Selesai");
                        }}
                        className="py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check size={14} /> Selesai
                      </Button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Kolom 3: Selesai */}
        <div
          className={`space-y-3.5 ${
            activeMobileTab !== "Selesai" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h2 className="font-bold text-[#1F2937] text-base">Selesai</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {completedList.length}
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF]">Siap Bayar / Pulang</span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {completedList.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-[#ECE8E1] text-[#9CA3AF] text-sm">
                Belum ada antrean selesai
              </div>
            ) : (
              completedList.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                  primaryAction={
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagihKasir(item);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold bg-[#C9772E] hover:bg-[#b26624] text-white shadow-xs"
                    >
                      <Receipt size={14} /> Tagih ke Kasir POS
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail Antrean */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Detail Antrean #${selectedItem.nomorAntrean}`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between p-3.5 bg-[#F7F5F1] rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-white rounded-xl shadow-xs border border-[#ECE8E1]">
                  {selectedItem.hewanIcon}
                </span>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-lg flex items-center gap-2">
                    {selectedItem.hewanNama}
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white border border-[#ECE8E1]">
                      {selectedItem.hewanRas} • {selectedItem.hewanUkuran}
                    </span>
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Pemilik: <span className="font-semibold text-[#1F2937]">{selectedItem.pelangganNama}</span> ({selectedItem.pelangganTelepon})
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  selectedItem.status === "Diproses"
                    ? "info"
                    : selectedItem.status === "Selesai"
                    ? "success"
                    : "warning"
                }
              >
                {selectedItem.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[#ECE8E1]">
                <span className="text-[#6B7280]">Layanan:</span>
                <span className="font-semibold text-[#1F2937]">{selectedItem.layananNama}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#ECE8E1]">
                <span className="text-[#6B7280]">Groomer / Petugas:</span>
                <span className="font-semibold text-[#1F2937]">{selectedItem.stafNama}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#ECE8E1]">
                <span className="text-[#6B7280]">Durasi Estimasi:</span>
                <span className="font-semibold text-[#1F2937]">{selectedItem.durasiMenit} Menit</span>
              </div>
              {selectedItem.jamMulai && (
                <div className="flex justify-between py-1.5 border-b border-[#ECE8E1]">
                  <span className="text-[#6B7280]">Waktu Pengerjaan:</span>
                  <span className="font-semibold text-[#1F2937]">
                    {selectedItem.jamMulai} - {selectedItem.estimasiSelesai || "Sekarang"}
                  </span>
                </div>
              )}
              {selectedItem.addons && selectedItem.addons.length > 0 && (
                <div className="py-1.5 border-b border-[#ECE8E1]">
                  <span className="text-[#6B7280] block mb-1">Add-on / Tambahan:</span>
                  <div className="space-y-1">
                    {selectedItem.addons.map((add, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded-lg border border-[#ECE8E1]">
                        <span>{add.nama}</span>
                        <span className="font-semibold text-[#C9772E]">{formatRupiah(add.harga)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedItem.catatan && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                  <span className="font-bold block mb-0.5">Catatan Khusus:</span>
                  {selectedItem.catatan}
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-bold text-[#1F2937]">
                <span>Total Biaya:</span>
                <span className="text-[#C9772E]">{formatRupiah(selectedItem.totalHarga)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ECE8E1] flex items-center justify-end gap-2">
              {selectedItem.status === "Selesai" ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleTagihKasir(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Receipt size={16} /> Tagih ke Kasir POS
                </Button>
              ) : selectedItem.status === "Menunggu" ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUpdateStatus(selectedItem.id, "Diproses");
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Play size={16} /> Mulai Proses Grooming
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUpdateStatus(selectedItem.id, "Selesai");
                    setSelectedItem(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Check size={16} /> Tandai Selesai
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tambah Antrean Walk-in */}
      <Modal
        isOpen={isNewWalkinOpen}
        onClose={() => setIsNewWalkinOpen(false)}
        title="Tambah Antrean Layanan Walk-in"
      >
        <form onSubmit={handleCreateWalkin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Pilih Pelanggan
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const cust = initialCustomers.find((c) => c.id === e.target.value);
                if (cust && cust.pets.length > 0) {
                  setSelectedPetName(cust.pets[0].nama);
                }
              }}
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            >
              {initialCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.telepon})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Nama Hewan Peliharaan
              </label>
              <input
                type="text"
                value={selectedPetName}
                onChange={(e) => setSelectedPetName(e.target.value)}
                placeholder="Contoh: Milo, Luna"
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Ukuran Hewan
              </label>
              <select
                value={petSize}
                onChange={(e) => setPetSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              >
                <option value="Kecil">Kecil (&lt; 5 kg)</option>
                <option value="Sedang">Sedang (5 - 15 kg)</option>
                <option value="Besar">Besar (&gt; 15 kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Pilih Layanan
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            >
              {initialServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.durasi} mnt) - {formatRupiah(s.harga[petSize === "Kecil" ? "kecil" : petSize === "Sedang" ? "sedang" : "besar"])}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Pilih Groomer / Staf
            </label>
            <select
              value={selectedStaffName}
              onChange={(e) => setSelectedStaffName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            >
              {initialStaffMembers.map((st) => (
                <option key={st.id} value={st.nama}>
                  {st.nama} - {st.peran}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Add-on Tambahan (Opsional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceAddons.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#C9772E] bg-[#C9772E]/5 font-semibold text-[#1F2937]"
                        : "border-[#ECE8E1] hover:bg-[#F7F5F1] text-[#4B5563]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedAddonIds((prev) =>
                          isChecked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                        );
                      }}
                      className="accent-[#C9772E] rounded"
                    />
                    <div className="flex-1 truncate">
                      <div>{addon.nama}</div>
                      <div className="text-[11px] text-[#C9772E]">{formatRupiah(addon.harga)}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Catatan Khusus Grooming
            </label>
            <textarea
              rows={2}
              value={newCatatan}
              onChange={(e) => setNewCatatan(e.target.value)}
              placeholder="Contoh: Kulit sensitif, hati-hati telinga kiri, dll..."
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewWalkinOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan ke Antrean
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Queue Card Sub-component
function QueueCard({
  item,
  onSelect,
  primaryAction,
}: {
  item: QueueItem;
  onSelect: () => void;
  primaryAction: React.ReactNode;
}) {
  return (
    <div
      onClick={onSelect}
      className="p-3.5 bg-white rounded-2xl border border-[#ECE8E1] shadow-xs hover:border-[#C9772E]/60 transition-all cursor-pointer group hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#F7F5F1] text-center leading-7 text-xs font-bold text-[#1F2937] border border-[#ECE8E1]">
            {item.nomorAntrean}
          </span>
          <div>
            <div className="font-bold text-[#1F2937] text-sm flex items-center gap-1.5">
              <span>{item.hewanIcon}</span>
              <span>{item.hewanNama}</span>
              <span className="text-[11px] font-normal text-[#9CA3AF]">
                ({item.hewanUkuran})
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280]">
              Pemilik: {item.pelangganNama}
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-[#C9772E]">
          {formatRupiah(item.totalHarga)}
        </span>
      </div>

      <div className="py-2 border-y border-[#F3EFEA] my-2 text-xs space-y-1">
        <div className="font-semibold text-[#374151] truncate">
          {item.layananNama}
        </div>
        <div className="flex items-center justify-between text-[#6B7280] text-[11px]">
          <span className="flex items-center gap-1">
            <User size={12} className="text-[#9CA3AF]" /> {item.stafNama}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock size={12} className="text-[#9CA3AF]" />
            {item.status === "Diproses" && item.estimasiSelesai ? (
              <span className="text-blue-600 font-semibold">
                Est. {item.estimasiSelesai}
              </span>
            ) : (
              <span>{item.durasiMenit} mnt</span>
            )}
          </span>
        </div>
      </div>

      {item.catatan && (
        <div className="mb-2 text-[11px] text-[#6B7280] bg-[#FAF8F5] p-1.5 rounded-lg truncate">
          💬 {item.catatan}
        </div>
      )}

      <div className="pt-1">{primaryAction}</div>
    </div>
  );
}
