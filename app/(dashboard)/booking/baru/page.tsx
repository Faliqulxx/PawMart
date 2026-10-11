"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  User,
  Scissors,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  AlertTriangle,
  Sparkles,
  Printer,
  FileCheck,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { initialCustomers, Customer, Pet } from "@/data/customers";
import { initialServices, serviceAddons, ServiceItem } from "@/data/services";
import { initialStaffMembers, StaffMember } from "@/data/staff";
import { initialBookings } from "@/data/bookings";

export default function BuatBookingBaruPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Pelanggan & Hewan
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(initialCustomers[1]);
  const [selectedPet, setSelectedPet] = useState<Pet>(initialCustomers[1].pets[0]);
  const [customerSearch, setCustomerSearch] = useState("");

  // STEP 2: Layanan & Ukuran
  const [selectedService, setSelectedService] = useState<ServiceItem>(initialServices[0]);
  const [petSize, setPetSize] = useState<"Kecil" | "Sedang" | "Besar">("Kecil");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // STEP 3: Tanggal, Slot Jam, & Staf
  const [bookingDate, setBookingDate] = useState<string>("2026-10-12");
  const [bookingTime, setBookingTime] = useState<string>("10:00");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember>(initialStaffMembers[0]);

  // STEP 4: Konfirmasi & Opsi
  const [notes, setNotes] = useState("");
  const [downPayment, setDownPayment] = useState<number>(0);
  const [sendWaReminder, setSendWaReminder] = useState<boolean>(true);

  // Success Confirmation Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState("");

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter(
      (c) =>
        c.id !== "CUST-001" &&
        (c.nama.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.telepon.includes(customerSearch))
    );
  }, [customerSearch]);

  // Selected Addons
  const activeAddons = useMemo(() => {
    return serviceAddons.filter((a) => selectedAddonIds.includes(a.id));
  }, [selectedAddonIds]);

  // Price & Duration Calculation
  const basePrice =
    petSize === "Kecil"
      ? selectedService.harga.kecil
      : petSize === "Sedang"
      ? selectedService.harga.sedang
      : selectedService.harga.besar;

  const totalAddonPrice = activeAddons.reduce((sum, a) => sum + a.harga, 0);
  const grandTotal = basePrice + totalAddonPrice;
  const estimatedDuration = selectedService.durasi;

  // Available Time Slots & Clash Detection
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Clash check: is staff already booked at that date and time?
  const isSlotClashing = (slot: string) => {
    return initialBookings.some(
      (b) =>
        b.tanggal === bookingDate &&
        b.jam.startsWith(slot.slice(0, 2)) &&
        b.stafNama === selectedStaff.nama &&
        b.status !== "Dibatalkan"
    );
  };

  // Step Validation
  const canGoToStep2 = !!selectedCustomer && !!selectedPet;
  const canGoToStep3 = !!selectedService;
  const canGoToStep4 = !!bookingDate && !!bookingTime && !!selectedStaff && !isSlotClashing(bookingTime);

  // Handle Submit Booking
  const handleSaveBooking = () => {
    const newId = `BK-00${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedBookingId(newId);
    setIsSuccessModalOpen(true);
    showToast(`Reservasi ${newId} untuk ${selectedPet.nama} berhasil dibuat!`, "success");
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/booking"
            className="text-xs font-semibold text-[#6B7280] hover:text-[#C9772E] flex items-center gap-1 mb-1"
          >
            <ChevronLeft size={14} /> Kembali ke Kalender Booking
          </Link>
          <h1 className="text-2xl font-bold text-[#1F2937]">Buat Reservasi Baru</h1>
          <p className="text-xs text-[#6B7280]">
            Alur pemesanan jadwal layanan, pemilihan groomer, dan kalkulasi biaya.
          </p>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { step: 1, label: "1. Pelanggan & Anabul", icon: User },
            { step: 2, label: "2. Pilih Layanan", icon: Scissors },
            { step: 3, label: "3. Tanggal & Groomer", icon: Clock },
            { step: 4, label: "4. Konfirmasi", icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-[#C9772E]/10 text-[#C9772E] font-bold"
                    : isDone
                    ? "text-emerald-700 font-semibold cursor-pointer"
                    : "text-[#9CA3AF]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    isCurrent
                      ? "bg-[#C9772E] text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-[#ECE8E1] text-[#6B7280]"
                  }`}
                >
                  {isDone ? "✓" : item.step}
                </div>
                <span className="hidden sm:inline text-[11px] truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Pelanggan & Hewan */}
      {currentStep === 1 && (
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Langkah 1: Pilih Pelanggan & Anabul</h2>
            <p className="text-xs text-[#6B7280]">Cari pelanggan terdaftar dan tentukan anabul yang akan dirawat.</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Cari nama pelanggan atau nomor telepon..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    if (cust.pets.length > 0) setSelectedPet(cust.pets[0]);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#C9772E] bg-[#C9772E]/5 shadow-xs"
                      : "border-[#ECE8E1] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F2937] text-sm">{cust.nama}</span>
                    <span className="text-[11px] text-[#6B7280]">{cust.telepon}</span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">
                    Anabul: {cust.pets.map((p) => p.nama).join(", ") || "Belum ada anabul terdaftar"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pet Selector */}
          {selectedCustomer && (
            <div className="p-4 bg-[#F7F5F1] rounded-2xl space-y-3">
              <h3 className="font-bold text-xs text-[#4B5563] uppercase tracking-wider">
                Pilih Anabul dari {selectedCustomer.nama}
              </h3>

              {selectedCustomer.pets.length === 0 ? (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Pelanggan ini belum memiliki data anabul. Anabul sementara akan dicatat sebagai Tamu.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedCustomer.pets.map((pet) => {
                    const isPetSelected = selectedPet?.id === pet.id;
                    return (
                      <div
                        key={pet.id}
                        onClick={() => setSelectedPet(pet)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                          isPetSelected
                            ? "border-[#C9772E] bg-white ring-2 ring-[#C9772E]/40 font-bold"
                            : "border-[#ECE8E1] bg-white hover:border-[#C9772E]/40"
                        }`}
                      >
                        <span className="text-2xl">{pet.icon}</span>
                        <div>
                          <div className="text-xs text-[#1F2937]">{pet.nama}</div>
                          <div className="text-[10px] text-[#6B7280] font-normal">{pet.ras}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-[#ECE8E1]">
            <Button
              variant="primary"
              disabled={!canGoToStep2}
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5"
            >
              <span>Lanjut ke Pilih Layanan</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Layanan & Addon */}
      {currentStep === 2 && (
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Langkah 2: Pilih Layanan & Add-on</h2>
              <p className="text-xs text-[#6B7280]">
                Tentukan treatment untuk {selectedPet.nama} ({selectedPet.ras}).
              </p>
            </div>

            {/* Pet Size selector */}
            <div className="flex items-center gap-1 bg-[#F7F5F1] p-1 rounded-xl text-xs">
              {(["Kecil", "Sedang", "Besar"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setPetSize(size)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    petSize === size
                      ? "bg-white text-[#C9772E] shadow-xs"
                      : "text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialServices.map((service) => {
              const isSelected = selectedService.id === service.id;
              const price =
                petSize === "Kecil"
                  ? service.harga.kecil
                  : petSize === "Sedang"
                  ? service.harga.sedang
                  : service.harga.besar;

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-[#C9772E] bg-[#C9772E]/5 ring-2 ring-[#C9772E]/40"
                      : "border-[#ECE8E1] hover:border-[#C9772E]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs border border-[#ECE8E1]">
                        {service.icon}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-[#1F2937]">{service.nama}</div>
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                          <Clock size={11} /> {service.durasi} menit • {service.kategori}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">Biaya Ukuran {petSize}:</span>
                    <span className="font-bold text-[#C9772E] text-sm">{formatRupiah(price)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add-on selection */}
          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-xs text-[#4B5563] uppercase tracking-wider">
              Add-on & Perawatan Tambahan (Opsional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceAddons.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#C9772E] bg-[#C9772E]/5 font-semibold text-[#1F2937]"
                        : "border-[#ECE8E1] hover:bg-[#F7F5F1] text-[#4B5563]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
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
                      <span>{addon.nama}</span>
                    </div>
                    <span className="font-semibold text-[#C9772E]">{formatRupiah(addon.harga)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[#6B7280]">Estimasi Durasi: </span>
              <strong className="text-[#1F2937]">{estimatedDuration} Menit</strong>
            </div>
            <div>
              <span className="text-[#6B7280]">Total Biaya: </span>
              <strong className="text-[#C9772E] text-base font-bold">{formatRupiah(grandTotal)}</strong>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-[#ECE8E1]">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex items-center gap-1">
              <ChevronLeft size={16} /> Kembali
            </Button>
            <Button
              variant="primary"
              disabled={!canGoToStep3}
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5"
            >
              <span>Lanjut ke Jadwal & Staf</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Jadwal, Slot Jam, & Staf */}
      {currentStep === 3 && (
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Langkah 3: Pilih Tanggal, Jam & Groomer</h2>
            <p className="text-xs text-[#6B7280]">Sistem akan memverifikasi ketersediaan slot agar tidak bentrok.</p>
          </div>

          {/* Staff selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4B5563]">Pilih Groomer / Staf:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {initialStaffMembers.map((staff) => {
                const isSelected = selectedStaff.id === staff.id;
                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                      isSelected
                        ? "border-[#C9772E] bg-[#C9772E]/10 ring-2 ring-[#C9772E]/40 font-bold"
                        : "border-[#ECE8E1] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="text-2xl mb-1">{staff.avatar}</div>
                    <div className="text-xs text-[#1F2937] font-semibold">{staff.nama}</div>
                    <div className="text-[10px] text-[#6B7280]">{staff.peran}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">Pilih Tanggal Reservasi:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40 font-medium"
            />
          </div>

          {/* Time Slot Picker Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#4B5563]">
                Pilih Jam Kedatangan:
              </label>
              <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Warna merah = Jadwal Penuh
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {timeSlots.map((slot) => {
                const isClashing = isSlotClashing(slot);
                const isSelected = bookingTime === slot;

                return (
                  <button
                    key={slot}
                    disabled={isClashing}
                    onClick={() => setBookingTime(slot)}
                    type="button"
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                      isClashing
                        ? "bg-red-50 text-red-400 border border-red-200 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-[#C9772E] text-white shadow-xs"
                        : "bg-[#F7F5F1] text-[#374151] hover:bg-[#ECE8E1]"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-[#ECE8E1]">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex items-center gap-1">
              <ChevronLeft size={16} /> Kembali
            </Button>
            <Button
              variant="primary"
              disabled={!canGoToStep4}
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5"
            >
              <span>Lanjut ke Konfirmasi</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Konfirmasi & Simpan */}
      {currentStep === 4 && (
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Langkah 4: Konfirmasi Reservasi</h2>
            <p className="text-xs text-[#6B7280]">Periksa rincian data booking sebelum disimpan ke jadwal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer & Pet Details */}
            <div className="p-4 bg-[#F7F5F1] rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-[#1F2937] text-sm flex items-center gap-1.5 pb-2 border-b border-[#ECE8E1]">
                <User size={15} className="text-[#C9772E]" /> Data Pelanggan & Anabul
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Pelanggan:</span>
                <span className="font-semibold text-[#1F2937]">{selectedCustomer.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">No. Telepon:</span>
                <span className="font-semibold text-[#1F2937]">{selectedCustomer.telepon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Nama Anabul:</span>
                <span className="font-semibold text-[#1F2937]">
                  {selectedPet.nama} ({selectedPet.ras})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Ukuran:</span>
                <span className="font-semibold text-[#1F2937]">{petSize}</span>
              </div>
            </div>

            {/* Service & Schedule Details */}
            <div className="p-4 bg-[#F7F5F1] rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-[#1F2937] text-sm flex items-center gap-1.5 pb-2 border-b border-[#ECE8E1]">
                <CalendarDays size={15} className="text-[#C9772E]" /> Jadwal & Layanan
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Layanan:</span>
                <span className="font-semibold text-[#1F2937]">{selectedService.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Waktu:</span>
                <span className="font-semibold text-[#1F2937]">
                  {formatTanggal(bookingDate)} pukul {bookingTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Groomer:</span>
                <span className="font-semibold text-[#1F2937]">{selectedStaff.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Total Biaya:</span>
                <span className="font-bold text-[#C9772E] text-sm">{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes and WA reminder */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Catatan Khusus Grooming / Penyakit Bawaan:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Takut air hangat, telinga agak gatal, anabul manja..."
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-xs border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={sendWaReminder}
                onChange={(e) => setSendWaReminder(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <div className="text-emerald-950">
                <span className="font-bold flex items-center gap-1">
                  <MessageCircle size={14} /> Otomatis kirim notifikasi & pengingat jadwal via WhatsApp
                </span>
                <span className="text-[11px] text-emerald-800">
                  Pelanggan akan menerima detail bukti reservasi langsung ke nomor {selectedCustomer.telepon}.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-between pt-3 border-t border-[#ECE8E1]">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex items-center gap-1">
              <ChevronLeft size={16} /> Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBooking}
              className="flex items-center gap-1.5 bg-[#C9772E] hover:bg-[#b26624]"
            >
              <CheckCircle2 size={16} />
              <span>Simpan & Konfirmasi Booking</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modal Bukti Booking Sukses */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          router.push("/booking");
        }}
        title="Reservasi Berhasil Dibuat!"
      >
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl">
            ✨
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#1F2937]">Bukti Booking #{generatedBookingId}</h3>
            <p className="text-xs text-[#6B7280]">
              Jadwal telah tercatat dalam kalender dan siap dikerjakan pada tanggal yang ditentukan.
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F1] rounded-2xl text-left text-xs space-y-1.5 border border-[#ECE8E1]">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Anabul:</span>
              <strong className="text-[#1F2937]">{selectedPet?.nama} ({selectedPet?.ras})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Pemilik:</span>
              <strong className="text-[#1F2937]">{selectedCustomer?.nama}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Layanan:</span>
              <strong className="text-[#1F2937]">{selectedService?.nama}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Jadwal:</span>
              <strong className="text-[#1F2937]">{formatTanggal(bookingDate)} • {bookingTime} WIB</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Groomer:</span>
              <strong className="text-[#1F2937]">{selectedStaff?.nama}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#ECE8E1] text-sm">
              <span className="text-[#6B7280]">Estimasi Biaya:</span>
              <strong className="text-[#C9772E] font-bold">{formatRupiah(grandTotal)}</strong>
            </div>
          </div>

          {sendWaReminder && (
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <MessageCircle size={16} />
              <span>Simulasi pengingat WhatsApp berhasil dikirim ke nomor {selectedCustomer?.telepon}.</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                window.print();
              }}
              className="flex items-center gap-1.5"
            >
              <Printer size={15} /> Cetak Bukti
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push("/booking");
              }}
            >
              Selesai & Ke Kalender
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
