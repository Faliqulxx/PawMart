"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Menu,
  Scissors,
  CalendarDays,
  Award,
  Layers,
  Users,
  BarChart3,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole, RoleType } from "@/context/UserContext";

export function BottomNav() {
  const pathname = usePathname();
  const { role, currentUser } = useUserRole();
  const [showMoreModal, setShowMoreModal] = useState(false);

  // Dynamic primary tabs based strictly on role
  const primaryTabs =
    role === "groomer"
      ? [
          {
            name: "Beranda",
            href: "/",
            icon: LayoutDashboard,
            isActive: pathname === "/",
          },
          {
            name: "Layanan",
            href: "/layanan",
            icon: Scissors,
            isActive: pathname.startsWith("/layanan"),
          },
          {
            name: "Booking",
            href: "/booking",
            icon: CalendarDays,
            isActive: pathname.startsWith("/booking"),
          },
        ]
      : [
          {
            name: "Beranda",
            href: "/",
            icon: LayoutDashboard,
            isActive: pathname === "/",
          },
          {
            name: "Transaksi",
            href: "/transaksi",
            icon: ShoppingCart,
            isActive: pathname.startsWith("/transaksi"),
          },
          {
            name: "Layanan",
            href: "/layanan",
            icon: Scissors,
            isActive: pathname.startsWith("/layanan"),
          },
        ];

  // Secondary items for the "Lainnya" sheet - filtered strictly by role
  const allPotentialItems: {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    description: string;
    badge: string | null;
    badgeDanger?: boolean;
    allowed: RoleType[];
  }[] = [
    {
      name: "Booking & Jadwal",
      href: "/booking",
      icon: CalendarDays,
      description: "Kalender antrean grooming & dokter",
      badge: "15 Jadwal",
      allowed: ["admin", "kasir", "groomer"],
    },
    {
      name: "Program Loyalitas",
      href: "/loyalitas",
      icon: Award,
      description: "Tingkat member, poin & voucher",
      badge: "Katalog Hadiah",
      allowed: ["admin", "kasir"],
    },
    {
      name: "Katalog Produk",
      href: "/produk",
      icon: Package,
      description: "Daftar master produk & harga",
      badge: null,
      allowed: ["admin", "kasir"],
    },
    {
      name: "Manajemen Stok",
      href: "/stok",
      icon: Layers,
      description: "Peringatan stok menipis & mutasi",
      badge: "6 Menipis",
      badgeDanger: true,
      allowed: ["admin", "kasir"],
    },
    {
      name: "Data Pelanggan",
      href: "/pelanggan",
      icon: Users,
      description: "Daftar anabul & riwayat vaksin",
      badge: null,
      allowed: ["admin", "kasir", "groomer"],
    },
    {
      name: "Laporan Penjualan",
      href: "/laporan",
      icon: BarChart3,
      description: "Grafik omzet, margin & produk terlaris",
      badge: null,
      allowed: ["admin"],
    },
    {
      name: "Pengaturan Toko",
      href: "/pengaturan",
      icon: Settings,
      description: "Profil toko, struk, staf & pajak",
      badge: null,
      allowed: ["admin"],
    },
  ];

  // Strictly filter items: do not render disallowed items
  const accessibleMoreItems = allPotentialItems.filter((item) =>
    item.allowed.includes(role)
  );

  const isMoreActive =
    pathname.startsWith("/booking") ||
    pathname.startsWith("/loyalitas") ||
    pathname.startsWith("/produk") ||
    pathname.startsWith("/stok") ||
    pathname.startsWith("/pelanggan") ||
    pathname.startsWith("/laporan") ||
    pathname.startsWith("/pengaturan");

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ECE8E1] px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-4 items-center gap-1">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px]",
                  tab.isActive
                    ? "text-[#C9772E] font-semibold"
                    : "text-[#6B7280] hover:text-[#1F2937]"
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    tab.isActive && "bg-[#FBEBDD]"
                  )}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[11px] mt-0.5">{tab.name}</span>
              </Link>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setShowMoreModal(true)}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px]",
              isMoreActive
                ? "text-[#C9772E] font-semibold"
                : "text-[#6B7280] hover:text-[#1F2937]"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-colors",
                isMoreActive && "bg-[#FBEBDD]"
              )}
            >
              <Menu size={20} />
            </div>
            <span className="text-[11px] mt-0.5">Lainnya</span>
          </button>
        </div>
      </div>

      {/* Mobile "Lainnya" Bottom Sheet */}
      {showMoreModal && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowMoreModal(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-[#ECE8E1] p-5 pb-8 z-10 animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-[#ECE8E1] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E1]">
              <div>
                <h3 className="font-bold text-base text-[#1F2937]">Menu Tambahan</h3>
                <p className="text-xs text-[#6B7280]">
                  Masuk sebagai: <strong className="text-[#C9772E]">{currentUser.roleLabel}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowMoreModal(false)}
                className="p-1.5 text-[#6B7280] hover:text-[#1F2937] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {accessibleMoreItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMoreModal(false)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all",
                      active
                        ? "bg-[#FBEBDD]/40 border-[#C9772E]/40 text-[#C9772E]"
                        : "border-[#ECE8E1] bg-[#FAF8F5] hover:bg-white text-[#1F2937]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          active
                            ? "bg-[#C9772E] text-white"
                            : "bg-white text-[#C9772E] border border-[#ECE8E1]"
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                item.badgeDanger
                                  ? "bg-[#FEE2E2] text-[#E5484D]"
                                  : "bg-[#FBEBDD] text-[#C9772E]"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280]">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#9CA3AF]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
