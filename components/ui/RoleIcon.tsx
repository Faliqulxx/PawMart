"use client";

import React from "react";
import { Crown, Calculator, Scissors, LucideProps } from "lucide-react";
import { RoleType } from "@/data/users";

interface RoleIconProps extends LucideProps {
  role?: RoleType | string;
  size?: number;
  className?: string;
}

/**
 * Flat Icon untuk Role / Peran Pengguna
 * - Owner / Admin: Crown (Mahkota flat)
 * - Kasir: Calculator / Cashier POS flat
 * - Groomer: Scissors flat
 * (Icon anabul tetap terpisah dan tidak diganti)
 */
export function RoleIcon({
  role,
  size = 16,
  className = "",
  ...props
}: RoleIconProps) {
  if (role === "admin") {
    return <Crown size={size} className={`shrink-0 ${className}`} {...props} />;
  }

  if (role === "kasir") {
    return <Calculator size={size} className={`shrink-0 ${className}`} {...props} />;
  }

  // default groomer
  return <Scissors size={size} className={`shrink-0 ${className}`} {...props} />;
}
