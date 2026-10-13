"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Sparkles, HelpCircle, X, Check, Crown, Calculator, Scissors } from "lucide-react";
import { useUserRole } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { SYSTEM_USERS, getUserByEmailOrUsername } from "@/data/users";

// Custom Paw Icon matching the Paw Palace logo in the mockup
function PawPalaceLogoIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Toes */}
      <ellipse cx="26" cy="30" rx="9.5" ry="13.5" transform="rotate(-18 26 30)" fill="#F87D19" stroke="#682E00" strokeWidth="3" />
      <ellipse cx="42" cy="18" rx="9" ry="13" transform="rotate(-6 42 18)" fill="#F87D19" stroke="#682E00" strokeWidth="3" />
      <ellipse cx="58" cy="18" rx="9" ry="13" transform="rotate(6 58 18)" fill="#F87D19" stroke="#682E00" strokeWidth="3" />
      <ellipse cx="74" cy="30" rx="9.5" ry="13.5" transform="rotate(18 74 30)" fill="#F87D19" stroke="#682E00" strokeWidth="3" />
      {/* Main Center Pad */}
      <path
        d="M 27 56 C 20 68, 30 87, 50 87 C 70 87, 80 68, 73 56 C 67 44, 57 49, 50 48 C 43 49, 33 44, 27 56 Z"
        fill="#F87D19"
        stroke="#682E00"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useUserRole();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Silakan masukkan Email atau Username");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Silakan masukkan Password");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Authenticate against verified user directory
      const matchedUser = getUserByEmailOrUsername(username);

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage("Akun tidak ditemukan. Gunakan demo: owner@pawmart.id, kasir@pawmart.id, atau groomer@pawmart.id");
        return;
      }

      login(matchedUser.id, rememberMe);
      showToast(
        `Login berhasil! Selamat datang, ${matchedUser.name} (${matchedUser.roleLabel}).`,
        "success"
      );
      router.push("/");
    }, 450);
  };

  const handleQuickLogin = (targetUserId: string) => {
    setIsLoading(true);
    setErrorMessage("");

    const targetUser = SYSTEM_USERS.find((u) => u.id === targetUserId) || SYSTEM_USERS[0];
    setUsername(targetUser.email);
    setPassword("••••••••");

    setTimeout(() => {
      login(targetUser.id, rememberMe);
      showToast(
        `Login berhasil sebagai ${targetUser.name} (${targetUser.roleLabel})!`,
        "success"
      );
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#F87D19] flex items-center justify-center p-8 sm:p-10 lg:p-12 overflow-x-hidden select-none">
      {/* Full-Screen Two-Column Grid Container */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.9fr)] gap-8 lg:gap-10 xl:gap-12 items-center">
        
        {/* PANEL KIRI: Visual Pet Shop Panel Utama */}
        <div className="w-full h-48 sm:h-64 lg:h-[min(680px,calc(100vh-64px))] rounded-[24px] overflow-hidden relative shadow-2xl shadow-orange-950/20 border border-white/20">
          <Image
            src="/loginpage.jpg"
            alt="Paw Palace Pet Shop Illustration"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-[center_65%]"
          />
        </div>

        {/* PANEL KANAN: Login Card */}
        <div className="w-full flex items-center justify-center lg:justify-start">
          <div className="w-full max-w-[440px] bg-white rounded-[26px] shadow-2xl shadow-orange-950/25 p-8 sm:p-10 border border-white/80">
            
            {/* Logo Paw Palace - Centered */}
            <div className="flex items-center justify-center gap-3.5 mb-5 text-center">
              <PawPalaceLogoIcon className="w-11 h-11 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight uppercase leading-none font-sans">
                  PAW PALACE
                </h1>
                <span className="text-[11px] sm:text-xs font-black text-[#1F2937] tracking-wider uppercase opacity-90 mt-1 leading-none">
                  MY PET SHOP
                </span>
              </div>
            </div>

            {/* Judul & Subtitle - Centered */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight leading-tight">
                Selamat Datang!
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] font-normal mt-1 leading-normal">
                Silakan masuk ke akun Anda
              </p>
            </div>

            {/* Pesan Kesalahan jika ada */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-left">
                {errorMessage}
              </div>
            )}

            {/* Form Login */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Field 1: Email / Username */}
              <div>
                <div className="relative rounded-xl border border-[#D1D5DB] focus-within:border-[#F87D19] focus-within:ring-2 focus-within:ring-[#F87D19]/20 bg-white transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <User size={18} className="stroke-[1.9]" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Email atau Username"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="relative rounded-xl border border-[#D1D5DB] focus-within:border-[#F87D19] focus-within:ring-2 focus-within:ring-[#F87D19]/20 bg-white transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Lock size={18} className="stroke-[1.9]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Password"
                    disabled={isLoading}
                    className="w-full pl-11 pr-11 py-2.5 sm:py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#1F2937] transition-colors focus:outline-none cursor-pointer"
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="stroke-[1.9]" />
                    ) : (
                      <Eye size={18} className="stroke-[1.9]" />
                    )}
                  </button>
                </div>

                {/* Ingat Saya & Lupa Kata Sandi */}
                <div className="flex items-center justify-between mt-2.5 px-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#6B7280]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#D1D5DB] text-[#F87D19] focus:ring-[#F87D19] cursor-pointer"
                    />
                    <span>Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-[#6B7280] hover:text-[#F87D19] font-medium transition-colors cursor-pointer text-right"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
              </div>

              {/* Tombol MASUK */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 sm:py-3.5 px-6 rounded-full bg-[#F87D19] hover:bg-[#E56E0D] active:bg-[#D46006] text-white font-black text-sm tracking-widest uppercase shadow-md shadow-[#F87D19]/30 hover:shadow-lg hover:shadow-[#F87D19]/40 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <span>MASUK</span>
                )}
              </button>
            </form>

            {/* Divider "atau" */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ECE8E1]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#9CA3AF] text-[11px] font-medium">
                  atau
                </span>
              </div>
            </div>

            {/* Compact Demo Account Selector */}
            <div className="text-left">
              <div className="mb-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
                  <Sparkles size={12} className="text-[#F87D19]" />
                  <span>AKSES AKUN DEMO</span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                  Klik untuk masuk sebagai akun demo
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-001")}
                  disabled={isLoading}
                  className="py-2 px-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/70 transition-all flex items-center justify-center gap-1.5 font-bold text-xs text-[#1F2937] hover:text-[#F87D19] cursor-pointer"
                  title="Masuk sebagai Owner (Budi Hartono)"
                >
                  <Crown size={14} className="text-amber-500 shrink-0" />
                  <span>Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-002")}
                  disabled={isLoading}
                  className="py-2 px-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/70 transition-all flex items-center justify-center gap-1.5 font-bold text-xs text-[#1F2937] hover:text-[#F87D19] cursor-pointer"
                  title="Masuk sebagai Kasir (Maya Kasir)"
                >
                  <Calculator size={14} className="text-blue-500 shrink-0" />
                  <span>Kasir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-003")}
                  disabled={isLoading}
                  className="py-2 px-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/70 transition-all flex items-center justify-center gap-1.5 font-bold text-xs text-[#1F2937] hover:text-[#F87D19] cursor-pointer"
                  title="Masuk sebagai Groomer (Rifki Groomer)"
                >
                  <Scissors size={14} className="text-emerald-500 shrink-0" />
                  <span>Groomer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1F2937] p-1 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#F87D19] flex items-center justify-center mx-auto mb-3">
              <HelpCircle size={24} />
            </div>

            <h3 className="text-lg font-bold text-[#1F2937] text-center">
              Daftar Akun Pengguna
            </h3>
            <p className="text-xs text-[#6B7280] text-center mt-1 leading-relaxed">
              Silakan pilih salah satu akun pengguna terdaftar berikut:
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1]">
                <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-500" /> Akun Owner:
                </p>
                <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                  Budi Hartono | owner@pawmart.id
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1]">
                <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Calculator size={14} className="text-blue-500" /> Akun Kasir:
                </p>
                <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                  Maya Kasir | kasir@pawmart.id
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1]">
                <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Scissors size={14} className="text-emerald-500" /> Akun Groomer:
                </p>
                <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                  Rifki Groomer | groomer@pawmart.id
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowForgotModal(false);
                handleQuickLogin("USR-001");
              }}
              className="w-full mt-5 py-3 rounded-xl bg-[#F87D19] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#E56E0D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} /> Masuk Sebagai Owner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
