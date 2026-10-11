import React from "react";
import { ArrowUpRight, AlertTriangle, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  isPositive?: boolean;
  isDanger?: boolean;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  isPositive = true,
  isDanger = false,
  icon: Icon,
  iconBg = "bg-[#FBEBDD]",
  iconColor = "text-[#C9772E]",
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 hover:border-[#ded8cf] transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-[#6B7280]">
          {title}
        </span>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            iconBg,
            iconColor
          )}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
          {value}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {isDanger ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-[#FEE2E2] text-[#E5484D]">
              <AlertTriangle size={12} />
              {subtitle}
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold",
                isPositive
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : "bg-[#FEE2E2] text-[#E5484D]"
              )}
            >
              <ArrowUpRight size={13} />
              {subtitle}
            </span>
          )}
          {!isDanger && (
            <span className="text-[#9CA3AF] text-[11px]">dari kemarin</span>
          )}
        </div>
      </div>
    </Card>
  );
}
