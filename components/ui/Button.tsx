import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "warning";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9772E]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-[#C9772E] text-white hover:bg-[#B56A27] shadow-sm shadow-[#C9772E]/20",
    secondary:
      "bg-[#FBEBDD] text-[#C9772E] hover:bg-[#F5DFC9]",
    outline:
      "border border-[#ECE8E1] bg-white text-[#1F2937] hover:bg-[#F7F5F1] hover:border-[#ded8cf]",
    ghost:
      "bg-transparent text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F5F1]",
    danger:
      "bg-[#E5484D] text-white hover:bg-[#ce3b40] shadow-sm shadow-[#E5484D]/20",
    warning:
      "bg-[#F59E0B] text-white hover:bg-[#d98b06] shadow-sm shadow-[#F59E0B]/20",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-md gap-1.5 min-h-[36px]",
    md: "text-sm px-4 py-2 rounded-lg gap-2 min-h-[44px]",
    lg: "text-base px-5 py-2.5 rounded-lg gap-2.5 min-h-[48px]",
    icon: "p-2 rounded-lg min-w-[40px] min-h-[40px]",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
