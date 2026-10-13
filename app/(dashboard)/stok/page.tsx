"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  AlertTriangle,
  Clock,
  Archive,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { initialProducts, Product, PAWMART_PRODUCTS_KEY } from "@/data/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { initialStockMutations, StockMutation } from "@/data/stockMutations";
import { formatTanggal, formatRupiah } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";

export default function StokPage() {
  const { showToast } = useToast();
  const { isAdmin, currentUser } = useUserRole();

  const [activeTab, setActiveTab] = useState<"daftar" | "mutasi">("daftar");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [mutations, setMutations] = useState<StockMutation[]>(initialStockMutations);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Aman" | "Menipis" | "Habis">("Semua");

  // Load products from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PAWMART_PRODUCTS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [adjustType, setAdjustType] = useState<"Masuk" | "Keluar" | "Penyesuaian">("Masuk");
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<StockMutation["alasan"]>("Pembelian / Restock");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Stock summary counts
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.stok === 0).length;
  const lowStockCount = products.filter((p) => p.stok > 0 && p.stok <= p.stokMin).length;
  const expiringSoonCount = products.filter(
    (p) => p.tanggalKedaluwarsa && p.tanggalKedaluwarsa.startsWith("2025")
  ).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (filterStatus === "Aman") matchStatus = p.stok > p.stokMin;
      else if (filterStatus === "Menipis") matchStatus = p.stok > 0 && p.stok <= p.stokMin;
      else if (filterStatus === "Habis") matchStatus = p.stok === 0;

      return matchQuery && matchStatus;
    });
  }, [products, searchQuery, filterStatus]);

  // Handle Stock Adjustment Submit
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();

    if (adjustQty <= 0) {
      showToast("Jumlah stok harus lebih besar dari 0!", "error");
      return;
    }

    const currentStock = selectedProduct.stok;
    let newStock = currentStock;

    if (adjustType === "Masuk") {
      newStock = currentStock + adjustQty;
    } else if (adjustType === "Keluar") {
      if (currentStock < adjustQty) {
        showToast("Jumlah keluar melebihi stok yang ada!", "error");
        return;
      }
      newStock = currentStock - adjustQty;
    } else {
      // Penyesuaian opname langsung jadi adjustQty
      newStock = adjustQty;
    }

    // Update Product Stock
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === selectedProduct.id ? { ...p, stok: newStock } : p));
      if (typeof window !== "undefined") {
        localStorage.setItem(PAWMART_PRODUCTS_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    // Add Mutation Log
    const newMutation: StockMutation = {
      id: `MUT-00${mutations.length + 1}`,
      tanggal: new Date().toISOString().replace("T", " ").slice(0, 16),
      produkId: selectedProduct.id,
      produkNama: selectedProduct.nama,
      jenis: adjustType,
      jumlah: adjustType === "Keluar" ? -adjustQty : adjustQty,
      stokSebelum: currentStock,
      stokSesudah: newStock,
      alasan: adjustReason,
      keterangan: adjustNotes || "Penyesuaian manual kasir",
      petugas: "Admin",
    };

    setMutations((prev) => [newMutation, ...prev]);
    setIsAdjustModalOpen(false);
    setAdjustNotes("");
    showToast(`Stok ${selectedProduct.nama} berhasil diperbarui menjadi ${newStock}!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Manajemen Stok & Inventaris
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Pantau ketersediaan barang toko, peringatan batas minimum, dan mutasi barang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button
              variant="primary"
              onClick={() => setIsAdjustModalOpen(true)}
              className="shadow-md shadow-[#C9772E]/20"
            >
              <PlusCircle size={16} /> + Penyesuaian Stok
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-xl font-semibold">
              <span>👩‍💼</span>
              <span>Mode Kasir: Monitoring Stok Saja</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Macam Produk
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#1F2937] flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-[#1F2937]">
              {totalProducts}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Semua SKU aktif</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">
              Stok Menipis
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-[#D97706]">
              {lowStockCount}
            </span>
            <p className="text-[11px] text-[#D97706] font-medium mt-0.5">
              Di bawah stok minimum
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">
              Hampir Kedaluwarsa
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#E5484D] flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-[#E5484D]">
              {expiringSoonCount}
            </span>
            <p className="text-[11px] text-[#E5484D] font-medium mt-0.5">
              Makanan & obat &lt; 90 hari
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">
              Stok Habis
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-[#4B5563] flex items-center justify-center">
              <Archive size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-[#1F2937]">
              {outOfStockCount}
            </span>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Perlu PO restock</p>
          </div>
        </Card>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#ECE8E1] pb-2">
        <button
          onClick={() => setActiveTab("daftar")}
          className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "daftar"
              ? "border-[#C9772E] text-[#C9772E]"
              : "border-transparent text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          Daftar Stok & Peringatan
        </button>
        <button
          onClick={() => setActiveTab("mutasi")}
          className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "mutasi"
              ? "border-[#C9772E] text-[#C9772E]"
              : "border-transparent text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          Riwayat Mutasi Stok ({mutations.length})
        </button>
      </div>

      {/* TAB 1: DAFTAR STOK */}
      {activeTab === "daftar" && (
        <div className="space-y-5">
          {/* Expiry Alert Warning Banner if any */}
          {expiringSoonCount > 0 && (
            <div className="p-4 rounded-2xl bg-[#FEF3C7]/60 border border-amber-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-[#92400E]">
                  Peringatan Kedaluwarsa Produk (Tahun 2025):
                </h4>
                <p className="text-[#B45309] mt-0.5">
                  Terdapat {expiringSoonCount} item pakan &amp; suplemen (Nutri-Plus Gel, Revolution, Drontal) mendekati masa kedaluwarsa. Disarankan retur distributor atau beri diskon promo cuci gudang.
                </p>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SKU atau nama produk stok..."
                className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] text-xs sm:text-sm rounded-xl border border-[#ECE8E1] focus:bg-white focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#6B7280] whitespace-nowrap hidden sm:inline">
                Status:
              </span>
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#ECE8E1] w-full sm:w-auto">
                {(["Semua", "Aman", "Menipis", "Habis"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex-1 sm:flex-initial text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                      filterStatus === s
                        ? "bg-white text-[#C9772E] shadow-xs"
                        : "text-[#6B7280] hover:text-[#1F2937]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                      <th className="py-3 px-4 sm:px-6">Produk</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3 text-center">Stok Saat Ini</th>
                      <th className="py-3 px-3 text-center">Batas Minimum</th>
                      <th className="py-3 px-3">Kedaluwarsa</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8E1]">
                    {filteredProducts.map((p) => {
                      const isOutOfStock = p.stok === 0;
                      const isLowStock = p.stok > 0 && p.stok <= p.stokMin;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-[#FAF8F5]/60 transition-colors"
                        >
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <ProductImage
                                src={p.gambar || p.icon}
                                alt={p.nama}
                                size="sm"
                              />
                              <div>
                                <p className="font-bold text-[#1F2937]">{p.nama}</p>
                                <span className="text-[11px] text-[#9CA3AF] font-mono">
                                  {p.sku}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#6B7280]">
                            {p.kategori}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`text-base font-extrabold ${
                                isOutOfStock
                                  ? "text-[#E5484D]"
                                  : isLowStock
                                  ? "text-[#D97706]"
                                  : "text-[#1F2937]"
                              }`}
                            >
                              {p.stok}
                            </span>{" "}
                            <span className="text-xs text-[#6B7280]">
                              {p.satuan}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center text-[#6B7280]">
                            {p.stokMin} {p.satuan}
                          </td>
                          <td className="py-3.5 px-3">
                            {p.tanggalKedaluwarsa ? (
                              <span
                                className={`text-xs ${
                                  p.tanggalKedaluwarsa.startsWith("2025")
                                    ? "font-bold text-[#E5484D] bg-[#FEE2E2] px-2 py-0.5 rounded-md"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                {formatTanggal(p.tanggalKedaluwarsa)}
                              </span>
                            ) : (
                              <span className="text-[#9CA3AF]">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {isOutOfStock ? (
                              <Badge variant="danger">Habis</Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning">Menipis</Badge>
                            ) : (
                              <Badge variant="success">Aman</Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isAdmin ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs py-1"
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setIsAdjustModalOpen(true);
                                }}
                              >
                                Sesuaikan
                              </Button>
                            ) : (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Cek Stok
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: RIWAYAT MUTASI STOK */}
      {activeTab === "mutasi" && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Log Mutasi & Penyesuaian Stok</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Catatan keluar masuk barang untuk audit dan stok opname berkala.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                    <th className="py-3 px-4 sm:px-6">Waktu Mutasi</th>
                    <th className="py-3 px-3">Produk</th>
                    <th className="py-3 px-3 text-center">Jenis</th>
                    <th className="py-3 px-3 text-center">Perubahan Qty</th>
                    <th className="py-3 px-3 text-center">Sebelum → Sesudah</th>
                    <th className="py-3 px-3">Alasan Mutasi</th>
                    <th className="py-3 px-4">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E1]">
                  {mutations.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 text-[#6B7280] whitespace-nowrap">
                        {m.tanggal} WIB
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#1F2937]">
                        {m.produkNama}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            m.jenis === "Masuk"
                              ? "bg-[#DCFCE7] text-[#16A34A]"
                              : m.jenis === "Keluar"
                              ? "bg-[#FEE2E2] text-[#E5484D]"
                              : "bg-[#FEF3C7] text-[#D97706]"
                          }`}
                        >
                          {m.jenis}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold">
                        <span
                          className={
                            m.jumlah > 0
                              ? "text-[#16A34A]"
                              : m.jumlah < 0
                              ? "text-[#E5484D]"
                              : "text-[#1F2937]"
                          }
                        >
                          {m.jumlah > 0 ? `+${m.jumlah}` : m.jumlah}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#6B7280] font-mono">
                        {m.stokSebelum} → {m.stokSesudah}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-[#1F2937] text-xs">
                          {m.alasan}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          {m.keterangan}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{m.petugas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL PENYESUAIAN STOK */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Penyesuaian Stok Barang"
        description="Catat restock, kerusakan barang, atau audit fisik stok opname"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Pilih Produk
            </label>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setSelectedProduct(found);
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs font-semibold focus:outline-none focus:border-[#C9772E]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} (Stok Saat Ini: {p.stok} {p.satuan})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Masuk", label: "Barang Masuk (+)" },
              { id: "Keluar", label: "Barang Keluar (-)" },
              { id: "Penyesuaian", label: "Koreksi Opname" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAdjustType(t.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  adjustType === t.id
                    ? "bg-[#C9772E] text-white border-[#C9772E]"
                    : "bg-[#FAF8F5] text-[#1F2937] border-[#ECE8E1] hover:bg-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Jumlah ({selectedProduct.satuan})
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjustQty || ""}
                onChange={(e) => setAdjustQty(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-sm font-bold text-[#1F2937] focus:outline-none focus:border-[#C9772E]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Alasan Penyesuaian
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="Pembelian / Restock">Pembelian / Restock</option>
                <option value="Penjualan Kasir">Penjualan Kasir</option>
                <option value="Barang Rusak / Bocor">Barang Rusak / Bocor</option>
                <option value="Stok Opname">Stok Opname Fisik</option>
                <option value="Kedaluwarsa">Kedaluwarsa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Catatan / No. PO / Referensi
            </label>
            <input
              type="text"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              placeholder="Contoh: No. Faktur PO-9921 / Cacat kemasan kaleng"
              className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Mutasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
