import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#ECE8E1] shadow-[0_1px_3px_rgba(0,0,0,0.03)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 border-b border-[#ECE8E1] flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: CardProps) {
  return (
    <h3
      className={cn(
        "text-base sm:text-lg font-semibold text-[#1F2937] tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("p-4 sm:p-5", className)} {...props}>
      {children}
    </div>
  );
}
