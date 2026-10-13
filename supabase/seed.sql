-- ==============================================================================
-- supabase/seed.sql
-- PawMart POS - Data Awal (Seed Data) Konsisten dengan /data Dummy
-- ==============================================================================

-- 1. PENGATURAN TOKO (SINGLETON STORE SETTINGS)
INSERT INTO public.store_settings (
    is_singleton,
    store_name,
    slogan,
    address,
    phone,
    email,
    website,
    tax_percentage,
    is_tax_enabled,
    service_fee,
    is_service_fee_enabled,
    receipt_paper_size,
    receipt_footer,
    points_per_amount,
    point_value
) VALUES (
    true,
    'PawMart Pet Care & Shop',
    'Pusat Kebutuhan Anabul Terlengkap & Terpercaya',
    'Jl. Kemang Raya No. 42A, Mampang Prapatan, Jakarta Selatan 12730',
    '021-7890123 / 0812-9988-7766',
    'support@pawmart.id',
    'www.pawmart.id',
    11.00,
    false,
    0.00,
    false,
    '80mm',
    'Terima kasih telah berbelanja di PawMart! Barang yang sudah dibeli dapat ditukar maksimal 2 hari dengan membawa struk ini.',
    10000.00,
    100.00
) ON CONFLICT (is_singleton) DO NOTHING;

-- 2. KATEGORI PRODUK (6 KATEGORI UTAMA)
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
('11111111-1111-1111-1111-111111111101', 'Makanan Kucing', 'makanan-kucing', 'Pakan kering dan basah nutrisi khusus anabul kucing', 1),
('11111111-1111-1111-1111-111111111102', 'Makanan Anjing', 'makanan-anjing', 'Pakan nutrisi lengkap seimbang anjing dewasa & anak', 2),
('11111111-1111-1111-1111-111111111103', 'Aksesoris', 'aksesoris', 'Tempat makan, mainan, tali penuntun, dan sisir perawatan', 3),
('11111111-1111-1111-1111-111111111104', 'Pasir', 'pasir', 'Pasir gumpal bentonite dan pasir organik tofu ramah lingkungan', 4),
('11111111-1111-1111-1111-111111111105', 'Obat & Vitamin', 'obat-vitamin', 'Suplemen imun, minyak ikan omega, obat kutu, dan obat cacing', 5),
('11111111-1111-1111-1111-111111111106', 'Kandang', 'kandang', 'Kandang lipat besi anti karat, pet cargo penerbangan, dan aksesoris rumah anabul', 6)
ON CONFLICT (name) DO NOTHING;

-- 3. PRODUK RITEL (MINIMAL 20 PRODUK LENGKAP DENGAN BARCODE UNIK)
INSERT INTO public.products (
    id, category_id, name, sku, barcode, buy_price, sell_price, stock, min_stock, unit, image_url, expiry_date, description, is_active
) VALUES
-- Makanan Kucing (Kategori 1)
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Royal Canin Adult Cat 1kg', 'RC-CAT-01', '8991001001', 115000.00, 145000.00, 18, 5, 'Pcs', '/images/products/royal-canin-cat.svg', '2026-08-15', 'Makanan kucing dewasa untuk kesehatan pencernaan dan bulu berkilau.', true),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Whiskas Tuna Adult 1kg', 'WH-TUNA-01', '8991001002', 48000.00, 65000.00, 34, 10, 'Pcs', '/images/products/whiskas-tuna.svg', '2026-11-20', 'Rasa tuna lezat kaya omega 3 & 6 untuk keaktifan kucing.', true),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'Royal Canin Kitten 400g', 'RC-KIT-400', '8991001003', 58000.00, 75000.00, 16, 5, 'Pcs', '/images/products/royal-canin-cat.svg', '2026-07-25', 'Nutrisi spesifik untuk anak kucing usia 4 hingga 12 bulan.', true),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', 'Me-O Creamy Treats Salmon (4x15g)', 'MEO-CRM-01', '8991001004', 16000.00, 24000.00, 50, 15, 'Pack', '/images/products/whiskas-tuna.svg', '2026-12-31', 'Camilan basah lezat tekstur lembut kesukaan anabul.', true),

-- Makanan Anjing (Kategori 2)
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'Pedigree Adult Beef & Veg 1kg', 'PD-BEEF-01', '8991001005', 55000.00, 75000.00, 14, 5, 'Pcs', '/images/products/pedigree-beef.svg', '2026-09-10', 'Makanan anjing formula nutrisi seimbang dengan daging sapi asli.', true),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 'Pro Plan Puppy Chicken Rice 2.5kg', 'PP-PUPPY-01', '8991001006', 210000.00, 265000.00, 8, 3, 'Pcs', '/images/products/proplan-puppy.svg', '2026-05-30', 'Formula nutrisi tinggi dengan colostrum untuk daya tahan anak anjing.', true),
('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111102', 'JerHigh Chicken Jerky Treats 70g', 'JH-CHICK-01', '8991001007', 22000.00, 32000.00, 30, 8, 'Pack', '/images/products/pedigree-beef.svg', '2026-10-15', 'Snack daging ayam asli panggang renyah untuk anjing.', true),

-- Aksesoris (Kategori 3)
('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111103', 'Tempat Makan Stainless Anti-Semut', 'ACC-BOWL-01', '8991001008', 28000.00, 45000.00, 22, 5, 'Pcs', '/images/products/bowl-stainless.svg', NULL, 'Mangkuk makan stainless tebal dengan karet anti-selip dan parit anti-semut.', true),
('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111103', 'Mainan Kucing Laser & Bulu Interaktif', 'ACC-TOY-01', '8991001009', 20000.00, 35000.00, 29, 8, 'Pcs', '/images/products/toy-laser.svg', NULL, 'Mainan stik bulu dengan gantungan lonceng dan pointer laser mini.', true),
('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111103', 'Sisir Kucing Self-Cleaning Slicker', 'ACC-BRUSH-01', '8991001010', 25000.00, 42000.00, 19, 5, 'Pcs', '/images/products/bowl-stainless.svg', NULL, 'Mencabut bulu mati dengan satu tombol dorong pembersih instan.', true),
('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111103', 'Kalung Kucing Lonceng Motif Paw', 'ACC-KLL-01', '8991001011', 8000.00, 18000.00, 40, 10, 'Pcs', '/images/products/toy-laser.svg', NULL, 'Bahan nilon lembut dengan gesper pengaman pelepas otomatis.', true),

-- Pasir (Kategori 4)
('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111104', 'Pasir Kucing Bento Gumpal Apel 10L', 'LIT-BEN-01', '8991001012', 42000.00, 60000.00, 12, 5, 'Sak', '/images/products/pasir-bentonite.svg', NULL, 'Pasir gumpal wangi apel segar, bebas debu 99%, daya serap tinggi.', true),
('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111104', 'Pasir Tofu Soya Kopi 7L', 'LIT-TOFU-01', '8991001013', 52000.00, 75000.00, 15, 6, 'Sak', '/images/products/pasir-tofu.svg', NULL, 'Pasir ramah lingkungan dari ampas tahu, wangi kopi, flushable ke toilet.', true),
('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111104', 'Pasir Gumpal Wangi Lemon Markotops 25L', 'LIT-MAR-25', '8991001014', 95000.00, 130000.00, 15, 5, 'Sak', '/images/products/pasir-bentonite.svg', NULL, 'Kemasan hemat isi 25 Liter aroma lemon tahan bau hingga 30 hari.', true),

-- Obat & Vitamin (Kategori 5)
('22222222-2222-2222-2222-222222222215', '11111111-1111-1111-1111-111111111105', 'Nutri-Plus Gel Virbac 120g', 'MED-NUTRI-01', '8991001015', 110000.00, 140000.00, 7, 3, 'Tube', '/images/products/nutri-gel.svg', '2026-11-28', 'Suplemen energi tinggi kaya vitamin & mineral pemulihan pasca sakit.', true),
('22222222-2222-2222-2222-222222222216', '11111111-1111-1111-1111-111111111105', 'Minyak Ikan Salmon Omega 3 (100 Kapsul)', 'MED-FISH-01', '8991001016', 35000.00, 55000.00, 25, 8, 'Botol', '/images/products/fish-oil.svg', '2026-10-18', 'Menutrisi akar bulu, kurangi kerontokan dan tingkatkan imunitas.', true),
('22222222-2222-2222-2222-222222222217', '11111111-1111-1111-1111-111111111105', 'Obat Tetes Kutu Revolution Cat', 'MED-REV-01', '8991001017', 95000.00, 125000.00, 5, 6, 'Pcs', '/images/products/nutri-gel.svg', '2026-12-15', 'Mencegah kutu, tungau telinga, dan cacing hati pada kucing.', true),
('22222222-2222-2222-2222-222222222218', '11111111-1111-1111-1111-111111111105', 'Drontal Plus Obat Cacing Anjing', 'MED-DRON-01', '8991001018', 28000.00, 42000.00, 5, 5, 'Tablet', '/images/products/fish-oil.svg', '2026-10-30', 'Membasmi seluruh jenis cacing pencernaan pada anjing dewasa dan anak.', true),

-- Kandang & Pet Travel (Kategori 6)
('22222222-2222-2222-2222-222222222219', '11111111-1111-1111-1111-111111111106', 'Kandang Kucing Besi Lipat 60x42x50cm', 'KDG-LIPAT-60', '8991001019', 160000.00, 220000.00, 6, 2, 'Unit', '/images/products/cage-iron.svg', NULL, 'Kandang lipat coating anti karat dengan tatakan plastik kuat.', true),
('22222222-2222-2222-2222-222222222220', '11111111-1111-1111-1111-111111111106', 'Pet Cargo Travel Box Ukuran M', 'ACC-CRG-01', '8991001020', 110000.00, 165000.00, 7, 3, 'Unit', '/images/products/pet-cargo.svg', NULL, 'Keranjang bawa anabul standar penerbangan dan perjalanan darat.', true)
ON CONFLICT (sku) DO NOTHING;

-- 4. PELANGGAN CRM (10 PELANGGAN)
INSERT INTO public.customers (
    id, customer_code, name, phone, email, address, tier, points, total_spent, last_visit_at
) VALUES
('33333333-3333-3333-3333-333333333301', 'CUST-001', 'Pelanggan Umum', '-', '-', 'Kasir Langsung', 'bronze', 0, 12500000.00, '2025-10-18 16:45:00+07'),
('33333333-3333-3333-3333-333333333302', 'CUST-002', 'Rina Sari', '0812-3456-7890', 'rina.sari@gmail.com', 'Jl. Kemang Raya No. 42, Jakarta Selatan', 'silver', 485, 4850000.00, '2025-10-18 14:15:00+07'),
('33333333-3333-3333-3333-333333333303', 'CUST-003', 'Andri Pratama', '0813-8899-1122', 'andri.pratama@yahoo.com', 'Jl. Bangka VII No. 15, Mampang Prapatan', 'silver', 320, 3200000.00, '2025-10-17 11:00:00+07'),
('33333333-3333-3333-3333-333333333304', 'CUST-004', 'Siti Nurhaliza', '0817-5544-3322', 'siti.nurhaliza@gmail.com', 'Jl. Antasari Permai Blok C3, Jakarta Selatan', 'silver', 295, 2950000.00, '2025-10-17 16:20:00+07'),
('33333333-3333-3333-3333-333333333305', 'CUST-005', 'Budi Santoso', '0819-0123-4567', 'budi.santoso@outlook.com', 'Jl. Ampera Raya No. 8, Cilandak', 'gold', 540, 5400000.00, '2025-10-16 10:30:00+07'),
('33333333-3333-3333-3333-333333333306', 'CUST-006', 'Dewi Lestari', '0815-7766-5544', 'dewi.lestari@gmail.com', 'Jl. Fatmawati No. 90, Jakarta Selatan', 'silver', 185, 1850000.00, '2025-10-15 13:10:00+07'),
('33333333-3333-3333-3333-333333333307', 'CUST-007', 'Hendra Wijaya', '0821-4433-2211', 'hendra.w@wjayagroup.id', 'Apartemen Kemang Village Tower Infinity 12A', 'platinum', 760, 7600000.00, '2025-10-15 15:45:00+07'),
('33333333-3333-3333-3333-333333333308', 'CUST-008', 'Maya Angelia', '0812-9988-7766', 'maya.angelia@gmail.com', 'Jl. Cipete Raya No. 18, Kebayoran Baru', 'silver', 215, 2150000.00, '2025-10-14 09:40:00+07'),
('33333333-3333-3333-3333-333333333309', 'CUST-009', 'Fajar Nugraha', '0878-1122-3344', 'fajar.nugraha@techcorp.co.id', 'Jl. Benda No. 33, Cilandak Timur', 'bronze', 142, 1420000.00, '2025-10-13 11:20:00+07'),
('33333333-3333-3333-3333-333333333310', 'CUST-010', 'Natasha Clarissa', '0811-2233-4455', 'natasha.c@gmail.com', 'Jl. Bangka Barat No. 5B, Kemang', 'gold', 630, 6300000.00, '2025-10-12 14:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- 5. HEWAN PELIHARAAN (PETS - 12 ANABUL)
INSERT INTO public.pets (
    id, customer_id, name, species, breed, birth_date, gender, weight_kg, size, special_notes
) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333302', 'Mochi', 'kucing', 'British Shorthair', '2024-05-10', 'jantan', 4.20, 'kecil', 'Alergi pakan berbahan dasar jagung'),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', 'Oreo', 'kucing', 'Domestik Mix', '2025-06-15', 'jantan', 3.50, 'kecil', 'Sangat aktif dan gemar bermain bola bulu'),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333303', 'Bruno', 'anjing', 'Golden Retriever', '2023-04-05', 'jantan', 28.50, 'besar', 'Rutin grooming 2 minggu sekali, ramah dengan anak'),
('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333304', 'Luna', 'kucing', 'Persia Medium', '2025-01-18', 'betina', 3.80, 'kecil', 'Perlu sisir bulu harian untuk cegah hairball'),
('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333305', 'Milo', 'anjing', 'Pomeranian', '2022-02-14', 'jantan', 3.10, 'kecil', 'Gigi sensitif, lebih cocok pakan soft kibble'),
('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333305', 'Koko', 'kelinci', 'Netherland Dwarf', '2025-12-01', 'jantan', 1.00, 'kecil', 'Pemberian rumput timothy hay tanpa batas'),
('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333306', 'Simba', 'kucing', 'Maine Coon Mix', '2026-02-15', 'jantan', 4.80, 'sedang', 'Nafsu makan sangat tinggi, masa pertumbuhan pesat'),
('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333307', 'Thor', 'anjing', 'Siberian Husky', '2024-03-20', 'jantan', 24.00, 'besar', 'Ruangan harus berpendingin AC'),
('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333308', 'Chiki', 'kucing', 'Scottish Fold', '2025-07-10', 'betina', 3.20, 'kecil', 'Telinga lipat memerlukan pembersihan rutin dari tungau'),
('44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333309', 'Cookie', 'hamster', 'Roborovski', '2026-04-12', 'betina', 0.05, 'kecil', 'Suka camilan biji bunga matahari'),
('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333310', 'Bella', 'anjing', 'Toy Poodle', '2023-02-11', 'betina', 3.80, 'kecil', 'Grooming model teddy bear setiap 3 minggu'),
('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333310', 'Bowie', 'kucing', 'Ragdoll', '2025-05-05', 'jantan', 4.50, 'sedang', 'Mata biru sensitif sinar matahari langsung')
ON CONFLICT (id) DO NOTHING;

-- 6. JADWAL VAKSINASI ANABUL
INSERT INTO public.pet_vaccinations (
    pet_id, vaccine_name, given_at, next_due_at, veterinarian_name, notes
) VALUES
('44444444-4444-4444-4444-444444444401', 'Tricat Feline', '2025-05-12', '2026-11-15', 'drh. Maya Putri', 'Kondisi sehat saat vaksinasi, tidak ada reaksi demam'),
('44444444-4444-4444-4444-444444444402', 'Rabies Booster', '2025-06-10', '2026-12-20', 'drh. Maya Putri', 'Penyuntikan tahunan rabies'),
('44444444-4444-4444-4444-444444444403', 'DHPPiL Canine', '2025-04-05', '2026-11-05', 'drh. Maya Putri', 'Vaksin lengkap 5 komponen anjing'),
('44444444-4444-4444-4444-444444444404', 'Tricat Booster', '2025-01-18', '2026-12-10', 'drh. Maya Putri', 'Tetracat tahunan anabul'),
('44444444-4444-4444-4444-444444444408', 'Eurican 7', '2025-03-20', '2026-12-25', 'drh. Maya Putri', 'Vaksinasi berkala anjing ras besar');

-- 7. VOUCHER BELANJA LOYALITAS
INSERT INTO public.vouchers (
    code, name, type, value, min_spend, quota, used_count, valid_until, is_active, description
) VALUES
('WELCOME10', 'Voucher Selamat Datang Member Baru', 'nominal', 10000.00, 50000.00, 500, 32, '2027-12-31', true, 'Potongan Rp 10.000 untuk transaksi pertama member baru'),
('GROOMING15', 'Diskon Spesial Grooming Sehat', 'persen', 15.00, 100000.00, 200, 45, '2027-06-30', true, 'Diskon 15% untuk paket spa mandi medicated'),
('PAWHEMAT25', 'Voucher Gajian Akhir Pekan', 'nominal', 25000.00, 150000.00, 100, 18, '2027-08-31', true, 'Potongan Rp 25.000 untuk belanja pakan dan perlengkapan')
ON CONFLICT (code) DO NOTHING;

-- 8. KATALOG LAYANAN JASA (GROOMING, SPA, VAKSINASI)
INSERT INTO public.services (
    id, name, category, duration_minutes, price_small, price_medium, price_large, description, package_items, is_active
) VALUES
('55555555-5555-5555-5555-555555555501', 'Mandi Biasa (Basic Bath)', 'Grooming', 45, 50000.00, 70000.00, 100000.00, 'Mandi bersih dengan shampoo herbal, pengeringan blower lembut, dan sisir bulu.', NULL, true),
('55555555-5555-5555-5555-555555555502', 'Mandi Anti Kutu & Jamur (Medicated)', 'Grooming', 60, 80000.00, 100000.00, 140000.00, 'Terapi mandi dengan shampoo sulfur anti-parasit dan anti-fungal untuk kulit sensitif.', NULL, true),
('55555555-5555-5555-5555-555555555503', 'Potong Rambut & Styling (Haircut)', 'Grooming', 90, 90000.00, 120000.00, 170000.00, 'Cukur rapi higienis atau potongan model lucu (Teddy Bear, Lion Cut, Summer Cut).', NULL, true),
('55555555-5555-5555-5555-555555555504', 'Potong Kuku & Bersih Telinga', 'Grooming', 20, 30000.00, 40000.00, 50000.00, 'Perapian kuku anabul agar tidak tajam dan pembersihan ear canal dari ear mite.', NULL, true),
('55555555-5555-5555-5555-555555555505', 'Paket Grooming Lengkap (Full Spa)', 'Paket', 120, 150000.00, 200000.00, 280000.00, 'Paket hemat lengkap: Mandi medicated + potong rambut styling + potong kuku + bersih telinga + semprot parfum.', ARRAY['Mandi Anti Kutu & Jamur', 'Potong Rambut & Styling', 'Potong Kuku & Bersih Telinga', 'Parfum & Vitamin Bulu'], true),
('55555555-5555-5555-5555-555555555506', 'Vaksinasi Anabul', 'Kesehatan', 30, 120000.00, 150000.00, 180000.00, 'Penyuntikan vaksin dasar (Tricat/Tetracat/Eurican/Rabies) oleh dokter hewan bersertifikat.', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- 9. ADD-ON LAYANAN
INSERT INTO public.service_addons (id, name, price, is_active) VALUES
('66666666-6666-6666-6666-666666666601', 'Bulu Kusut / Detangling', 25000.00, true),
('66666666-6666-6666-6666-666666666602', 'Parfum Khusus Aroma Strawberry / Vanilla', 15000.00, true),
('66666666-6666-6666-6666-666666666603', 'Obat Kutu Tetes Spot-On', 45000.00, true),
('66666666-6666-6666-6666-666666666604', 'Sikat Gigi & Bersih Karang Gigi Ringan', 30000.00, true)
ON CONFLICT (id) DO NOTHING;

-- 10. KAMAR PET HOTEL (CAGES)
INSERT INTO public.cages (code, name, type, rate_per_night, status, description) VALUES
('S-01', 'Kandang Standar 1', 'standar', 60000.00, 'tersedia', 'Kandang besi luas 70x60cm, matras empuk, dan sirkulasi udara baik.'),
('S-02', 'Kandang Standar 2', 'standar', 60000.00, 'tersedia', 'Kandang besi luas 70x60cm, matras empuk, dan sirkulasi udara baik.'),
('P-01', 'Kamar Premium 1', 'premium', 90000.00, 'tersedia', 'Kamar bertingkat 90x80cm, area bermain mini, dan sesi jalan santai.'),
('P-02', 'Kamar Premium 2', 'premium', 90000.00, 'tersedia', 'Kamar bertingkat 90x80cm, area bermain mini, dan sesi jalan santai.'),
('V-01', 'Kamar VIP AC 1', 'vip', 130000.00, 'tersedia', 'Kamar kaca privat eksklusif ber-AC 24 jam dengan live camera monitoring.')
ON CONFLICT (code) DO NOTHING;
