-- 1. KUNCI SEMUA TABEL UTAMA UNTUK ADMIN (AUTHENTICATED)
DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        -- Drop policy lama/permissive
        EXECUTE format('DROP POLICY IF EXISTS "Allow All %I Insert" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All %I Update" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All %I Delete" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All Sub Brands Insert" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All Sub Brands Update" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All Sub Brands Delete" ON public.%I', tbl, tbl);

        -- Public Read (Bebas dibaca oleh siapapun)
        EXECUTE format('DROP POLICY IF EXISTS "Public Read %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public Read %I" ON public.%I FOR SELECT USING (true)', tbl, tbl);

        -- Hak Akses Tambah/Edit/Hapus Hanya untuk Authenticated User
        EXECUTE format('CREATE POLICY "Admin Insert %I" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', tbl, tbl);
        EXECUTE format('CREATE POLICY "Admin Update %I" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'')', tbl, tbl);
        EXECUTE format('CREATE POLICY "Admin Delete %I" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'')', tbl, tbl);
    END LOOP;
END $$;

-- 2. KUNCI STORAGE BUCKET (UPLOAD GAMBAR)
DROP POLICY IF EXISTS "Allow Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow Storage Update" ON storage.objects;

CREATE POLICY "Admin Storage Insert" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Storage Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Storage Delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');