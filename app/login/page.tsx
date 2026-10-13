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
    <div className="min-h-screen w-full bg-[#F87D19] flex flex-col justify-between overflow-x-hidden select-none relative">
      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 py-4 lg:py-6 gap-6 lg:gap-8">
        
        {/* Left Area: Illustration of Dogs, Cats, and Pet Shop Accessories */}
        <div className="flex-1 w-full flex items-end justify-center lg:justify-start relative min-h-[300px] sm:min-h-[420px] lg:min-h-[680px] xl:min-h-[740px]">
          <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[680px] xl:h-[760px] max-w-4xl">
            <Image
              src="/loginpage.jpg"
              alt="Paw Palace Pet Shop Illustration"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain object-bottom drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right Area: Floating Clean White Card */}
        <div className="w-full lg:w-[440px] xl:w-[470px] shrink-0 flex items-center justify-center my-auto z-10 pb-6 lg:pb-0">
          <div className="w-full bg-white rounded-[36px] shadow-2xl shadow-orange-950/30 px-8 py-9 sm:px-10 sm:py-11 border border-white/60 relative">
            
            {/* Header: Paw Palace My Pet Shop Logo */}
            <div className="flex items-center justify-center gap-3.5 mb-6">
              <PawPalaceLogoIcon className="w-12 h-12 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight uppercase leading-tight font-sans">
                  PAW PALACE
                </h1>
                <span className="text-xs sm:text-sm font-extrabold text-[#1F2937] tracking-wider uppercase opacity-90 leading-tight">
                  MY PET SHOP
                </span>
              </div>
            </div>

            {/* Greetings */}
            <div className="text-center mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
                Selamat Datang!
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] font-normal mt-1.5">
                Silakan masuk ke akun Anda
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input 1: Email atau Username */}
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
                    className="w-full pl-11 pr-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Input 2: Password */}
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
                    className="w-full pl-11 pr-11 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none transition-colors"
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

                {/* Forgot Password Right-Aligned Link */}
                <div className="flex items-center justify-between mt-2.5 px-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#6B7280]">
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

              {/* Action Button: MASUK */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-5 py-3.5 px-6 rounded-full bg-[#F87D19] hover:bg-[#E56E0D] active:bg-[#D46006] text-white font-black text-sm sm:text-base tracking-widest uppercase shadow-lg shadow-[#F87D19]/35 hover:shadow-xl hover:shadow-[#F87D19]/45 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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

            {/* Dedicated Demo Accounts for Testing */}
            <div className="mt-6 pt-5 border-t border-[#ECE8E1]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#F87D19]" />
                  Akses Akun Demo
                </span>
                <span className="text-[10px] bg-orange-100 text-[#C9772E] px-2 py-0.5 rounded-full font-semibold">
                  1-Klik Masuk
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-001")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/60 transition-all text-left group cursor-pointer"
                  title="Masuk sebagai Akun Owner (Budi Hartono)"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F2937] group-hover:text-[#F87D19]">
                    <Crown size={14} className="text-amber-500 shrink-0" />
                    <span className="truncate">Owner</span>
                  </div>
                  <p className="text-[9px] text-[#6B7280] mt-0.5 truncate">
                    owner@pawmart.id
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-002")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/60 transition-all text-left group cursor-pointer"
                  title="Masuk sebagai Akun Kasir (Maya Kasir)"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F2937] group-hover:text-[#F87D19]">
                    <Calculator size={14} className="text-blue-500 shrink-0" />
                    <span className="truncate">Kasir</span>
                  </div>
                  <p className="text-[9px] text-[#6B7280] mt-0.5 truncate">
                    kasir@pawmart.id
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("USR-003")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-[#ECE8E1] hover:border-[#F87D19] hover:bg-orange-50/60 transition-all text-left group cursor-pointer"
                  title="Masuk sebagai Akun Groomer (Rifki Groomer)"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F2937] group-hover:text-[#F87D19]">
                    <Scissors size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Groomer</span>
                  </div>
                  <p className="text-[9px] text-[#6B7280] mt-0.5 truncate">
                    groomer@pawmart.id
                  </p>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#9CA3AF] mt-3">
                Sistem RBAC Aktif • Hak akses & UI terkunci sesuai akun yang login
              </p>
            </div>
          </div>
        </div>
      </main>

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
