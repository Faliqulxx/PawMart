"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  PawPrint,
  ShieldAlert,
  ChevronRight,
  Eye,
  Heart,
  PlusCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { initialCustomers, Customer, Pet } from "@/data/customers";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { initialMemberBalances, memberTiers, initialVouchers } from "@/data/loyalty";
import { initialBookings } from "@/data/bookings";
import { Ticket, Scissors, CalendarDays } from "lucide-react";

export default function PelangganPage() {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalTab, setModalTab] = useState<"anabul" | "booking" | "layanan" | "loyalitas">("anabul");

  // Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Pet input during add
  const [formPetName, setFormPetName] = useState("");
  const [formPetType, setFormPetType] = useState<Pet["jenis"]>("Kucing");
  const [formPetBreed, setFormPetBreed] = useState("");
  const [formPetAge, setFormPetAge] = useState("");
  const [formPetVaccine, setFormPetVaccine] = useState("");

  // Add Pet to existing customer modal
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState<Pet["jenis"]>("Kucing");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetAge, setNewPetAge] = useState("");
  const [newPetVaccine, setNewPetVaccine] = useState("");

  // Summary Metrics
  const totalCustomers = customers.length;
  const totalPets = customers.reduce((acc, c) => acc + c.pets.length, 0);
  const totalPoints = customers.reduce((acc, c) => acc + c.poin, 0);

  // Filtered
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return (
        c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.telepon.includes(searchQuery) ||
        c.pets.some((p) => p.nama.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [customers, searchQuery]);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Nama pelanggan wajib diisi!", "error");
      return;
    }

    const newPets: Pet[] = [];
    if (formPetName.trim()) {
      newPets.push({
        id: `PET-${Date.now().toString().slice(-4)}`,
        nama: formPetName,
        jenis: formPetType,
        ras: formPetBreed || "Campuran",
        umur: formPetAge || "1 Tahun",
        berat: "3.5 kg",
        vaksinTerakhir: "Pemeriksaan Perdana",
        jadwalVaksinBerikutnya: formPetVaccine || "Rabies - Belum Dijadwalkan",
        icon: formPetType === "Kucing" ? "🐱" : formPetType === "Anjing" ? "🐶" : "🐰",
      });
    }

    const newCustomer: Customer = {
      id: `CUST-0${customers.length + 1}`,
      nama: formName,
      telepon: formPhone || "-",
      email: formEmail || "-",
      alamat: formAddress || "Jakarta",
      totalBelanja: 0,
      poin: 10, // bonus poin pendaftaran
      kunjunganTerakhir: new Date().toISOString().split("T")[0],
      pets: newPets,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setIsAddCustomerOpen(false);
    showToast(`Pelanggan baru ${formName} berhasil didaftarkan! (+10 Poin Sambutan)`);

    // Reset Form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormPetName("");
    setFormPetBreed("");
    setFormPetAge("");
    setFormPetVaccine("");
  };

  const handleAddPetToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newPetName.trim()) return;

    const newPet: Pet = {
      id: `PET-${Date.now().toString().slice(-4)}`,
      nama: newPetName,
      jenis: newPetType,
      ras: newPetBreed || "Domestik",
      umur: newPetAge || "1 Tahun",
      berat: "3.0 kg",
      vaksinTerakhir: "Tercatat di PawMart",
      jadwalVaksinBerikutnya: newPetVaccine || "Vaksin Tahunan",
      icon: newPetType === "Kucing" ? "🐱" : newPetType === "Anjing" ? "🐶" : "🐰",
    };

    const updatedCustomer = {
      ...selectedCustomer,
      pets: [...selectedCustomer.pets, newPet],
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c))
    );
    setSelectedCustomer(updatedCustomer);
    setIsAddPetModalOpen(false);
    showToast(`Hewan peliharaan "${newPetName}" berhasil ditambahkan!`);
    setNewPetName("");
    setNewPetBreed("");
    setNewPetAge("");
    setNewPetVaccine("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Data Pelanggan & Anabul
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Pusat loyalitas pelanggan, riwayat belanja, dan profil medis vaksin anabul.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddCustomerOpen(true)}
          className="shadow-md shadow-[#C9772E]/20"
        >
          <Plus size={16} /> + Tambah Pelanggan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">
              Total Pelanggan Terdaftar
            </p>
            <p className="text-2xl font-black text-[#1F2937] mt-1">
              {totalCustomers} Member
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FBEBDD] text-[#C9772E] flex items-center justify-center">
            <Users size={20} />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">
              Anabul Terdata
            </p>
            <p className="text-2xl font-black text-[#1F2937] mt-1">
              {totalPets} Ekor
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
            <PawPrint size={20} />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">
              Poin Loyalitas Beredar
            </p>
            <p className="text-2xl font-black text-[#C9772E] mt-1">
              {totalPoints.toLocaleString("id-ID")} Poin
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award size={20} />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemilik, nomor telepon, atau nama anabul..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] text-xs sm:text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl border border-[#ECE8E1] focus:bg-white focus:outline-none focus:border-[#C9772E]"
          />
        </div>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                  <th className="py-3 px-4 sm:px-6">Nama Pelanggan</th>
                  <th className="py-3 px-3">Kontak & Telepon</th>
                  <th className="py-3 px-3">Hewan Peliharaan</th>
                  <th className="py-3 px-3 text-right">Total Belanja</th>
                  <th className="py-3 px-3 text-center">Poin Reward</th>
                  <th className="py-3 px-3">Kunjungan Terakhir</th>
                  <th className="py-3 px-4 text-center">Detail & Anabul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E1]">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C9772E]/10 text-[#C9772E] font-bold text-xs flex items-center justify-center shrink-0">
                          {cust.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2937] group-hover:text-[#C9772E] transition-colors">
                            {cust.nama}
                          </p>
                          <span className="text-[11px] text-[#9CA3AF] font-mono">
                            {cust.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-[#9CA3AF]" />
                        <span>{cust.telepon}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {cust.pets.length === 0 ? (
                        <span className="text-xs text-[#9CA3AF]">-</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cust.pets.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-[11px] font-medium text-[#1F2937]"
                            >
                              <span>{p.icon}</span>
                              <span>{p.nama}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-extrabold text-[#1F2937]">
                      {formatRupiah(cust.totalBelanja)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {(() => {
                        const member = initialMemberBalances.find(
                          (m) => m.id === cust.id || m.nama.toLowerCase() === cust.nama.toLowerCase()
                        );
                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-[#FBEBDD] text-[#C9772E] font-bold text-xs">
                              {cust.poin} pts
                            </span>
                            {member && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  memberTiers[member.tier].badgeBg
                                }`}
                              >
                                {member.tier}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-3 text-[#6B7280]">
                      {formatTanggal(cust.kunjunganTerakhir)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                          setModalTab("anabul");
                        }}
                      >
                        <Eye size={14} /> Lihat Profil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL / DRAWER PELANGGAN & HEWAN PELIHARAAN */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Profil Member: ${selectedCustomer.nama}`}
          description={`ID: ${selectedCustomer.id} • Terakhir berkunjung: ${formatTanggal(
            selectedCustomer.kunjunganTerakhir
          )}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Customer Contact & Stats Header */}
            {(() => {
              const member = initialMemberBalances.find(
                (m) =>
                  m.id === selectedCustomer.id ||
                  m.nama.toLowerCase() === selectedCustomer.nama.toLowerCase()
              );

              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-xs">
                  <div>
                    <p className="text-[#6B7280] text-[11px]">Nomor Telepon</p>
                    <p className="font-bold text-[#1F2937] text-xs mt-0.5">
                      {selectedCustomer.telepon}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280] text-[11px]">Total Belanja</p>
                    <p className="font-bold text-[#C9772E] text-xs mt-0.5">
                      {formatRupiah(selectedCustomer.totalBelanja)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280] text-[11px]">Tingkat Member</p>
                    <p className="font-bold text-[#1F2937] text-xs mt-0.5">
                      {member ? (
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${memberTiers[member.tier].badgeBg}`}>
                          ★ {member.tier}
                        </span>
                      ) : (
                        "Non-Member"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280] text-[11px]">Saldo Poin</p>
                    <p className="font-bold text-[#16A34A] text-xs mt-0.5">
                      {selectedCustomer.poin} Poin
                    </p>
                  </div>
                  <div className="sm:col-span-4 pt-1.5 border-t border-[#ECE8E1] flex items-center gap-1.5 text-[#6B7280] text-[11px]">
                    <MapPin size={13} className="shrink-0 text-[#C9772E]" />
                    <span className="truncate">{selectedCustomer.alamat}</span>
                  </div>
                </div>
              );
            })()}

            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center gap-1 p-1 bg-[#ECE8E1]/60 rounded-xl overflow-x-auto">
              {[
                { id: "anabul", label: `🐾 Anabul (${selectedCustomer.pets.length})` },
                { id: "booking", label: "📅 Jadwal Booking" },
                { id: "layanan", label: "✂️ Riwayat Layanan" },
                { id: "loyalitas", label: "👑 Loyalitas & Voucher" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    modalTab === tab.id
                      ? "bg-white text-[#C9772E] shadow-xs"
                      : "text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: ANABUL & VAKSIN */}
            {modalTab === "anabul" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#1F2937]">
                    Daftar Hewan Peliharaan Terdaftar
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs py-1"
                    onClick={() => setIsAddPetModalOpen(true)}
                  >
                    <PlusCircle size={13} /> + Tambah Anabul
                  </Button>
                </div>

                {selectedCustomer.pets.length === 0 ? (
                  <div className="p-6 text-center text-[#9CA3AF] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#ECE8E1]">
                    <PawPrint size={24} className="mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Belum ada data hewan peliharaan.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {selectedCustomer.pets.map((pet) => (
                      <div
                        key={pet.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#ECE8E1] shadow-xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1.5 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1]">
                              {pet.icon}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-[#1F2937]">
                                {pet.nama}
                              </div>
                              <div className="text-[11px] text-[#6B7280]">
                                {pet.jenis} • {pet.ras} • {pet.umur} ({pet.berat})
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
                            <span className="text-[#6B7280] block text-[10px]">Vaksin Terakhir:</span>
                            <span className="font-semibold text-[#1F2937]">{pet.vaksinTerakhir}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                            <span className="text-amber-800 font-bold block text-[10px]">Jadwal Vaksin:</span>
                            <span className="font-bold text-amber-900">{pet.jadwalVaksinBerikutnya}</span>
                          </div>
                        </div>

                        {pet.catatanKhusus && (
                          <div className="text-[11px] text-[#6B7280] bg-gray-50 p-2 rounded-lg">
                            💬 Catatan: {pet.catatanKhusus}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BOOKING */}
            {modalTab === "booking" && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#1F2937]">
                  Jadwal Reservasi Layanan
                </h4>
                {(() => {
                  const custBookings = initialBookings.filter(
                    (b) =>
                      b.pelangganNama.toLowerCase() === selectedCustomer.nama.toLowerCase() ||
                      b.pelangganId === selectedCustomer.id
                  );

                  if (custBookings.length === 0) {
                    return (
                      <div className="p-6 text-center text-[#9CA3AF] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#ECE8E1] text-xs">
                        Tidak ada riwayat booking aktif untuk pelanggan ini.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {custBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 bg-white rounded-xl border border-[#ECE8E1] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#1F2937] flex items-center gap-1.5">
                              <span>{b.hewanIcon}</span>
                              <span>{b.layananNama}</span>
                              <span className="text-[#6B7280] font-normal">({b.hewanNama})</span>
                            </div>
                            <div className="text-[11px] text-[#6B7280]">
                              {formatTanggal(b.tanggal)} • {b.jam} WIB • Petugas: {b.stafNama}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={b.status === "Selesai" ? "success" : "info"}>
                              {b.status}
                            </Badge>
                            <div className="text-[11px] font-bold text-[#C9772E] mt-0.5">
                              {formatRupiah(b.totalHarga)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: RIWAYAT LAYANAN */}
            {modalTab === "layanan" && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#1F2937]">
                  Riwayat Pengerjaan Grooming & Penitipan
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div className="p-3 bg-white rounded-xl border border-[#ECE8E1] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#1F2937]">
                      <span>🛁 Mandi Biasa + Detangling (Mochi)</span>
                      <span className="text-[#C9772E]">{formatRupiah(65000)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#6B7280]">
                      <span>11 Okt 2026 • Groomer: Dewi Lestari</span>
                      <span className="text-emerald-600 font-semibold">Selesai Dibayar</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#ECE8E1] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#1F2937]">
                      <span>🏨 Pet Hotel: Kamar VIP 4 Malam (Bruno)</span>
                      <span className="text-[#C9772E]">{formatRupiah(620000)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#6B7280]">
                      <span>09 - 13 Okt 2026 • Petugas: Bagas Setiawan</span>
                      <span className="text-blue-600 font-semibold">Sedang Menginap</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LOYALITAS & VOUCHER */}
            {modalTab === "loyalitas" && (
              <div className="space-y-3 text-xs">
                {(() => {
                  const member = initialMemberBalances.find(
                    (m) =>
                      m.id === selectedCustomer.id ||
                      m.nama.toLowerCase() === selectedCustomer.nama.toLowerCase()
                  );

                  return (
                    <div className="space-y-3">
                      {member && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] tracking-wider uppercase font-bold text-amber-200">
                                PawMart VIP Club • {member.tier}
                              </span>
                              <h4 className="text-base font-bold mt-0.5">{member.nama}</h4>
                              <p className="text-[11px] font-mono text-white/80">{member.nomorKartu}</p>
                            </div>
                            <span className="text-2xl font-black text-amber-300">
                              {member.poin} Poin
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-white/20 text-[11px] flex justify-between">
                            <span>Akumulasi: {formatRupiah(member.totalBelanja)}</span>
                            <span>{memberTiers[member.tier].keuntungan[0]}</span>
                          </div>
                        </div>
                      )}

                      <h4 className="font-bold text-xs text-[#1F2937]">Voucher Tersedia untuk Member:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {initialVouchers.slice(0, 4).map((v) => (
                          <div key={v.kode} className="p-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/40 text-xs">
                            <div className="font-bold text-[#1F2937] flex justify-between">
                              <span>{v.kode}</span>
                              <span className="text-[#C9772E] font-semibold">{v.nama}</span>
                            </div>
                            <div className="text-[10px] text-[#6B7280] mt-1">
                              Min. Belanja: {formatRupiah(v.minBelanja)} • s/d {v.berlakuSampai}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="pt-2 border-t border-[#ECE8E1] flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL TAMBAH PELANGGAN BARU */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Pendaftaran Pelanggan Baru"
        description="Masukkan data pemilik dan data hewan peliharaan"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9772E]">
              Data Pemilik
            </h4>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Rina Sari"
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Alamat Tinggal
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Jl. Kemang Selatan No. ..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          {/* Optional Pet Section */}
          <div className="pt-3 border-t border-[#ECE8E1] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9772E]">
              Data Hewan Peliharaan (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Nama Anabul
                </label>
                <input
                  type="text"
                  value={formPetName}
                  onChange={(e) => setFormPetName(e.target.value)}
                  placeholder="Contoh: Mochi / Bruno"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Jenis Hewan
                </label>
                <select
                  value={formPetType}
                  onChange={(e) => setFormPetType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
                >
                  <option value="Kucing">Kucing</option>
                  <option value="Anjing">Anjing</option>
                  <option value="Kelinci">Kelinci</option>
                  <option value="Hamster">Hamster</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Ras
                </label>
                <input
                  type="text"
                  value={formPetBreed}
                  onChange={(e) => setFormPetBreed(e.target.value)}
                  placeholder="British Shorthair / Golden"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Umur
                </label>
                <input
                  type="text"
                  value={formPetAge}
                  onChange={(e) => setFormPetAge(e.target.value)}
                  placeholder="1.5 Tahun"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Jadwal Vaksin / Kontrol
              </label>
              <input
                type="text"
                value={formPetVaccine}
                onChange={(e) => setFormPetVaccine(e.target.value)}
                placeholder="Rabies - 15 Nov 2025"
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddCustomerOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Daftarkan Pelanggan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL TAMBAH ANABUL KE PELANGGAN YANG DIPILIH */}
      <Modal
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        title={`Tambah Anabul Baru untuk ${selectedCustomer?.nama}`}
        description="Lengkapi profil anabul untuk pengingat jadwal vaksin"
        maxWidth="md"
      >
        <form onSubmit={handleAddPetToCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Nama Anabul *
              </label>
              <input
                type="text"
                required
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="Contoh: Chiki"
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Jenis Hewan
              </label>
              <select
                value={newPetType}
                onChange={(e) => setNewPetType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="Kucing">Kucing</option>
                <option value="Anjing">Anjing</option>
                <option value="Kelinci">Kelinci</option>
                <option value="Hamster">Hamster</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Ras
              </label>
              <input
                type="text"
                value={newPetBreed}
                onChange={(e) => setNewPetBreed(e.target.value)}
                placeholder="Contoh: Persian / Poodle"
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Umur
              </label>
              <input
                type="text"
                value={newPetAge}
                onChange={(e) => setNewPetAge(e.target.value)}
                placeholder="Contoh: 8 Bulan"
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Jadwal Vaksin Berikutnya
            </label>
            <input
              type="text"
              value={newPetVaccine}
              onChange={(e) => setNewPetVaccine(e.target.value)}
              placeholder="Contoh: Vaksin F3 - 10 Des 2025"
              className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddPetModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Anabul
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
