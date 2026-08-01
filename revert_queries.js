const fs = require('fs');

// 1. Revert lib/actions.ts
let actions = fs.readFileSync('lib/actions.ts', 'utf8');

const oldActionsCreate = `  try {
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

const newActionsCreate = `  try {
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
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan pada server' };
  }`;

actions = actions.replace(/menu_id\?: string;\n\s*/, '');
actions = actions.replace(oldActionsCreate, newActionsCreate);

actions = actions.replace(
  /export async function countBestSellers\(sub_brand_id: string\): Promise<number> \{\s*const \{ count, error \} = await supabase\s*\.from\('best_sellers'\)\s*\.select\('id, menus!inner\(sub_brand_id\)', \{ count: 'exact', head: true \}\)\s*\.eq\('menus\.sub_brand_id', sub_brand_id\);/,
  'export async function countBestSellers(sub_brand_id: string): Promise<number> {\n  const { count, error } = await supabase\n    .from(\'best_sellers\')\n    .select(\'id\', { count: \'exact\', head: true })\n    .eq(\'sub_brand_id\', sub_brand_id);'
);

fs.writeFileSync('lib/actions.ts', actions);

// 2. Revert context/SubBrandContext.tsx
let ctx = fs.readFileSync('context/SubBrandContext.tsx', 'utf8');
ctx = ctx.replace(
  /\.select\(\"\*, menus!inner\(\*\)\"\)\s*\.eq\(\"menus\.sub_brand_id\", sub_brand_id\)/,
  '.select(\"*\")\n      .eq(\"sub_brand_id\", sub_brand_id)'
);
fs.writeFileSync('context/SubBrandContext.tsx', ctx);

// 3. Revert app/page.tsx
let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace(
  /const \{ data: allBestSellers, error \} = await supabase\.from\('best_sellers'\)\.select\('\*, menus!inner\(\*, sub_brands\(name\)\)'\);/,
  'const { data: allBestSellers, error } = await supabase.from(\'best_sellers\').select(\'*, sub_brands(name)\');'
);
fs.writeFileSync('app/page.tsx', page);

// 4. Revert MenuGrid.tsx and MenuCategoryTabs.tsx
['components/sections/MenuGrid.tsx', 'components/sections/MenuCategoryTabs.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\(item\.menus\?\.name \|\| item\.name\)/g, 'item.name');
  c = c.replace(/\(item\.menus\?\.price \|\| item\.price\)/g, 'item.price');
  c = c.replace(/\(item\.menus\?\.image_url \|\| item\.image_url\) as string/g, 'item.image_url as string');
  if (file.includes('MenuCategoryTabs')) {
     c = c.replace(/bs\.menus\?\.sub_brands\?\.name/g, 'bs.sub_brands?.name');
  }
  fs.writeFileSync(file, c);
});

// 5. Revert app/admin/page.tsx
let admin = fs.readFileSync('app/admin/page.tsx', 'utf8');
admin = admin.replace(
  /const res = await createBestSeller\(\{\s*menu_id: menu\.id,\s*sub_brand_id: subBrandId,/,
  'const res = await createBestSeller({\n        sub_brand_id: subBrandId,'
);
fs.writeFileSync('app/admin/page.tsx', admin);

// 6. Revert lib/types.ts
let types = fs.readFileSync('lib/types.ts', 'utf8');
types = types.replace(/\s*menus\?: \{[\s\S]*?\};\n/, '\n');
fs.writeFileSync('lib/types.ts', types);
