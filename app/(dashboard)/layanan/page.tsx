"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Scissors,
  Plus,
  Search,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  Tag,
  Star,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LayananNav } from "@/components/layanan/LayananNav";
import {
  initialServices,
  serviceAddons,
  ServiceItem,
  ServiceAddon,
} from "@/data/services";
import { formatRupiah } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";

export default function LayananKatalogPage() {
  const { showToast } = useToast();
  const { isAdmin } = useUserRole();

  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [addons] = useState<ServiceAddon[]>(serviceAddons);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedSizePreview, setSelectedSizePreview] = useState<"kecil" | "sedang" | "besar">("kecil");

  // Modal Tambah Layanan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ServiceItem["kategori"]>("Grooming");
  const [formDuration, setFormDuration] = useState(60);
  const [formPriceKecil, setFormPriceKecil] = useState(60000);
  const [formPriceSedang, setFormPriceSedang] = useState(80000);
  const [formPriceBesar, setFormPriceBesar] = useState(120000);
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("🛁");

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCat =
        selectedCategory === "Semua" || srv.kategori === selectedCategory;
      const matchQuery =
        srv.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Nama layanan wajib diisi!", "error");
      return;
    }

    const newService: ServiceItem = {
      id: `SRV-00${services.length + 1}`,
      nama: formName,
      kategori: formCategory,
      durasi: formDuration,
      harga: {
        kecil: formPriceKecil,
        sedang: formPriceSedang,
        besar: formPriceBesar,
      },
      deskripsi: formDescription || "Layanan perawatan profesional PawMart.",
      icon: formIcon,
      isActive: true,
    };

    setServices((prev) => [newService, ...prev]);
    setIsModalOpen(false);
    showToast(`Layanan '${formName}' berhasil ditambahkan ke katalog!`);
    setFormName("");
    setFormDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Katalog Layanan &amp; Jasa
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Paket grooming anabul, spa, potong styling, vaksinasi dokter, dan treatment khusus.
          </p>
        </div>

        {isAdmin ? (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="shadow-md shadow-[#C9772E]/20"
          >
            <Plus size={16} /> + Tambah Layanan
          </Button>
        ) : (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-medium">
            🐾 Mode Katalog Layanan
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <LayananNav />

      {/* Filter and Animal Size Selector */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama perawatan, paket spa, atau vaksin..."
              className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] text-xs sm:text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl border border-[#ECE8E1] focus:bg-white focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          {/* Ukuran Hewan Preview Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#6B7280] whitespace-nowrap">
              Patokan Ukuran Hewan:
            </span>
            <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#ECE8E1]">
              {(["kecil", "sedang", "besar"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSizePreview(sz)}
                  className={`text-xs px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    selectedSizePreview === sz
                      ? "bg-[#C9772E] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  {sz === "kecil"
                    ? "Kecil (< 5kg)"
                    : sz === "sedang"
                    ? "Sedang (5-15kg)"
                    : "Besar (> 15kg)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#ECE8E1] scrollbar-none">
          {["Semua", "Grooming", "Paket", "Kesehatan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#C9772E] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#6B7280] hover:bg-[#FBEBDD] hover:text-[#C9772E] border border-[#ECE8E1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredServices.map((srv) => {
          const currentPrice = srv.harga[selectedSizePreview];
          const isPaket = srv.kategori === "Paket";

          return (
            <Card
              key={srv.id}
              className={`p-5 flex flex-col justify-between transition-all hover:border-[#C9772E]/60 hover:shadow-md relative group ${
                isPaket ? "border-[#C9772E]/40 bg-gradient-to-b from-[#FBEBDD]/30 to-white" : ""
              }`}
            >
              {isPaket && (
                <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#C9772E] text-white shadow-xs flex items-center gap-1">
                  <Star size={11} /> Paling Hemat
                </span>
              )}

              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {srv.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9772E] bg-[#FBEBDD] px-2 py-0.5 rounded-md">
                      {srv.kategori}
                    </span>
                    <h3 className="font-extrabold text-base text-[#1F2937] mt-1 group-hover:text-[#C9772E] transition-colors">
                      {srv.nama}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                  {srv.deskripsi}
                </p>

                {/* Paket content list if any */}
                {srv.isiPaket && (
                  <div className="p-3 rounded-xl bg-white border border-[#ECE8E1] mb-4 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#1F2937]">Termasuk dalam paket:</p>
                    {srv.isiPaket.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                        <CheckCircle2 size={13} className="text-[#16A34A] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Duration & Size breakdown */}
                <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-4">
                  <span className="flex items-center gap-1 font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#ECE8E1]">
                    <Clock size={13} className="text-[#C9772E]" />
                    {srv.durasi} Menit
                  </span>
                  <span className="text-[11px]">
                    Kecil: {formatRupiah(srv.harga.kecil)} • Besar: {formatRupiah(srv.harga.besar)}
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-[#ECE8E1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6B7280] block">
                    Tarif Ukuran ({selectedSizePreview}):
                  </span>
                  <span className="text-lg font-black text-[#C9772E]">
                    {formatRupiah(currentPrice)}
                  </span>
                </div>

                <Link href={`/booking/baru?serviceId=${srv.id}`}>
                  <Button variant="primary" size="sm" className="text-xs shadow-xs">
                    <CalendarDays size={14} /> Booking Jadwal
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add-ons Perawatan Khusus */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-[#1F2937]">
              Layanan Tambahan (Add-on Grooming)
            </h3>
            <p className="text-xs text-[#6B7280]">
              Opsi ekstra saat anabul dimandikan atau di-styling.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FBEBDD] text-[#C9772E]">
            {addons.length} Pilihan Ekstra
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {addons.map((add) => (
            <div
              key={add.id}
              className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-xs text-[#1F2937]">{add.nama}</p>
                <p className="text-xs font-extrabold text-[#C9772E] mt-0.5">
                  +{formatRupiah(add.harga)}
                </p>
              </div>
              <span className="text-lg">✨</span>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL TAMBAH LAYANAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Layanan Jasa Baru"
        description="Daftarkan layanan grooming, paket, atau konsultasi dokter"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Nama Layanan *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Terapi Spa Aromaterapi Anabul"
              className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="Grooming">Grooming</option>
                <option value="Paket">Paket Hemat</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Penitipan">Penitipan</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Estimasi Durasi (Menit)
              </label>
              <input
                type="number"
                min="10"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value) || 30)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Emoji Ikon
              </label>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="🛁">🛁 Mandi</option>
                <option value="✂️">✂️ Cukur / Gunting</option>
                <option value="🧼">🧼 Medicated</option>
                <option value="🐾">🐾 Kuku & Telinga</option>
                <option value="⭐">⭐ Paket Spa</option>
                <option value="💉">💉 Vaksin</option>
                <option value="🩺">🩺 Konsultasi Dokter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
              Tarif Berdasarkan Ukuran Hewan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-[#6B7280] block mb-1">Kecil (&lt; 5kg)</span>
                <input
                  type="number"
                  value={formPriceKecil}
                  onChange={(e) => setFormPriceKecil(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs font-bold text-[#C9772E] focus:outline-none focus:border-[#C9772E]"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] block mb-1">Sedang (5-15kg)</span>
                <input
                  type="number"
                  value={formPriceSedang}
                  onChange={(e) => setFormPriceSedang(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs font-bold text-[#C9772E] focus:outline-none focus:border-[#C9772E]"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] block mb-1">Besar (&gt; 15kg)</span>
                <input
                  type="number"
                  value={formPriceBesar}
                  onChange={(e) => setFormPriceBesar(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs font-bold text-[#C9772E] focus:outline-none focus:border-[#C9772E]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Jelaskan tahapan atau manfaat perawatan ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Layanan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
