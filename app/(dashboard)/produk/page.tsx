"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { initialProducts, categories, Product } from "@/data/products";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useUserRole } from "@/context/UserContext";

export default function ProdukPage() {
  const { showToast } = useToast();
  const { isAdmin, isKasir, currentUser } = useUserRole();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [stockStatusFilter, setStockStatusFilter] = useState<"Semua" | "Tersedia" | "Menipis" | "Habis">("Semua");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formBarcode, setFormBarcode] = useState("");
  const [formCategory, setFormCategory] = useState<Product["kategori"]>("Makanan Kucing");
  const [formHargaBeli, setFormHargaBeli] = useState<number>(0);
  const [formHargaJual, setFormHargaJual] = useState<number>(0);
  const [formStok, setFormStok] = useState<number>(10);
  const [formStokMin, setFormStokMin] = useState<number>(5);
  const [formSatuan, setFormSatuan] = useState("Pcs");
  const [formExpiry, setFormExpiry] = useState("");
  const [formIcon, setFormIcon] = useState("🐱");

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormBarcode(`899100${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory("Makanan Kucing");
    setFormHargaBeli(50000);
    setFormHargaJual(70000);
    setFormStok(15);
    setFormStokMin(5);
    setFormSatuan("Pcs");
    setFormExpiry("2026-12-31");
    setFormIcon("🐱");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.nama);
    setFormSku(prod.sku);
    setFormBarcode(prod.barcode);
    setFormCategory(prod.kategori);
    setFormHargaBeli(prod.hargaBeli);
    setFormHargaJual(prod.hargaJual);
    setFormStok(prod.stok);
    setFormStokMin(prod.stokMin);
    setFormSatuan(prod.satuan);
    setFormExpiry(prod.tanggalKedaluwarsa || "");
    setFormIcon(prod.icon);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Nama produk wajib diisi!", "error");
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                nama: formName,
                sku: formSku,
                barcode: formBarcode,
                kategori: formCategory,
                hargaBeli: formHargaBeli,
                hargaJual: formHargaJual,
                stok: formStok,
                stokMin: formStokMin,
                satuan: formSatuan,
                tanggalKedaluwarsa: formExpiry || undefined,
                icon: formIcon,
              }
            : p
        )
      );
      showToast(`Produk '${formName}' berhasil diperbarui!`);
    } else {
      const newProduct: Product = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        nama: formName,
        sku: formSku,
        barcode: formBarcode,
        kategori: formCategory,
        hargaBeli: formHargaBeli,
        hargaJual: formHargaJual,
        stok: formStok,
        stokMin: formStokMin,
        satuan: formSatuan,
        tanggalKedaluwarsa: formExpiry || undefined,
        icon: formIcon,
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Produk '${formName}' berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Produk "${name}" telah dihapus.`, "info");
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "Semua" || p.kategori === selectedCategory;
      const matchQuery =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStock = true;
      if (stockStatusFilter === "Tersedia") matchStock = p.stok > p.stokMin;
      else if (stockStatusFilter === "Menipis")
        matchStock = p.stok > 0 && p.stok <= p.stokMin;
      else if (stockStatusFilter === "Habis") matchStock = p.stok === 0;

      return matchCat && matchQuery && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Katalog Produk & Harga
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Kelola master data produk, SKU, barcode, harga jual, dan stok toko.
          </p>
        </div>

        {isAdmin ? (
          <Button
            variant="primary"
            onClick={openAddModal}
            className="shadow-md shadow-[#C9772E]/20"
          >
            <Plus size={16} /> + Tambah Produk
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-xl font-semibold">
            <span>👩‍💼</span>
            <span>Mode Kasir: Cek Katalog & Harga Jual</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama produk, SKU, atau barcode..."
              className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] text-xs sm:text-sm text-[#1F2937] placeholder-[#9CA3AF] rounded-xl border border-[#ECE8E1] focus:bg-white focus:outline-none focus:border-[#C9772E] focus:ring-2 focus:ring-[#C9772E]/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5F1] text-xs sm:text-sm font-medium text-[#1F2937] rounded-xl border border-[#ECE8E1] focus:outline-none focus:border-[#C9772E]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "Semua" ? "Semua Kategori" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F7F5F1] text-xs sm:text-sm font-medium text-[#1F2937] rounded-xl border border-[#ECE8E1] focus:outline-none focus:border-[#C9772E]"
            >
              <option value="Semua">Semua Status Stok</option>
              <option value="Tersedia">Stok Aman</option>
              <option value="Menipis">Stok Menipis (≤ Min)</option>
              <option value="Habis">Stok Habis (0)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1 border-t border-[#ECE8E1]">
          <span>
            Menampilkan{" "}
            <strong className="text-[#1F2937]">{filteredProducts.length}</strong>{" "}
            dari {products.length} produk
          </span>
          <span className="hidden sm:inline">
            Status diperbarui secara real-time
          </span>
        </div>
      </Card>

      {/* DESKTOP TABLE VIEW (≥ 640px) */}
      <div className="hidden sm:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-y border-[#ECE8E1] text-[#6B7280] font-semibold text-[11px] sm:text-xs">
                    <th className="py-3 px-4 sm:px-6">Produk</th>
                    <th className="py-3 px-3">Kategori</th>
                    {isAdmin && <th className="py-3 px-3 text-right">Harga Beli</th>}
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-center">Stok</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E1]">
                  {filteredProducts.map((prod) => {
                    const isOutOfStock = prod.stok <= 0;
                    const isLowStock = prod.stok > 0 && prod.stok <= prod.stokMin;

                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-[#FAF8F5]/60 transition-colors group"
                      >
                        {/* Name & Emoji & SKU */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                              {prod.icon}
                            </div>
                            <div>
                              <p className="font-bold text-[#1F2937] group-hover:text-[#C9772E] transition-colors">
                                {prod.nama}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                                <span>{prod.sku}</span>
                                <span>•</span>
                                <span>{prod.satuan}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-[11px] font-medium text-[#4B5563]">
                            {prod.kategori}
                          </span>
                        </td>

                        {/* Buy Price (Admin Only) */}
                        {isAdmin && (
                          <td className="py-3.5 px-3 text-right text-[#6B7280]">
                            {formatRupiah(prod.hargaBeli)}
                          </td>
                        )}

                        {/* Sell Price */}
                        <td className="py-3.5 px-3 text-right font-bold text-[#1F2937]">
                          {formatRupiah(prod.hargaJual)}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-[#1F2937]">
                            {prod.stok}
                          </span>
                          <span className="text-[11px] text-[#6B7280] ml-1">
                            {prod.satuan}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 text-center">
                          {isOutOfStock ? (
                            <Badge variant="danger">Habis</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Menipis</Badge>
                          ) : (
                            <Badge variant="success">Tersedia</Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C9772E] hover:bg-[#FBEBDD] transition-colors"
                                title="Ubah Produk"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.nama)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#E5484D] hover:bg-[#FEE2E2] transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              Lihat Saja
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

      {/* MOBILE STACKED CARDS VIEW (< 640px) */}
      <div className="sm:hidden space-y-3">
        {filteredProducts.map((prod) => {
          const isOutOfStock = prod.stok <= 0;
          const isLowStock = prod.stok > 0 && prod.stok <= prod.stokMin;

          return (
            <Card key={prod.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-center text-2xl shrink-0">
                    {prod.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2937]">
                      {prod.nama}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] font-mono">
                      {prod.sku} • {prod.kategori}
                    </p>
                  </div>
                </div>

                {isOutOfStock ? (
                  <Badge variant="danger">Habis</Badge>
                ) : isLowStock ? (
                  <Badge variant="warning">Menipis</Badge>
                ) : (
                  <Badge variant="success">Tersedia</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E1]">
                <div>
                  <span className="text-[#6B7280] block text-[10px]">
                    Harga Jual:
                  </span>
                  <span className="font-bold text-[#C9772E] text-sm">
                    {formatRupiah(prod.hargaJual)}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10px]">
                    Stok Tersedia:
                  </span>
                  <span className="font-bold text-[#1F2937] text-sm">
                    {prod.stok} {prod.satuan}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => openEditModal(prod)}
                  >
                    <Edit2 size={13} /> Ubah
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-[#E5484D] hover:bg-rose-50"
                    onClick={() => handleDeleteProduct(prod.id, prod.nama)}
                  >
                    <Trash2 size={13} /> Hapus
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Ubah Data Produk" : "Tambah Produk Baru"}
        description="Lengkapi detail produk toko PawMart"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Royal Canin Adult Cat 1kg"
              className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                SKU Produk
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Barcode
              </label>
              <input
                type="text"
                value={formBarcode}
                onChange={(e) => setFormBarcode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                {categories
                  .filter((c) => c !== "Semua")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Satuan
              </label>
              <select
                value={formSatuan}
                onChange={(e) => setFormSatuan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="Pcs">Pcs</option>
                <option value="Sak">Sak</option>
                <option value="Pack">Pack</option>
                <option value="Botol">Botol</option>
                <option value="Unit">Unit</option>
                <option value="Tube">Tube</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Emoji Ikon
              </label>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              >
                <option value="🐱">🐱 Kucing</option>
                <option value="🐶">🐶 Anjing</option>
                <option value="🐟">🐟 Ikan</option>
                <option value="🥣">🥣 Mangkuk</option>
                <option value="🎾">🎾 Mainan</option>
                <option value="🍏">🍏 Apel Pasir</option>
                <option value="☕">☕ Kopi Pasir</option>
                <option value="💊">💊 Vitamin</option>
                <option value="🏠">🏠 Kandang</option>
                <option value="🧴">🧴 Shampo</option>
                <option value="✨">✨ Suplemen</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Harga Beli (Rp)
              </label>
              <input
                type="number"
                value={formHargaBeli || ""}
                onChange={(e) => setFormHargaBeli(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                required
                value={formHargaJual || ""}
                onChange={(e) => setFormHargaJual(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm font-bold text-[#C9772E] focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Jumlah Stok
              </label>
              <input
                type="number"
                value={formStok || ""}
                onChange={(e) => setFormStok(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Stok Minimum (Alert)
              </label>
              <input
                type="number"
                value={formStokMin || ""}
                onChange={(e) => setFormStokMin(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#C9772E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-1">
                Tanggal Kedaluwarsa
              </label>
              <input
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECE8E1] bg-white text-xs focus:outline-none focus:border-[#C9772E]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#ECE8E1]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Produk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
