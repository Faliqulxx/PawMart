export type PaperWidth = "58mm" | "80mm";
export type PrinterType = "thermal" | "browser";
export type PrinterConnectionStatus = "connected" | "disconnected" | "unknown";
export type PrintingState = "idle" | "printing" | "success" | "error";

export interface ThermalItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  headerNote?: string;
  footerNote?: string;
}

export interface ThermalTransaction {
  transactionNumber: string;
  dateTime: string;
  cashier: string;
  customer: string;
  items: ThermalItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  loyaltyPoints?: number;
  store: StoreInfo;
}

export interface PrinterConfig {
  printerType: PrinterType;
  paperWidth: PaperWidth;
  autoPrint: boolean;
  bridgeUrl: string;
  timeoutMs?: number;
}

export interface PrintResult {
  success: boolean;
  message: string;
  printerStatus?: PrinterConnectionStatus;
  timestamp?: string;
}
