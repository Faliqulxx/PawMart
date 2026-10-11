"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageCircle,
  Share2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Scissors,
  Home,
  Stethoscope,
  Sparkles,
  Phone,
  RotateCcw,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { initialBookings, BookingRecord, BookingStatus } from "@/data/bookings";
import { initialStaffMembers } from "@/data/staff";
import { initialServices } from "@/data/services";

export default function BookingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);

  // View state: "kalender" | "daftar"
  const [activeView, setActiveView] = useState<"kalender" | "daftar">("kalender");
  // Calendar mode: "hari" | "minggu" | "bulan"
  const [calendarMode, setCalendarMode] = useState<"hari" | "minggu" | "bulan">("minggu");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-11");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStaff, setFilterStaff] = useState<string>("Semua");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [isWaReminderOpen, setIsWaReminderOpen] = useState(false);
  const [bookingForWa, setBookingForWa] = useState<BookingRecord | null>(null);

  // Statistics
  const todayBookings = bookings.filter((b) => b.tanggal === "2026-10-11");
  const pendingConfirm = bookings.filter((b) => b.status === "Menunggu Konfirmasi");
  const inProgressCount = bookings.filter((b) => b.status === "Diproses");
  const completedToday = bookings.filter((b) => b.status === "Selesai" && b.tanggal === "2026-10-11");

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStaff = filterStaff === "Semua" || b.stafNama === filterStaff;
      const matchCat = filterCategory === "Semua" || b.layananKategori === filterCategory;
      const matchStatus = filterStatus === "Semua" || b.status === filterStatus;
      const matchSearch =
        !searchQuery ||
        b.pelangganNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.hewanNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.layananNama.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStaff && matchCat && matchStatus && matchSearch;
    });
  }, [bookings, filterStaff, filterCategory, filterStatus, searchQuery]);

  // Update Status Booking
  const handleUpdateStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    showToast(`Status booking ${id} diubah menjadi "${newStatus}"`, "success");
    if (selectedBooking?.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Check-in Booking to Queue
  const handleCheckInBooking = (booking: BookingRecord) => {
    handleUpdateStatus(booking.id, "Check-in");
    showToast(`Booking ${booking.hewanNama} berhasil Check-in dan masuk ke Antrean Layanan!`, "success");
    router.push("/layanan/antrean");
  };

  // Open WA Modal
  const handleOpenWaReminder = (booking: BookingRecord) => {
    setBookingForWa(booking);
    setIsWaReminderOpen(true);
  };

  // Send WhatsApp (Simulation)
  const handleSendWaSimulated = () => {
    if (!bookingForWa) return;
    showToast(`Pengingat WhatsApp berhasil dikirim ke ${bookingForWa.pelangganNama} (${bookingForWa.pelangganTelepon})`, "success");
    setIsWaReminderOpen(false);
  };

  // Helpers for Status badge colors
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return <Badge variant="warning">{status}</Badge>;
      case "Terkonfirmasi":
        return <Badge variant="info">{status}</Badge>;
      case "Check-in":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">{status}</Badge>;
      case "Diproses":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{status}</Badge>;
      case "Selesai":
        return <Badge variant="success">{status}</Badge>;
      case "Terlambat":
        return <Badge variant="danger">{status}</Badge>;
      case "Dibatalkan":
      case "Tidak Hadir":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Category Icon & Color
  const getCategoryTheme = (kat: string) => {
    switch (kat) {
      case "Grooming":
        return { bg: "bg-amber-500", light: "bg-amber-50 text-amber-700 border-amber-200" };
      case "Paket":
        return { bg: "bg-purple-500", light: "bg-purple-50 text-purple-700 border-purple-200" };
      case "Kesehatan":
        return { bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "Penitipan":
        return { bg: "bg-blue-500", light: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return { bg: "bg-[#C9772E]", light: "bg-[#C9772E]/10 text-[#C9772E] border-[#C9772E]/30" };
    }
  };

  // Weekly calendar days (11-17 Okt 2026)
  const weekDays = [
    { date: "2026-10-11", label: "Min, 11 Okt" },
    { date: "2026-10-12", label: "Sen, 12 Okt" },
    { date: "2026-10-13", label: "Sel, 13 Okt" },
    { date: "2026-10-14", label: "Rab, 14 Okt" },
    { date: "2026-10-15", label: "Kam, 15 Okt" },
    { date: "2026-10-16", label: "Jum, 16 Okt" },
    { date: "2026-10-17", label: "Sab, 17 Okt" },
  ];

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <CalendarDays size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Jadwal & Booking</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Kalender reservasi pengerjaan grooming, pet hotel, dan konsultasi kesehatan anabul.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/booking/baru">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={18} />
              <span>Buat Booking Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#C9772E]/10 text-[#C9772E] flex items-center justify-center font-bold text-lg">
            📅
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Booking Hari Ini</div>
            <div className="text-xl font-bold text-[#1F2937]">{todayBookings.length} Jadwal</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Menunggu Konfirmasi</div>
            <div className="text-xl font-bold text-amber-600">{pendingConfirm.length} Perlu Respon</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Sedang Berlangsung</div>
            <div className="text-xl font-bold text-blue-600">{inProgressCount.length} Pengerjaan</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Selesai Hari Ini</div>
            <div className="text-xl font-bold text-emerald-600">{completedToday.length} Anabul</div>
          </div>
        </div>
      </div>

      {/* Filter and View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* View Switcher: Kalender vs Daftar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#ECE8E1]/60 rounded-xl">
            <button
              onClick={() => setActiveView("kalender")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "kalender"
                  ? "bg-white text-[#C9772E] shadow-xs"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              📅 Kalender
            </button>
            <button
              onClick={() => setActiveView("daftar")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "daftar"
                  ? "bg-white text-[#C9772E] shadow-xs"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              📋 Daftar Tabel ({filteredBookings.length})
            </button>
          </div>

          {activeView === "kalender" && (
            <div className="flex items-center gap-1 p-1 bg-[#ECE8E1]/40 rounded-xl">
              {(["hari", "minggu", "bulan"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize font-medium ${
                    calendarMode === mode
                      ? "bg-white text-[#1F2937] shadow-xs font-semibold"
                      : "text-[#6B7280]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Cari booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F5F1] rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F7F5F1] rounded-xl text-xs font-medium text-[#374151] border-none"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Grooming">Grooming</option>
            <option value="Paket">Paket</option>
            <option value="Kesehatan">Kesehatan</option>
          </select>

          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F7F5F1] rounded-xl text-xs font-medium text-[#374151] border-none"
          >
            <option value="Semua">Semua Staf</option>
            {initialStaffMembers.map((s) => (
              <option key={s.id} value={s.nama}>
                {s.nama}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F7F5F1] rounded-xl text-xs font-medium text-[#374151] border-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
            <option value="Terkonfirmasi">Terkonfirmasi</option>
            <option value="Check-in">Check-in</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Main Content: Calendar vs Table List */}
      {activeView === "kalender" ? (
        <div className="bg-white rounded-2xl border border-[#ECE8E1] shadow-xs p-4 sm:p-5 space-y-4">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E1]">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-[#F7F5F1] text-[#6B7280]">
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-bold text-[#1F2937] text-base">
                11 - 17 Oktober 2026
              </h2>
              <button className="p-1.5 rounded-lg hover:bg-[#F7F5F1] text-[#6B7280]">
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setSelectedDate("2026-10-11")}
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF8F5] border border-[#ECE8E1] text-[#C9772E]"
              >
                Hari Ini
              </button>
            </div>

            {/* Service Category Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Grooming
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Paket
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kesehatan
              </span>
            </div>
          </div>

          {/* Weekly / Daily Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 gap-2 pb-2 text-center text-xs font-bold border-b border-[#ECE8E1]">
                <div className="text-[#9CA3AF] py-1">Jam</div>
                {weekDays.map((day) => {
                  const isCurrent = day.date === "2026-10-11";
                  return (
                    <div
                      key={day.date}
                      className={`py-1.5 rounded-xl ${
                        isCurrent ? "bg-[#C9772E]/10 text-[#C9772E]" : "text-[#4B5563]"
                      }`}
                    >
                      {day.label}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots rows */}
              <div className="divide-y divide-[#F3EFEA]">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-2 py-2.5 items-start min-h-[64px]">
                    <div className="text-xs font-semibold text-[#9CA3AF] pt-1 text-center">
                      {time}
                    </div>

                    {weekDays.map((day) => {
                      const bookingsInSlot = filteredBookings.filter(
                        (b) => b.tanggal === day.date && b.jam.startsWith(time.slice(0, 2))
                      );

                      return (
                        <div key={day.date} className="min-h-[48px] space-y-1.5">
                          {bookingsInSlot.map((b) => {
                            const theme = getCategoryTheme(b.layananKategori);
                            return (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                className={`p-2 rounded-xl text-left border cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${theme.light}`}
                              >
                                <div className="font-bold text-[11px] truncate flex items-center gap-1">
                                  <span>{b.hewanIcon}</span>
                                  <span>{b.hewanNama}</span>
                                  <span className="text-[10px] font-normal text-black/60">
                                    ({b.jam})
                                  </span>
                                </div>
                                <div className="text-[10px] truncate text-black/70">
                                  {b.layananNama}
                                </div>
                                <div className="text-[9px] text-black/50 truncate">
                                  {b.stafNama}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View: Table List */
        <div className="bg-white rounded-2xl border border-[#ECE8E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#6B7280] border-b border-[#ECE8E1]">
                <tr>
                  <th className="py-3 px-4 font-semibold">No. Booking</th>
                  <th className="py-3 px-4 font-semibold">Jadwal & Waktu</th>
                  <th className="py-3 px-4 font-semibold">Pelanggan & Anabul</th>
                  <th className="py-3 px-4 font-semibold">Layanan</th>
                  <th className="py-3 px-4 font-semibold">Staf Penanggung Jawab</th>
                  <th className="py-3 px-4 font-semibold">Total Biaya</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E1]">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-[#FDFBF9] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1F2937]">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1F2937]">
                        {formatTanggal(b.tanggal)}
                      </div>
                      <div className="text-[11px] text-[#C9772E] font-medium flex items-center gap-1">
                        <Clock size={11} /> {b.jam} ({b.durasi} mnt)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1F2937] flex items-center gap-1">
                        <span>{b.hewanIcon}</span>
                        <span>{b.hewanNama}</span>
                        <span className="text-[11px] font-normal text-[#9CA3AF]">
                          ({b.hewanRas})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {b.pelangganNama} • {b.pelangganTelepon}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#374151]">
                        {b.layananNama}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {b.layananKategori}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#4B5563]">
                      {b.stafNama}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#C9772E]">
                      {formatRupiah(b.totalHarga)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWaReminder(b);
                        }}
                        title="Kirim Pengingat WhatsApp"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Booking */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Detail Reservasi ${selectedBooking.id}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F7F5F1] rounded-2xl flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-[#ECE8E1]">
                  {selectedBooking.hewanIcon}
                </span>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-base">
                    {selectedBooking.hewanNama} ({selectedBooking.hewanRas})
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Ukuran: {selectedBooking.hewanUkuran} • Jenis: {selectedBooking.hewanJenis}
                  </p>
                  <p className="text-xs font-semibold text-[#1F2937] mt-0.5">
                    Pemilik: {selectedBooking.pelangganNama} ({selectedBooking.pelangganTelepon})
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            {/* Detail Rows */}
            <div className="space-y-2 text-xs border-y border-[#ECE8E1] py-3">
              <div className="flex justify-between py-1">
                <span className="text-[#6B7280]">Layanan:</span>
                <span className="font-semibold text-[#1F2937]">{selectedBooking.layananNama}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B7280]">Jadwal:</span>
                <span className="font-semibold text-[#1F2937]">
                  {formatTanggal(selectedBooking.tanggal)} pukul {selectedBooking.jam} ({selectedBooking.durasi} Menit)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B7280]">Staf / Groomer:</span>
                <span className="font-semibold text-[#1F2937]">{selectedBooking.stafNama}</span>
              </div>

              {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                <div className="py-1">
                  <span className="text-[#6B7280] block mb-1">Add-on:</span>
                  {selectedBooking.addons.map((add, idx) => (
                    <div key={idx} className="flex justify-between text-[#4B5563] pl-2">
                      <span>+ {add.nama}</span>
                      <span>{formatRupiah(add.harga)}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedBooking.catatan && (
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 border border-amber-200">
                  <span className="font-bold block mb-0.5">Catatan Khusus:</span>
                  {selectedBooking.catatan}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-[#ECE8E1] text-sm font-bold text-[#1F2937]">
                <span>Estimasi Biaya:</span>
                <span className="text-[#C9772E]">{formatRupiah(selectedBooking.totalHarga)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenWaReminder(selectedBooking)}
                className="flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                <MessageCircle size={14} /> Pengingat WA
              </Button>

              <div className="flex items-center gap-2">
                {selectedBooking.status === "Menunggu Konfirmasi" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Terkonfirmasi")}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={14} /> Konfirmasi Jadwal
                  </Button>
                )}

                {selectedBooking.status === "Terkonfirmasi" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleCheckInBooking(selectedBooking)}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <Scissors size={14} /> Check-in & Masuk Antrean
                  </Button>
                )}

                {selectedBooking.status !== "Dibatalkan" && selectedBooking.status !== "Selesai" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Dibatalkan")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Batalkan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal WhatsApp Reminder Preview */}
      {bookingForWa && (
        <Modal
          isOpen={isWaReminderOpen}
          onClose={() => setIsWaReminderOpen(false)}
          title="Pratinjau Pengingat WhatsApp"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono text-emerald-950 whitespace-pre-wrap leading-relaxed">
{`Halo Kak ${bookingForWa.pelangganNama}! 🐾

Mengingatkan jadwal perawatan anabul tersayang:
🐶 Nama Hewan: ${bookingForWa.hewanNama} (${bookingForWa.hewanRas})
✂️ Layanan: ${bookingForWa.layananNama}
📅 Tanggal: ${formatTanggal(bookingForWa.tanggal)}
⏰ Jam: ${bookingForWa.jam} WIB
📍 Lokasi: PawMart Pet Shop & Care

Mohon hadir 10 menit sebelum jadwal ya Kak. Jika ingin menjadwal ulang, silakan balas pesan ini. Terima kasih! 🐶✨`}
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Nomor Tujuan: <strong className="text-[#1F2937]">{bookingForWa.pelangganTelepon}</strong></span>
              <span>Status: Siap Kirim</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E1]">
              <Button
                variant="outline"
                onClick={() => setIsWaReminderOpen(false)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                onClick={handleSendWaSimulated}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                <MessageCircle size={16} /> Kirim Pengingat WhatsApp
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
