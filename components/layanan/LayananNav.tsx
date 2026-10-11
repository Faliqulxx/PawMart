"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, ListOrdered, Home, Sparkles } from "lucide-react";

export function LayananNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Katalog & Paket Layanan",
      href: "/layanan",
      icon: Scissors,
      exact: true,
    },
    {
      name: "Papan Antrean (Grooming)",
      href: "/layanan/antrean",
      icon: ListOrdered,
      exact: false,
    },
    {
      name: "Penitipan (Pet Hotel)",
      href: "/layanan/penitipan",
      icon: Home,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#ECE8E1]/60 rounded-2xl w-fit overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            <Icon size={16} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
