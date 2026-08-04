'use server';

import { revalidatePath } from 'next/cache';

/**
 * lib/actions.ts — All Server Actions for GTC Coffee & Bistro.
 *
 * Sections:
 *   1. Newsletter (existing, preserved)
 *   2. Sub-Brand CRUD
 *   3. Sub-Category CRUD
 *   4. Menu CRUD
 *   5. Best-Seller CRUD (with max-3 guard)
 *
 * Security note (Next.js Server Actions guide):
 *   - Every action runs as a POST on the server.
 *   - Never trust client-supplied data; validate here.
 *   - The Supabase client here uses the public anon key which is limited
 *     by RLS to authenticated users for writes.
 */

import { createServerSupabase } from '@/lib/supabase-server';
import type {
  SubBrand,
  SubCategory,
  Menu,
  BestSeller,
  ActionResult,
} from '@/lib/types';

// ══════════════════════════════════════════════════════════════════════════════
// 1. NEWSLETTER (existing — preserved unchanged)
// ══════════════════════════════════════════════════════════════════════════════

export interface NewsletterState {
  status: 'idle' | 'success' | 'error' | 'invalid';
  message: string;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = formData.get('email');

  if (typeof email !== 'string' || email.trim() === '') {
    return { status: 'invalid', message: 'Silakan masukkan alamat email Anda.' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_RE.test(trimmed)) {
    return { status: 'invalid', message: 'Silakan masukkan alamat email yang valid.' };
  }

  await new Promise((r) => setTimeout(r, 300));

  return {
    status: 'success',
    message: 'Berhasil. Kami akan menghubungi Anda — tanpa pesan spam, kapan pun.',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. SUB-BRAND CRUD
// ══════════════════════════════════════════════════════════════════════════════

export async function getSubBrands(): Promise<SubBrand[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('sub_brands')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SubBrand[];
}

export async function createSubBrand(input: {
  name: string;
  description: string;
  image_url?: string | null;
  item_count?: number;
  icon_name?: string;
}): Promise<ActionResult<SubBrand>> {
  const supabase = await createServerSupabase();
  if (!input.name.trim()) {
    return { success: false, error: 'Nama sub-brand wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('sub_brands')
    .insert([
      {
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        image_url: input.image_url ?? null,
        item_count: input.item_count ?? 0,
        icon_name: input.icon_name?.trim() || 'coffee',
      },
    ])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as SubBrand };
}

export async function updateSubBrand(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    image_url: string | null;
    item_count: number;
    icon_name: string;
  }>,
): Promise<ActionResult<SubBrand>> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.image_url !== undefined) payload.image_url = input.image_url;
  if (input.item_count !== undefined) payload.item_count = input.item_count;
  if (input.icon_name !== undefined) payload.icon_name = input.icon_name.trim() || 'coffee';

  const { data, error } = await supabase
    .from('sub_brands')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as SubBrand };
}

export async function deleteSubBrand(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };

  const { error } = await supabase.from('sub_brands').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. SUB-CATEGORY CRUD
// ══════════════════════════════════════════════════════════════════════════════

export async function getSubCategories(sub_brand_id: string): Promise<SubCategory[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('sub_brand_id', sub_brand_id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SubCategory[];
}

export async function createSubCategory(input: {
  sub_brand_id: string;
  name: string;
}): Promise<ActionResult<SubCategory>> {
  const supabase = await createServerSupabase();
  if (!input.sub_brand_id || !input.name.trim()) {
    return { success: false, error: 'Sub-Brand ID dan nama sub-kategori wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('sub_categories')
    .insert([{ sub_brand_id: input.sub_brand_id, name: input.name.trim() }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as SubCategory };
}

export async function updateSubCategory(
  id: string,
  name: string,
): Promise<ActionResult<SubCategory>> {
  const supabase = await createServerSupabase();
  if (!id || !name.trim()) {
    return { success: false, error: 'ID dan nama wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('sub_categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as SubCategory };
}

export async function deleteSubCategory(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };
  const { error } = await supabase.from('sub_categories').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. MENU CRUD
// ══════════════════════════════════════════════════════════════════════════════

export async function getMenus(sub_category_id: string): Promise<Menu[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('sub_category_id', sub_category_id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Menu[];
}

export async function createMenu(input: {
  sub_category_id: string;
  name: string;
  price: string;
  image_url?: string | null;
}): Promise<ActionResult<Menu>> {
  const supabase = await createServerSupabase();
  if (!input.sub_category_id || !input.name.trim() || !input.price.trim()) {
    return { success: false, error: 'Sub-Kategori, nama menu, dan harga wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('menus')
    .insert([
      {
        sub_category_id: input.sub_category_id,
        name: input.name.trim(),
        price: input.price.trim(),
        image_url: input.image_url ?? null,
      },
    ])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as Menu };
}

export async function updateMenu(
  id: string,
  input: Partial<{ name: string; price: string; image_url: string | null }>,
): Promise<ActionResult<Menu>> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.price !== undefined) payload.price = input.price.trim();
  if (input.image_url !== undefined) payload.image_url = input.image_url;

  const { data, error } = await supabase
    .from('menus')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as Menu };
}

export async function deleteMenu(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };
  const { error } = await supabase.from('menus').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. BEST-SELLER CRUD  (max-3 guard enforced here AND in DB trigger)
// ══════════════════════════════════════════════════════════════════════════════

export async function getBestSellers(sub_brand_id: string): Promise<BestSeller[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('best_sellers')
    .select('*')
    .eq('sub_brand_id', sub_brand_id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as BestSeller[];
}

/** Count how many best sellers a sub-brand already has (used in admin UI). */
export async function countBestSellers(sub_brand_id: string): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from('best_sellers')
    .select('id', { count: 'exact', head: true })
    .eq('sub_brand_id', sub_brand_id);

  if (error) return 0;
  return count ?? 0;
}

export async function createBestSeller(input: {
  sub_brand_id: string;
  name: string;
  description: string;
  price: string;
  badge?: string;
  image_url?: string | null;
}): Promise<ActionResult<BestSeller>> {
  const supabase = await createServerSupabase();
  try {
    if (!input.name.trim() || !input.sub_brand_id) {
      return { success: false, error: 'Sub-Brand ID dan Nama best-seller wajib diisi.' };
    }

    // ── MAX-3 GUARD (server-action layer) ──────────────────────────────────────
    const { count, error: countErr } = await supabase
      .from('best_sellers')
      .select('id', { count: 'exact', head: true })
      .eq('sub_brand_id', input.sub_brand_id);

    if (countErr) throw new Error(countErr.message);

    if ((count ?? 0) >= 3) {
      return {
        success: false,
        error: 'Maksimal 3 menu best seller per sub-brand',
      };
    }
    // ── END GUARD ──────────────────────────────────────────────────────────────

    const { data, error } = await supabase
      .from('best_sellers')
      .insert([
        {
          sub_brand_id: input.sub_brand_id,
          name: input.name.trim(),
          description: input.description?.trim() ?? '',
          price: input.price.trim(),
          badge: input.badge?.trim() ?? '',
          image_url: input.image_url ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: data as BestSeller };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan pada server' };
  }
}

export async function updateBestSeller(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    price: string;
    badge: string;
    image_url: string | null;
  }>,
): Promise<ActionResult<BestSeller>> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.price !== undefined) payload.price = input.price.trim();
  if (input.badge !== undefined) payload.badge = input.badge.trim();
  if (input.image_url !== undefined) payload.image_url = input.image_url;

  const { data, error } = await supabase
    .from('best_sellers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as BestSeller };
}

export async function deleteBestSeller(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!id) return { success: false, error: 'ID wajib disertakan.' };
  const { error } = await supabase.from('best_sellers').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}
