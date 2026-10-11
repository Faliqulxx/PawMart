"use client";

import React, { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Sparkles,
  Gift,
  CheckCircle2,
  Clock,
  Tag,
  Copy,
  Scissors,
  Calendar,
  AlertCircle,
  Percent,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { LoyaltyNav } from "@/components/loyalty/LoyaltyNav";
import { formatRupiah, formatTanggal } from "@/lib/format";
import {
  initialVouchers,
  VoucherItem,
  rewardCatalog,
  RewardItem,
  initialMemberBalances,
} from "@/data/loyalty";

export default function LoyaltyVoucherPage() {
  const { showToast } = useToast();

  const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
  const [rewards, setRewards] = useState<RewardItem[]>(rewardCatalog);
  const [activeUserPoints, setActiveUserPoints] = useState<number>(
    initialMemberBalances[0].poin // Rina Sari (820 Poin)
  );

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Buat Voucher Baru
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKode, setNewKode] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newTipe, setNewTipe] = useState<"nominal" | "persen">("nominal");
  const [newNilai, setNewNilai] = useState<number>(10000);
  const [newMinBelanja, setNewMinBelanja] = useState<number>(50000);
  const [newExpiry, setNewExpiry] = useState<string>("2026-12-31");
  const [newKuota, setNewKuota] = useState<number>(50);
  const [newDeskripsi, setNewDeskripsi] = useState("");

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchStatus = filterStatus === "Semua" || v.status === filterStatus;
    const matchQuery =
      !searchQuery ||
      v.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  // Handle Copy Voucher Code
  const handleCopyCode = (kode: string) => {
    navigator.clipboard.writeText(kode);
    showToast(`Kode voucher "${kode}" disalin ke clipboard!`, "info");
  };

  // Handle Redeem Reward
  const handleRedeemReward = (reward: RewardItem) => {
    if (activeUserPoints < reward.poinDibutuhkan) {
      showToast("Poin tidak mencukupi untuk menukar hadiah ini", "error");
      return;
    }

    setActiveUserPoints((prev) => prev - reward.poinDibutuhkan);
    showToast(
      `Berhasil menukarkan ${reward.poinDibutuhkan} poin dengan "${reward.nama}"!`,
      "success"
    );
  };

  // Handle Create Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKode.trim()) {
      showToast("Kode voucher wajib diisi", "error");
      return;
    }

    const created: VoucherItem = {
      kode: newKode.toUpperCase(),
      nama: newNama || `Voucher ${newKode.toUpperCase()}`,
      tipe: newTipe,
      nilai: newNilai,
      minBelanja: newMinBelanja,
      berlakuSampai: newExpiry,
      kuota: newKuota,
      status: "Aktif",
      deskripsi: newDeskripsi || `Potongan ${newTipe === "nominal" ? formatRupiah(newNilai) : `${newNilai}%`}`,
    };

    setVouchers([created, ...vouchers]);
    setIsCreateModalOpen(false);
    setNewKode("");
    setNewNama("");
    setNewDeskripsi("");
    showToast(`Voucher ${created.kode} berhasil dibuat!`, "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <Ticket size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Katalog Voucher & Tukar Poin</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Kupon promosi diskon kasir dan penukaran poin loyalti anabul.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus size={18} />
            <span>Buat Voucher Baru</span>
          </Button>
        </div>
      </div>

      {/* Sub Nav */}
      <LoyaltyNav />

      {/* Section 1: Reward Catalog (Tukar Poin) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-5 rounded-3xl border border-amber-200/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <Gift size={20} className="text-[#C9772E]" /> Katalog Tukar Poin Hadiah
            </h2>
            <p className="text-xs text-[#6B7280]">
              Tukarkan poin member dengan potongan belanja atau layanan perawatan gratis.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-amber-300 shadow-2xs text-xs">
            <span className="text-[#6B7280]">Simulasi Poin Member (Rina Sari):</span>
            <span className="font-extrabold text-[#C9772E] text-sm">{activeUserPoints} POIN</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {rewards.map((reward) => {
            const canAfford = activeUserPoints >= reward.poinDibutuhkan;

            return (
              <div
                key={reward.id}
                className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1]">
                      {reward.icon}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                      ★ {reward.poinDibutuhkan} Poin
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1F2937] mt-2.5">{reward.nama}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{reward.deskripsi}</p>
                </div>

                <Button
                  size="sm"
                  variant={canAfford ? "primary" : "outline"}
                  disabled={!canAfford}
                  onClick={() => handleRedeemReward(reward)}
                  className={`w-full text-xs font-semibold ${
                    !canAfford ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {canAfford ? "Tukarkan Sekarang" : "Poin Belum Cukup"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Daftar Voucher Aktif */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Daftar Voucher Promosi Toko</h2>
            <p className="text-xs text-[#6B7280]">Voucher yang dapat diinput kasir saat proses pembayaran.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Cari voucher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#ECE8E1] rounded-xl text-xs focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#ECE8E1] rounded-xl text-xs font-medium text-[#374151]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Habis">Habis</option>
              <option value="Kedaluwarsa">Kedaluwarsa</option>
            </select>
          </div>
        </div>

        {/* Voucher Cards Grid with Ticket Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => {
            const isExpired = voucher.status === "Kedaluwarsa";
            const isOutOfStock = voucher.status === "Habis";

            return (
              <div
                key={voucher.kode}
                className={`relative bg-white rounded-2xl border shadow-xs transition-all overflow-hidden flex flex-col justify-between ${
                  isExpired || isOutOfStock
                    ? "border-[#ECE8E1] opacity-75"
                    : "border-amber-200 hover:border-[#C9772E]"
                }`}
              >
                {/* Top header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#C9772E] tracking-wider uppercase">
                        PawMart Voucher
                      </span>
                      <h3 className="font-bold text-base text-[#1F2937] mt-0.5">
                        {voucher.nama}
                      </h3>
                    </div>
                    <Badge
                      variant={
                        voucher.status === "Aktif"
                          ? "success"
                          : voucher.status === "Habis"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {voucher.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#6B7280] mt-1">{voucher.deskripsi}</p>
                </div>

                {/* Perforated ticket divider line */}
                <div className="relative flex items-center px-4 my-1">
                  <div className="w-full border-t-2 border-dashed border-[#ECE8E1]" />
                  <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-[#F7F5F1] border-r border-[#ECE8E1]" />
                  <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-[#F7F5F1] border-l border-[#ECE8E1]" />
                </div>

                {/* Bottom coupon details */}
                <div className="p-4 pt-3 space-y-3 bg-[#FAF8F5]/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Min. Belanja: <strong>{formatRupiah(voucher.minBelanja)}</strong>
                    </span>
                    <span className="text-[#6B7280]">
                      Berlaku s/d: <strong>{formatTanggal(voucher.berlakuSampai)}</strong>
                    </span>
                  </div>

                  {/* Code and Copy Button */}
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#ECE8E1]">
                    <div className="font-mono font-bold text-sm tracking-wider text-[#1F2937]">
                      {voucher.kode}
                    </div>
                    <button
                      onClick={() => handleCopyCode(voucher.kode)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#C9772E] hover:underline"
                    >
                      <Copy size={13} /> Salin Kode
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Buat Voucher Baru */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Voucher Promosi Baru"
      >
        <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#4B5563] mb-1">
              Kode Voucher (Huruf Kapital & Angka)
            </label>
            <input
              type="text"
              value={newKode}
              onChange={(e) => setNewKode(e.target.value.toUpperCase())}
              placeholder="Contoh: MERDEKA50, ANABUL10"
              required
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl font-mono font-bold text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#4B5563] mb-1">
              Nama / Judul Promo
            </label>
            <input
              type="text"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              placeholder="Contoh: Diskon Promo Hari Kucing Sedunia"
              required
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Tipe Diskon
              </label>
              <select
                value={newTipe}
                onChange={(e) => setNewTipe(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              >
                <option value="nominal">Nominal Rupiah (Rp)</option>
                <option value="persen">Persentase (%)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Nilai Diskon ({newTipe === "nominal" ? "Rp" : "%"})
              </label>
              <input
                type="number"
                value={newNilai}
                onChange={(e) => setNewNilai(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Minimal Belanja (Rp)
              </label>
              <input
                type="number"
                value={newMinBelanja}
                onChange={(e) => setNewMinBelanja(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Kuota Pemakaian
              </label>
              <input
                type="number"
                value={newKuota}
                onChange={(e) => setNewKuota(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#4B5563] mb-1">
              Berlaku Sampai Tanggal
            </label>
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#4B5563] mb-1">
              Deskripsi Ketentuan
            </label>
            <textarea
              rows={2}
              value={newDeskripsi}
              onChange={(e) => setNewDeskripsi(e.target.value)}
              placeholder="Contoh: Berlaku untuk semua produk pakan dan grooming..."
              className="w-full px-3 py-2 bg-[#F7F5F1] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C9772E]/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
