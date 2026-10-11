import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "primary" | "neutral" | "info" | "outline" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "neutral",
  children,
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-[#DCFCE7] text-[#16A34A] border-emerald-200",
    danger: "bg-[#FEE2E2] text-[#E5484D] border-rose-200",
    warning: "bg-[#FEF3C7] text-[#D97706] border-amber-200",
    primary: "bg-[#FBEBDD] text-[#C9772E] border-[#F5DFC9]",
    neutral: "bg-[#F3F4F6] text-[#4B5563] border-gray-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-white text-[#4B5563] border-gray-200",
    default: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
