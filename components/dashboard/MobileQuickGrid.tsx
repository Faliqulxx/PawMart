import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Layers,
  Users,
  BarChart3,
  Settings,
  Scissors,
  CalendarDays,
  Home,
  Award,
} from "lucide-react";

export function MobileQuickGrid() {
  const quickActions = [
    {
      name: "Kasir POS",
      href: "/transaksi",
      icon: ShoppingCart,
      bg: "bg-[#FBEBDD]",
      color: "text-[#C9772E]",
      badge: "Cepat",
    },
    {
      name: "Layanan",
      href: "/layanan",
      icon: Scissors,
      bg: "bg-amber-50",
      color: "text-amber-600",
      badge: "Grooming",
    },
    {
      name: "Booking",
      href: "/booking",
      icon: CalendarDays,
      bg: "bg-purple-50",
      color: "text-purple-600",
      badge: "15 Jadwal",
    },
    {
      name: "Pet Hotel",
      href: "/layanan/penitipan",
      icon: Home,
      bg: "bg-blue-50",
      color: "text-blue-600",
      badge: "8 Terisi",
    },
    {
      name: "Loyalitas",
      href: "/loyalitas",
      icon: Award,
      bg: "bg-rose-50",
      color: "text-rose-600",
      badge: null,
    },
    {
      name: "Stok Toko",
      href: "/stok",
      icon: Layers,
      bg: "bg-stone-100",
      color: "text-stone-700",
      badge: "6 Menipis",
    },
  ];

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-bold text-[#1F2937]">Akses Cepat Kasir</h3>
        <span className="text-[11px] text-[#6B7280]">Pintasan Operasional</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE8E1] shadow-xs active:scale-95 transition-all relative group"
            >
              {item.badge && (
                <span className="absolute -top-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#E5484D] text-white shadow-xs">
                  {item.badge}
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105`}
              >
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold text-[#1F2937] text-center leading-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
