"use client";

import React, { useState } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  containerClassName?: string;
}

const sizeClasses = {
  xs: "w-7 h-7 rounded-lg text-xs",
  sm: "w-9 h-9 rounded-xl text-sm",
  md: "w-11 h-11 rounded-xl text-base",
  lg: "w-14 h-14 rounded-2xl text-lg",
  xl: "w-20 h-20 rounded-2xl text-xl",
};

const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function ProductImage({
  src,
  alt,
  size = "md",
  className = "",
  containerClassName = "",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no src or failed to load, show package fallback
  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FAF8F5] border border-[#ECE8E1] text-[#C9772E]/70 shrink-0 ${sizeClasses[size]} ${containerClassName}`}
        title={alt}
      >
        <Package size={iconSizes[size]} className="stroke-[1.75]" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-center shrink-0 ${sizeClasses[size]} ${containerClassName}`}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-200 ${className}`}
      />
    </div>
  );
}
