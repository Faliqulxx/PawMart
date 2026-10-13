"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useCashierShift } from "@/context/ShiftContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";

export function CloseShiftModal() {
  const {
    currentShift,
    isCloseShiftModalOpen,
    setIsCloseShiftModalOpen,
    endShift,
  } = useCashierShift();
  const { showToast } = useToast();

  const [actualCash, setActualCash] = useState<number | "">("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Set default actual cash suggestion to expected cash when opened
  useEffect(() => {
    if (isCloseShiftModalOpen && currentShift) {
      setActualCash(currentShift.expectedCash);
      setNotes("");
    }
  }, [isCloseShiftModalOpen, currentShift]);

  if (!isCloseShiftModalOpen || !currentShift) return null;

  const expectedCash = currentShift.startingCash + currentShift.cashSales;
  const numericActual = typeof actualCash === "number" ? actualCash : 0;
  const difference = numericActual - expectedCash;

  const handleQuickAdd = (amount: number) => {
    const current = typeof actualCash === "number" ? actualCash : 0;
    setActualCash(current + amount);
  };

  const handleSetExact = () => {
    setActualCash(expectedCash);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (actualCash === "" || numericActual < 0) {
      showToast("Harap masukkan nominal uang fisik yang ada di laci kas.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const closed = endShift(numericActual, notes);
      setIsSubmitting(false);

      if (closed.cashDifference === 0) {
        showToast(
          `Shift #${closed.shiftNumber} berhasil ditutup! Kas laci seimbang pas.`,
          "success"
        );
      } else if (closed.cashDifference && closed.cashDifference > 0) {
        showToast(
          `Shift #${closed.shiftNumber} ditutup dengan selisih lebih +${formatRupiah(closed.cashDifference)}.`,
          "info"
        );
      } else {
        showToast(
          `Shift #${closed.shiftNumber} ditutup dengan selisih kurang ${formatRupiah(closed.cashDifference || 0)}.`,
          "error"
        );
      }
    }, 350);
  };

  const formatShiftTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#ECE8E1] relative animate-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={() => setIsCloseShiftModalOpen(false)}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1F2937] p-1 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs border border-amber-100">
            <Lock size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded-full">
              Shift #{currentShift.shiftNumber} • {currentShift.id}
            </span>
            <h3 className="text-xl font-bold text-[#1F2937] tracking-tight mt-0.5">
              Tutup Shift & Rekonsiliasi Kas
            </h3>
          </div>
        </div>

        {/* Info Petugas & Waktu */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8E1] mb-5 text-xs">
          <div>
            <span className="text-[#6B7280] flex items-center gap-1 mb-0.5">
              <UserCheck size={13} className="text-[#C9772E]" /> Kasir Bertugas
            </span>
            <span className="font-bold text-[#1F2937] text-sm truncate block">
              {currentShift.cashierName}
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] flex items-center gap-1 mb-0.5">
              <Clock size={13} className="text-[#C9772E]" /> Jam Operasional
            </span>
            <span className="font-semibold text-[#1F2937] text-xs block">
              {formatShiftTime(currentShift.startTime)} - Sekarang (WIB)
            </span>
          </div>
        </div>

        {/* Ringkasan Finansial Shift */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] px-1">
            <span>Rincian Pembukuan Shift</span>
            <span className="text-[#6B7280] font-normal flex items-center gap-1">
              <Receipt size={12} /> {currentShift.transactionCount} Transaksi
            </span>
          </div>

          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE8E1] space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#4B5563]">
              <span>Modal Awal Kas (Starting Float)</span>
              <span className="font-semibold text-[#1F2937]">
                {formatRupiah(currentShift.startingCash)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#4B5563]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Penjualan Tunai (Cash Sales)
              </span>
              <span className="font-semibold text-emerald-700">
                +{formatRupiah(currentShift.cashSales)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#4B5563]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Penjualan QRIS / Non-Tunai
              </span>
              <span className="font-semibold text-blue-700">
                {formatRupiah(currentShift.nonCashSales)}
              </span>
            </div>

            <div className="border-t border-[#ECE8E1] pt-2 flex items-center justify-between text-xs font-medium text-[#6B7280]">
              <span>Total Omset Penjualan</span>
              <span className="font-bold text-[#1F2937]">
                {formatRupiah(currentShift.totalSales)}
              </span>
            </div>

            {/* Kas Seharusnya */}
            <div className="bg-white rounded-xl p-3 border border-[#ECE8E1] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#1F2937] block">
                  Kas Seharusnya di Laci (Expected Cash)
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  Modal Awal + Penjualan Tunai
                </span>
              </div>
              <span className="text-base font-extrabold text-[#C9772E]">
                {formatRupiah(expectedCash)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Rekonsiliasi Kas Aktual */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Wallet size={14} className="text-[#C9772E]" />
                Hitung Fisik Uang di Laci (Actual Cash) *
              </label>
              <button
                type="button"
                onClick={handleSetExact}
                className="text-[11px] font-semibold text-[#C9772E] hover:underline cursor-pointer"
              >
                Set Pas ({formatRupiah(expectedCash)})
              </button>
            </div>

            <div className="relative rounded-xl border border-[#D1D5DB] focus-within:border-[#C9772E] focus-within:ring-2 focus-within:ring-[#C9772E]/20 bg-white transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-bold text-[#6B7280]">
                Rp
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={actualCash}
                onChange={(e) =>
                  setActualCash(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="0"
                required
                className="w-full pl-11 pr-4 py-2.5 text-lg font-extrabold text-[#1F2937] placeholder-[#9CA3AF] rounded-xl bg-transparent outline-none"
              />
            </div>

            {/* Quick Helper Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-[#6B7280]">Tambah pecahan:</span>
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#C9772E] cursor-pointer"
              >
                +10rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(20000)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#C9772E] cursor-pointer"
              >
                +20rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50000)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#C9772E] cursor-pointer"
              >
                +50rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100000)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#C9772E] cursor-pointer"
              >
                +100rb
              </button>
              <button
                type="button"
                onClick={() => setActualCash(0)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 cursor-pointer ml-auto"
              >
                Reset 0
              </button>
            </div>
          </div>

          {/* Status Selisih Kas (Difference Banner) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              difference === 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : difference < 0
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {difference === 0 ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : difference < 0 ? (
                  <TrendingDown size={18} className="text-rose-600 shrink-0" />
                ) : (
                  <TrendingUp size={18} className="text-amber-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block">
                    {difference === 0
                      ? "Kas Laci Pas / Seimbang"
                      : difference < 0
                      ? "Selisih Kurang (Defisit Kas)"
                      : "Selisih Lebih (Surplus Kas)"}
                  </span>
                  <span className="text-[10px] opacity-80">
                    {difference === 0
                      ? "Uang fisik tepat sesuai hitungan sistem."
                      : difference < 0
                      ? "Uang fisik di laci kurang dari catatan sistem."
                      : "Uang fisik di laci melebihi catatan sistem."}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold tracking-tight">
                  {difference === 0
                    ? "Rp 0"
                    : difference > 0
                    ? `+${formatRupiah(difference)}`
                    : formatRupiah(difference)}
                </span>
              </div>
            </div>
          </div>

          {/* Catatan Penutupan */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              Catatan Penutupan Shift {difference !== 0 && <span className="text-rose-500">* (Jelaskan selisih)</span>}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                difference !== 0
                  ? "Tuliskan keterangan mengapa terjadi selisih kas..."
                  : "Catatan serah terima kasir berikutnya (opsional)..."
              }
              className="w-full px-3.5 py-2 text-xs border border-[#D1D5DB] rounded-xl focus:border-[#C9772E] focus:ring-2 focus:ring-[#C9772E]/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCloseShiftModalOpen(false)}
              className="flex-1 text-xs py-2.5 border-[#ECE8E1]"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1 text-xs py-2.5 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
            >
              <Lock size={15} />
              <span>{isSubmitting ? "Menutup..." : "Konfirmasi Tutup Shift"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
