"use client";

import React, { useState } from "react";
import {
  Store,
  Users,
  Receipt,
  Percent,
  Palette,
  Save,
  Plus,
  Shield,
  CheckCircle2,
  Volume2,
  Scissors,
  Clock,
  MessageCircle,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  initialStoreProfile,
  initialStaff,
  initialReceiptSettings,
  initialTaxSettings,
  StoreProfile,
  StaffUser,
  ReceiptSettings,
  TaxSettings,
} from "@/data/settings";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";
import { Lock } from "lucide-react";

export default function PengaturanPage() {
  const { showToast } = useToast();
  const { isAdmin, currentUser } = useUserRole();

  const [activeTab, setActiveTab] = useState<
    | "profil"
    | "pengguna"
    | "struk"
    | "pajak"
    | "tampilan"
    | "layanan"
    | "jam"
    | "pengingat"
    | "loyalitas"
  >("profil");

  // State forms
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(initialStoreProfile);
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaff);
  const [receiptSettings, setReceiptSettings] =
    useState<ReceiptSettings>(initialReceiptSettings);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(initialTaxSettings);

  // Appearance state
  const [fontSize, setFontSize] = useState<"standard" | "large">("standard");
  const [scannerSound, setScannerSound] = useState(true);

  // Phase 2 Settings State
  const [hMin1Wa, setHMin1Wa] = useState(true);
  const [hMin3HoursWa, setHMin3HoursWa] = useState(true);
  const [waTemplate, setWaTemplate] = useState(
    "Halo Kak {nama_pelanggan}! Mengingatkan jadwal perawatan {nama_hewan} pada {tanggal} jam {jam} WIB di PawMart POS."
  );

  const handleSave = (section: string) => {
    if (!isAdmin && section !== "tampilan") {
      showToast("Akses ditolak: Hanya Owner yang dapat menyimpan pengaturan ini!", "error");
      return;
    }
    showToast(`Pengaturan ${section} berhasil disimpan!`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
          Pengaturan Toko & POS
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Konfigurasi identitas toko, akun kasir, format struk, layanan, pengingat, dan loyalitas.
        </p>
      </div>

      {/* Role Protection Banner for Non-Admin */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <p className="font-bold text-amber-900">
                Mode Akses Terbatas ({currentUser.roleLabel})
              </p>
              <p className="text-amber-800/80 mt-0.5">
                Pengaturan master toko (Profil, Akun Staf, Pajak, Struk) dilindungi untuk Owner. Anda dapat menyesuaikan preferensi tab "Tampilan & Sistem".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#ECE8E1] pb-2 scrollbar-none">
        {[
          { id: "profil", label: "Profil Toko", icon: Store },
          { id: "pengguna", label: "Pengguna & Peran", icon: Users },
          { id: "layanan", label: "Layanan & Tarif", icon: Scissors },
          { id: "jam", label: "Jam & Slot", icon: Clock },
          { id: "pengingat", label: "Pengingat WA", icon: MessageCircle },
          { id: "loyalitas", label: "Aturan Loyalitas", icon: Award },
          { id: "struk", label: "Pengaturan Struk", icon: Receipt },
          { id: "pajak", label: "Pajak & Biaya", icon: Percent },
          { id: "tampilan", label: "Tampilan & Sistem", icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#C9772E] text-white shadow-xs"
                  : "bg-white text-[#6B7280] hover:bg-[#FBEBDD] hover:text-[#C9772E] border border-[#ECE8E1]"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL TOKO */}
      {activeTab === "profil" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Identitas & Kontak Toko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Nama Toko Pet Shop
                </label>
                <input
                  type="text"
                  value={storeProfile.namaToko}
                  onChange={(e) =>
                    setStoreProfile({ ...storeProfile, namaToko: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Slogan / Tagline Toko
                </label>
                <input
                  type="text"
                  value={storeProfile.slogan}
                  onChange={(e) =>
                    setStoreProfile({ ...storeProfile, slogan: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Alamat Lengkap Toko
              </label>
              <textarea
                rows={2}
                value={storeProfile.alamat}
                onChange={(e) =>
                  setStoreProfile({ ...storeProfile, alamat: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={storeProfile.telepon}
                  onChange={(e) =>
                    setStoreProfile({ ...storeProfile, telepon: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Email Toko
                </label>
                <input
                  type="email"
                  value={storeProfile.email}
                  onChange={(e) =>
                    setStoreProfile({ ...storeProfile, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                  Website Toko
                </label>
                <input
                  type="text"
                  value={storeProfile.website}
                  onChange={(e) =>
                    setStoreProfile({ ...storeProfile, website: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Catatan Footer Struk Standar
              </label>
              <textarea
                rows={2}
                value={storeProfile.catatanStruk}
                onChange={(e) =>
                  setStoreProfile({ ...storeProfile, catatanStruk: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => handleSave("Profil Toko")}
                className="shadow-md shadow-[#C9772E]/20"
              >
                <Save size={16} /> Simpan Profil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: PENGGUNA & PERAN */}
      {activeTab === "pengguna" && (
        <div className="space-y-4 max-w-4xl">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Pengguna &amp; Peran Kasir</CardTitle>
                <p className="text-xs text-[#6B7280]">
                  Kelola staf yang memiliki akses masuk ke PawMart POS.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() =>
                  showToast(
                    "Modal tambah staf disiapkan untuk tahap backend Supabase Auth!",
                    "info"
                  )
                }
              >
                <Plus size={14} /> + Tambah Pengguna
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-[#ECE8E1]">
                {staffList.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FBEBDD] text-xl flex items-center justify-center shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[#1F2937]">
                            {user.nama}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.role === "Admin"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : user.role === "Kasir"
                                ? "bg-[#FBEBDD] text-[#C9772E]"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                          Login terakhir: {user.loginTerakhir}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="success">Aktif</Badge>
                      <button
                        onClick={() =>
                          showToast(`Akses staf '${user.nama}' sudah aktif.`)
                        }
                        className="text-xs text-[#C9772E] font-medium hover:underline px-2 py-1"
                      >
                        Edit Peran
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: PENGATURAN STRUK */}
      {activeTab === "struk" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Konfigurasi Cetak Struk Kasir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Lebar Kertas Printer Thermal
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "58mm", label: "58 mm (Printer Kasir Mini / Bluetooth)" },
                  { id: "80mm", label: "80 mm (Printer Desktop Standar)" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setReceiptSettings({
                        ...receiptSettings,
                        lebarKertas: p.id as any,
                      })
                    }
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      receiptSettings.lebarKertas === p.id
                        ? "bg-[#C9772E] text-white border-[#C9772E]"
                        : "bg-[#FAF8F5] text-[#1F2937] border-[#ECE8E1]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#1F2937] block">
                Pilihan Elemen Header &amp; Footer:
              </label>

              {[
                {
                  key: "tampilkanLogo",
                  label: "Tampilkan Logo Paw Print di Bagian Atas",
                },
                {
                  key: "tampilkanAlamat",
                  label: "Tampilkan Alamat Lengkap Toko di Struk",
                },
                {
                  key: "tampilkanKontak",
                  label: "Tampilkan No Telepon & Website",
                },
                {
                  key: "tampilkanPoinPelanggan",
                  label: "Tampilkan Akumulasi Poin Reward Pelanggan",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#ECE8E1] bg-[#FAF8F5] cursor-pointer hover:bg-white text-xs font-medium text-[#1F2937]"
                >
                  <input
                    type="checkbox"
                    checked={(receiptSettings as any)[item.key]}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="accent-[#C9772E] w-4 h-4 rounded"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Pesan Penutup Struk
              </label>
              <input
                type="text"
                value={receiptSettings.pesanPenutup}
                onChange={(e) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    pesanPenutup: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => handleSave("Format Struk")}
                className="shadow-md shadow-[#C9772E]/20"
              >
                <Save size={16} /> Simpan Format Struk
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PAJAK & BIAYA */}
      {activeTab === "pajak" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Pengaturan PPN &amp; Biaya Layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937]">
                    Pajak Pertambahan Nilai (PPN)
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Kalkulasi pajak otomatis pada setiap transaksi kasir.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={taxSettings.pajakAktif}
                  onChange={(e) =>
                    setTaxSettings({
                      ...taxSettings,
                      pajakAktif: e.target.checked,
                    })
                  }
                  className="accent-[#C9772E] w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {taxSettings.pajakAktif && (
                <div className="pt-3 border-t border-[#ECE8E1] flex items-center gap-3">
                  <span className="text-xs text-[#6B7280]">Persentase PPN:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      value={taxSettings.persentasePajak}
                      onChange={(e) =>
                        setTaxSettings({
                          ...taxSettings,
                          persentasePajak: Number(e.target.value),
                        })
                      }
                      className="w-full pr-7 pl-3 py-1.5 rounded-lg border border-[#ECE8E1] text-xs font-bold text-[#1F2937]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-bold">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937]">
                    Biaya Layanan / Admin (Grooming / Packaging)
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    Tambahan biaya penanganan khusus saat transaksi.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={taxSettings.biayaLayananAktif}
                  onChange={(e) =>
                    setTaxSettings({
                      ...taxSettings,
                      biayaLayananAktif: e.target.checked,
                    })
                  }
                  className="accent-[#C9772E] w-5 h-5 rounded cursor-pointer"
                />
              </div>

              {taxSettings.biayaLayananAktif && (
                <div className="pt-3 border-t border-[#ECE8E1] flex items-center gap-3">
                  <span className="text-xs text-[#6B7280]">Nominal Flat (Rp):</span>
                  <input
                    type="number"
                    value={taxSettings.nominalBiayaLayanan}
                    onChange={(e) =>
                      setTaxSettings({
                        ...taxSettings,
                        nominalBiayaLayanan: Number(e.target.value),
                      })
                    }
                    className="w-36 px-3 py-1.5 rounded-lg border border-[#ECE8E1] text-xs font-bold text-[#1F2937]"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => handleSave("Pajak & Biaya")}
                className="shadow-md shadow-[#C9772E]/20"
              >
                <Save size={16} /> Simpan Pajak
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: TAMPILAN & SISTEM */}
      {activeTab === "tampilan" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Preferensi Tampilan Kasir &amp; Perangkat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Tema Warna PawMart
              </label>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#C9772E] flex items-center justify-center text-white font-bold text-xs">
                    🐾
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1F2937]">
                      Warm Cream &amp; Amber Orange (Default Resmi)
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Kontras visual tinggi sesuai standar WCAG AA
                    </p>
                  </div>
                </div>
                <Badge variant="primary">Aktif</Badge>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Ukuran Font Teks Kasir
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFontSize("standard")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left ${
                    fontSize === "standard"
                      ? "bg-[#C9772E] text-white border-[#C9772E]"
                      : "bg-[#FAF8F5] text-[#1F2937] border-[#ECE8E1]"
                  }`}
                >
                  Ukuran Standar (14px)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("large")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left ${
                    fontSize === "large"
                      ? "bg-[#C9772E] text-white border-[#C9772E]"
                      : "bg-[#FAF8F5] text-[#1F2937] border-[#ECE8E1]"
                  }`}
                >
                  Ukuran Besar (16px - Ramah Tablet)
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#ECE8E1]">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#ECE8E1] bg-[#FAF8F5] cursor-pointer">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-[#C9772E]" />
                  <div>
                    <p className="text-xs font-bold text-[#1F2937]">
                      Efek Suara Beep Saat Scan Barcode
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Umpan balik audio saat produk ditambahkan ke keranjang kasir
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scannerSound}
                  onChange={(e) => setScannerSound(e.target.checked)}
                  className="accent-[#C9772E] w-5 h-5 rounded"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => handleSave("Tampilan & Sistem")}
                className="shadow-md shadow-[#C9772E]/20"
              >
                <Save size={16} /> Simpan Preferensi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: LAYANAN & TARIF */}
      {activeTab === "layanan" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Pengaturan Layanan & Kebijakan Tarif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-[#6B7280]">
              Tarif dasar pengerjaan salon grooming dan penitipan pet hotel PawMart POS.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] space-y-2">
                <h4 className="font-bold text-sm text-[#1F2937]">Mandi Biasa (Basic Bath)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Kecil (&lt; 5kg)</label>
                    <input defaultValue="50000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Sedang (5-15kg)</label>
                    <input defaultValue="70000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Besar (&gt; 15kg)</label>
                    <input defaultValue="100000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] space-y-2">
                <h4 className="font-bold text-sm text-[#1F2937]">Penitipan Kamar Pet Hotel (/malam)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Kamar Standar</label>
                    <input defaultValue="60000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Kamar Premium</label>
                    <input defaultValue="90000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6B7280]">Kamar VIP (AC)</label>
                    <input defaultValue="130000" className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#ECE8E1] font-bold" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave("Tarif Layanan")}>
                <Save size={16} /> Simpan Tarif
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: JAM & SLOT */}
      {activeTab === "jam" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Jam Operasional & Slot Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Jam Buka Salon:</label>
                <input defaultValue="09:00" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Jam Tutup Salon:</label>
                <input defaultValue="18:00" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#4B5563] block mb-1">Interval Slot Kalender:</label>
              <select defaultValue="60" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-semibold">
                <option value="30">Setiap 30 Menit</option>
                <option value="45">Setiap 45 Menit</option>
                <option value="60">Setiap 60 Menit (1 Jam)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave("Jam Operasional")}>
                <Save size={16} /> Simpan Jadwal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 8: PENGINGAT WA */}
      {activeTab === "pengingat" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Pengingat WhatsApp Otomatis (Simulasi)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-[#ECE8E1] bg-[#FAF8F5] cursor-pointer">
                <div>
                  <span className="font-bold text-[#1F2937] block">Pengingat H-1 Jadwal Reservasi</span>
                  <span className="text-[11px] text-[#6B7280]">Kirim otomatis 24 jam sebelum waktu pengerjaan</span>
                </div>
                <input
                  type="checkbox"
                  checked={hMin1Wa}
                  onChange={(e) => setHMin1Wa(e.target.checked)}
                  className="accent-[#C9772E] w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#ECE8E1] bg-[#FAF8F5] cursor-pointer">
                <div>
                  <span className="font-bold text-[#1F2937] block">Pengingat H-3 Jam Sebelum Datang</span>
                  <span className="text-[11px] text-[#6B7280]">Notifikasi singkat agar pemilik bersiap mengantar anabul</span>
                </div>
                <input
                  type="checkbox"
                  checked={hMin3HoursWa}
                  onChange={(e) => setHMin3HoursWa(e.target.checked)}
                  className="accent-[#C9772E] w-5 h-5 rounded"
                />
              </label>
            </div>

            <div>
              <label className="font-bold text-[#4B5563] block mb-1">Templat Pesan WhatsApp:</label>
              <textarea
                rows={3}
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                className="w-full p-3 bg-[#F7F5F1] rounded-xl font-mono text-xs border-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave("Pengingat WhatsApp")}>
                <Save size={16} /> Simpan Pengingat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 9: ATURAN LOYALITAS */}
      {activeTab === "loyalitas" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Konfigurasi Aturan Program Loyalitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Rasio Belanja per 1 Poin:</label>
                <input defaultValue="10000" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Bonus Poin Layanan Jasa:</label>
                <input defaultValue="2x Lipat" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Masa Berlaku Poin (Bulan):</label>
                <input defaultValue="12" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Bonus Ulang Tahun Anabul:</label>
                <input defaultValue="50 Poin" className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl border-none font-bold" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave("Aturan Loyalitas")}>
                <Save size={16} /> Simpan Aturan Poin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
