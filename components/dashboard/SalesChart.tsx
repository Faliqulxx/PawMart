"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { salesChart7Days, salesChart30Days, salesChartMonth } from "@/data/stats";
import { formatRupiah } from "@/lib/format";
import { TrendingUp, Calendar } from "lucide-react";

export function SalesChart() {
  const [period, setPeriod] = useState<"7d" | "30d" | "month">("7d");

  const getChartData = () => {
    switch (period) {
      case "30d":
        return salesChart30Days;
      case "month":
        return salesChartMonth;
      case "7d":
      default:
        return salesChart7Days;
    }
  };

  const chartData = getChartData();
  const totalPeriodSales = chartData.reduce((acc, curr) => acc + curr.nilai, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-[#ECE8E1] text-xs">
          <p className="font-semibold text-[#1F2937] mb-1">{label}</p>
          <p className="text-[#C9772E] font-bold text-sm">
            {formatRupiah(payload[0].value)}
          </p>
          {payload[0].payload.transaksi && (
            <p className="text-[#6B7280] mt-0.5">
              {payload[0].payload.transaksi} Transaksi
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Grafik Penjualan</CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              <TrendingUp size={12} />
              +14.2%
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Total {period === "7d" ? "7 hari" : period === "30d" ? "4 minggu" : "4 bulan"}:{" "}
            <span className="font-semibold text-[#1F2937]">
              {formatRupiah(totalPeriodSales)}
            </span>
          </p>
        </div>

        {/* Period Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-xs font-medium pl-8 pr-7 py-1.5 bg-[#F7F5F1] hover:bg-[#FAF8F5] text-[#1F2937] border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9772E]/20 cursor-pointer transition-colors"
            >
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        <div className="h-[260px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ECE8E1"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#ECE8E1" }}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickFormatter={(val) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
                  return `${val / 1000} rb`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="nilai"
                fill="#E9A464"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: "#C9772E" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
