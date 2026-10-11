"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  CreditCard,
  User,
  RotateCcw,
  Receipt,
  ShoppingCart,
  Calendar,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Percent,
  Tag,
  ShieldCheck,
  AlertCircle,
  Check,
  Award,
  Ticket,
  Gift,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { initialProducts, categories, Product } from "@/data/products";
import { initialCustomers, Customer } from "@/data/customers";
import { initialTransactions, Transaction, TransactionItem } from "@/data/transactions";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";
import {
  initialVouchers,
  VoucherItem,
  initialMemberBalances,
  memberTiers,
} from "@/data/loyalty";

interface CartItemState {
  product: Product;
  qty: number;
  customPrice?: number; // Custom unit price set by Admin/Owner
}

interface HeldTransaction {
  id: string;
  heldAt: string;
  customer: Customer;
  items: CartItemState[];
  discountType: "rp" | "percent";
  discountValue: number;
  effectiveDiscount: number;
  taxEnabled: boolean;
  total: number;
}

export default function TransaksiPage() {
  const { showToast } = useToast();
  const { currentUser, role, isAdmin } = useUserRole();

  // Active Tab: 'pos' | 'riwayat' | 'ditahan'
  const [activeTab, setActiveTab] = useState<"pos" | "riwayat" | "ditahan">("pos");

  // Product Catalog State
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Cart State
  const [cart, setCart] = useState<CartItemState[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    initialCustomers[0]
  );

  // Discount State: 'rp' or 'percent'
  const [discountType, setDiscountType] = useState<"rp" | "percent">("rp");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);

  // Editing custom price state (Admin only)
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempCustomPrice, setTempCustomPrice] = useState<number>(0);

  // Transactions list (can be augmented by new sales)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Held Transactions list
  const [heldList, setHeldList] = useState<HeldTransaction[]>([]);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Loyalty & Voucher State
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);

  // Read Pending Checkout from Grooming Queue or Pet Hotel Check-out
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingRaw = window.sessionStorage.getItem("pawmart_pending_service_checkout");
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          const matchedCust = initialCustomers.find(
            (c) => c.nama.toLowerCase() === pending.customerName?.toLowerCase()
          );
          if (matchedCust) setSelectedCustomer(matchedCust);

          const srvProduct: Product = {
            id: `SRV-${Date.now()}`,
            nama: pending.serviceName || "Layanan Jasa PawMart",
            sku: "SRV-POS",
            barcode: "9990001",
            kategori: "Aksesoris",
            hargaBeli: 0,
            hargaJual: pending.price || 50000,
            stok: 99,
            stokMin: 0,
            satuan: "Paket",
            icon: pending.source === "boarding" ? "🏨" : "✂️",
          };

          setCart((prev) => [...prev, { product: srvProduct, qty: 1 }]);
          window.sessionStorage.removeItem("pawmart_pending_service_checkout");
          showToast(`Layanan ${pending.serviceName} (${formatRupiah(pending.price)}) berhasil dimasukkan ke keranjang kasir!`, "success");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [showToast]);

  // Find Member details for selected customer
  const customerMember = useMemo(() => {
    return initialMemberBalances.find(
      (m) => m.id === selectedCustomer.id || m.nama.toLowerCase() === selectedCustomer.nama.toLowerCase()
    );
  }, [selectedCustomer]);

  // Filter Catalog Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchCat =
        selectedCategory === "Semua" || p.kategori === selectedCategory;
      const matchQuery =
        p.nama.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchProduct.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [searchProduct, selectedCategory]);

  // Cart Subtotal Calculation (uses customPrice if set by Admin)
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const unitPrice =
        item.customPrice !== undefined ? item.customPrice : item.product.hargaJual;
      return acc + unitPrice * item.qty;
    }, 0);
  }, [cart]);

  // Store Discount Calculation (Rp / %)
  const effectiveDiscount = useMemo(() => {
    if (discountValue <= 0 || subtotal <= 0) return 0;
    if (discountType === "percent") {
      const pct = Math.min(100, Math.max(0, discountValue));
      return Math.round((subtotal * pct) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  // Voucher Discount Calculation
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher || subtotal < appliedVoucher.minBelanja) return 0;
    if (appliedVoucher.tipe === "persen") {
      return Math.round((subtotal * appliedVoucher.nilai) / 100);
    }
    return Math.min(subtotal, appliedVoucher.nilai);
  }, [appliedVoucher, subtotal]);

  // Points Discount Calculation (100 poin = Rp 10.000 / 1 poin = Rp 100)
  const maxAvailablePointsDiscount = customerMember ? customerMember.poin * 100 : 0;
  const pointsDiscount = useMemo(() => {
    if (!redeemPoints || !customerMember || customerMember.poin <= 0) return 0;
    const remaining = Math.max(0, subtotal - effectiveDiscount - voucherDiscount);
    return Math.min(remaining, maxAvailablePointsDiscount);
  }, [redeemPoints, customerMember, subtotal, effectiveDiscount, voucherDiscount, maxAvailablePointsDiscount]);

  // Total All Deductions
  const totalAllDiscounts = effectiveDiscount + voucherDiscount + pointsDiscount;

  // Tax Calculation
  const taxAmount = useMemo(() => {
    if (!taxEnabled) return 0;
    return Math.round((subtotal - totalAllDiscounts) * 0.11);
  }, [subtotal, totalAllDiscounts, taxEnabled]);

  // Total Calculation
  const total = useMemo(() => {
    return Math.max(0, subtotal - totalAllDiscounts + taxAmount);
  }, [subtotal, totalAllDiscounts, taxAmount]);

  // Points to Earn
  const pointsToEarn = useMemo(() => {
    const base = Math.floor(total / 10000);
    const multiplier = customerMember ? memberTiers[customerMember.tier].multiplierPoin : 1.0;
    return Math.round(base * multiplier);
  }, [total, customerMember]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.qty, 0);
  }, [cart]);

  // Check if cashier exceeds limit (Rp 1.000 max)
  const isCashierExceedingLimit = !isAdmin && effectiveDiscount > 1000;

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stok <= 0) {
      showToast(`Stok ${product.nama} habis!`, "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stok) {
          showToast(`Jumlah melebihi stok yang tersedia (${product.stok})`, "error");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            if (newQty > item.product.stok) {
              showToast(`Maksimal stok tercapai (${item.product.stok})`, "error");
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const resetCart = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType("rp");
    setTaxEnabled(false);
    setSelectedCustomer(initialCustomers[0]);
    setEditingPriceItemId(null);
  };

  // Admin Custom Price handlers
  const handleStartEditPrice = (item: CartItemState) => {
    if (!isAdmin) return;
    setEditingPriceItemId(item.product.id);
    setTempCustomPrice(
      item.customPrice !== undefined ? item.customPrice : item.product.hargaJual
    );
  };

  const handleSaveCustomPrice = (productId: string) => {
    if (!isAdmin) return;
    if (tempCustomPrice < 0) {
      showToast("Harga tidak boleh negatif!", "error");
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, customPrice: tempCustomPrice }
          : item
      )
    );
    setEditingPriceItemId(null);
    showToast(`Harga produk berhasil disesuaikan menjadi ${formatRupiah(tempCustomPrice)}!`);
  };

  const handleResetCustomPrice = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, customPrice: undefined }
          : item
      )
    );
    setEditingPriceItemId(null);
    showToast("Harga produk dikembalikan ke harga katalog normal.");
  };

  // Quick 1000 Cashier Discount
  const handleApplyCashierDiscount = () => {
    setDiscountType("rp");
    setDiscountValue(1000);
    showToast("Diskon Rp 1.000 atas permintaan pelanggan berhasil diterapkan!", "success");
  };

  // Hold transaction
  const handleHoldTransaction = () => {
    if (cart.length === 0) {
      showToast("Keranjang kosong, tidak ada transaksi untuk ditahan", "error");
      return;
    }

    const heldItem: HeldTransaction = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      heldAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      customer: selectedCustomer,
      items: [...cart],
      discountType,
      discountValue,
      effectiveDiscount,
      taxEnabled,
      total,
    };

    setHeldList((prev) => [heldItem, ...prev]);
    resetCart();
    showToast(`Transaksi untuk ${selectedCustomer.nama} berhasil ditahan!`, "info");
  };

  // Restore held transaction
  const handleRestoreHeld = (held: HeldTransaction) => {
    setCart(held.items);
    setSelectedCustomer(held.customer);
    setDiscountType(held.discountType || "rp");
    setDiscountValue(held.discountValue || 0);
    setTaxEnabled(held.taxEnabled);
    setHeldList((prev) => prev.filter((h) => h.id !== held.id));
    setActiveTab("pos");
    showToast(`Transaksi ${held.id} dimuat kembali ke keranjang`);
  };

  // Delete held transaction
  const handleDeleteHeld = (id: string) => {
    setHeldList((prev) => prev.filter((h) => h.id !== id));
    showToast("Transaksi ditahan dihapus");
  };

  // Validate and open payment modal
  const handleOpenPayment = () => {
    if (isCashierExceedingLimit) {
      showToast(
        "Batas diskon kasir adalah Rp 1.000. Untuk diskon lebih besar, hubungi Admin/Owner!",
        "error"
      );
      return;
    }
    setIsPaymentOpen(true);
  };

  // Finish Payment
  const handlePaymentSuccess = (paymentInfo: {
    metodeBayar: "Tunai" | "QRIS" | "Transfer" | "Kartu";
    nominalBayar: number;
    kembalian: number;
  }) => {
    const nextTrxNumber = `TRX-00${transactions.length + 1}`;
    const txItems: TransactionItem[] = cart.map((c) => {
      const unitPrice =
        c.customPrice !== undefined ? c.customPrice : c.product.hargaJual;
      return {
        produkId: c.product.id,
        produkNama:
          c.customPrice !== undefined && c.customPrice !== c.product.hargaJual
            ? `${c.product.nama} (Harga Khusus)`
            : c.product.nama,
        harga: unitPrice,
        qty: c.qty,
        subtotal: unitPrice * c.qty,
        icon: c.product.icon,
      };
    });

    const newTx: Transaction = {
      id: nextTrxNumber,
      noTransaksi: nextTrxNumber,
      tanggal: new Date().toISOString().split("T")[0],
      waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      pelangganId: selectedCustomer.id,
      pelangganNama: selectedCustomer.nama,
      items: txItems,
      subtotal,
      diskon: effectiveDiscount,
      pajak: taxAmount,
      total,
      metodeBayar: paymentInfo.metodeBayar,
      nominalBayar: paymentInfo.nominalBayar,
      kembalian: paymentInfo.kembalian,
      status: "Selesai",
      kasir: currentUser.name,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsPaymentOpen(false);
    setIsMobileCartOpen(false);
    resetCart();
    setActiveReceipt(newTx);
    showToast(`Transaksi ${nextTrxNumber} berhasil diselesaikan!`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
              Kasir & Transaksi POS
            </h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                <ShieldCheck size={13} /> Mode Owner/Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBEBDD] text-[#C9772E] border border-[#F5DFC9]">
                <span>👩‍💼</span> Mode Kasir/Karyawan
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            {isAdmin
              ? "Login sebagai Owner: Anda memiliki wewenang penuh mengubah harga produk & memberi diskon bebas (Rp / %)."
              : "Login sebagai Kasir: Terdapat ketentuan diskon Rp 1.000 jika ada pelanggan yang meminta diskon."}
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ECE8E1]/60 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pos"
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            Kasir POS
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "riwayat"
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            Riwayat Penjualan
          </button>
          <button
            onClick={() => setActiveTab("ditahan")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === "ditahan"
                ? "bg-white text-[#C9772E] shadow-xs"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            Ditahan
            {heldList.length > 0 && (
              <span className="ml-1.5 bg-[#F59E0B] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {heldList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: KASIR POS (DUAL PANEL) */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: PRODUCT CATALOG (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Search and Category Filter */}
            <Card className="p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Cari nama produk, SKU, atau scan barcode..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] text-xs sm:text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl border border-[#ECE8E1] focus:bg-white focus:outline-none focus:border-[#C9772E] focus:ring-2 focus:ring-[#C9772E]/20"
                  />
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-[#C9772E] text-white shadow-xs"
                        : "bg-[#FAF8F5] text-[#6B7280] hover:bg-[#FBEBDD] hover:text-[#C9772E] border border-[#ECE8E1]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((prod) => {
                const inCart = cart.find((c) => c.product.id === prod.id);
                const isOutOfStock = prod.stok <= 0;
                const isLowStock = prod.stok > 0 && prod.stok <= prod.stokMin;

                return (
                  <Card
                    key={prod.id}
                    className={`overflow-hidden flex flex-col justify-between transition-all hover:border-[#C9772E]/50 group ${
                      isOutOfStock ? "opacity-60 bg-gray-50" : ""
                    }`}
                  >
                    <div className="p-3 sm:p-4">
                      {/* Product Header & Emoji */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                          {prod.icon}
                        </div>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#E5484D]">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">
                            Sisa {prod.stok}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded">
                            Stok {prod.stok}
                          </span>
                        )}
                      </div>

                      {/* Name & SKU */}
                      <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] line-clamp-2 leading-snug group-hover:text-[#C9772E] transition-colors">
                        {prod.nama}
                      </h4>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-mono">
                        {prod.sku}
                      </p>
                    </div>

                    {/* Price and Add Action */}
                    <div className="p-3 sm:p-4 pt-0 border-t border-[#ECE8E1]/60 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-[#C9772E] block">
                          {formatRupiah(prod.hargaJual)}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          inCart
                            ? "bg-[#C9772E] text-white shadow-xs"
                            : "bg-[#FBEBDD] text-[#C9772E] hover:bg-[#C9772E] hover:text-white"
                        } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                        title="Tambah ke Keranjang"
                      >
                        {inCart ? (
                          <span className="text-xs font-bold">{inCart.qty}</span>
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: CART (DESKTOP / TABLET) (4 cols) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
            <Card className="flex flex-col shadow-md">
              {/* Cart Header */}
              <CardHeader className="py-3 px-4 flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#C9772E]" />
                  <CardTitle className="text-base">Keranjang Kasir</CardTitle>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={resetCart}
                    className="text-xs text-[#E5484D] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Kosongkan
                  </button>
                )}
              </CardHeader>

              {/* Customer Select */}
              <div className="p-3.5 border-b border-[#ECE8E1] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#6B7280]">
                    Pilih Pelanggan / Member:
                  </label>
                  {customerMember && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        memberTiers[customerMember.tier].badgeBg
                      }`}
                    >
                      ★ {customerMember.tier} ({customerMember.poin} Poin)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <select
                    value={selectedCustomer.id}
                    onChange={(e) => {
                      const found = initialCustomers.find(
                        (c) => c.id === e.target.value
                      );
                      if (found) {
                        setSelectedCustomer(found);
                        setRedeemPoints(false);
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-[#F7F5F1] text-xs font-semibold text-[#1F2937] rounded-xl border border-[#ECE8E1] focus:outline-none focus:border-[#C9772E]"
                  >
                    {initialCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.nama} {cust.poin > 0 ? `(${cust.poin} Poin)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="p-3.5 max-h-[310px] overflow-y-auto divide-y divide-[#ECE8E1] flex-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-[#9CA3AF] space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F5F1] flex items-center justify-center mx-auto text-[#6B7280]">
                      <ShoppingCart size={24} />
                    </div>
                    <p className="text-xs font-semibold text-[#6B7280]">
                      Keranjang Masih Kosong
                    </p>
                    <p className="text-[11px]">
                      Klik produk pada katalog di sebelah kiri untuk menambahkan.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const hasCustomPrice =
                      item.customPrice !== undefined &&
                      item.customPrice !== item.product.hargaJual;
                    const effectiveUnitPrice =
                      item.customPrice !== undefined
                        ? item.customPrice
                        : item.product.hargaJual;
                    const isEditingThisPrice =
                      editingPriceItemId === item.product.id;

                    return (
                      <div
                        key={item.product.id}
                        className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1F2937] truncate">
                              {item.product.nama}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                              {hasCustomPrice ? (
                                <>
                                  <span className="line-through text-gray-400">
                                    {formatRupiah(item.product.hargaJual)}
                                  </span>
                                  <span className="font-bold text-[#C9772E]">
                                    {formatRupiah(effectiveUnitPrice)}
                                  </span>
                                  <span className="bg-[#DCFCE7] text-[#16A34A] text-[9px] font-bold px-1 rounded">
                                    Diskon Owner
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#6B7280]">
                                  {formatRupiah(effectiveUnitPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-bold text-[#1F2937]">
                              {formatRupiah(effectiveUnitPrice * item.qty)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-[10px] text-[#E5484D] hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>

                        {/* Quantity and Admin Edit Price Action */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-[#ECE8E1]/80">
                          {/* Qty increment/decrement */}
                          <div className="flex items-center gap-1 bg-[#F7F5F1] p-0.5 rounded-lg border border-[#ECE8E1]">
                            <button
                              onClick={() => updateQty(item.product.id, -1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#6B7280] hover:bg-white hover:text-[#1F2937]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-[#1F2937]">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product.id, 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#6B7280] hover:bg-white hover:text-[#1F2937]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Admin Edit Price Button / Cashier Locked Notice */}
                          {isAdmin ? (
                            <div>
                              {!isEditingThisPrice ? (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPrice(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C9772E] hover:underline bg-[#FBEBDD]/60 hover:bg-[#FBEBDD] px-2 py-0.5 rounded-md"
                                  title="Ubah harga satuan untuk beri diskon langsung (Wewenang Owner)"
                                >
                                  <Edit3 size={11} /> Ubah Harga
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={tempCustomPrice || ""}
                                    onChange={(e) =>
                                      setTempCustomPrice(Number(e.target.value) || 0)
                                    }
                                    placeholder="Harga baru"
                                    className="w-24 px-1.5 py-0.5 text-xs font-bold rounded border border-[#C9772E] bg-white text-[#C9772E] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCustomPrice(item.product.id)}
                                    className="p-1 rounded bg-[#16A34A] text-white hover:bg-emerald-600"
                                    title="Terapkan harga"
                                  >
                                    <Check size={12} />
                                  </button>
                                  {hasCustomPrice && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetCustomPrice(item.product.id)}
                                      className="p-1 rounded bg-gray-200 text-[#6B7280] hover:bg-gray-300"
                                      title="Reset ke harga normal"
                                    >
                                      <RotateCcw size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#9CA3AF] italic">
                              Harga standar toko
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Order Summary & Actions */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-[#ECE8E1] bg-[#FAF8F5] space-y-3">
                  {/* ROLE SPECIFIC POLICY / INSTRUCTION BANNER */}
                  {isAdmin ? (
                    <div className="p-2.5 rounded-xl bg-[#DCFCE7]/70 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                        <ShieldCheck size={14} />
                        <span>Wewenang Owner / Admin Aktif</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Anda dapat merubah harga satuan per item di atas atau memberikan diskon transaksi dalam nominal <strong>Rp</strong> maupun persentase <strong>%</strong> tanpa batas.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#FEF3C7]/80 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#92400E]">
                            Keterangan Kebijakan Kasir:
                          </p>
                          <p className="text-[11px] text-[#B45309] mt-0.5">
                            Jika ada pelanggan yang ingin <strong>minta diskon</strong>, kasir berwenang memberikan potongan sebesar <strong>Rp 1.000</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Quick 1000 Cashier Discount Button */}
                      <button
                        type="button"
                        onClick={handleApplyCashierDiscount}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Tag size={13} />
                        <span>Terapkan Diskon Rp 1.000 (Minta Diskon)</span>
                      </button>
                    </div>
                  )}

                  {/* DISCOUNT CONTROLS: RP & % TOGGLE */}
                  <div className="space-y-2 text-xs p-3 rounded-xl bg-white border border-[#ECE8E1]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F2937] flex items-center gap-1">
                        <Tag size={13} className="text-[#C9772E]" />
                        <span>Diskon Transaksi:</span>
                      </span>

                      {/* RP vs % TOGGLE SWITCH */}
                      <div className="flex items-center bg-[#F7F5F1] p-0.5 rounded-lg border border-[#ECE8E1]">
                        <button
                          type="button"
                          onClick={() => setDiscountType("rp")}
                          className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                            discountType === "rp"
                              ? "bg-[#C9772E] text-white shadow-xs"
                              : "text-[#6B7280] hover:text-[#1F2937]"
                          }`}
                        >
                          Rp
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("percent")}
                          className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                            discountType === "percent"
                              ? "bg-[#C9772E] text-white shadow-xs"
                              : "text-[#6B7280] hover:text-[#1F2937]"
                          }`}
                        >
                          %
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6B7280] text-[11px]">
                        {discountType === "rp"
                          ? "Masukkan nominal potongan (Rp):"
                          : "Masukkan persentase diskon (%):"}
                      </span>

                      <div className="relative w-32">
                        {discountType === "rp" && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7280]">
                            Rp
                          </span>
                        )}
                        <input
                          type="number"
                          value={discountValue || ""}
                          onChange={(e) =>
                            setDiscountValue(Number(e.target.value) || 0)
                          }
                          placeholder="0"
                          className={`w-full text-right py-1.5 rounded-lg border bg-white text-xs font-bold text-[#1F2937] focus:outline-none ${
                            discountType === "rp" ? "pl-8 pr-2.5" : "pl-2.5 pr-7"
                          } ${
                            isCashierExceedingLimit
                              ? "border-[#E5484D] focus:border-[#E5484D]"
                              : "border-[#ECE8E1] focus:border-[#C9772E]"
                          }`}
                        />
                        {discountType === "percent" && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
                            %
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick percentage buttons for Owner */}
                    {isAdmin && discountType === "percent" && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[#9CA3AF]">Pintasan:</span>
                        {[5, 10, 15, 20].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setDiscountValue(pct)}
                            className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                              discountValue === pct
                                ? "bg-[#C9772E] text-white border-[#C9772E]"
                                : "bg-gray-50 text-[#4B5563] border-[#ECE8E1] hover:bg-[#FBEBDD]"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Warning if Cashier exceeds Rp 1.000 */}
                    {isCashierExceedingLimit && (
                      <div className="p-2 rounded-lg bg-[#FEE2E2] text-[#E5484D] text-[11px] font-semibold flex items-center gap-1">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>
                          Maksimal wewenang diskon kasir Rp 1.000. Hubungi Owner untuk diskon lebih besar.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tax Option */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <label className="text-[#6B7280] flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                        className="accent-[#C9772E] rounded"
                      />
                      <span>Aktifkan PPN 11%</span>
                    </label>
                    <span className="font-medium text-[#1F2937]">
                      {formatRupiah(taxAmount)}
                    </span>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="pt-2 border-t border-[#ECE8E1] space-y-1 text-xs">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Subtotal ({totalItemCount} item)</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>

                    {effectiveDiscount > 0 && (
                      <div className="flex justify-between text-[#16A34A] font-semibold">
                        <span>
                          Diskon{" "}
                          {discountType === "percent"
                            ? `(${discountValue}%)`
                            : `(Rp)`}
                          {!isAdmin && effectiveDiscount === 1000 ? " [Pelanggan]" : ""}
                        </span>
                        <span>-{formatRupiah(effectiveDiscount)}</span>
                      </div>
                    )}

                    {/* Loyalty Points Redemption Toggle */}
                    {customerMember && customerMember.poin > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={redeemPoints}
                            onChange={(e) => setRedeemPoints(e.target.checked)}
                            className="accent-[#C9772E] rounded"
                          />
                          <div>
                            <span className="font-bold text-[#92400E] block text-[11px]">
                              Tukar {customerMember.poin} Poin Member
                            </span>
                            <span className="text-[10px] text-amber-700">
                              Potongan senilai {formatRupiah(maxAvailablePointsDiscount)}
                            </span>
                          </div>
                        </label>
                        <span className="font-extrabold text-[#C9772E] text-xs">
                          {redeemPoints ? `-${formatRupiah(pointsDiscount)}` : "Tersedia"}
                        </span>
                      </div>
                    )}

                    {/* Voucher Section */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
                      {appliedVoucher ? (
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-bold text-emerald-700 block text-[11px]">
                              🏷️ Voucher: {appliedVoucher.kode}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">
                              {appliedVoucher.nama} (-{formatRupiah(voucherDiscount)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAppliedVoucher(null)}
                            className="text-[10px] text-red-600 hover:underline font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsVoucherModalOpen(true)}
                          className="w-full py-1 text-xs font-semibold text-[#C9772E] hover:underline flex items-center justify-center gap-1.5"
                        >
                          <Ticket size={13} />
                          <span>Gunakan Voucher Promo</span>
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between text-base font-extrabold text-[#1F2937] pt-1">
                      <span>Total Tagihan</span>
                      <span className="text-[#C9772E] text-lg">
                        {formatRupiah(total)}
                      </span>
                    </div>

                    {/* Points to earn row (PRD 6.3.5) */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} className="text-emerald-600" /> Poin yang akan didapat:
                      </span>
                      <span className="font-bold">+{pointsToEarn} Poin</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="warning"
                      onClick={handleHoldTransaction}
                      className="w-full text-xs"
                    >
                      <PauseCircle size={15} /> Tahan (Hold)
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleOpenPayment}
                      disabled={isCashierExceedingLimit}
                      className="w-full text-xs shadow-md shadow-[#C9772E]/20"
                    >
                      <CreditCard size={15} /> Bayar Sekarang
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* MOBILE FLOATING CART BAR */}
          {cart.length > 0 && (
            <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-white border-t border-[#ECE8E1] shadow-xl z-30 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#6B7280]">
                  {totalItemCount} Item dalam keranjang
                </p>
                <p className="text-base font-black text-[#C9772E]">
                  {formatRupiah(total)}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsMobileCartOpen(true)}
                className="shadow-sm shadow-[#C9772E]/20"
              >
                Lihat Keranjang & Bayar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MOBILE CART MODAL / BOTTOM SHEET */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col p-5 z-10 animate-in slide-in-from-bottom">
            <div className="w-12 h-1 bg-[#ECE8E1] rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E1]">
              <h3 className="font-bold text-base text-[#1F2937]">
                Keranjang Kasir ({totalItemCount} item)
              </h3>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="text-xs text-[#6B7280]"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#ECE8E1] py-3 space-y-2">
              {/* Cashier Policy Notice on Mobile */}
              {!isAdmin && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <p className="font-bold text-amber-800">
                    Keterangan Diskon Kasir:
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Potongan diskon Rp 1.000 jika pelanggan meminta diskon.
                  </p>
                  <button
                    type="button"
                    onClick={handleApplyCashierDiscount}
                    className="mt-1.5 w-full py-1 bg-amber-500 text-white rounded font-bold text-xs"
                  >
                    Terapkan Diskon Rp 1.000
                  </button>
                </div>
              )}

              {cart.map((item) => {
                const effectiveUnitPrice =
                  item.customPrice !== undefined
                    ? item.customPrice
                    : item.product.hargaJual;

                return (
                  <div
                    key={item.product.id}
                    className="py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-xs text-[#1F2937]">
                        {item.product.nama}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {formatRupiah(effectiveUnitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-7 h-7 rounded bg-[#F7F5F1] flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-7 h-7 rounded bg-[#F7F5F1] flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Discount Controls */}
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1] my-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Pilihan Diskon:</span>
                <div className="flex bg-white rounded border border-[#ECE8E1]">
                  <button
                    onClick={() => setDiscountType("rp")}
                    className={`px-2 py-0.5 text-xs font-bold ${
                      discountType === "rp" ? "bg-[#C9772E] text-white" : ""
                    }`}
                  >
                    Rp
                  </button>
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 text-xs font-bold ${
                      discountType === "percent" ? "bg-[#C9772E] text-white" : ""
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                placeholder={discountType === "rp" ? "Nominal Rp" : "Persen %"}
                className="w-full text-right py-1 px-2 border rounded bg-white text-xs font-bold"
              />
            </div>

            <div className="pt-3 border-t border-[#ECE8E1] space-y-2">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#C9772E]">{formatRupiah(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="warning"
                  onClick={() => {
                    handleHoldTransaction();
                    setIsMobileCartOpen(false);
                  }}
                >
                  Tahan
                </Button>
                <Button
                  variant="primary"
                  disabled={isCashierExceedingLimit}
                  onClick={() => {
                    setIsMobileCartOpen(false);
                    handleOpenPayment();
                  }}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI */}
      {activeTab === "riwayat" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Riwayat Transaksi Penjualan</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Total {transactions.length} transaksi tercatat di sistem PawMart.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                Semua Status Selesai
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                    <th className="py-3 px-4 sm:px-6">No. Transaksi</th>
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Pelanggan</th>
                    <th className="py-3 px-3">Jumlah Item</th>
                    <th className="py-3 px-3">Metode</th>
                    <th className="py-3 px-3 text-right">Total Tagihan</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E1]">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors group cursor-pointer"
                      onClick={() => setActiveReceipt(tx)}
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#1F2937]">
                        <span className="font-mono text-xs text-[#C9772E] bg-[#FBEBDD] px-2 py-0.5 rounded-md">
                          {tx.noTransaksi}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#6B7280] whitespace-nowrap">
                        {formatTanggal(tx.tanggal)}, {tx.waktu} WIB
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#1F2937]">
                        {tx.pelangganNama}
                      </td>
                      <td className="py-3.5 px-3 text-[#6B7280]">
                        {tx.items.length} macam produk
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] font-medium text-[#1F2937]">
                          {tx.metodeBayar}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-[#1F2937] whitespace-nowrap">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant="success">Selesai</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReceipt(tx);
                          }}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C9772E] hover:bg-[#FBEBDD] transition-colors"
                          title="Cetak Ulang Struk"
                        >
                          <Receipt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: TRANSAKSI DITAHAN */}
      {activeTab === "ditahan" && (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-base text-[#1F2937]">
              Daftar Transaksi Ditahan (Pending / On Hold)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Transaksi yang sementara ditunda dapat dilanjutkan kembali tanpa kehilangan item keranjang.
            </p>
          </Card>

          {heldList.length === 0 ? (
            <Card className="p-12 text-center text-[#9CA3AF]">
              <Clock size={32} className="mx-auto mb-2 text-[#6B7280]" />
              <p className="text-sm font-semibold text-[#1F2937]">
                Tidak Ada Transaksi yang Ditahan
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                Gunakan tombol &apos;Tahan&apos; pada panel kasir jika pelanggan ingin menambah belanjaan atau menunggu.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heldList.map((held) => (
                <Card key={held.id} className="p-4 space-y-3 border-amber-200 bg-amber-50/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {held.id}
                    </span>
                    <span className="text-xs text-[#6B7280]">{held.heldAt} WIB</span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">
                      {held.customer.nama}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {held.items.length} jenis item ({formatRupiah(held.total)})
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE8E1] text-[11px] space-y-1 max-h-28 overflow-y-auto">
                    {held.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.qty}x {item.product.nama}
                        </span>
                        <span className="font-semibold">
                          {formatRupiah(
                            (item.customPrice !== undefined
                              ? item.customPrice
                              : item.product.hargaJual) * item.qty
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs text-[#E5484D]"
                      onClick={() => handleDeleteHeld(held.id)}
                    >
                      <Trash2 size={13} /> Hapus
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleRestoreHeld(held)}
                    >
                      Lanjutkan di Kasir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          transaction={activeReceipt}
        />
      )}

      {/* Modal Pilih Voucher Promo */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        title="Pilih Voucher Promosi Kasir"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#6B7280]">
            Pilih voucher yang berlaku untuk transaksi ini (Minimal belanja berlaku).
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {initialVouchers
              .filter((v) => v.status === "Aktif")
              .map((voucher) => {
                const isEligible = subtotal >= voucher.minBelanja;
                return (
                  <div
                    key={voucher.kode}
                    onClick={() => {
                      if (!isEligible) {
                        showToast(`Min. belanja ${formatRupiah(voucher.minBelanja)} belum terpenuhi`, "error");
                        return;
                      }
                      setAppliedVoucher(voucher);
                      setIsVoucherModalOpen(false);
                      showToast(`Voucher ${voucher.kode} berhasil diterapkan!`, "success");
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isEligible
                        ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50"
                        : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#C9772E] text-white font-mono text-[10px]">
                          {voucher.kode}
                        </span>
                        <span>{voucher.nama}</span>
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        Min. Belanja: {formatRupiah(voucher.minBelanja)} • Berlaku s/d: {voucher.berlakuSampai}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!isEligible}
                      className="text-xs py-1"
                    >
                      Pakai
                    </Button>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#ECE8E1]">
            <Button variant="outline" onClick={() => setIsVoucherModalOpen(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
