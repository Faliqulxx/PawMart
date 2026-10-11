"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { initialTransactions, Transaction } from "@/data/transactions";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Receipt, ChevronRight, Eye } from "lucide-react";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

export function RecentTransactions() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Ambil 4 transaksi terbaru sesuai PRD
  const recentList = initialTransactions.slice(0, 4);

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle>Transaksi Terbaru</CardTitle>
            <span className="w-5 h-5 rounded-full bg-[#FBEBDD] text-[#C9772E] flex items-center justify-center text-xs">
              <Receipt size={12} />
            </span>
          </div>
          <Link
            href="/transaksi?tab=riwayat"
            className="text-xs text-[#C9772E] font-medium hover:underline flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                  <th className="py-3 px-4 sm:px-6">No. Transaksi</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8E1]">
                {recentList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#1F2937]">
                      <span className="font-mono text-xs text-[#C9772E] bg-[#FBEBDD] px-2 py-0.5 rounded-md">
                        {tx.noTransaksi}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#6B7280] whitespace-nowrap">
                      {formatTanggal(tx.tanggal)}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#1F2937]">
                      {tx.pelangganNama}
                    </td>
                    <td className="py-3.5 px-3 text-[#6B7280]">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-[11px] font-medium">
                        {tx.metodeBayar}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#1F2937] whitespace-nowrap">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="success">Selesai</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C9772E] hover:bg-[#FBEBDD] transition-colors inline-flex items-center justify-center"
                        title="Lihat Struk"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detail Struk saat klik aksi */}
      {selectedTx && (
        <ReceiptModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transaction={selectedTx}
        />
      )}
    </>
  );
}
