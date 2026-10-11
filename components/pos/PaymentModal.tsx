"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentSuccess: (paymentInfo: {
    metodeBayar: "Tunai" | "QRIS" | "Transfer" | "Kartu";
    nominalBayar: number;
    kembalian: number;
  }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { showToast } = useToast();
  const [method, setMethod] = useState<"Tunai" | "QRIS" | "Transfer" | "Kartu">("Tunai");
  const [cashAmount, setCashAmount] = useState<number>(total);
  const [isAccumulating, setIsAccumulating] = useState<boolean>(false);

  useEffect(() => {
    setCashAmount(total);
    setIsAccumulating(false);
  }, [total, isOpen]);

  const change = Math.max(0, cashAmount - total);
  const isInsufficient = method === "Tunai" && cashAmount < total;

  // Handle click on nominal bills (5000, 10000, 50000, 100000)
  const handleAddNominal = (val: number) => {
    if (!isAccumulating && cashAmount === total) {
      // Jika masih di nilai awal (uang pas), mulai akumulasi dari lembaran pertama yang diklik
      setCashAmount(val);
      setIsAccumulating(true);
    } else {
      // Tambahkan lembaran ke uang yang sudah dimasukkan
      setCashAmount((prev) => prev + val);
      setIsAccumulating(true);
    }
  };

  const handleSelectUangPas = () => {
    setCashAmount(total);
    setIsAccumulating(false);
  };

  const handleResetCash = () => {
    setCashAmount(0);
    setIsAccumulating(true);
  };

  const handleFinish = () => {
    if (isInsufficient) {
      showToast("Nominal pembayaran tunai kurang dari total belanja!", "error");
      return;
    }

    onPaymentSuccess({
      metodeBayar: method,
      nominalBayar: method === "Tunai" ? cashAmount : total,
      kembalian: method === "Tunai" ? change : 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembayaran Transaksi"
      description="Pilih metode pembayaran dan masukkan nominal"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Total to pay banner */}
        <div className="p-4 rounded-2xl bg-[#FBEBDD] border border-[#F5DFC9] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B7280]">Total Tagihan</p>
            <p className="text-2xl font-black text-[#C9772E] tracking-tight">
              {formatRupiah(total)}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#C9772E] border border-[#F5DFC9]">
            {method}
          </span>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="text-xs font-bold text-[#1F2937] block mb-2">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "Tunai", label: "Tunai (Cash)", icon: Banknote },
              { id: "QRIS", label: "QRIS Dinamis", icon: QrCode },
              { id: "Transfer", label: "Transfer Bank", icon: Building2 },
              { id: "Kartu", label: "Kartu Debit/Kredit", icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = method === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMethod(item.id as any);
                    if (item.id !== "Tunai") setCashAmount(total);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold min-h-[56px] ${
                    isSelected
                      ? "bg-[#C9772E] text-white border-[#C9772E] shadow-sm shadow-[#C9772E]/20"
                      : "bg-[#FAF8F5] text-[#1F2937] border-[#ECE8E1] hover:bg-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash payment specific form */}
        {method === "Tunai" && (
          <div className="space-y-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Uang Diterima dari Pelanggan
                </label>
                {cashAmount !== total && (
                  <button
                    type="button"
                    onClick={handleSelectUangPas}
                    className="text-[11px] text-[#C9772E] hover:underline font-semibold"
                  >
                    Set ke Uang Pas
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B7280]">
                  Rp
                </span>
                <input
                  type="number"
                  value={cashAmount || ""}
                  onChange={(e) => {
                    setCashAmount(Number(e.target.value) || 0);
                    setIsAccumulating(true);
                  }}
                  placeholder="0"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#ECE8E1] bg-white text-lg font-black text-[#1F2937] focus:outline-none focus:border-[#C9772E] focus:ring-2 focus:ring-[#C9772E]/20"
                />
              </div>
            </div>

            {/* Pilihan Cepat & Tombol Nominal Sesuai Kebutuhan */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#1F2937]">
                  Pilihan Cepat &amp; Masukkan Nominal:
                </p>
                {cashAmount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetCash}
                    className="text-[11px] text-[#E5484D] hover:underline flex items-center gap-0.5 font-semibold"
                    title="Kosongkan nilai uang untuk mulai hitung lembaran dari 0"
                  >
                    <RotateCcw size={11} />
                    <span>Reset (Rp 0)</span>
                  </button>
                )}
              </div>

              {/* Tombol Uang Pas + 5000, 10000, 50000, 100000 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* 1. Tombol UANG PAS */}
                <button
                  type="button"
                  onClick={handleSelectUangPas}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 ${
                    cashAmount === total && !isAccumulating
                      ? "bg-[#C9772E] text-white border-[#C9772E] shadow-sm shadow-[#C9772E]/25"
                      : "bg-white text-[#1F2937] border-[#ECE8E1] hover:bg-[#FBEBDD] hover:border-[#C9772E]"
                  }`}
                >
                  <span>💵</span>
                  <span>Uang Pas</span>
                </button>

                {/* 2. Tombol Nominal: 5000, 10000, 50000, 100000 */}
                {[
                  { label: "+ 5.000", value: 5000 },
                  { label: "+ 10.000", value: 10000 },
                  { label: "+ 50.000", value: 50000 },
                  { label: "+ 100.000", value: 100000 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleAddNominal(item.value)}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold border bg-white text-[#1F2937] border-[#ECE8E1] hover:bg-[#FBEBDD] hover:border-[#C9772E] hover:text-[#C9772E] active:scale-95 transition-all text-center shadow-xs"
                    title={`Klik untuk menambahkan ${item.label} ke uang diterima`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-[#9CA3AF] pt-0.5">
                💡 <em>Tips:</em> Klik tombol nominal berulang kali untuk menjumlahkan lembaran uang yang diterima pelanggan.
              </p>
            </div>

            {/* Change return calculation */}
            <div className="pt-3 border-t border-[#ECE8E1] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Kembalian</p>
                <p
                  className={`text-xl font-black ${
                    isInsufficient ? "text-[#E5484D]" : "text-[#16A34A]"
                  }`}
                >
                  {isInsufficient
                    ? `Kurang ${formatRupiah(total - cashAmount)}`
                    : formatRupiah(change)}
                </p>
              </div>
              {!isInsufficient && change > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  Harus Dikembalikan
                </span>
              )}
              {!isInsufficient && change === 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  Uang Pas Diterima
                </span>
              )}
            </div>
          </div>
        )}

        {/* QRIS Dummy QR */}
        {method === "QRIS" && (
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-center space-y-3">
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col items-center justify-center">
              <div className="w-full h-full bg-[#1F2937] p-2 rounded-xl flex items-center justify-center text-white">
                <QrCode size={140} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F2937]">QRIS PawMart Merchant</p>
              <p className="text-[11px] text-[#6B7280]">
                Scan dengan aplikasi BCA, Mandiri, GoPay, OVO, atau ShopeePay
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full font-semibold">
              <CheckCircle2 size={14} /> Menunggu Verifikasi Pembayaran
            </div>
          </div>
        )}

        {/* Transfer / Card Dummy */}
        {(method === "Transfer" || method === "Kartu") && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-xs space-y-2">
            <p className="font-bold text-[#1F2937]">
              {method === "Transfer" ? "Instruksi Transfer Bank" : "Instruksi Mesin EDC"}
            </p>
            <p className="text-[#6B7280]">
              {method === "Transfer"
                ? "Silakan verifikasi bukti transfer ke rekening BCA 892-019-2819 a.n PawMart Pet Shop."
                : "Gesek atau masukkan kartu debit/kredit pelanggan pada mesin EDC kasir PawMart."}
            </p>
            <div className="p-3 bg-white rounded-xl border border-[#ECE8E1] flex justify-between items-center font-mono">
              <span className="text-[#6B7280]">Kode Otorisasi (Dummy):</span>
              <span className="font-bold text-[#1F2937]">AUTH-992182</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={isInsufficient}
            onClick={handleFinish}
          >
            Selesaikan & Cetak Struk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
