"use client";

import React, { useState } from "react";
import { X, Coins, Clock, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useUserRole } from "@/context/UserContext";
import { useCashierShift } from "@/context/ShiftContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";

export function OpenShiftModal() {
  const { currentUser } = useUserRole();
  const { isOpenShiftModalOpen, setIsOpenShiftModalOpen, startShift } = useCashierShift();
  const { showToast } = useToast();

  const [startingCash, setStartingCash] = useState<number>(500000);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpenShiftModalOpen) return null;

  const quickAmounts = [200000, 300000, 500000, 1000000, 2000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startingCash < 0) {
      showToast("Modal awal kas tidak boleh bernilai negatif.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const shift = startShift(startingCash, notes);
      setIsSubmitting(false);
      showToast(
        `Shift #${shift.shiftNumber} berhasil dibuka dengan modal awal ${formatRupiah(startingCash)}!`,
        "success"
      );
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ECE8E1] relative animate-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={() => setIsOpenShiftModalOpen(false)}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1F2937] p-1 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FBEBDD] text-[#C9772E] flex items-center justify-center shrink-0 shadow-xs">
            <Coins size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#C9772E] uppercase bg-[#FBEBDD] px-2 py-0.5 rounded-full">
              Sesi Operasional POS
            </span>
            <h3 className="text-xl font-bold text-[#1F2937] tracking-tight mt-0.5">
              Buka Shift Kasir Baru
            </h3>
          </div>
        </div>

        {/* Info Box Kasir */}
        <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8E1] mb-5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-[#C9772E]" /> Kasir Bertugas:
            </span>
            <span className="font-bold text-[#1F2937]">{currentUser.name}</span>
          </div>
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#C9772E]" /> Waktu Buka:
            </span>
            <span className="font-semibold text-[#1F2937]">
              {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB (Hari Ini)
            </span>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              Modal Awal Kas di Laci (Starting Float) *
            </label>
            <div className="relative rounded-xl border border-[#D1D5DB] focus-within:border-[#C9772E] focus-within:ring-2 focus-within:ring-[#C9772E]/20 bg-white transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-bold text-[#6B7280]">
                Rp
              </div>
              <input
                type="number"
                min="0"
                step="5000"
                value={startingCash || ""}
                onChange={(e) => setStartingCash(Number(e.target.value))}
                placeholder="500.000"
                required
                className="w-full pl-11 pr-4 py-2.5 text-base font-bold text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none"
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Uang tunai fisik pecahan kecil untuk uang kembalian di laci kasir.
            </p>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStartingCash(amt)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    startingCash === amt
                      ? "bg-[#C9772E] text-white border-[#C9772E]"
                      : "bg-[#FAF8F5] text-[#4B5563] border-[#ECE8E1] hover:border-[#C9772E]"
                  }`}
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              Catatan Kasir (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pecahan Rp 5.000 20 lbr, Rp 2.000 50 lbr"
              className="w-full px-3.5 py-2 text-xs border border-[#D1D5DB] rounded-xl focus:border-[#C9772E] focus:ring-2 focus:ring-[#C9772E]/20 outline-none transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpenShiftModalOpen(false)}
              className="flex-1 text-xs py-2.5 border-[#ECE8E1]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1 text-xs py-2.5 shadow-md shadow-[#C9772E]/20"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? "Membuka..." : "Buka Shift Sekarang"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
