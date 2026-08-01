-- ============================================================
--  GTC Coffee & Bistro — Full Dynamic Menu Schema
--  Migration 001 — Sub Brands + Sub Categories + Menus + Best Sellers
--  Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. sub_brands ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_brands (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  image_url    TEXT,
  item_count   INT         NOT NULL DEFAULT 0,
  icon_name    TEXT        NOT NULL DEFAULT 'coffee',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. sub_categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_brand_id UUID        NOT NULL
                  REFERENCES public.sub_brands (id)
                  ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. menus ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menus (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_category_id  UUID        NOT NULL
                     REFERENCES public.sub_categories (id)
                     ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  price            TEXT        NOT NULL DEFAULT '',
  image_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. best_sellers ──────────────────────────────────────────────────────────
-- MAX 3 per sub_brand — enforced in lib/actions.ts AND by a DB trigger below.
CREATE TABLE IF NOT EXISTS public.best_sellers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_brand_id UUID        NOT NULL
                 REFERENCES public.sub_brands (id)
                 ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  price        TEXT        NOT NULL DEFAULT '',
  badge        TEXT        NOT NULL DEFAULT '',
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sub_categories_sub_brand_id
  ON public.sub_categories (sub_brand_id);

CREATE INDEX IF NOT EXISTS idx_menus_sub_category_id
  ON public.menus (sub_category_id);

CREATE INDEX IF NOT EXISTS idx_best_sellers_sub_brand_id
  ON public.best_sellers (sub_brand_id);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.sub_brands      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_sellers    ENABLE ROW LEVEL SECURITY;

-- Public SELECT (website display)
CREATE POLICY "public_read_sub_brands"
  ON public.sub_brands FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "public_read_sub_categories"
  ON public.sub_categories FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "public_read_menus"
  ON public.menus FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "public_read_best_sellers"
  ON public.best_sellers FOR SELECT TO anon, authenticated USING (TRUE);

-- Authenticated ALL (admin CRUD)
CREATE POLICY "auth_write_sub_brands"
  ON public.sub_brands FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth_write_sub_categories"
  ON public.sub_categories FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth_write_menus"
  ON public.menus FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth_write_best_sellers"
  ON public.best_sellers FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- ── DB-level guard: max 3 best sellers per sub_brand ─────────────────────────
-- Defence-in-depth: same check is in lib/actions.ts (server layer).
CREATE OR REPLACE FUNCTION public.check_best_seller_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count
    FROM public.best_sellers
   WHERE sub_brand_id = NEW.sub_brand_id;

  IF current_count >= 3 THEN
    RAISE EXCEPTION 'Maksimal 3 menu best seller per sub-brand';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_best_seller_limit ON public.best_sellers;
CREATE TRIGGER trg_best_seller_limit
  BEFORE INSERT ON public.best_sellers
  FOR EACH ROW EXECUTE FUNCTION public.check_best_seller_limit();

-- ── Storage bucket: sub-brand-assets ────────────────────────────────────────
-- Run in Supabase Storage UI or SQL Editor:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('sub-brand-assets', 'sub-brand-assets', TRUE)
--   ON CONFLICT (id) DO UPDATE SET public = TRUE;
--
--   CREATE POLICY "public_read_sub_brand_assets"
--     ON storage.objects FOR SELECT TO anon, authenticated
--     USING (bucket_id = 'sub-brand-assets');
--
--   CREATE POLICY "auth_write_sub_brand_assets"
--     ON storage.objects FOR ALL TO authenticated
--     USING (bucket_id = 'sub-brand-assets')
--     WITH CHECK (bucket_id = 'sub-brand-assets');
