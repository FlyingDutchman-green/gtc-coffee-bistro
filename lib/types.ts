/**
 * lib/types.ts — Shared TypeScript types for Sub-Brands, Sub-Categories,
 * Menus, and Best Sellers (mirrors the Supabase DB schema).
 *
 * Used by: lib/actions.ts, context/SubBrandContext.tsx,
 *          app/admin/page.tsx, components/sections/MenuGrid.tsx
 */

// ── Sub Brand ─────────────────────────────────────────────────────────────────
export interface SubBrand {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  item_count: number;
  icon_name: string;
  created_at: string;
}

// ── Sub Category ──────────────────────────────────────────────────────────────
export interface SubCategory {
  id: string;
  sub_brand_id: string;
  name: string;
  created_at: string;
}

// ── Menu ─────────────────────────────────────────────────────────────────────
export interface Menu {
  id: string;
  sub_category_id: string;
  name: string;
  price: string;
  image_url: string | null;
  created_at: string;
}

// ── Best Seller ───────────────────────────────────────────────────────────────
export interface BestSeller {
  id: string;
  sub_brand_id: string;
  name: string;
  description: string;
  price: string;
  badge: string;
  image_url: string | null;
  created_at: string;
}

// ── Action Response (generic) ─────────────────────────────────────────────────
export interface ActionResult<T = null> {
  success: boolean;
  error?: string;
  data?: T;
}
