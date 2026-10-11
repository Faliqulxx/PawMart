"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  User,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  FileText,
  AlertTriangle,
  Heart,
  ChevronRight,
  ShieldAlert,
  Info,
  Layers,
  Utensils,
  Phone,
  Smile,
  LogOut,
  Bed,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { LayananNav } from "@/components/layanan/LayananNav";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { initialCages, CageRecord, CageType, cageRates } from "@/data/boarding";
import { initialBoardingStays, BoardingStay, DailyLog } from "@/data/boardingStays";
import { initialCustomers } from "@/data/customers";
import { initialStaffMembers } from "@/data/staff";

export default function PenitipanPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [cages, setCages] = useState<CageRecord[]>(initialCages);
  const [stays, setStays] = useState<BoardingStay[]>(initialBoardingStays);

  // Active view: "peta" | "daftar"
  const [activeView, setActiveView] = useState<"peta" | "daftar">("peta");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedCage, setSelectedCage] = useState<CageRecord | null>(null);
  const [selectedStay, setSelectedStay] = useState<BoardingStay | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [stayToCheckOut, setStayToCheckOut] = useState<BoardingStay | null>(null);

  // New Journal Log Modal
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [logActivity, setLogActivity] = useState<DailyLog["aktivitas"]>("Makan & Minum");
  const [logNotes, setLogNotes] = useState("");
  const [logStaff, setLogStaff] = useState(initialStaffMembers[0].nama);

  // Form Check-in State
  const [checkInCustId, setCheckInCustId] = useState(initialCustomers[1].id);
  const [checkInPetName, setCheckInPetName] = useState(initialCustomers[1].pets[0]?.nama || "Mochi");
  const [checkInCageId, setCheckInCageId] = useState("");
  const [checkInStartDate, setCheckInStartDate] = useState("2026-10-11");
  const [checkInEndDate, setCheckInEndDate] = useState("2026-10-14");
  const [checkInFood, setCheckInFood] = useState("");
  const [checkInEmergency, setCheckInEmergency] = useState("");
  const [checkInNotes, setCheckInNotes] = useState("");
  const [includeCheckoutGrooming, setIncludeCheckoutGrooming] = useState(false);

  // Capacity calculations
  const totalCages = cages.length;
  const occupiedCages = cages.filter((c) => c.status === "Terisi").length;
  const availableCages = cages.filter((c) => c.status === "Tersedia").length;
  const cleaningCages = cages.filter((c) => c.status === "Perlu Dibersihkan").length;
  const occupancyRate = Math.round((occupiedCages / totalCages) * 100);

  // Filtered Cages
  const filteredCages = useMemo(() => {
    return cages.filter((c) => {
      const matchType = filterType === "Semua" || c.tipe === filterType;
      const matchSearch =
        !searchQuery ||
        c.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.penghuniSaatIni &&
          c.penghuniSaatIni.hewanNama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.penghuniSaatIni &&
          c.penghuniSaatIni.pelangganNama.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [cages, filterType, searchQuery]);

  // Active stays
  const activeStays = useMemo(() => {
    return stays.filter((s) => s.status === "Menginap");
  }, [stays]);

  // Handle Cage Click
  const handleSelectCage = (cage: CageRecord) => {
    setSelectedCage(cage);
    if (cage.penghuniSaatIni) {
      const stay = stays.find((s) => s.id === cage.penghuniSaatIni?.stayId);
      if (stay) {
        setSelectedStay(stay);
      }
    } else {
      setSelectedStay(null);
    }
  };

  // Handle Toggle Clean Cage
  const handleCleanCage = (cageId: string) => {
    setCages((prev) =>
      prev.map((c) => (c.id === cageId ? { ...c, status: "Tersedia" as const } : c))
    );
    showToast(`Kandang ${cageId} telah selesai dibersihkan dan siap digunakan!`, "success");
    if (selectedCage?.id === cageId) {
      setSelectedCage((prev) => (prev ? { ...prev, status: "Tersedia" as const } : null));
    }
  };

  // Handle Add Journal Log
  const handleSaveJournalLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay) return;

    const now = new Date();
    const timeStr = `${formatTanggal(now.toISOString().split("T")[0])} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: DailyLog = {
      waktu: timeStr,
      aktivitas: logActivity,
      catatan: logNotes,
      petugas: logStaff,
    };

    setStays((prev) =>
      prev.map((s) =>
        s.id === selectedStay.id
          ? { ...s, jurnalHarian: [newLog, ...s.jurnalHarian] }
          : s
      )
    );

    setSelectedStay((prev) =>
      prev ? { ...prev, jurnalHarian: [newLog, ...prev.jurnalHarian] } : null
    );

    setIsAddLogOpen(false);
    setLogNotes("");
    showToast("Catatan jurnal harian berhasil ditambahkan!", "success");
  };

  // Handle Submit Check-in
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = initialCustomers.find((c) => c.id === checkInCustId) || initialCustomers[1];
    const cage = cages.find((c) => c.id === checkInCageId);

    if (!cage) {
      showToast("Silakan pilih kandang yang tersedia", "error");
      return;
    }

    const newStayId = `STAY-${Date.now().toString().slice(-4)}`;
    const newStay: BoardingStay = {
      id: newStayId,
      pelangganId: cust.id,
      pelangganNama: cust.nama,
      telepon: cust.telepon,
      kontakDarurat: checkInEmergency || cust.telepon,
      hewanNama: checkInPetName,
      hewanJenis: "Kucing",
      hewanRas: "Campuran",
      hewanUkuran: "Kecil",
      hewanIcon: "🐾",
      kandangId: cage.id,
      kandangTipe: cage.tipe,
      tarifPerMalam: cage.tarifPerMalam,
      tanggalMasuk: checkInStartDate,
      tanggalKeluarRencana: checkInEndDate,
      makananBawaan: checkInFood || "Pakan dari Pet Shop",
      catatanKhusus: checkInNotes,
      addons: includeCheckoutGrooming ? [{ nama: "Mandi Grooming saat Check-out", harga: 70000 }] : [],
      status: "Menginap",
      jurnalHarian: [
        {
          waktu: `${formatTanggal(checkInStartDate)} 10:00`,
          aktivitas: "Makan & Minum",
          catatan: "Hewan telah check-in dengan kondisi sehat dan aktif",
          petugas: "Dewi Lestari",
        },
      ],
    };

    // Update cage
    setCages((prev) =>
      prev.map((c) =>
        c.id === cage.id
          ? {
              ...c,
              status: "Terisi",
              penghuniSaatIni: {
                stayId: newStayId,
                hewanNama: checkInPetName,
                pelangganNama: cust.nama,
                tanggalMasuk: checkInStartDate,
                tanggalKeluar: checkInEndDate,
              },
            }
          : c
      )
    );

    setStays((prev) => [newStay, ...prev]);
    setIsCheckInOpen(false);
    showToast(`Check-in berhasil untuk ${checkInPetName} di Kandang ${cage.nomor}`, "success");
  };

  // Open Checkout Modal
  const handleOpenCheckOut = (stay: BoardingStay) => {
    setStayToCheckOut(stay);
    setIsCheckOutOpen(true);
  };

  // Perform Checkout and Tagih ke Kasir
  const handleConfirmCheckOut = () => {
    if (!stayToCheckOut) return;

    // Calculate nights
    const start = new Date(stayToCheckOut.tanggalMasuk).getTime();
    const end = new Date(stayToCheckOut.tanggalKeluarRencana).getTime();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
    const roomCost = diffDays * stayToCheckOut.tarifPerMalam;
    const addonsCost = stayToCheckOut.addons.reduce((sum, a) => sum + a.harga, 0);
    const totalCost = roomCost + addonsCost;

    // Update cage status to "Perlu Dibersihkan"
    setCages((prev) =>
      prev.map((c) =>
        c.id === stayToCheckOut.kandangId
          ? { ...c, status: "Perlu Dibersihkan", penghuniSaatIni: undefined }
          : c
      )
    );

    // Update stay status
    setStays((prev) =>
      prev.map((s) => (s.id === stayToCheckOut.id ? { ...s, status: "Check-out" } : s))
    );

    // Save pending checkout service
    const pendingCheckout = {
      source: "boarding",
      stayId: stayToCheckOut.id,
      customerName: stayToCheckOut.pelangganNama,
      phone: stayToCheckOut.telepon,
      petName: stayToCheckOut.hewanNama,
      serviceName: `Pet Hotel: ${stayToCheckOut.kandangTipe} (${diffDays} Malam) - ${stayToCheckOut.hewanNama}`,
      price: totalCost,
      roomCost,
      addonsCost,
      addons: stayToCheckOut.addons,
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pawmart_pending_service_checkout", JSON.stringify(pendingCheckout));
    }

    setIsCheckOutOpen(false);
    setSelectedCage(null);
    setSelectedStay(null);
    showToast(`Check-out ${stayToCheckOut.hewanNama} selesai. Mengarahkan ke Kasir...`, "success");
    router.push(`/transaksi?from=boarding&stayId=${stayToCheckOut.id}&total=${totalCost}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <Home size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Penitipan Hewan (Pet Hotel)</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Pantau denah keterisian kandang, log harian anabul, dan alur check-in/check-out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const freeCage = cages.find((c) => c.status === "Tersedia");
              if (freeCage) setCheckInCageId(freeCage.id);
              setIsCheckInOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Check-in Baru</span>
          </Button>
        </div>
      </div>

      {/* Sub Nav */}
      <LayananNav />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Kapasitas Hotel</div>
            <div className="text-2xl font-bold text-[#1F2937] mt-0.5">
              {occupiedCages} <span className="text-sm font-normal text-[#9CA3AF]">/ {totalCages} Kandang</span>
            </div>
            <div className="text-xs font-semibold text-[#C9772E] mt-1">Okupansi: {occupancyRate}%</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C9772E]/10 text-[#C9772E] flex items-center justify-center font-bold text-xl">
            🏨
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Kandang Terisi</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{occupiedCages} Kamar</div>
            <div className="text-xs text-[#6B7280] mt-1">{activeStays.length} Anabul Menginap</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            🐾
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Kandang Kosong</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{availableCages} Kamar</div>
            <div className="text-xs text-emerald-600 mt-1">Siap untuk Check-in</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ✨
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Perlu Dibersihkan</div>
            <div className="text-2xl font-bold text-slate-600 mt-0.5">{cleaningCages} Kamar</div>
            <div className="text-xs text-slate-500 mt-1">Siap disanitasi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xl">
            🧹
          </div>
        </div>
      </div>

      {/* Filter and View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#ECE8E1]/60 rounded-xl w-fit">
          <button
            onClick={() => setActiveView("peta")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "peta"
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            🗺️ Peta Denah Kandang
          </button>
          <button
            onClick={() => setActiveView("daftar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "daftar"
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            📋 Daftar Tamu Menginap ({activeStays.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Cari no kandang / nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F7F5F1] rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-[#F7F5F1] rounded-xl text-xs font-semibold text-[#374151] border-none"
          >
            <option value="Semua">Semua Tipe Kandang</option>
            <option value="Standar">Standar (Rp 60.000)</option>
            <option value="Premium">Premium (Rp 90.000)</option>
            <option value="VIP">VIP AC (Rp 130.000)</option>
          </select>
        </div>
      </div>

      {/* Main View: Peta Denah vs Daftar */}
      {activeView === "peta" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cages Grid (2 Cols on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
                <span>Denah Kandang Pet Hotel</span>
                <span className="text-xs font-normal text-[#6B7280]">
                  (Klik kandang untuk melihat info atau kelola)
                </span>
              </h2>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kosong
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Terisi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Dibersihkan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredCages.map((cage) => {
                const isSelected = selectedCage?.id === cage.id;
                const isOccupied = cage.status === "Terisi";
                const isCleaning = cage.status === "Perlu Dibersihkan";

                return (
                  <div
                    key={cage.id}
                    onClick={() => handleSelectCage(cage)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isSelected
                        ? "border-[#C9772E] ring-2 ring-[#C9772E]/40 bg-[#C9772E]/5 shadow-md"
                        : isOccupied
                        ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                        : isCleaning
                        ? "border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                        : "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-[#1F2937] text-base">
                          {cage.nomor}
                        </span>
                        <div className="text-[11px] font-semibold text-[#6B7280]">
                          {cage.tipe}
                        </div>
                      </div>

                      <span
                        className={`w-3 h-3 rounded-full ${
                          isOccupied
                            ? "bg-amber-500 ring-2 ring-amber-200"
                            : isCleaning
                            ? "bg-slate-400 ring-2 ring-slate-200"
                            : "bg-emerald-500 ring-2 ring-emerald-200"
                        }`}
                      />
                    </div>

                    {isOccupied && cage.penghuniSaatIni ? (
                      <div className="my-2 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                        <div className="font-bold text-[#1F2937] text-xs truncate flex items-center gap-1">
                          🐾 {cage.penghuniSaatIni.hewanNama}
                        </div>
                        <div className="text-[10px] text-[#6B7280] truncate">
                          Owner: {cage.penghuniSaatIni.pelangganNama}
                        </div>
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          s/d {formatTanggal(cage.penghuniSaatIni.tanggalKeluar)}
                        </div>
                      </div>
                    ) : isCleaning ? (
                      <div className="my-2 py-3 text-center">
                        <span className="text-xs font-semibold text-slate-500">
                          🧹 Perlu Sanitasi
                        </span>
                      </div>
                    ) : (
                      <div className="my-2 py-3 text-center">
                        <span className="text-xs font-semibold text-emerald-600">
                          ✨ Tersedia
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-black/5 text-[#6B7280]">
                      <span>{formatRupiah(cage.tarifPerMalam)}</span>
                      <span className="text-[10px]">/malam</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details / Side Panel */}
          <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-5 h-fit">
            {selectedCage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-[#ECE8E1]">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937]">
                      Kandang #{selectedCage.nomor}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Tipe {selectedCage.tipe} • {formatRupiah(selectedCage.tarifPerMalam)} / malam
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedCage.status === "Terisi"
                        ? "warning"
                        : selectedCage.status === "Perlu Dibersihkan"
                        ? "default"
                        : "success"
                    }
                  >
                    {selectedCage.status}
                  </Badge>
                </div>

                {selectedStay ? (
                  <div className="space-y-4">
                    {/* Pet Guest Card */}
                    <div className="p-3.5 bg-[#F7F5F1] rounded-2xl flex items-center gap-3">
                      <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-[#ECE8E1]">
                        {selectedStay.hewanIcon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#1F2937] text-base truncate">
                          {selectedStay.hewanNama}
                        </div>
                        <div className="text-xs text-[#6B7280] truncate">
                          {selectedStay.hewanRas} • {selectedStay.hewanUkuran}
                        </div>
                        <div className="text-xs text-[#1F2937] font-semibold mt-0.5">
                          Pemilik: {selectedStay.pelangganNama} ({selectedStay.telepon})
                        </div>
                      </div>
                    </div>

                    {/* Stay Info */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#ECE8E1]">
                        <span className="text-[#6B7280]">Tanggal Masuk:</span>
                        <span className="font-semibold text-[#1F2937]">
                          {formatTanggal(selectedStay.tanggalMasuk)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ECE8E1]">
                        <span className="text-[#6B7280]">Rencana Keluar:</span>
                        <span className="font-semibold text-[#1F2937]">
                          {formatTanggal(selectedStay.tanggalKeluarRencana)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ECE8E1]">
                        <span className="text-[#6B7280]">Makanan Bawaan:</span>
                        <span className="font-semibold text-[#1F2937]">
                          {selectedStay.makananBawaan}
                        </span>
                      </div>
                      {selectedStay.catatanKhusus && (
                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 border border-amber-200">
                          <span className="font-bold block mb-0.5">Catatan Khusus:</span>
                          {selectedStay.catatanKhusus}
                        </div>
                      )}
                    </div>

                    {/* Daily Logs Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                          <FileText size={14} className="text-[#C9772E]" /> Jurnal Harian
                        </h4>
                        <button
                          onClick={() => setIsAddLogOpen(true)}
                          className="text-xs font-semibold text-[#C9772E] hover:underline"
                        >
                          + Tambah Log
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedStay.jurnalHarian.map((log, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#1F2937]">
                              <span className="flex items-center gap-1 text-[#C9772E]">
                                <Clock size={11} /> {log.waktu}
                              </span>
                              <span className="px-1.5 py-0.5 bg-white rounded border border-[#ECE8E1] text-[10px]">
                                {log.aktivitas}
                              </span>
                            </div>
                            <p className="text-[#4B5563] text-[11px]">{log.catatan}</p>
                            <div className="text-[10px] text-[#9CA3AF] text-right">
                              Oleh: {log.petugas}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Check-out */}
                    <div className="pt-3 border-t border-[#ECE8E1]">
                      <Button
                        variant="primary"
                        onClick={() => handleOpenCheckOut(selectedStay)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} /> Proses Check-out & Tagih
                      </Button>
                    </div>
                  </div>
                ) : selectedCage.status === "Perlu Dibersihkan" ? (
                  <div className="space-y-4 py-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-xl">
                      🧹
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2937]">
                        Kandang Perlu Disanitasi
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Kandang baru saja dikosongkan. Bersihkan dan semprot disinfektan sebelum tamu berikutnya masuk.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleCleanCage(selectedCage.id)}
                      className="w-full"
                    >
                      Tandai Sudah Selesai Dibersihkan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2937]">
                        Kandang Kosong & Tersedia
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Kandang ini siap dihuni oleh anabul tamu pet hotel.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setCheckInCageId(selectedCage.id);
                        setIsCheckInOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Plus size={16} /> Check-in ke Kandang #{selectedCage.nomor}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#9CA3AF] space-y-2">
                <Bed size={32} className="mx-auto text-[#D1D5DB]" />
                <p className="text-xs">
                  Pilih salah satu nomor kandang di denah untuk melihat informasi penghuni atau kelola status.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* View: Daftar Tabel Tamu Menginap */
        <div className="bg-white rounded-2xl border border-[#ECE8E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#6B7280] border-b border-[#ECE8E1]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Kandang</th>
                  <th className="py-3 px-4 font-semibold">Anabul & Pemilik</th>
                  <th className="py-3 px-4 font-semibold">Tipe Kamar</th>
                  <th className="py-3 px-4 font-semibold">Tgl Masuk - Keluar</th>
                  <th className="py-3 px-4 font-semibold">Tarif / Malam</th>
                  <th className="py-3 px-4 font-semibold">Jurnal Harian</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E1]">
                {activeStays.map((stay) => {
                  const start = new Date(stay.tanggalMasuk).getTime();
                  const end = new Date(stay.tanggalKeluarRencana).getTime();
                  const nights = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));

                  return (
                    <tr key={stay.id} className="hover:bg-[#FDFBF9] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1F2937]">
                        <span className="px-2 py-1 rounded-lg bg-[#F7F5F1] border border-[#ECE8E1]">
                          #{stay.kandangId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1F2937] flex items-center gap-1.5 text-sm">
                          <span>{stay.hewanIcon}</span>
                          <span>{stay.hewanNama}</span>
                        </div>
                        <div className="text-[11px] text-[#6B7280]">
                          {stay.pelangganNama} • {stay.telepon}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline">{stay.kandangTipe}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1F2937]">
                          {formatTanggal(stay.tanggalMasuk)} - {formatTanggal(stay.tanggalKeluarRencana)}
                        </div>
                        <div className="text-[11px] text-[#C9772E] font-medium">
                          ({nights} Malam)
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1F2937]">
                        {formatRupiah(stay.tarifPerMalam)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {stay.jurnalHarian.length} Catatan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenCheckOut(stay)}
                          className="text-xs py-1"
                        >
                          Check-out
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Check-in */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Formulir Check-in Pet Hotel"
      >
        <form onSubmit={handleCheckInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Pilih Pelanggan
            </label>
            <select
              value={checkInCustId}
              onChange={(e) => {
                setCheckInCustId(e.target.value);
                const cust = initialCustomers.find((c) => c.id === e.target.value);
                if (cust && cust.pets.length > 0) {
                  setCheckInPetName(cust.pets[0].nama);
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
                Nama Hewan
              </label>
              <input
                type="text"
                value={checkInPetName}
                onChange={(e) => setCheckInPetName(e.target.value)}
                placeholder="Contoh: Bruno, Mochi"
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Pilih Kandang Tersedia
              </label>
              <select
                value={checkInCageId}
                onChange={(e) => setCheckInCageId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              >
                <option value="">-- Pilih Kandang --</option>
                {cages
                  .filter((c) => c.status === "Tersedia")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomor} - {c.tipe} ({formatRupiah(c.tarifPerMalam)}/malam)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Tanggal Masuk
              </label>
              <input
                type="date"
                value={checkInStartDate}
                onChange={(e) => setCheckInStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Rencana Keluar
              </label>
              <input
                type="date"
                value={checkInEndDate}
                onChange={(e) => setCheckInEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Makanan Bawaan / Pola Makan
            </label>
            <input
              type="text"
              value={checkInFood}
              onChange={(e) => setCheckInFood(e.target.value)}
              placeholder="Contoh: Royal Canin Kitten 2x sehari jam 08:00 & 17:00"
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Kontak Darurat
            </label>
            <input
              type="text"
              value={checkInEmergency}
              onChange={(e) => setCheckInEmergency(e.target.value)}
              placeholder="Contoh: 0812-9999-0000 (Kerabat / Pasangan)"
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Catatan Khusus (Alergi / Kebiasaan)
            </label>
            <textarea
              rows={2}
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
              placeholder="Contoh: Takut suara petir, butuh selimut khusus..."
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={includeCheckoutGrooming}
              onChange={(e) => setIncludeCheckoutGrooming(e.target.checked)}
              className="accent-[#C9772E] rounded"
            />
            <span className="font-semibold text-amber-900">
              Paket Tambahan: Mandi Grooming Bersih saat Hari Check-out (+Rp 70.000)
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCheckInOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Konfirmasi Check-in
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Daily Journal Log */}
      <Modal
        isOpen={isAddLogOpen}
        onClose={() => setIsAddLogOpen(false)}
        title={`Tambah Catatan Harian - ${selectedStay?.hewanNama}`}
      >
        <form onSubmit={handleSaveJournalLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Jenis Aktivitas
            </label>
            <select
              value={logActivity}
              onChange={(e) => setLogActivity(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            >
              <option value="Makan & Minum">Makan & Minum</option>
              <option value="Bermain">Bermain / Jalan-jalan</option>
              <option value="Kondisi Medis / Pup">Kondisi Medis / Pup / BAK</option>
              <option value="Grooming">Grooming & Sanitasi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Detail Catatan
            </label>
            <textarea
              rows={3}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Contoh: Makan porsi pagi habis bersih, minum banyak, anabul ceria..."
              required
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Petugas / Penanggung Jawab
            </label>
            <select
              value={logStaff}
              onChange={(e) => setLogStaff(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            >
              {initialStaffMembers.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama} ({s.peran})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddLogOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Jurnal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Check-out Billing Summary */}
      {stayToCheckOut && (
        <Modal
          isOpen={isCheckOutOpen}
          onClose={() => setIsCheckOutOpen(false)}
          title="Ringkasan Check-out & Tagihan Pet Hotel"
        >
          {(() => {
            const start = new Date(stayToCheckOut.tanggalMasuk).getTime();
            const end = new Date(stayToCheckOut.tanggalKeluarRencana).getTime();
            const nights = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
            const roomTotal = nights * stayToCheckOut.tarifPerMalam;
            const addonsTotal = stayToCheckOut.addons.reduce((sum, a) => sum + a.harga, 0);
            const grandTotal = roomTotal + addonsTotal;

            return (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#F7F5F1] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-[#ECE8E1]">
                      {stayToCheckOut.hewanIcon}
                    </span>
                    <div>
                      <h4 className="font-bold text-[#1F2937] text-base">
                        {stayToCheckOut.hewanNama} ({stayToCheckOut.hewanRas})
                      </h4>
                      <p className="text-xs text-[#6B7280]">
                        Pemilik: {stayToCheckOut.pelangganNama} • {stayToCheckOut.telepon}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Kandang #{stayToCheckOut.kandangId}</Badge>
                </div>

                {/* Billing Breakdown */}
                <div className="space-y-2 text-sm border-y border-[#ECE8E1] py-3">
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">
                      Sewa Kamar {stayToCheckOut.kandangTipe} ({nights} Malam @ {formatRupiah(stayToCheckOut.tarifPerMalam)}):
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      {formatRupiah(roomTotal)}
                    </span>
                  </div>

                  {stayToCheckOut.addons.map((add, idx) => (
                    <div key={idx} className="flex justify-between py-1 text-xs text-[#4B5563]">
                      <span>+ {add.nama}</span>
                      <span className="font-semibold text-[#1F2937]">{formatRupiah(add.harga)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 border-t border-[#ECE8E1] text-base font-bold text-[#1F2937]">
                    <span>Total Tagihan:</span>
                    <span className="text-[#C9772E]">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-xs">
                  💡 Menekan tombol di bawah akan menandai kamar sebagai "Perlu Dibersihkan" dan memindahkan total tagihan ke kasir POS PawMart untuk pembayaran.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCheckOutOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleConfirmCheckOut}
                    className="flex items-center gap-2"
                  >
                    <Receipt size={16} /> Tagih ke Kasir POS
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
