const fs = require('fs');

let actions = fs.readFileSync('lib/actions.ts', 'utf8');

// 1. Update createBestSeller input interface
actions = actions.replace(
  /export async function createBestSeller\(input: \{/,
  'export async function createBestSeller(input: {\n  menu_id?: string;'
);

// 2. Wrap in try-catch and update logic
const createActionOld = `  if (!input.sub_brand_id || !input.name.trim()) {
    return { success: false, error: 'Sub-Brand ID dan nama best-seller wajib diisi.' };
  }

  // ── MAX-3 GUARD (server-action layer) ──────────────────────────────────────
  const { count, error: countErr } = await supabase
    .from('best_sellers')
    .select('id, menus!inner(sub_brand_id)', { count: 'exact', head: true })
    .eq('menus.sub_brand_id', input.sub_brand_id);

  if (countErr) return { success: false, error: countErr.message };

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

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, data: data as BestSeller };`;

const createActionNew = `  try {
    if (!input.name.trim()) {
      return { success: false, error: 'Nama best-seller wajib diisi.' };
    }

    let actualSubBrandId = input.sub_brand_id;
    if (input.menu_id) {
      const { data: menuData, error: menuErr } = await supabase
        .from('menus')
        .select('sub_brand_id')
        .eq('id', input.menu_id)
        .single();
      
      if (menuErr) throw new Error(menuErr.message);
      if (menuData) actualSubBrandId = menuData.sub_brand_id;
    }

    if (!actualSubBrandId) {
      return { success: false, error: 'Sub-Brand ID tidak ditemukan.' };
    }

    // ── MAX-3 GUARD (server-action layer) ──────────────────────────────────────
    const { data: activeBS, error: countErr } = await supabase
      .from('best_sellers')
      .select('id, menus!inner(sub_brand_id)')
      .eq('menus.sub_brand_id', actualSubBrandId);

    if (countErr) throw new Error(countErr.message);

    if (activeBS && activeBS.length >= 3) {
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
          sub_brand_id: actualSubBrandId,
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
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan pada server' };
  }`;

actions = actions.replace(createActionOld, createActionNew);
fs.writeFileSync('lib/actions.ts', actions);

// 3. Update app/admin/page.tsx
let page = fs.readFileSync('app/admin/page.tsx', 'utf8');

page = page.replace(
  /const result = await createBestSeller\(\{[\s\S]*?\}\);[\s\S]*?if \(!result\.success\) \{[\s\S]*?setError\(result\.error \?\? \"Gagal menyimpan\.\"\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?if \(customImagePreview\) URL\.revokeObjectURL\(customImagePreview\);[\s\S]*?onSaved\(\);/m,
  `const res = await createBestSeller({
        menu_id: menu.id,
        sub_brand_id: subBrandId,
        name: menu.name,
        description: description.trim(),
        price: menu.price,
        badge: badge.trim(),
        image_url: finalImageUrl,
      });
      if (res?.success) {
        if (customImagePreview) URL.revokeObjectURL(customImagePreview);
        // showToast("Menu berhasil ditambahkan sebagai Best Seller", "success"); // Not in scope of Modal directly, handled by onSaved
        onSaved();
      } else {
        setError(res?.error || "Gagal menyimpan.");
      }`
);

fs.writeFileSync('app/admin/page.tsx', page);
