"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Transaction } from "@/data/transactions";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Printer, CheckCircle, PawPrint, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export function ReceiptModal({
  isOpen,
  onClose,
  transaction,
}: ReceiptModalProps) {
  const { showToast } = useToast();

  const handlePrint = () => {
    // Buat iframe terisolasi khusus cetak agar tidak terpotong oleh overflow/modal dialog
    let iframe = document.getElementById(
      "receipt-print-iframe"
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "receipt-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Struk_${transaction.noTransaksi}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 3mm 4mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', Courier, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              width: 72mm;
              max-width: 100%;
              margin: 0 auto;
              padding: 6px 2px;
              color: #000;
              background: #fff;
              font-size: 11px;
              line-height: 1.35;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider {
              border-bottom: 1px dashed #000;
              margin: 6px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .item-row {
              margin-bottom: 5px;
            }
            .item-name {
              font-weight: bold;
              font-size: 11px;
            }
            .item-detail {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
            }
            .total-row {
              font-size: 13px;
              font-weight: 900;
              margin: 4px 0;
            }
            .footer {
              margin-top: 8px;
              font-size: 9.5px;
              text-align: center;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div style="font-size: 16px; margin-bottom: 2px;">🐾</div>
            <div class="font-bold" style="font-size: 14px; letter-spacing: 0.5px;">PAWMART PET SHOP</div>
            <div style="font-size: 10px;">Jl. Kemang Raya No. 42A, Jakarta Selatan</div>
            <div style="font-size: 10px;">Telp: 021-7890123 / 0812-9988-7766</div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <span>No. Transaksi</span>
            <span class="font-bold">${transaction.noTransaksi}</span>
          </div>
          <div class="row">
            <span>Waktu</span>
            <span>${formatTanggal(transaction.tanggal)}, ${transaction.waktu || "14:30"} WIB</span>
          </div>
          <div class="row">
            <span>Kasir</span>
            <span>${transaction.kasir || "Admin"}</span>
          </div>
          <div class="row">
            <span>Pelanggan</span>
            <span class="font-bold">${transaction.pelangganNama}</span>
          </div>

          <div class="divider"></div>

          <!-- DAFTAR ITEM -->
          <div>
            ${transaction.items
              .map(
                (item) => `
              <div class="item-row">
                <div class="item-name">${item.produkNama}</div>
                <div class="item-detail">
                  <span>${item.qty} x ${formatRupiah(item.harga)}</span>
                  <span class="font-bold">${formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal</span>
            <span>${formatRupiah(transaction.subtotal)}</span>
          </div>
          ${
            transaction.diskon > 0
              ? `
          <div class="row font-bold">
            <span>Diskon</span>
            <span>-${formatRupiah(transaction.diskon)}</span>
          </div>
          `
              : ""
          }
          ${
            transaction.pajak > 0
              ? `
          <div class="row">
            <span>PPN (11%)</span>
            <span>${formatRupiah(transaction.pajak)}</span>
          </div>
          `
              : ""
          }
          <div class="divider"></div>
          <div class="row total-row">
            <span>TOTAL</span>
            <span>${formatRupiah(transaction.total)}</span>
          </div>
          <div class="divider"></div>

          <div class="row">
            <span>Metode Bayar</span>
            <span class="font-bold">${transaction.metodeBayar}</span>
          </div>
          <div class="row">
            <span>Bayar (Diterima)</span>
            <span>${formatRupiah(transaction.nominalBayar || transaction.total)}</span>
          </div>
          <div class="row">
            <span>Kembalian</span>
            <span class="font-bold">${formatRupiah(transaction.kembalian || 0)}</span>
          </div>

          <div class="divider"></div>
          <div class="row">
            <span>Poin Diperoleh</span>
            <span class="font-bold">+${Math.floor(transaction.total / 10000)} Poin</span>
          </div>
          <div class="row">
            <span>Status Member</span>
            <span class="font-bold">PawMart Club Member</span>
          </div>

          <div class="divider"></div>

          <div class="footer">
            <div class="font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA! 🐾</div>
            <div>Barang yang dibeli dapat ditukar maks. 2 hari</div>
            <div>dengan membawa struk resmi ini.</div>
            <div style="margin-top: 4px; letter-spacing: 1px;">*** PAWMART SYSTEM POS ***</div>
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(receiptHtml);
    iframeDoc.close();

    // Beri jeda sejenak agar iframe selesai render lalu panggil print
    setTimeout(() => {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    }, 250);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Struk PawMart #${transaction.noTransaksi} - Total: ${formatRupiah(
          transaction.total
        )} (${formatTanggal(transaction.tanggal)})`
      );
      showToast("Tautan ringkasan struk digital disalin ke clipboard!");
    } else {
      showToast("Fitur cetak siap digunakan!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Struk Pembayaran"
      description={`Nomor Transaksi: ${transaction.noTransaksi}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable Struk Paper Container Preview */}
        <div
          id="printable-receipt"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECE8E1] text-[#1F2937] font-mono text-xs leading-relaxed shadow-xs"
        >
          {/* Logo & Store Header */}
          <div className="text-center pb-3 border-b border-dashed border-[#b8b0a2]">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#C9772E] text-white mx-auto mb-2 shadow-xs">
              <PawPrint size={22} className="stroke-[2.5]" />
            </div>
            <h2 className="font-extrabold text-base tracking-tight text-[#1F2937] font-sans">
              PAWMART PET SHOP
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              Jl. Kemang Raya No. 42A, Jakarta Selatan
            </p>
            <p className="text-[11px] text-[#6B7280]">
              Telp: 021-7890123 / 0812-9988-7766
            </p>
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-[#b8b0a2] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">No. Transaksi</span>
              <span className="font-bold text-[#1F2937]">
                {transaction.noTransaksi}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Waktu</span>
              <span>
                {formatTanggal(transaction.tanggal)}, {transaction.waktu || "14:30"} WIB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Kasir</span>
              <span>{transaction.kasir || "Admin"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Pelanggan</span>
              <span className="font-semibold text-[#1F2937]">
                {transaction.pelangganNama}
              </span>
            </div>
          </div>

          {/* Item List */}
          <div className="py-2.5 border-b border-dashed border-[#b8b0a2] space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5 text-xs">
                <p className="font-bold text-[#1F2937]">{item.produkNama}</p>
                <div className="flex justify-between text-[11px] text-[#6B7280]">
                  <span>
                    {item.qty} x {formatRupiah(item.harga)}
                  </span>
                  <span className="font-semibold text-[#1F2937]">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="py-2.5 border-b border-dashed border-[#b8b0a2] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6B7280]">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.diskon > 0 && (
              <div className="flex justify-between text-[#16A34A] font-bold">
                <span>Diskon</span>
                <span>-{formatRupiah(transaction.diskon)}</span>
              </div>
            )}
            {transaction.pajak > 0 && (
              <div className="flex justify-between text-[#6B7280]">
                <span>PPN (11%)</span>
                <span>{formatRupiah(transaction.pajak)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#1F2937] pt-1 border-t border-[#ECE8E1]">
              <span>TOTAL</span>
              <span className="text-[#C9772E] text-base">
                {formatRupiah(transaction.total)}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="py-2.5 border-b border-dashed border-[#b8b0a2] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Metode Bayar</span>
              <span className="font-semibold">{transaction.metodeBayar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Bayar (Diterima)</span>
              <span>{formatRupiah(transaction.nominalBayar || transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Kembalian</span>
              <span className="font-bold text-[#16A34A]">
                {formatRupiah(transaction.kembalian || 0)}
              </span>
            </div>
          </div>

          {/* Loyalty points summary */}
          <div className="py-2.5 border-b border-dashed border-[#b8b0a2] text-[11px] space-y-1 bg-amber-50/50 p-2 rounded-lg">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Poin Diperoleh Hari Ini</span>
              <span className="font-extrabold text-[#C9772E]">
                +{Math.floor(transaction.total / 10000)} Poin
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Program Loyalitas</span>
              <span className="font-semibold text-[#1F2937]">PawMart VIP Club</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 text-center text-[10px] text-[#6B7280] space-y-1">
            <p className="font-bold text-[#1F2937]">
              TERIMA KASIH ATAS KUNJUNGAN ANDA! 🐾
            </p>
            <p>Barang yang dibeli dapat ditukar 2 hari dengan membawa struk.</p>
            <p className="tracking-widest text-[#9CA3AF] pt-0.5">
              *** PAWMART SYSTEM POS ***
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 size={16} /> Salin Ringkasan
          </Button>
          <Button
            variant="primary"
            className="flex-1 shadow-md shadow-[#C9772E]/20"
            onClick={handlePrint}
          >
            <Printer size={16} /> Cetak Struk (Thermal)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
