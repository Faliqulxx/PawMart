"use client";

import React from "react";
import { OpenShiftModal } from "@/components/pos/OpenShiftModal";
import { CloseShiftModal } from "@/components/pos/CloseShiftModal";

export function CashierShiftModals() {
  return (
    <>
      <OpenShiftModal />
      <CloseShiftModal />
    </>
  );
}
