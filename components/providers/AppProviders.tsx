"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext";
import { ShiftProvider } from "@/context/ShiftContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CashierShiftModals } from "@/components/pos/CashierShiftModals";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ShiftProvider>
        <ToastProvider>
          {children}
          <CashierShiftModals />
        </ToastProvider>
      </ShiftProvider>
    </UserProvider>
  );
}
