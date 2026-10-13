"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CashierShift, initialShiftHistory } from "@/data/shifts";
import { useUserRole } from "@/context/UserContext";

export interface ShiftContextValue {
  currentShift: CashierShift | null;
  shiftHistory: CashierShift[];
  isShiftActive: boolean;
  isOpenShiftModalOpen: boolean;
  isCloseShiftModalOpen: boolean;
  setIsOpenShiftModalOpen: (open: boolean) => void;
  setIsCloseShiftModalOpen: (open: boolean) => void;
  startShift: (startingCash: number, notes?: string) => CashierShift;
  endShift: (actualCash: number, notes?: string) => CashierShift;
  recordTransactionToShift: (amount: number, paymentMethod: string) => void;
  getShiftById: (id: string) => CashierShift | undefined;
}

const ShiftContext = createContext<ShiftContextValue | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isKasir } = useUserRole();

  const [shiftHistory, setShiftHistory] = useState<CashierShift[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pawmart_shift_history");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load shift history:", e);
      }
    }
    return initialShiftHistory;
  });

  const [currentShift, setCurrentShift] = useState<CashierShift | null>(null);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

  // Sync current active shift whenever logged-in user changes or shift history updates
  useEffect(() => {
    if (!currentUser) {
      setCurrentShift(null);
      return;
    }

    // Find if current user has an open active shift
    const activeShift = shiftHistory.find(
      (s) => s.cashierId === currentUser.id && s.status === "open"
    );

    setCurrentShift(activeShift || null);
  }, [currentUser, shiftHistory]);

  // Persist shift history to localStorage
  const saveShiftHistory = (newHistory: CashierShift[]) => {
    setShiftHistory(newHistory);
    try {
      localStorage.setItem("pawmart_shift_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to persist shift history:", e);
    }
  };

  /**
   * Buka Shift Kasir Baru
   */
  const startShift = (startingCash: number, notes: string = ""): CashierShift => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const shiftCount = shiftHistory.length + 1;
    const newShiftId = `SHF-${dateStr}-${String(shiftCount).padStart(3, "0")}`;

    const newShift: CashierShift = {
      id: newShiftId,
      shiftNumber: shiftCount,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      startTime: now.toISOString(),
      endTime: null,
      status: "open",
      startingCash: Math.max(0, startingCash),
      cashSales: 0,
      nonCashSales: 0,
      totalSales: 0,
      transactionCount: 0,
      expectedCash: Math.max(0, startingCash),
      actualCash: null,
      cashDifference: null,
      notes: notes || "Shift dibuka oleh " + currentUser.name,
    };

    const updatedHistory = [newShift, ...shiftHistory];
    saveShiftHistory(updatedHistory);
    setCurrentShift(newShift);
    setIsOpenShiftModalOpen(false);

    return newShift;
  };

  /**
   * Tutup Shift Kasir dengan Rekonsiliasi Kas Laci
   */
  const endShift = (actualCash: number, notes: string = ""): CashierShift => {
    if (!currentShift) {
      throw new Error("Tidak ada shift aktif yang dapat ditutup.");
    }

    const now = new Date();
    const expected = currentShift.startingCash + currentShift.cashSales;
    const difference = actualCash - expected;

    const closedShift: CashierShift = {
      ...currentShift,
      endTime: now.toISOString(),
      status: "closed",
      expectedCash: expected,
      actualCash: actualCash,
      cashDifference: difference,
      notes: notes ? `${currentShift.notes || ""} | Tutup Shift: ${notes}` : currentShift.notes,
    };

    const updatedHistory = shiftHistory.map((s) =>
      s.id === currentShift.id ? closedShift : s
    );

    saveShiftHistory(updatedHistory);
    setCurrentShift(null);
    setIsCloseShiftModalOpen(false);

    return closedShift;
  };

  /**
   * Catat Transaksi Selesai ke Shift Aktif Kasir
   */
  const recordTransactionToShift = (amount: number, paymentMethod: string) => {
    if (!currentShift) return;

    const isCash = paymentMethod.toLowerCase() === "tunai";
    const addCash = isCash ? amount : 0;
    const addNonCash = !isCash ? amount : 0;

    const updatedShift: CashierShift = {
      ...currentShift,
      cashSales: currentShift.cashSales + addCash,
      nonCashSales: currentShift.nonCashSales + addNonCash,
      totalSales: currentShift.totalSales + amount,
      transactionCount: currentShift.transactionCount + 1,
      expectedCash: currentShift.expectedCash + addCash,
    };

    const updatedHistory = shiftHistory.map((s) =>
      s.id === currentShift.id ? updatedShift : s
    );

    saveShiftHistory(updatedHistory);
    setCurrentShift(updatedShift);
  };

  const getShiftById = (id: string) => {
    return shiftHistory.find((s) => s.id === id);
  };

  return (
    <ShiftContext.Provider
      value={{
        currentShift,
        shiftHistory,
        isShiftActive: !!currentShift && currentShift.status === "open",
        isOpenShiftModalOpen,
        isCloseShiftModalOpen,
        setIsOpenShiftModalOpen,
        setIsCloseShiftModalOpen,
        startShift,
        endShift,
        recordTransactionToShift,
        getShiftById,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useCashierShift() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error("useCashierShift must be used within a ShiftProvider");
  }
  return context;
}
