-- ==============================================================================
-- 0005_views_indexes.sql
-- PawMart POS - View Analitik Dashboard/Laporan & Optimasi Indeks Performa
-- ==============================================================================

-- ==============================================================================
-- 1. INDEXING STRATEGIS UNTUK PERFORMA QUERY CEPAT
-- ==============================================================================

-- Indeks Pencarian Produk (Barcode, SKU, Kategori)
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Indeks Trigram Pencarian Teks Nama Produk (pg_trgm untuk ILIKE '%keyword%')
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- Indeks Pelanggan (Telepon, Nama Trigram)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON public.customers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON public.customers(tier);

-- Indeks Hewan Peliharaan & Vaksinasi
CREATE INDEX IF NOT EXISTS idx_pets_customer_id ON public.pets(customer_id);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet_id ON public.pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_next_due ON public.pet_vaccinations(next_due_at);

-- Indeks Transaksi & Detail Struk
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_no ON public.transactions(invoice_no);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier_id ON public.transactions(cashier_id);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON public.transaction_items(product_id);

-- Indeks Audit Mutasi Persediaan
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod_date ON public.stock_movements(product_id, created_at DESC);

-- Indeks Layanan & Booking
CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON public.bookings(booking_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_boarding_stays_dates ON public.boarding_stays(check_in_date, expected_check_out_date, status);

-- ==============================================================================
-- 2. VIEW PRODUK PUBLIK (TANPA HARGA BELI / HPP UNTUK KASIR)
-- ==============================================================================
CREATE OR REPLACE VIEW v_products_public
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.category_id,
    c.name AS category_name,
    p.name,
    p.sku,
    p.barcode,
    p.sell_price,
    p.stock,
    p.min_stock,
    p.unit,
    p.image_url,
    p.expiry_date,
    p.description,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.is_active = true;
COMMENT ON VIEW v_products_public IS 'Katalog produk publik aman tanpa kolom buy_price (HPP) untuk tampilan kasir';

-- ==============================================================================
-- 3. VIEW DASHBOARD METRIK HARI INI (Zona Waktu: Asia/Jakarta)
-- ==============================================================================
CREATE OR REPLACE VIEW v_dashboard_today
WITH (security_invoker = true) AS
SELECT
    COALESCE(SUM(t.total), 0.00) AS total_sales_today,
    COUNT(t.id) AS total_transactions_today,
    COALESCE(SUM(ti.total_items_sold), 0) AS total_products_sold_today,
    (SELECT COUNT(*) FROM public.products WHERE stock <= min_stock AND is_active = true) AS low_stock_count
FROM public.transactions t
LEFT JOIN (
    SELECT transaction_id, SUM(quantity) AS total_items_sold
    FROM public.transaction_items
    GROUP BY transaction_id
) ti ON t.id = ti.transaction_id
WHERE t.status = 'selesai'
  AND timezone('Asia/Jakarta', t.created_at)::date = timezone('Asia/Jakarta', now())::date;
COMMENT ON VIEW v_dashboard_today IS 'Ringkasan metrik 4 kartu dasbor utama untuk penjualan hari ini (WIB)';

-- ==============================================================================
-- 4. VIEW PENJUALAN HARIAN (UNTUK GRAFIK TREN 7 HARI / 30 HARI)
-- ==============================================================================
CREATE OR REPLACE VIEW v_daily_sales
WITH (security_invoker = true) AS
SELECT
    timezone('Asia/Jakarta', t.created_at)::date AS sales_date,
    TO_CHAR(timezone('Asia/Jakarta', t.created_at)::date, 'DD Mon') AS label_date,
    COALESCE(SUM(t.total), 0.00) AS total_revenue,
    COUNT(t.id) AS transaction_count,
    COALESCE(SUM(t.subtotal), 0.00) AS subtotal_sales,
    COALESCE(SUM(t.discount), 0.00) AS total_discount,
    COALESCE(SUM(t.tax), 0.00) AS total_tax
FROM public.transactions t
WHERE t.status = 'selesai'
GROUP BY timezone('Asia/Jakarta', t.created_at)::date
ORDER BY sales_date DESC;
COMMENT ON VIEW v_daily_sales IS 'Statistik penjualan per hari dalam zona waktu WIB untuk grafik Recharts';

-- ==============================================================================
-- 5. VIEW PRODUK TERLARIS (TOP SELLING PRODUCTS)
-- ==============================================================================
CREATE OR REPLACE VIEW v_top_products
WITH (security_invoker = true) AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.image_url,
    p.sell_price,
    COALESCE(SUM(ti.quantity), 0) AS total_sold,
    COALESCE(SUM(ti.line_total), 0.00) AS total_revenue
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.transaction_items ti ON p.id = ti.product_id
JOIN public.transactions t ON ti.transaction_id = t.id
WHERE t.status = 'selesai'
GROUP BY p.id, p.name, c.name, p.image_url, p.sell_price
ORDER BY total_sold DESC;
COMMENT ON VIEW v_top_products IS 'Daftar produk paling laris berdasarkan akumulasi kuantitas terjual';

-- ==============================================================================
-- 6. VIEW STOK MENIPIS (LOW STOCK ALERT)
-- ==============================================================================
CREATE OR REPLACE VIEW v_low_stock
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.name,
    p.sku,
    p.barcode,
    c.name AS category_name,
    p.stock,
    p.min_stock,
    p.unit,
    p.image_url,
    CASE 
        WHEN p.stock = 0 THEN 'Habis'
        ELSE 'Menipis'
    END AS stock_status
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = true
ORDER BY p.stock ASC;
COMMENT ON VIEW v_low_stock IS 'Daftar barang dengan sisa persediaan kritis atau habis';

-- ==============================================================================
-- 7. VIEW PRODUK MENDEKATI KEDALUWARSA (EXPIRING PRODUCTS IN 30 DAYS)
-- ==============================================================================
CREATE OR REPLACE VIEW v_expiring_products
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.name,
    p.sku,
    c.name AS category_name,
    p.stock,
    p.unit,
    p.expiry_date,
    (p.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.expiry_date IS NOT NULL 
  AND p.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
  AND p.stock > 0
  AND p.is_active = true
ORDER BY p.expiry_date ASC;
COMMENT ON VIEW v_expiring_products IS 'Peringatan produk pakan atau obat yang mendekati masa kedaluwarsa 30 hari ke depan';

-- ==============================================================================
-- 8. VIEW PENJUALAN PER KATEGORI (UNTUK DONUT / PIE CHART LAPORAN)
-- ==============================================================================
CREATE OR REPLACE VIEW v_sales_by_category
WITH (security_invoker = true) AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(SUM(ti.quantity), 0) AS total_units_sold,
    COALESCE(SUM(ti.line_total), 0.00) AS total_revenue
FROM public.categories c
JOIN public.products p ON c.id = p.category_id
JOIN public.transaction_items ti ON p.id = ti.product_id
JOIN public.transactions t ON ti.transaction_id = t.id
WHERE t.status = 'selesai'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
COMMENT ON VIEW v_sales_by_category IS 'Komposisi pendapatan penjualan per kategori barang untuk laporan laba';
