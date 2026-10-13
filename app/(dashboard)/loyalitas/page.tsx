"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Users,
  Ticket,
  TrendingUp,
  ShieldCheck,
  QrCode,
  Edit3,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Star,
  Gift,
  Crown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { LoyaltyNav } from "@/components/loyalty/LoyaltyNav";
import { formatRupiah } from "@/lib/format";
import { memberTiers, initialMemberBalances, initialVouchers } from "@/data/loyalty";

export default function LoyalitasPage() {
  const { showToast } = useToast();

  // Selected member card preview
  const [selectedPreviewMember, setSelectedPreviewMember] = useState(initialMemberBalances[0]);

  // Point rules state (Dummy editable)
  const [pointRatio, setPointRatio] = useState("10.000");
  const [serviceMultiplier, setServiceMultiplier] = useState("2");
  const [bdayBonus, setBdayBonus] = useState("50");
  const [expiryMonths, setExpiryMonths] = useState("12");

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Aturan perolehan poin berhasil diperbarui!", "success");
  };

  // Top members sorted by total belanja
  const topMembers = [...initialMemberBalances].sort((a, b) => b.totalBelanja - a.totalBelanja);

  // Active vouchers count
  const activeVouchersCount = initialVouchers.filter((v) => v.status === "Aktif").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <Award size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Program Loyalitas & Poin</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Kelola tingkatan member, katalog reward belanja, dan aturan voucher diskon kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/loyalitas/voucher">
            <Button variant="outline" className="flex items-center gap-1.5">
              <Ticket size={16} /> Kelola Voucher
            </Button>
          </Link>
          <Link href="/loyalitas/member">
            <Button variant="primary" className="flex items-center gap-1.5">
              <Users size={16} /> Data Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Sub Nav */}
      <LoyaltyNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Member</div>
            <div className="text-2xl font-bold text-[#1F2937] mt-0.5">{initialMemberBalances.length} Pelanggan</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">↑ 18% dari bulan lalu</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <Crown size={22} className="text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Poin Beredar</div>
            <div className="text-2xl font-bold text-[#C9772E] mt-0.5">
              {initialMemberBalances.reduce((sum, m) => sum + m.poin, 0)} Poin
            </div>
            <div className="text-xs text-[#6B7280] mt-1">Estimasi nilai: {formatRupiah(1350000)}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C9772E]/10 text-[#C9772E] flex items-center justify-center font-bold text-xl">
            <Star size={22} className="text-[#C9772E]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Poin Ditukar</div>
            <div className="text-2xl font-bold text-blue-600 mt-0.5">340 Poin</div>
            <div className="text-xs text-blue-600 mt-1">4 penukaran voucher</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            🎁
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Voucher Aktif</div>
            <div className="text-2xl font-bold text-purple-600 mt-0.5">{activeVouchersCount} Promo</div>
            <div className="text-xs text-purple-600 mt-1">Siap dipakai di kasir</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
            🏷️
          </div>
        </div>
      </div>

      {/* Digital Member Card Preview & Tier Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Card Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1F2937] text-base">Kartu Member Digital</h2>
            <select
              value={selectedPreviewMember.id}
              onChange={(e) => {
                const found = initialMemberBalances.find((m) => m.id === e.target.value);
                if (found) setSelectedPreviewMember(found);
              }}
              className="text-xs px-2.5 py-1 bg-white border border-[#ECE8E1] rounded-lg font-medium"
            >
              {initialMemberBalances.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Membership Card Graphic */}
          <div
            className={`p-6 rounded-3xl text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
              selectedPreviewMember.tier === "Gold"
                ? "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border border-amber-400/40"
                : selectedPreviewMember.tier === "Silver"
                ? "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 border border-slate-400/40"
                : "bg-gradient-to-br from-[#A05A2C] via-[#7B3F11] to-[#4A260B] border border-amber-700/40"
            }`}
          >
            {/* Background Paw watermark */}
            <div className="absolute right-[-20px] bottom-[-20px] text-white/10 text-9xl pointer-events-none select-none font-bold">
              🐾
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐱</span>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-widest text-amber-200">
                    PawMart VIP Club
                  </div>
                  <div className="text-[10px] text-white/80">Pet Care & Shop</div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  selectedPreviewMember.tier === "Gold"
                    ? "bg-yellow-400 text-yellow-950 shadow-sm"
                    : selectedPreviewMember.tier === "Silver"
                    ? "bg-slate-200 text-slate-900 shadow-sm"
                    : "bg-amber-800 text-amber-200"
                }`}
              >
                ★ {selectedPreviewMember.tier} Member
              </span>
            </div>

            <div className="my-6 relative z-10">
              <div className="text-xs text-white/70">Nama Pemegang Kartu</div>
              <div className="text-xl font-bold tracking-wide mt-0.5">
                {selectedPreviewMember.nama}
              </div>
              <div className="text-xs text-white/60 font-mono mt-0.5">
                ID: {selectedPreviewMember.nomorKartu}
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="relative z-10 space-y-1.5 pt-2 border-t border-white/20">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/80">Saldo Poin</span>
                <span className="font-extrabold text-amber-300">
                  {selectedPreviewMember.poin} POIN
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (selectedPreviewMember.totalBelanja /
                          (selectedPreviewMember.tier === "Gold" ? 5000000 : 2000000)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/70">
                <span>Total Belanja: {formatRupiah(selectedPreviewMember.totalBelanja)}</span>
                <span>
                  {selectedPreviewMember.tier === "Gold"
                    ? "Level Maksimal"
                    : `Naik ke ${selectedPreviewMember.tier === "Bronze" ? "Silver" : "Gold"}`}
                </span>
              </div>
            </div>

            {/* Dummy QR Barcode */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/70 relative z-10">
              <div className="flex items-center gap-1.5">
                <QrCode size={18} className="text-white/90" />
                <span>Pindai saat transaksi di kasir</span>
              </div>
              <span className="font-semibold text-amber-200">
                Diskon {memberTiers[selectedPreviewMember.tier].diskonGrooming}% Grooming
              </span>
            </div>
          </div>
        </div>

        {/* Tier Benefits Column */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-[#1F2937] text-base">Tingkatan Level & Keuntungan</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bronze */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FBEBDD] text-[#B87333]">
                    🥉 Bronze
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">Min. Rp 0</span>
                </div>
                <h3 className="font-bold text-sm text-[#1F2937] mt-3">Member Pemula</h3>
                <p className="text-xs text-[#6B7280] mt-1">Otomatis didapat saat mendaftarkan anabul.</p>
                <ul className="text-xs text-[#4B5563] space-y-1.5 mt-3 pt-3 border-t border-[#ECE8E1]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#C9772E]" /> 1 Poin per Rp 10.000 belanja
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#C9772E]" /> Bonus +50 poin ultah anabul
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#C9772E]" /> Akses promo katalog voucher
                  </li>
                </ul>
              </div>
            </div>

            {/* Silver */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    🥈 Silver
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">Min. Rp 2.000.000</span>
                </div>
                <h3 className="font-bold text-sm text-[#1F2937] mt-3">Pelanggan Setia</h3>
                <p className="text-xs text-[#6B7280] mt-1">Akumulasi belanja mencapai Rp 2 juta.</p>
                <ul className="text-xs text-[#4B5563] space-y-1.5 mt-3 pt-3 border-t border-[#ECE8E1]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-600" /> Poin 1.25x lipat lebih cepat
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-600" /> Diskon 5% jasa grooming
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-600" /> Voucher bulanan Rp 10.000
                  </li>
                </ul>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3 flex flex-col justify-between ring-1 ring-amber-300/50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    🥇 Gold VIP
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">Min. Rp 5.000.000</span>
                </div>
                <h3 className="font-bold text-sm text-[#1F2937] mt-3">VIP PawMart</h3>
                <p className="text-xs text-[#6B7280] mt-1">Level tertinggi dengan keuntungan maksimal.</p>
                <ul className="text-xs text-[#4B5563] space-y-1.5 mt-3 pt-3 border-t border-[#ECE8E1]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600" /> Poin 1.5x lipat tiap transaksi
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600" /> Diskon 10% jasa grooming
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600" /> Prioritas booking slot weekend
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600" /> Free 1x konsultasi dokter hewan
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Config and Top Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aturan Poin Form */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
            <h3 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
              <Sparkles size={18} className="text-[#C9772E]" /> Pengaturan Aturan Poin (Simulasi)
            </h3>
            <span className="text-xs text-[#6B7280]">Kebijakan Toko</span>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Perolehan Poin Standar:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280]">1 Poin setiap pembelanjaan Rp</span>
                <input
                  type="text"
                  value={pointRatio}
                  onChange={(e) => setPointRatio(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-[#F7F5F1] rounded-xl font-bold text-[#1F2937] border-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Pengali Poin Layanan Jasa (Grooming & Hotel):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={serviceMultiplier}
                  onChange={(e) => setServiceMultiplier(e.target.value)}
                  className="w-16 px-3 py-1.5 bg-[#F7F5F1] rounded-xl font-bold text-[#1F2937] border-none text-center"
                />
                <span className="text-[#6B7280]">x lipat poin dibanding produk fisik</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Bonus Ulang Tahun Anabul:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bdayBonus}
                  onChange={(e) => setBdayBonus(e.target.value)}
                  className="w-20 px-3 py-1.5 bg-[#F7F5F1] rounded-xl font-bold text-[#1F2937] border-none text-center"
                />
                <span className="text-[#6B7280]">Poin otomatis saat bulan lahir</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4B5563] mb-1">
                Masa Berlaku Poin:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={expiryMonths}
                  onChange={(e) => setExpiryMonths(e.target.value)}
                  className="w-16 px-3 py-1.5 bg-[#F7F5F1] rounded-xl font-bold text-[#1F2937] border-none text-center"
                />
                <span className="text-[#6B7280]">Bulan sejak poin diperoleh</span>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Simpan Aturan Poin
              </Button>
            </div>
          </form>
        </div>

        {/* Top 5 Members */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
            <h3 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
              <Star size={18} className="text-[#C9772E]" /> Top Member Teratas
            </h3>
            <Link
              href="/loyalitas/member"
              className="text-xs font-semibold text-[#C9772E] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {topMembers.slice(0, 5).map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-center font-bold leading-6 text-[#1F2937] shadow-2xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-[#1F2937]">{m.nama}</div>
                    <div className="text-[11px] text-[#6B7280]">{m.nomorKartu}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#C9772E]">{m.poin} Poin</div>
                  <div className="text-[11px] text-[#6B7280]">{formatRupiah(m.totalBelanja)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
