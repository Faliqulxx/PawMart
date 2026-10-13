"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUserRole, RoleType } from "@/context/UserContext";
import { PawPrint, ShieldAlert, ArrowLeft, LogOut, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RoleIcon } from "@/components/ui/RoleIcon";

// Route whitelist permission mapping per role
export const ROLE_ROUTE_PERMISSIONS: Record<RoleType, string[]> = {
  admin: [
    "/",
    "/transaksi",
    "/layanan",
    "/booking",
    "/produk",
    "/stok",
    "/pelanggan",
    "/loyalitas",
    "/laporan",
    "/pengaturan",
  ],
  kasir: [
    "/",
    "/transaksi",
    "/layanan",
    "/booking",
    "/produk",
    "/stok",
    "/pelanggan",
    "/loyalitas",
  ],
  groomer: [
    "/",
    "/layanan",
    "/booking",
    "/pelanggan",
  ],
};

function isRouteAllowedForRole(pathname: string, role: RoleType): boolean {
  if (role === "admin") return true;

  const allowedPrefixes = ROLE_ROUTE_PERMISSIONS[role] || ["/"];

  // Exact root matches
  if (pathname === "/") return true;

  // Check matching path segment
  return allowedPrefixes.some((prefix) => {
    if (prefix === "/") return false;
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });
}

function getRequiredRoleForPath(pathname: string): string {
  if (pathname.startsWith("/laporan") || pathname.startsWith("/pengaturan")) {
    return "Owner / Admin Toko";
  }
  if (
    pathname.startsWith("/transaksi") ||
    pathname.startsWith("/produk") ||
    pathname.startsWith("/stok") ||
    pathname.startsWith("/loyalitas")
  ) {
    return "Kasir atau Owner";
  }
  return "Staf Terotorisasi";
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, currentUser, role, logout } = useUserRole();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Loading state while checking session
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FA7815] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-bounce shadow-xl">
          <PawPrint size={32} className="text-white fill-white" />
        </div>
        <p className="mt-4 font-bold text-lg tracking-wide text-white">
          Memuat PawMart POS...
        </p>
      </div>
    );
  }

  // If not authenticated, keep showing clean splash while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FA7815] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse shadow-xl">
          <PawPrint size={32} className="text-white fill-white" />
        </div>
        <p className="mt-4 font-bold text-base tracking-wide text-white">
          Mengarahkan ke halaman login...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ROLE-BASED ROUTE PROTECTION (403 ACCESS DENIED)
  // --------------------------------------------------------------------------
  const isAllowed = isRouteAllowedForRole(pathname, role);

  if (!isAllowed) {
    const requiredRole = getRequiredRoleForPath(pathname);

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE8E1] shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#E5484D] flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={34} />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#E5484D] uppercase bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              403 • Akses Ditolak
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] tracking-tight mt-3">
              Izin Akses Terbatas
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
              Halaman ini memerlukan wewenang akun{" "}
              <strong className="text-[#1F2937]">{requiredRole}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8E1] text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Akun Saat Ini:</span>
              <span className="font-semibold text-[#1F2937]">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Peran Anda:</span>
              <span className="font-bold text-[#C9772E] flex items-center gap-1.5">
                <RoleIcon role={currentUser.role} size={14} />
                <span>{currentUser.roleLabel}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Halaman Dituju:</span>
              <span className="font-mono text-[11px] text-gray-500">{pathname}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link href="/" className="flex-1">
              <Button variant="primary" className="w-full text-xs py-2.5 flex items-center justify-center gap-2">
                <ArrowLeft size={15} />
                <span>Kembali ke Dashboard</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-xs py-2.5 border-[#ECE8E1] text-[#E5484D] hover:bg-red-50 hover:text-[#E5484D] flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Ganti Akun</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
