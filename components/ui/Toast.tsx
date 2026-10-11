"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === "success"
                ? "bg-white text-emerald-800 border-emerald-200 shadow-emerald-500/10"
                : toast.type === "error"
                ? "bg-white text-rose-800 border-rose-200 shadow-rose-500/10"
                : "bg-white text-slate-800 border-[#ECE8E1] shadow-black/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                  <CheckCircle2 size={16} />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#E5484D] shrink-0">
                  <AlertCircle size={16} />
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-7 h-7 rounded-lg bg-[#FBEBDD] flex items-center justify-center text-[#C9772E] shrink-0">
                  <Info size={16} />
                </div>
              )}
              <span className="font-medium text-xs sm:text-sm text-[#1F2937]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B7280] hover:text-[#1F2937] p-1 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
