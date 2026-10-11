"use client";

import React from "react";
import { stats } from "@/data/stats";
import { formatRupiah, formatTanggal } from "@/lib/format";
import {
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  PlusCircle,
  CalendarDays,
  Scissors,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  Store,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MobileQuickGrid } from "@/components/dashboard/MobileQuickGrid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { initialBookings } from "@/data/bookings";
import { initialBoardingStays } from "@/data/boardingStays";
import { useUserRole } from "@/context/UserContext";

export default function DashboardPage() {
  const { currentUser, role, isAdmin, isKasir, isGroomer } = useUserRole();

  // Booking stats for today
  const todayBookings = initialBookings.filter((b) => b.tanggal === "2026-10-11");
  const inProgressBookings = initialBookings.filter((b) => b.status === "Diproses");
  const upcomingBookings = initialBookings
    .filter((b) => b.status !== "Dibatalkan" && b.status !== "Selesai")
    .slice(0, 4);

  // Active pet hotel stays
  const activeStaysCount = initialBoardingStays.filter((s) => s.status === "Menginap").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-2">
              Halo, {currentUser.name.split(" ")[0]} <span>{currentUser.avatar}</span>
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : isKasir
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {currentUser.roleLabel}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isAdmin &&
              "Semua sistem operasional toko, data omzet penjualan & perawatan anabul berjalan normal."}
            {isKasir &&
              "Shift Kasir Aktif • Siap melayani pembayaran POS, antrean kasir, dan booking anabul."}
            {isGroomer &&
              "Stasiun Grooming Aktif • Pantau anabul dalam proses perawatan dan kalender reservasi."}
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2.5">
          {!isGroomer && (
            <Link href="/transaksi">
              <Button variant="primary" className="shadow-md shadow-[#C9772E]/20">
                <PlusCircle size={17} />
                <span>Transaksi Baru</span>
              </Button>
            </Link>
          )}
          <Link href="/booking/baru" className="hidden sm:inline-flex">
            <Button variant="outline" className="border-[#ECE8E1]">
              <CalendarDays size={16} />
              <span>Buat Booking</span>
            </Button>
          </Link>
          {isGroomer && (
            <Link href="/layanan/antrean">
              <Button variant="primary" className="shadow-md shadow-[#C9772E]/20">
                <Scissors size={17} />
                <span>Papan Antrean Grooming</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Role Banner Indicator */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
          isAdmin
            ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
            : isKasir
            ? "bg-blue-50/70 border-blue-200/80 text-blue-900"
            : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{currentUser.avatar}</span>
          <div>
            <span className="font-bold">
              Mode Peran: {currentUser.roleLabel}
            </span>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isAdmin &&
                "Anda memiliki hak akses penuh: Laporan Laba/Rugi, Penyesuaian Stok, Tambah Master Produk & Pengaturan Toko."}
              {isKasir &&
                "Akses Kasir Operasional: Melayani POS, Tagih Layanan, Buat Booking & Cek Stok. Data laba bersih dan pengaturan toko dilindungi."}
              {isGroomer &&
                "Akses Grooming: Fokus pada update status pengerjaan anabul (Menunggu → Proses → Selesai) dan melihat jadwal reservasi."}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
          <span>Ganti di Topbar</span>
        </div>
      </div>

      {/* Mobile Quick 3x2 Grid (PRD 6.1) */}
      <MobileQuickGrid />

      {/* 4 Stat Cards: Dynamically Rendered Based on Role */}
      {isAdmin ? (
        // OWNER / ADMIN VIEW: Financial & Store Performance
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <StatCard
            title="Total Penjualan Hari Ini"
            value={formatRupiah(stats.penjualanHariIni)}
            subtitle={`↑ ${stats.perubahan.penjualan}% dari kemarin`}
            isPositive={true}
            icon={DollarSign}
            iconBg="bg-[#DCFCE7]"
            iconColor="text-[#16A34A]"
          />

          <StatCard
            title="Jumlah Transaksi"
            value={String(stats.jumlahTransaksi)}
            subtitle={`↑ ${stats.perubahan.transaksi}% dari kemarin`}
            isPositive={true}
            icon={ShoppingBag}
            iconBg="bg-[#FBEBDD]"
            iconColor="text-[#C9772E]"
          />

          <StatCard
            title="Produk Terjual"
            value={String(stats.produkTerjual)}
            subtitle={`↑ ${stats.perubahan.produk}% dari kemarin`}
            isPositive={true}
            icon={PackageCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Stok Menipis"
            value={String(stats.stokMenipis)}
            subtitle="Perlu diperiksa"
            isDanger={true}
            icon={AlertTriangle}
            iconBg="bg-[#FEE2E2]"
            iconColor="text-[#E5484D]"
          />
        </div>
      ) : isKasir ? (
        // CASHIER VIEW: Shift & Operational Queue Metrics
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <StatCard
            title="Transaksi Shift Saya"
            value="14 Transaksi"
            subtitle="Shift Aktif Berjalan"
            isPositive={true}
            icon={ShoppingBag}
            iconBg="bg-[#FBEBDD]"
            iconColor="text-[#C9772E]"
          />

          <StatCard
            title="Antrean Siap Ditagih"
            value="2 Anabul"
            subtitle="Grooming Selesai"
            isPositive={true}
            icon={Scissors}
            iconBg="bg-[#DCFCE7]"
            iconColor="text-[#16A34A]"
          />

          <StatCard
            title="Booking Hari Ini"
            value={`${todayBookings.length} Reservasi`}
            subtitle="Jadwal Pelanggan"
            icon={CalendarDays}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />

          <StatCard
            title="Stok Menipis"
            value={String(stats.stokMenipis)}
            subtitle="Perlu perhatian"
            isDanger={true}
            icon={AlertTriangle}
            iconBg="bg-[#FEE2E2]"
            iconColor="text-[#E5484D]"
          />
        </div>
      ) : (
        // GROOMER VIEW: Grooming & Care Queue Metrics
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <StatCard
            title="Sedang Dikerjakan"
            value="2 Anabul"
            subtitle="Dalam Stasiun Grooming"
            isPositive={true}
            icon={Scissors}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Selesai Hari Ini"
            value="3 Anabul"
            subtitle="Siap Diambil Pemilik"
            isPositive={true}
            icon={CheckCircle2}
            iconBg="bg-[#DCFCE7]"
            iconColor="text-[#16A34A]"
          />

          <StatCard
            title="Jadwal Booking Saya"
            value={`${todayBookings.length} Reservasi`}
            subtitle="Reservasi Terjadwal"
            icon={CalendarDays}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />

          <StatCard
            title="Pet Hotel Menginap"
            value={`${activeStaysCount} Anabul`}
            subtitle="Dalam Kandang"
            icon={Layers}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>
      )}

      {/* Booking Hari Ini & Hewan Dititipkan Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Booking Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Booking Hari Ini
              </span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                📅
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1F2937] mt-2">
              {todayBookings.length} Reservasi
            </div>
            <div className="text-xs text-purple-700 font-semibold mt-1">
              {inProgressBookings.length} Sedang Dalam Pengerjaan
            </div>
          </div>

          <Link
            href="/booking"
            className="mt-4 pt-3 border-t border-[#ECE8E1] flex items-center justify-between text-xs font-semibold text-[#C9772E] hover:underline"
          >
            <span>Buka Kalender Booking</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Hewan Dititipkan */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Hewan Dititipkan
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                🏨
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1F2937] mt-2">
              {activeStaysCount} Anabul Menginap
            </div>
            <div className="text-xs text-blue-700 font-semibold mt-1">
              8 / 12 Kamar Terisi (67% Okupansi)
            </div>
          </div>

          <Link
            href="/layanan/penitipan"
            className="mt-4 pt-3 border-t border-[#ECE8E1] flex items-center justify-between text-xs font-semibold text-[#C9772E] hover:underline"
          >
            <span>Lihat Peta Kandang Hotel</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Antrean Grooming Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Antrean Grooming
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                ✂️
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              5 Anabul di Toko
            </div>
            <div className="text-xs text-[#6B7280] mt-1">
              2 Menunggu • 2 Proses • 1 Siap Ditagih
            </div>
          </div>

          <Link
            href="/layanan/antrean"
            className="mt-4 pt-3 border-t border-[#ECE8E1] flex items-center justify-between text-xs font-semibold text-[#C9772E] hover:underline"
          >
            <span>Papan Antrean Layanan</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Conditioned by Role */}
      {isAdmin ? (
        // OWNER: Full Sales Chart & Upcoming Bookings
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
                <div>
                  <h3 className="font-bold text-[#1F2937] text-base">Jadwal Perawatan Berikutnya</h3>
                  <p className="text-xs text-[#6B7280]">Reservasi terdekat yang akan dikerjakan staf.</p>
                </div>
                <Link
                  href="/booking"
                  className="text-xs font-semibold text-[#C9772E] hover:underline"
                >
                  Semua
                </Link>
              </div>

              <div className="space-y-2.5">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between text-xs hover:border-[#C9772E]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1 bg-white rounded-lg border border-[#ECE8E1]">
                        {b.hewanIcon}
                      </span>
                      <div>
                        <div className="font-bold text-[#1F2937] text-sm flex items-center gap-1.5">
                          <span>{b.hewanNama}</span>
                          <span className="text-[10px] font-normal text-[#9CA3AF]">
                            ({b.hewanRas})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B7280]">
                          {b.layananNama} • {b.stafNama}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#C9772E] flex items-center justify-end gap-1">
                        <Clock size={11} /> {b.jam}
                      </div>
                      <Badge variant={b.status === "Diproses" ? "info" : "warning"} className="mt-0.5 text-[10px] py-0 px-1.5">
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <SalesChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <div className="lg:col-span-4">
              <TopProducts />
            </div>
            <div className="lg:col-span-8">
              <RecentTransactions />
            </div>
          </div>
        </>
      ) : isKasir ? (
        // CASHIER: Operational Queue to Cashier + Recent Transactions
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
              <div>
                <h3 className="font-bold text-[#1F2937] text-base">Anabul Siap Ditagih ke Kasir</h3>
                <p className="text-xs text-[#6B7280]">Layanan grooming yang telah selesai dan siap dibayar.</p>
              </div>
              <Link
                href="/layanan/antrean"
                className="text-xs font-semibold text-[#C9772E] hover:underline"
              >
                Papan Antrean
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐩</span>
                  <div>
                    <span className="font-bold text-sm text-[#1F2937]">Coco (Poodle)</span>
                    <p className="text-[11px] text-[#6B7280]">Pemilik: Hendra Wijaya • Grooming Lengkap</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      ✓ Selesai Dikerjakan
                    </span>
                  </div>
                </div>
                <Link href="/transaksi?tagih=Coco">
                  <Button variant="primary" size="sm" className="text-xs">
                    Tagih Rp 120.000
                  </Button>
                </Link>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐱</span>
                  <div>
                    <span className="font-bold text-sm text-[#1F2937]">Mochi (Persia)</span>
                    <p className="text-[11px] text-[#6B7280]">Pemilik: Rina Sari • Mandi Anti Kutu</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      ✓ Selesai Dikerjakan
                    </span>
                  </div>
                </div>
                <Link href="/transaksi?tagih=Mochi">
                  <Button variant="primary" size="sm" className="text-xs">
                    Tagih Rp 85.000
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <RecentTransactions />
          </div>
        </div>
      ) : (
        // GROOMER: Queue board preview & Schedule
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E1]">
              <div>
                <h3 className="font-bold text-[#1F2937] text-base">Jadwal Perawatan Saya Hari Ini</h3>
                <p className="text-xs text-[#6B7280]">Daftar antrean anabul yang ditangani oleh {currentUser.name}.</p>
              </div>
              <Link
                href="/layanan/antrean"
                className="text-xs font-semibold text-[#C9772E] hover:underline"
              >
                Papan Antrean Lengkap
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between text-xs hover:border-[#C9772E]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-white rounded-lg border border-[#ECE8E1]">
                      {b.hewanIcon}
                    </span>
                    <div>
                      <div className="font-bold text-[#1F2937] text-sm flex items-center gap-1.5">
                        <span>{b.hewanNama}</span>
                        <span className="text-[10px] font-normal text-[#9CA3AF]">
                          ({b.hewanRas})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {b.layananNama} • Pemilik: {b.pelangganNama}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#C9772E] flex items-center justify-end gap-1">
                      <Clock size={12} /> {b.jam}
                    </div>
                    <Badge variant={b.status === "Diproses" ? "info" : "warning"} className="mt-1 text-[10px] py-0 px-2">
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#ECE8E1] shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#1F2937] text-base">Panduan Operasional Groomer</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Periksa kondisi fisik, kulit, dan kutu anabul sebelum memulai proses mandi atau cukur bulu.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#4B5563]">
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                  🐾 <strong>Check-in:</strong> Konfirmasi paket & catatan khusus pemilik (alergi sampo/obat).
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  ✂️ <strong>Proses:</strong> Update status menjadi "Diproses" di Papan Antrean.
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  ✓ <strong>Selesai:</strong> Pindahkan ke "Selesai" agar otomatis muncul di kasir.
                </div>
              </div>
            </div>

            <Link href="/layanan/antrean" className="mt-4">
              <Button variant="primary" className="w-full">
                Buka Papan Antrean Layanan
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
