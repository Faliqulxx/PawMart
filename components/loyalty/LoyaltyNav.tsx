"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Ticket, Users } from "lucide-react";

export function LoyaltyNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Ringkasan & Aturan Poin",
      href: "/loyalitas",
      icon: Award,
      exact: true,
    },
    {
      name: "Daftar Member & Kartu",
      href: "/loyalitas/member",
      icon: Users,
      exact: false,
    },
    {
      name: "Voucher & Tukar Poin",
      href: "/loyalitas/voucher",
      icon: Ticket,
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
