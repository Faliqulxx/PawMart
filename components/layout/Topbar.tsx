"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  PawPrint,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
  Shield,
  Coins,
  Lock,
  Clock,
  Sparkles,
} from "lucide-react";
import { useUserRole } from "@/context/UserContext";
import { useCashierShift } from "@/context/ShiftContext";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah } from "@/lib/format";
import { RoleIcon } from "@/components/ui/RoleIcon";

export function Topbar() {
  const router = useRouter();
  const { currentUser, role, isAdmin, isKasir, logout } = useUserRole();
  const {
    currentShift,
    isShiftActive,
    setIsOpenShiftModalOpen,
    setIsCloseShiftModalOpen,
  } = useCashierShift();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "Stok Menipis!",
      message: "Pasir Tofu Soya sisa 2 sak dan Bento sisa 4 sak.",
      time: "10 mnt yang lalu",
      icon: AlertTriangle,
      color: "text-[#E5484D] bg-[#FEE2E2]",
    },
    {
      id: "2",
      title: "Pengingat Vaksin",
      message: "Anabul 'Mochi' milik Rina Sari jadwal vaksin 15 Nov.",
      time: "1 jam yang lalu",
      icon: Info,
      color: "text-[#C9772E] bg-[#FBEBDD]",
    },
    {
      id: "3",
      title: "Transaksi Berhasil",
      message: "TRX-0018 sebesar Rp 245.000 selesai dicetak.",
      time: "2 jam yang lalu",
      icon: Check,
      color: "text-[#16A34A] bg-[#DCFCE7]",
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Role visual configuration badge
  const roleBadgeStyle =
    role === "admin"
      ? "bg-amber-50 text-amber-900 border-amber-200/90"
      : role === "kasir"
      ? "bg-blue-50 text-blue-900 border-blue-200/90"
      : "bg-emerald-50 text-emerald-900 border-emerald-200/90";

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#ECE8E1] px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Mobile / Tablet Logo Badge */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9772E] flex items-center justify-center text-white shadow-xs">
              <PawPrint size={18} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-base text-[#1F2937] tracking-tight">
              PawMart
            </span>
          </Link>
        </div>

        {/* Global Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md relative hidden sm:block"
        >
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, pelanggan, atau transaksi... (tekan Enter)"
              className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] hover:bg-[#FAF8F5] focus:bg-white text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-full border border-[#ECE8E1] focus:border-[#C9772E] focus:outline-none focus:ring-2 focus:ring-[#C9772E]/20 transition-all"
            />
          </div>
        </form>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Cashier Shift Control Pill (Only for role kasir) */}
          {role === "kasir" && (
            <div className="flex items-center gap-1.5">
              {isShiftActive && currentShift ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 pl-2.5 pr-1 py-1 rounded-full text-xs font-semibold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden sm:inline">Shift #{currentShift.shiftNumber} Aktif</span>
                  <span className="sm:hidden">S#{currentShift.shiftNumber}</span>
                  <button
                    onClick={() => setIsCloseShiftModalOpen(true)}
                    className="ml-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs"
                    title="Tutup Shift & Rekonsiliasi Kas Laci"
                  >
                    <Lock size={12} />
                    <span>Tutup</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsOpenShiftModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#C9772E] hover:bg-[#b06522] text-white shadow-xs transition-all cursor-pointer animate-bounce-subtle"
                  title="Buka Shift Kasir Baru"
                >
                  <Coins size={14} />
                  <span>Buka Shift</span>
                </button>
              )}
            </div>
          )}

          {/* Informational Role Status Badge (Read-Only Status, Not a Switcher) */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-default select-none shadow-xs ${roleBadgeStyle}`}
            title={`Akun terotentikasi sebagai ${currentUser.roleLabel}`}
          >
            <RoleIcon role={role} size={15} />
            <span>
              {role === "admin"
                ? "Owner"
                : role === "kasir"
                ? "Kasir"
                : "Groomer"}
            </span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-full text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F5F1] transition-colors focus:outline-none"
              title="Notifikasi"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5484D] ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#ECE8E1] py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-[#ECE8E1] flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#1F2937]">Notifikasi Toko</h4>
                  <span className="text-[11px] font-medium text-[#C9772E] bg-[#FBEBDD] px-2 py-0.5 rounded-full">
                    3 baru
                  </span>
                </div>
                <div className="divide-y divide-[#ECE8E1] max-h-72 overflow-y-auto">
                  {notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 hover:bg-[#FAF8F5] transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1F2937]">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-[#9CA3AF] mt-1 block">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-[#ECE8E1] text-center">
                  <Link
                    href={role === "groomer" ? "/booking" : "/stok"}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#C9772E] font-medium hover:underline"
                  >
                    Periksa semua peringatan & jadwal
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#ECE8E1] mx-0.5 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F7F5F1] transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#C9772E]/15 text-[#C9772E] font-bold text-xs flex items-center justify-center border border-[#C9772E]/30">
                <RoleIcon role={role} size={15} />
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-[#1F2937] block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {currentUser.roleLabel}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#9CA3AF] hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#ECE8E1] py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-[#ECE8E1]">
                  <p className="text-xs font-bold text-[#1F2937]">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">{currentUser.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] bg-[#FAF8F5] border border-[#ECE8E1] text-[#1F2937] px-2 py-0.5 rounded-full font-semibold">
                    <ShieldCheck size={12} className="text-[#16A34A]" /> {currentUser.roleLabel}
                  </div>
                </div>

                <div className="py-1">
                  {isAdmin && (
                    <Link
                      href="/pengaturan"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#4B5563] hover:bg-[#F7F5F1] hover:text-[#1F2937]"
                    >
                      <User size={14} /> Pengaturan Akun & Toko
                    </Link>
                  )}
                  <div className="px-4 py-1.5 text-[11px] text-[#9CA3AF]">
                    Sesi aktif via autentikasi
                  </div>
                </div>

                <div className="border-t border-[#ECE8E1] pt-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      showToast("Sesi berhasil diakhiri. Silakan login kembali.", "info");
                      router.push("/login");
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-[#E5484D] hover:bg-[#FEE2E2]/50 text-left font-medium transition-colors"
                  >
                    <LogOut size={14} /> Keluar / Ganti Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
