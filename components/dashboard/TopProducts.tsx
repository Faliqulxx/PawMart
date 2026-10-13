import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { topSellingProducts } from "@/data/stats";
import { formatRupiah } from "@/lib/format";
import { Trophy, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";

export function TopProducts() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle>Produk Terlaris</CardTitle>
          <span className="w-5 h-5 rounded-full bg-[#FBEBDD] text-[#C9772E] flex items-center justify-center text-xs">
            <Trophy size={12} />
          </span>
        </div>
        <Link
          href="/produk"
          className="text-xs text-[#C9772E] font-medium hover:underline flex items-center gap-0.5"
        >
          Lihat Semua <ChevronRight size={14} />
        </Link>
      </CardHeader>

      <CardContent className="pt-1 flex-1">
        <div className="divide-y divide-[#ECE8E1]">
          {topSellingProducts.map((item, idx) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1 group hover:bg-[#FAF8F5]/80 px-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0
                      ? "bg-[#C9772E] text-white"
                      : idx === 1
                      ? "bg-[#E9A464] text-white"
                      : idx === 2
                      ? "bg-[#FBEBDD] text-[#C9772E]"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {idx + 1}
                </span>

                <ProductImage
                  src={item.gambar || item.icon}
                  alt={item.nama}
                  size="sm"
                  className="group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#1F2937] truncate group-hover:text-[#C9772E] transition-colors">
                    {item.nama}
                  </p>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    {item.kategori}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-bold text-[#1F2937]">
                  {item.terjual}{" "}
                  <span className="text-[10px] font-normal text-[#6B7280]">
                    terjual
                  </span>
                </p>
                <p className="text-[11px] text-[#C9772E] font-medium">
                  {formatRupiah(item.pendapatan)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
