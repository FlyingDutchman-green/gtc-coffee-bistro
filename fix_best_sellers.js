const fs = require('fs');

// 1. Update app/page.tsx
let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace(
  /const \{ data: allBestSellers \} = await supabase\.from\('best_sellers'\)\.select\('\*, sub_brands\\(name\\)'\);/,
  'const { data: allBestSellers, error } = await supabase.from(\'best_sellers\').select(\'*, menus!inner(*, sub_brands(name))\');\n  console.log("DEBUG BEST SELLERS:", allBestSellers, error);'
);
fs.writeFileSync('app/page.tsx', page);

// 2. Update SubBrandContext.tsx
let ctx = fs.readFileSync('context/SubBrandContext.tsx', 'utf8');
ctx = ctx.replace(
  /const \{ data, error \} = await supabase\s*\.from\("best_sellers"\)\s*\.select\("\*"\)\s*\.eq\("sub_brand_id", sub_brand_id\)/,
  'const { data, error } = await supabase\n      .from("best_sellers")\n      .select("*, menus!inner(*)")\n      .eq("menus.sub_brand_id", sub_brand_id)'
);
ctx = ctx.replace(
  /\.order\("created_at", \{ ascending: true \}\);/,
  '.order("created_at", { ascending: true });\n    console.log("DEBUG BEST SELLERS:", data, error);'
);
fs.writeFileSync('context/SubBrandContext.tsx', ctx);

// 3. Update MenuCategoryTabs.tsx
let tabs = fs.readFileSync('components/sections/MenuCategoryTabs.tsx', 'utf8');
tabs = tabs.replace(
  /const bestSellers = allBestSellers\.filter\(\(bs: any\) => bs\.sub_brands\?\.name === category\.name\)\.slice\(0, 3\);/,
  'const bestSellers = allBestSellers.filter((bs: any) => bs.menus?.sub_brands?.name === category.name).slice(0, 3);'
);
tabs = tabs.replace(/item\.name/g, '(item.menus?.name || item.name)');
tabs = tabs.replace(/item\.price/g, '(item.menus?.price || item.price)');
tabs = tabs.replace(/item\.image_url/g, '(item.menus?.image_url || item.image_url)');
fs.writeFileSync('components/sections/MenuCategoryTabs.tsx', tabs);

// 4. Update MenuGrid.tsx (BestSellersSection)
let grid = fs.readFileSync('components/sections/MenuGrid.tsx', 'utf8');
grid = grid.replace(/item\.name/g, '(item.menus?.name || item.name)');
grid = grid.replace(/item\.price/g, '(item.menus?.price || item.price)');
grid = grid.replace(/item\.image_url/g, '(item.menus?.image_url || item.image_url)');
fs.writeFileSync('components/sections/MenuGrid.tsx', grid);
