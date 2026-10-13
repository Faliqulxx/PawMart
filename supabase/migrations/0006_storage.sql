-- ==============================================================================
-- 0006_storage.sql
-- PawMart POS - Konfigurasi Supabase Storage Bucket & Kebijakan Upload Foto
-- ==============================================================================

-- 1. BUAT BUCKET PRODUCT-IMAGES (PUBLIK READ, BATAS 5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- Maksimal 5MB (5 * 1024 * 1024)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- 2. KEBIJAKAN AKSES STORAGE (RLS ON storage.objects)

-- Siapapun dapat melihat/mengakses foto produk (Public Read)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Hanya Admin terautentikasi yang boleh mengunggah foto produk baru
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Hanya Admin yang boleh memperbarui foto produk
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    bucket_id = 'product-images' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Hanya Admin yang boleh menghapus foto produk
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
