"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </UserProvider>
  );
}
