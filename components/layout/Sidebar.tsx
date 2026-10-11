"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Scissors,
  CalendarDays,
  Package,
  Layers,
  Users,
  Award,
  BarChart3,
  Settings,
  PawPrint,
  Store,
  ChevronRight,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole, RoleType } from "@/context/UserContext";

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string | null;
  badgeDanger?: boolean;
  allowedRoles: RoleType[];
}

export const navItems: NavItemConfig[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
    allowedRoles: ["admin", "kasir", "groomer"],
  },
  {
    name: "Transaksi",
    href: "/transaksi",
    icon: ShoppingCart,
    badge: "POS",
    allowedRoles: ["admin", "kasir"],
  },
  {
    name: "Layanan",
    href: "/layanan",
    icon: Scissors,
    badge: "Grooming & Hotel",
    allowedRoles: ["admin", "kasir", "groomer"],
  },
  {
    name: "Booking",
    href: "/booking",
    icon: CalendarDays,
    badge: "15 Jadwal",
    allowedRoles: ["admin", "kasir", "groomer"],
  },
  {
    name: "Produk",
    href: "/produk",
    icon: Package,
    badge: null,
    allowedRoles: ["admin", "kasir"],
  },
  {
    name: "Stok",
    href: "/stok",
    icon: Layers,
    badge: "6 menipis",
    badgeDanger: true,
    allowedRoles: ["admin", "kasir"],
  },
  {
    name: "Pelanggan",
    href: "/pelanggan",
    icon: Users,
    badge: null,
    allowedRoles: ["admin", "kasir", "groomer"],
  },
  {
    name: "Loyalitas",
    href: "/loyalitas",
    icon: Award,
    badge: "Poin & Kupon",
    allowedRoles: ["admin", "kasir"],
  },
  {
    name: "Laporan",
    href: "/laporan",
    icon: BarChart3,
    badge: null,
    allowedRoles: ["admin"],
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
    badge: null,
    allowedRoles: ["admin"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, currentUser, isAdmin } = useUserRole();

  // Filter accessible items for the current role
  const accessibleItems = navItems.filter((item) => item.allowedRoles.includes(role));
  const restrictedItems = navItems.filter((item) => !item.allowedRoles.includes(role));

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-68 bg-white border-r border-[#ECE8E1] shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#ECE8E1] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#C9772E] flex items-center justify-center text-white shadow-md shadow-[#C9772E]/25 transition-transform group-hover:scale-105">
            <PawPrint size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#1F2937] tracking-tight">
                PawMart
              </span>
              <span className="bg-[#FBEBDD] text-[#C9772E] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                POS
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Pet Care & Shop</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
          <span>Menu {role === "admin" ? "Lengkap" : role === "kasir" ? "Kasir" : "Groomer"}</span>
          <span className="text-[9px] font-bold text-[#C9772E] bg-[#FBEBDD] px-1.5 py-0.5 rounded">
            {role.toUpperCase()}
          </span>
        </div>

        {/* Accessible items */}
        {accessibleItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group",
                isActive
                  ? "bg-[#C9772E] text-white shadow-sm shadow-[#C9772E]/20"
                  : "text-[#4B5563] hover:bg-[#FBEBDD]/60 hover:text-[#C9772E]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={18}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : "text-[#6B7280] group-hover:text-[#C9772E]"
                  )}
                />
                <span className="tracking-tight">{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeDanger
                      ? "bg-[#FEE2E2] text-[#E5484D]"
                      : "bg-[#FBEBDD] text-[#C9772E]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Restricted Items (Locked for this role) */}
        {restrictedItems.length > 0 && (
          <div className="pt-3 mt-3 border-t border-[#ECE8E1]/80">
            <div className="flex items-center justify-between px-3 py-1 text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
              <span>Akses Khusus Owner</span>
              <Lock size={11} className="text-[#9CA3AF]" />
            </div>
            {restrictedItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-[#4B5563] hover:bg-gray-100/70 transition-colors"
                  title="Menu ini hanya dapat diakses oleh Owner / Admin"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-[#9CA3AF]" />
                    <span className="line-through opacity-75">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Lock size={9} /> Owner
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Role Card at bottom */}
      <div className="p-3 border-t border-[#ECE8E1] bg-[#FAF8F5]">
        <div className="p-2.5 rounded-xl bg-white border border-[#ECE8E1] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FBEBDD] flex items-center justify-center text-sm">
              {currentUser.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1F2937] leading-none truncate">
                {currentUser.name.split(" ")[0]} ({role === "admin" ? "Owner" : role === "kasir" ? "Kasir" : "Groomer"})
              </p>
              <span className="text-[10px] text-[#6B7280] font-medium flex items-center gap-1 mt-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                {currentUser.roleLabel}
              </span>
            </div>
          </div>
          {isAdmin ? (
            <Link
              href="/pengaturan"
              className="text-[#9CA3AF] hover:text-[#1F2937] p-1"
              title="Kelola Toko & Pengaturan"
            >
              <ChevronRight size={15} />
            </Link>
          ) : (
            <div className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
              Staff
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
