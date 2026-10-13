"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  PieChart as PieIcon,
  ShoppingBag,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";
import { topSellingProducts } from "@/data/stats";
import { Lock, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";

export default function LaporanPage() {
  const { showToast } = useToast();
  const { isAdmin, currentUser } = useUserRole();

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "layanan" | "penitipan" | "staf" | "voucher"
  >("ringkasan");
  const [period, setPeriod] = useState<"hari_ini" | "7_hari" | "30_hari" | "bulan_ini">("30_hari");

  // Summary Metrics based on PRD 6.6
  const metrics = {
    omzet: 18950000,
    labaKotor: 6420000,
    transaksi: 114,
    rataRataTrx: 166228,
  };

  // Trend Chart Data
  const trendData = [
    { label: "Minggu 1", omzet: 4200000, laba: 1450000 },
    { label: "Minggu 2", omzet: 4650000, laba: 1600000 },
    { label: "Minggu 3", omzet: 4800000, laba: 1650000 },
    { label: "Minggu 4", omzet: 5300000, laba: 1720000 },
  ];

  // Category Breakdown Data (Donut Chart)
  const categoryData = [
    { name: "Makanan Kucing", value: 8500000, color: "#C9772E" },
    { name: "Makanan Anjing", value: 4200000, color: "#E9A464" },
    { name: "Pasir Kucing", value: 2600000, color: "#16A34A" },
    { name: "Aksesoris", value: 1950000, color: "#3B82F6" },
    { name: "Obat & Vitamin", value: 1200000, color: "#EC4899" },
    { name: "Kandang", value: 500000, color: "#8B5CF6" },
  ];

  // Payment Breakdown
  const paymentMethodData = [
    { metode: "QRIS Dinamis", persen: "42%", total: 7959000, color: "bg-[#C9772E]" },
    { metode: "Tunai (Cash)", persen: "36%", total: 6822000, color: "bg-emerald-500" },
    { metode: "Transfer Bank", persen: "14%", total: 2653000, color: "bg-blue-500" },
    { metode: "Kartu Debit/Kredit", persen: "8%", total: 1516000, color: "bg-amber-500" },
  ];

  const handleExport = (type: string) => {
    showToast(`Fitur ekspor ${type} segera hadir! Data siap dihubungkan ke backend.`, "info");
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        {/* Access Restriction Banner */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-amber-900 flex items-center gap-2">
                Akses Laporan Keuangan Toko Dibatasi
                <span className="text-xs bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                  Owner Only
                </span>
              </h2>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                Anda saat ini login sebagai <strong>{currentUser.name}</strong> ({currentUser.roleLabel}). 
                Laporan laba kotor, omzet tahunan, dan margin keuntungan toko hanya dapat dibuka oleh akun Owner.
              </p>
            </div>
          </div>
        </div>

        {/* Cashier Shift Report */}
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Rekap Transaksi Shift Kasir
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Ringkasan penerimaan kas, transaksi pos, dan serah terima shift kasir hari ini.
          </p>
        </div>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-[#6B7280]">Total Setoran Shift</span>
            <div className="text-2xl font-extrabold text-[#C9772E] mt-1.5">
              Rp 1.850.000
            </div>
            <p className="text-[11px] text-[#16A34A] font-semibold mt-1">14 Transaksi Berhasil</p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-[#6B7280]">Penerimaan Tunai (Cash)</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1.5">
              Rp 1.150.000
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">Fisik di Laci Kasir</p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-[#6B7280]">Non-Tunai (QRIS & Kartu)</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1.5">
              Rp 700.000
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">Otomatis Masuk Rekening</p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-[#6B7280]">Rata-rata per Struk</span>
            <div className="text-2xl font-extrabold text-[#1F2937] mt-1.5">
              Rp 132.140
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">Basket Size Kasir</p>
          </Card>
        </div>

        {/* Shift Cash Handover Guide */}
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E1]">
            <div>
              <h3 className="font-bold text-[#1F2937] text-base">Serah Terima & Tutup Shift Kasir</h3>
              <p className="text-xs text-[#6B7280]">Pastikan uang fisik di laci kasir cocok sebelum pergantian kasir.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Rekap shift kasir berhasil dicetak!", "success")}
              className="text-xs"
            >
              Cetak Rekap Shift
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
              <span className="text-[#6B7280] block text-[11px]">Modal Awal Kasir:</span>
              <strong className="text-sm text-[#1F2937]">Rp 200.000</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
              <span className="text-[#6B7280] block text-[11px]">Penjualan Tunai:</span>
              <strong className="text-sm text-emerald-600">+ Rp 1.150.000</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-emerald-800 block text-[11px] font-bold">Total Fisik Laci:</span>
              <strong className="text-sm text-emerald-700">Rp 1.350.000</strong>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Laporan Keuangan & Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Ringkasan omzet, laba kotor, performa kategori produk, dan metode bayar.
          </p>
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-xs font-semibold pl-3 pr-8 py-2 bg-white text-[#1F2937] border border-[#ECE8E1] rounded-xl focus:outline-none focus:border-[#C9772E]"
            >
              <option value="hari_ini">Hari Ini</option>
              <option value="7_hari">7 Hari Terakhir</option>
              <option value="30_hari">30 Hari Terakhir</option>
              <option value="bulan_ini">Bulan Ini</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => handleExport("Excel")}
            className="text-xs"
          >
            <FileSpreadsheet size={15} /> Ekspor Excel
          </Button>

          <Button
            variant="primary"
            onClick={() => handleExport("PDF")}
            className="text-xs shadow-md shadow-[#C9772E]/20"
          >
            <Download size={15} /> Ekspor PDF
          </Button>
        </div>
      </div>

      {/* Report Sub-Tabs (PRD 6.4) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#ECE8E1]/60 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: "ringkasan", label: "📊 Finansial & Produk" },
          { id: "layanan", label: "✂️ Pendapatan Layanan" },
          { id: "penitipan", label: "🏨 Okupansi Penitipan" },
          { id: "staf", label: "👥 Performa Staf" },
          { id: "voucher", label: "🏷️ Penggunaan Voucher" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ringkasan" && (
        <>
          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Omzet Penjualan
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">
              {formatRupiah(metrics.omzet)}
            </span>
            <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={12} /> +18.4% vs periode lalu
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Estimasi Laba Kotor
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FBEBDD] text-[#C9772E] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#C9772E]">
              {formatRupiah(metrics.labaKotor)}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Margin rata-rata: <strong>33.8%</strong>
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Jumlah Transaksi
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">
              {metrics.transaksi}
            </span>
            <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={12} /> +12 transaksi baru
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Rata-rata Nilai Trx (AOV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">
              {formatRupiah(metrics.rataRataTrx)}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Per struk belanja</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Sales Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Tren Penjualan & Laba Mingguan</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE8E1" />
                    <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)} jt`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatRupiah(Number(val))}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #ECE8E1",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="omzet" name="Omzet" fill="#E9A464" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="laba" name="Laba Kotor" fill="#C9772E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Share Donut Chart (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Penjualan per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col justify-between">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatRupiah(Number(val))}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #ECE8E1",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#ECE8E1]">
                {categoryData.slice(0, 4).map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[#6B7280]">{c.name}</span>
                    </div>
                    <span className="font-bold text-[#1F2937]">
                      {formatRupiah(c.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[#1F2937] mb-3">
          Metode Pembayaran Paling Sering Digunakan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {paymentMethodData.map((pm, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#1F2937]">
                  {pm.metode}
                </span>
                <span className="text-xs font-bold text-[#C9772E]">
                  {pm.persen}
                </span>
              </div>
              <div className="w-full bg-[#ECE8E1] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${pm.color}`}
                  style={{ width: pm.persen }}
                />
              </div>
              <span className="text-[11px] text-[#6B7280] mt-2 block font-medium">
                {formatRupiah(pm.total)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Products Margin Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Kontribusi Omzet Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                  <th className="py-3 px-4 sm:px-6">Produk</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-center">Unit Terjual</th>
                  <th className="py-3 px-3 text-right">Total Omzet</th>
                  <th className="py-3 px-3 text-right">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E1]">
                {topSellingProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-bold text-[#1F2937]">
                      <div className="flex items-center gap-2.5">
                        <ProductImage
                          src={p.gambar || p.icon}
                          alt={p.nama}
                          size="xs"
                        />
                        <span>{p.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">{p.kategori}</td>
                    <td className="py-3 px-3 text-center font-bold">{p.terjual} pcs</td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#C9772E]">
                      {formatRupiah(p.pendapatan)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#16A34A] font-semibold">
                      {((p.pendapatan / metrics.omzet) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* TAB 2: PENDAPATAN LAYANAN */}
      {activeTab === "layanan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Total Omzet Jasa Layanan</span>
              <div className="text-xl font-bold text-[#1F2937] mt-1">{formatRupiah(8450000)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">48 Layanan Selesai</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Pendapatan Salon Grooming</span>
              <div className="text-xl font-bold text-[#C9772E] mt-1">{formatRupiah(4950000)}</div>
              <span className="text-[11px] text-[#6B7280]">36 Anabul Dirawat</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Pendapatan Pet Hotel</span>
              <div className="text-xl font-bold text-blue-600 mt-1">{formatRupiah(3500000)}</div>
              <span className="text-[11px] text-[#6B7280]">12 Tamu Menginap</span>
            </Card>
          </div>

          <Card className="p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">Breakdown Layanan Terlaris</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              {[
                { nama: "Mandi Biasa (Basic Bath)", volume: "18 kali", total: 1150000 },
                { nama: "Paket Grooming Lengkap", volume: "12 kali", total: 2400000 },
                { nama: "Pet Hotel Kamar VIP", volume: "6 malam", total: 780000 },
                { nama: "Mandi Anti Kutu & Jamur", volume: "8 kali", total: 800000 },
                { nama: "Vaksinasi Anabul", volume: "6 kali", total: 900000 },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
                  <div>
                    <strong className="text-[#1F2937]">{item.nama}</strong>
                    <span className="text-[#6B7280] block text-[11px]">{item.volume} dikerjakan</span>
                  </div>
                  <strong className="text-[#C9772E]">{formatRupiah(item.total)}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: OKUPANSI PENITIPAN */}
      {activeTab === "penitipan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Rata-rata Okupansi Kamar</span>
              <div className="text-xl font-bold text-amber-600 mt-1">68% Terisi</div>
              <span className="text-[11px] text-[#6B7280]">8.2 dari 12 kamar per hari</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Rata-rata Lama Menginap</span>
              <div className="text-xl font-bold text-[#1F2937] mt-1">3.4 Malam</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Paling lama: 6 malam</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Kamar Paling Diminati</span>
              <div className="text-xl font-bold text-purple-600 mt-1">Kamar VIP AC</div>
              <span className="text-[11px] text-[#6B7280]">Tingkat okupansi 92%</span>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMA STAF */}
      {activeTab === "staf" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { nama: "Dewi Lestari", peran: "Groomer", selesai: 342, rating: 4.9, icon: "✂️" },
              { nama: "Bagas Setiawan", peran: "Groomer", selesai: 289, rating: 4.8, icon: "🛁" },
              { nama: "drh. Maya Putri", peran: "Dokter Hewan", selesai: 175, rating: 5.0, icon: "🩺" },
              { nama: "Rudi Hartono", peran: "Kasir POS", selesai: 512, rating: 4.9, icon: "👩‍💼" },
            ].map((staf, idx) => (
              <Card key={idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{staf.icon}</span>
                  <span className="text-xs font-bold text-amber-600">★ {staf.rating}</span>
                </div>
                <h4 className="font-bold text-sm text-[#1F2937]">{staf.nama}</h4>
                <p className="text-xs text-[#6B7280]">{staf.peran}</p>
                <div className="pt-2 border-t border-[#ECE8E1] text-xs font-semibold text-[#C9772E]">
                  {staf.selesai} Transaksi / Layanan
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PENGGUNAAN VOUCHER */}
      {activeTab === "voucher" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Total Pemakaian Voucher</span>
              <div className="text-xl font-bold text-[#1F2937] mt-1">32 Transaksi</div>
              <span className="text-[11px] text-[#6B7280]">Bulan berjalan</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Total Nilai Potongan Diberikan</span>
              <div className="text-xl font-bold text-[#C9772E] mt-1">{formatRupiah(420000)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Meningkatkan omzet +24%</span>
            </Card>
            <Card className="p-4 bg-white border-[#ECE8E1]">
              <span className="text-xs text-[#6B7280]">Voucher Paling Sering Digunakan</span>
              <div className="text-xl font-bold text-purple-600 mt-1">PAW10K</div>
              <span className="text-[11px] text-[#6B7280]">18 kali pemakaian</span>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
