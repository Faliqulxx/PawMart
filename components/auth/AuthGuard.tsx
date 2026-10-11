"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserContext";
import { PawPrint } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useUserRole();

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

  return <>{children}</>;
}
