export interface Product {
  id: string;
  nama: string;
  sku: string;
  barcode: string;
  kategori: "Makanan Kucing" | "Makanan Anjing" | "Aksesoris" | "Pasir" | "Obat & Vitamin" | "Kandang";
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMin: number;
  satuan: string;
  gambar?: string;
  icon?: string;
  tanggalKedaluwarsa?: string;
  deskripsi?: string;
}

export const categories = [
  "Semua",
  "Makanan Kucing",
  "Makanan Anjing",
  "Aksesoris",
  "Pasir",
  "Obat & Vitamin",
  "Kandang",
] as const;

export const PAWMART_PRODUCTS_KEY = "pawmart_products_v2";

export const initialProducts: Product[] = [
  // 1. Makanan Kucing (2 Produk)
  {
    id: "PROD-001",
    nama: "Royal Canin Adult Cat 1kg",
    sku: "RC-CAT-01",
    barcode: "8991001001",
    kategori: "Makanan Kucing",
    hargaBeli: 115000,
    hargaJual: 145000,
    stok: 18,
    stokMin: 5,
    satuan: "Pcs",
    gambar: "/images/products/royal-canin-cat.svg",
    icon: "/images/products/royal-canin-cat.svg",
    tanggalKedaluwarsa: "2026-08-15",
    deskripsi: "Makanan kucing dewasa untuk kesehatan pencernaan dan bulu berkilau.",
  },
  {
    id: "PROD-002",
    nama: "Whiskas Tuna Adult 1kg",
    sku: "WH-TUNA-01",
    barcode: "8991001002",
    kategori: "Makanan Kucing",
    hargaBeli: 48000,
    hargaJual: 65000,
    stok: 34,
    stokMin: 10,
    satuan: "Pcs",
    gambar: "/images/products/whiskas-tuna.svg",
    icon: "/images/products/whiskas-tuna.svg",
    tanggalKedaluwarsa: "2026-11-20",
    deskripsi: "Rasa tuna lezat kaya omega 3 & 6 untuk keaktifan kucing.",
  },

  // 2. Makanan Anjing (2 Produk)
  {
    id: "PROD-003",
    nama: "Pedigree Adult Beef & Veg 1kg",
    sku: "PD-BEEF-01",
    barcode: "8991001003",
    kategori: "Makanan Anjing",
    hargaBeli: 55000,
    hargaJual: 75000,
    stok: 14,
    stokMin: 5,
    satuan: "Pcs",
    gambar: "/images/products/pedigree-beef.svg",
    icon: "/images/products/pedigree-beef.svg",
    tanggalKedaluwarsa: "2026-09-10",
    deskripsi: "Makanan anjing formula nutrisi seimbang dengan daging sapi asli.",
  },
  {
    id: "PROD-004",
    nama: "Pro Plan Puppy Chicken Rice 2.5kg",
    sku: "PP-PUPPY-01",
    barcode: "8991001004",
    kategori: "Makanan Anjing",
    hargaBeli: 210000,
    hargaJual: 265000,
    stok: 8,
    stokMin: 3,
    satuan: "Pcs",
    gambar: "/images/products/proplan-puppy.svg",
    icon: "/images/products/proplan-puppy.svg",
    tanggalKedaluwarsa: "2026-05-30",
    deskripsi: "Formula nutrisi tinggi dengan colostrum untuk daya tahan anak anjing.",
  },

  // 3. Aksesoris (2 Produk)
  {
    id: "PROD-005",
    nama: "Tempat Makan Stainless Anti-Semut",
    sku: "ACC-BOWL-01",
    barcode: "8991001005",
    kategori: "Aksesoris",
    hargaBeli: 28000,
    hargaJual: 45000,
    stok: 22,
    stokMin: 5,
    satuan: "Pcs",
    gambar: "/images/products/bowl-stainless.svg",
    icon: "/images/products/bowl-stainless.svg",
    deskripsi: "Mangkuk makan stainless tebal dengan karet anti-selip dan parit anti-semut.",
  },
  {
    id: "PROD-006",
    nama: "Mainan Kucing Laser & Bulu Interaktif",
    sku: "ACC-TOY-01",
    barcode: "8991001006",
    kategori: "Aksesoris",
    hargaBeli: 20000,
    hargaJual: 35000,
    stok: 29,
    stokMin: 8,
    satuan: "Pcs",
    gambar: "/images/products/toy-laser.svg",
    icon: "/images/products/toy-laser.svg",
    deskripsi: "Mainan stik bulu dengan gantungan lonceng dan pointer laser mini.",
  },

  // 4. Pasir (2 Produk)
  {
    id: "PROD-007",
    nama: "Pasir Kucing Bento Gumpal Apel 10L",
    sku: "LIT-BEN-01",
    barcode: "8991001007",
    kategori: "Pasir",
    hargaBeli: 42000,
    hargaJual: 60000,
    stok: 12,
    stokMin: 5,
    satuan: "Sak",
    gambar: "/images/products/pasir-bentonite.svg",
    icon: "/images/products/pasir-bentonite.svg",
    deskripsi: "Pasir gumpal wangi apel segar, bebas debu 99%, daya serap tinggi.",
  },
  {
    id: "PROD-008",
    nama: "Pasir Tofu Soya Kopi 7L",
    sku: "LIT-TOFU-01",
    barcode: "8991001008",
    kategori: "Pasir",
    hargaBeli: 52000,
    hargaJual: 75000,
    stok: 15,
    stokMin: 6,
    satuan: "Sak",
    gambar: "/images/products/pasir-tofu.svg",
    icon: "/images/products/pasir-tofu.svg",
    deskripsi: "Pasir ramah lingkungan dari ampas tahu, wangi kopi, flushable ke toilet.",
  },

  // 5. Obat & Vitamin (2 Produk)
  {
    id: "PROD-009",
    nama: "Nutri-Plus Gel Virbac 120g",
    sku: "MED-NUTRI-01",
    barcode: "8991001009",
    kategori: "Obat & Vitamin",
    hargaBeli: 110000,
    hargaJual: 140000,
    stok: 7,
    stokMin: 3,
    satuan: "Tube",
    gambar: "/images/products/nutri-gel.svg",
    icon: "/images/products/nutri-gel.svg",
    tanggalKedaluwarsa: "2026-11-28",
    deskripsi: "Suplemen energi tinggi kaya vitamin & mineral pemulihan pasca sakit.",
  },
  {
    id: "PROD-010",
    nama: "Minyak Ikan Salmon Omega 3 (100 Kapsul)",
    sku: "MED-FISH-01",
    barcode: "8991001010",
    kategori: "Obat & Vitamin",
    hargaBeli: 35000,
    hargaJual: 55000,
    stok: 25,
    stokMin: 8,
    satuan: "Botol",
    gambar: "/images/products/fish-oil.svg",
    icon: "/images/products/fish-oil.svg",
    tanggalKedaluwarsa: "2026-10-18",
    deskripsi: "Menutrisi akar bulu, kurangi kerontokan dan tingkatkan imunitas.",
  },

  // 6. Kandang (2 Produk)
  {
    id: "PROD-011",
    nama: "Kandang Kucing Besi Lipat 60x42x50cm",
    sku: "KDG-LIPAT-60",
    barcode: "8991001011",
    kategori: "Kandang",
    hargaBeli: 160000,
    hargaJual: 220000,
    stok: 6,
    stokMin: 2,
    satuan: "Unit",
    gambar: "/images/products/cage-iron.svg",
    icon: "/images/products/cage-iron.svg",
    deskripsi: "Kandang lipat coating anti karat dengan tatakan plastik kuat.",
  },
  {
    id: "PROD-012",
    nama: "Pet Cargo Travel Box Ukuran M",
    sku: "ACC-CRG-01",
    barcode: "8991001012",
    kategori: "Kandang",
    hargaBeli: 110000,
    hargaJual: 165000,
    stok: 7,
    stokMin: 3,
    satuan: "Unit",
    gambar: "/images/products/pet-cargo.svg",
    icon: "/images/products/pet-cargo.svg",
    deskripsi: "Keranjang bawa anabul standar penerbangan dan perjalanan darat.",
  },
];
