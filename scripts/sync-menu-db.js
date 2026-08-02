#!/usr/bin/env node
/**
 * scripts/sync-menu-db.js
 *
 * CLI bulk-insert script: migrates the hardcoded INITIAL_MENU_DATA from
 * context/MenuContext.tsx into the live Supabase relational schema:
 *
 *   sub_brands → sub_categories → menus
 *
 * Also seeds the flat `menu_items` table consumed by FullMenuModal.
 *
 * Usage:
 *   node scripts/sync-menu-db.js
 *
 * Requires: @supabase/supabase-js (already installed in the project)
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ══════════════════════════════════════════════════════════════════════════════
// MASTER DATA — mirrors INITIAL_MENU_DATA in context/MenuContext.tsx
// ══════════════════════════════════════════════════════════════════════════════

const SUB_BRAND_META = {
  "MINUMAN (MOURO)": {
    description:
      "Kopi premium pour-over, mocktail signature, dan seduhan teh pilihan dari MOURO — sub-brand minuman unggulan GTC yang menggabungkan presisi dan cita rasa",
    icon_name: "drink",
    image_url: "/menu-mouro.jpg",
  },
  RAMENIKU: {
    description:
      "Ramen Jepang otentik dengan kaldu yang direbus 12 jam, mie segar buatan tangan, dan gyoza renyah — cita rasa Tokyo hadir di Pekalongan",
    icon_name: "ramen",
    image_url: "/menu-ramen.jpg",
  },
  "MIE JAGOAN": {
    description:
      "Mie lokal berkarakter pedas nampol dengan bumbu rahasia GTC, disajikan bersama pilihan dimsum premium — sajian nusantara yang tak terbantahkan kenikmatannya",
    icon_name: "noodle",
    image_url: "/menu-mie.jpg",
  },
  "AYAM KERATON": {
    description:
      "Hidangan ayam tradisional Indonesia premium yang dimarinasi dengan rempah keraton turun-temurun, disajikan lengkap dengan pilihan sambal autentik khas nusantara",
    icon_name: "chicken",
    image_url: "/menu-ayam.jpg",
  },
  "EL NASGOR": {
    description:
      "Nasi goreng kelas atas dengan sentuhan kreatif dan bahan premium — varian signature EL NASGOR mengangkat sajian rumahan menjadi pengalaman kuliner yang mengagumkan",
    icon_name: "rice",
    image_url: "/menu-nasgor.jpg",
  },
  "GOLDEN TELLER": {
    description:
      "Es teller manis khas GTC, jus buah segar cold-pressed, dan cemilan ringan artisan — penutup sempurna untuk setiap kunjungan ke GTC Coffee & Bistro",
    icon_name: "food",
    image_url: "/menu-golden-teller.jpg",
  },
  "DURIAN, JUS & CEMILAN": {
    description:
      "Durian, jus segar, dan cemilan ringan pilihan — teman santai sempurna di GTC Coffee & Bistro",
    icon_name: "food",
    image_url: "/menu-golden-teller.jpg",
  },
};

const MENU_DATA = {
  "MINUMAN (MOURO)": {
    "Coffee Latte": [
      { name: "[PAKET HEMAT] LATTE ICE & BABY CROISSANT", price: 25000 },
      { name: "[PROMO] MOURO OAT COFFEE", price: 24000 },
      { name: "MOURO AREN", price: 21000 },
      { name: "MOURO BUTTERSCOTCH", price: 25000 },
      { name: "MOURO CARAMEL MACHIATO", price: 25000 },
      { name: "MOURO HAZELNUT", price: 22000 },
      { name: "MOURO OAT MATCHA", price: 25000 },
      { name: "MOURO PANDAN", price: 22000 },
      { name: "MOURO PISTACIO", price: 25000 },
    ],
    "Cake & Ice Cream": [
      { name: "[PROMO] HOT DOG", price: 19000 },
      { name: "BANANA ICE CREAM", price: 13000 },
      { name: "BURGER MIX", price: 24000 },
      { name: "CHIKEN SPICY", price: 25000 },
      { name: "ICE CREAM", price: 20000 },
      { name: "MAC & CHEESE", price: 20000 },
    ],
    "Black Coffee": [
      { name: "AFFOGATO", price: 21000 },
      { name: "AMERICANO", price: 15000 },
      { name: "ESPRESSO", price: 12000 },
      { name: "KOPI SANGER", price: 18000 },
      { name: "KOPI TUBRUK", price: 15000 },
      { name: "VIETNAM DRIP", price: 18000 },
      { name: "COFFEE LATTE", price: 21000 },
    ],
    Other: [
      { name: "AIR MINERAL", price: 6000 },
      { name: "BLUE SPARKLING", price: 12000 },
      { name: "GREEN TEA", price: 12000 },
      { name: "JERUK", price: 10000 },
      { name: "LEMON SPARKLING", price: 12000 },
      { name: "LEMON TEA", price: 12000 },
      { name: "MELON SPARKLING", price: 12000 },
      { name: "ORANGE SPARKLING", price: 12000 },
      { name: "PINK LAVA", price: 12000 },
      { name: "RED SPARKLING", price: 12000 },
      { name: "TEH", price: 6000 },
      { name: "THAI TEA", price: 12000 },
    ],
    Frutycano: [
      { name: "BERRY HONEY AMERICANO", price: 23000 },
      { name: "LIMEPRESSO", price: 21000 },
      { name: "TRIPLE PEACH AMERICANO", price: 24000 },
      { name: "COCONUT BLACK", price: 19000 },
    ],
    "Milk Factory": [
      { name: "CHOCOLATTE", price: 20000 },
      { name: "DARK CHOCO", price: 20000 },
      { name: "MILOSAURUS", price: 21000 },
      { name: "OREO CREAMY LATTE", price: 21000 },
      { name: "REDVELVET", price: 20000 },
      { name: "STRAWBERRY LATTE", price: 20000 },
    ],
    "Matcha Base": [
      { name: "MATCHA CREAM CHEESE", price: 23000 },
      { name: "MATCHA ICE CREAM", price: 25000 },
      { name: "MATCHA PISTACIO", price: 23000 },
      { name: "STRAWBERRY MATCHA", price: 23000 },
      { name: "MATCHA LATTE", price: 20000 },
    ],
    Taro: [
      { name: "TARO CREAM CHEESE", price: 20000 },
      { name: "TARO ICE CREAM", price: 23000 },
      { name: "TARO LATTE", price: 18000 },
    ],
    "Lava Toast": [
      { name: "TOAST ICE CREAM", price: 26000 },
      { name: "TOAST MATCHA", price: 20000 },
      { name: "TOAST MILO", price: 20000 },
    ],
  },
  RAMENIKU: {
    Ramen: [
      { name: "HOKAIDO RAMEN", price: 23000 },
      { name: "KOBE RAMEN", price: 23000 },
      { name: "OSAKA RAMEN", price: 23000 },
      { name: "TOKYO RAMEN", price: 23000 },
    ],
    Snack: [
      { name: "CORN RIBS", price: 15000 },
      { name: "ENOKI CRISPY", price: 15000 },
      { name: "GYOZA", price: 23000 },
    ],
  },
  "MIE JAGOAN": {
    Snack: [
      { name: "Cireng", price: 12000 },
      { name: "Croffle", price: 16000 },
      { name: "Risol", price: 12000 },
    ],
    Dimsum: [
      { name: "Lumpia Udang", price: 15500 },
      { name: "Udang Keju", price: 15500 },
      { name: "Udang Rambutan", price: 15500 },
      { name: "Siomay Ayam", price: 15500 },
    ],
    "Mie V. Manis": [
      { name: "Mie Level V.Manis Lv 0", price: 15000 },
      { name: "Mie Level V.Manis Lv 1", price: 15000 },
      { name: "Mie Level V.Manis Lv 2", price: 15000 },
      { name: "Mie Level V.Manis Lv 3", price: 15000 },
      { name: "Mie Level V.Manis Lv 4", price: 15000 },
      { name: "Mie Level V.Manis Lv 5", price: 17500 },
      { name: "Mie Level V.Manis Lv 6", price: 17500 },
      { name: "Mie Level V.Manis Lv 7", price: 17500 },
      { name: "Mie Level V.Manis Lv 8", price: 17500 },
    ],
    "Mie V. Asin": [
      { name: "Mie Level V.Asin Lv 1", price: 15000 },
      { name: "Mie Level V.Asin Lv 2", price: 15000 },
      { name: "Mie Level V.Asin Lv 3", price: 15000 },
      { name: "Mie Level V.Asin Lv 4", price: 15000 },
      { name: "Mie Level V.Asin Lv 5", price: 17500 },
      { name: "Mie Level V.Asin Lv 6", price: 17500 },
      { name: "Mie Level V.Asin Lv 7", price: 17500 },
      { name: "Mie Level V.Asin Lv 8", price: 17500 },
    ],
    "Nasi Daun Jeruk": [
      { name: "Nasi Daun Jeruk Ayam Krikil Sambal Geprek", price: 25000 },
      { name: "Nasi Daun Jeruk Kulit Crispy Sambal Geprek", price: 25000 },
      { name: "Nasi Daun Jeruk Kulit Crispy Sambal Matah", price: 25000 },
      { name: "Nasi Daun Jeruk Ayam Krikil Sambal Matah", price: 25000 },
    ],
    Spaghetti: [
      { name: "Spaghetti Bolognese", price: 24000 },
      { name: "Spaghetti Carbonara", price: 26000 },
    ],
  },
  "AYAM KERATON": {
    "Paket Hemat": [
      { name: "Ayam Bakar hitam manis Paket Hemat (ayam negeri)", price: 19000 },
      { name: "Ayam Kremes Paket Hemat (ayam negeri)", price: 19000 },
    ],
    "Harga Ayam Pejantan": [
      { name: "Ayam Bakar kampung hitam manis", price: 35000 },
      { name: "Ayam Goreng Telur", price: 35000 },
      { name: "Ayam Kremes kampung", price: 35000 },
      { name: "Ayam Rempah keraton", price: 35000 },
    ],
    "Menu Lainnya": [
      { name: "BOCI GTC", price: 17000 },
      { name: "Roti Bakar Coklat", price: 18000 },
      { name: "Roti Bakar Coklat Keju", price: 19000 },
      { name: "Roti Bakar Keju", price: 18000 },
      { name: "Tahu Bakso", price: 21000 },
    ],
  },
  "EL NASGOR": {
    "Makanan Berat": [
      { name: "Bihun goreng spesial", price: 23000 },
      { name: "Bihun goreng Telor", price: 17000 },
      { name: "Indomie Goreng Telor", price: 15000 },
      { name: "Kwetiau Goreng Spesial", price: 25000 },
      { name: "Nasgor Ayam", price: 20000 },
      { name: "Nasgor Telor", price: 17000 },
      { name: "Nasi Ayam Suwir", price: 17000 },
      { name: "Nasi Bakar Tongkol", price: 17000 },
      { name: "Nasi Goreng Spesial", price: 24000 },
      { name: "Nasi Putih", price: 6000 },
      { name: "Paket Nasi Taichan", price: 25000 },
      { name: "Paket Soto Segeran & Nasi", price: 21000 },
      { name: "Sate Kulit Usus Taichan", price: 15000 },
      { name: "Taichan Daging", price: 25000 },
    ],
  },
  "GOLDEN TELLER": {
    "Smoothie Bowl": [
      { name: "Berry Booster", price: 39000 },
      { name: "Pina Colada", price: 33000 },
      { name: "Pink Dragon", price: 29000 },
      { name: "Tropical Green", price: 34000 },
      { name: "Tropical Twist", price: 28000 },
      { name: "UBE DELIGHT", price: 27000 },
      { name: "Banana Fudge", price: 27000 },
      { name: "Golden Durian", price: 29000 },
      { name: "Golden Mango", price: 28000 },
      { name: "Tropical Island", price: 28000 },
    ],
    Dessert: [
      { name: "Cireng Ayam Suwir", price: 13000 },
      { name: "Dubai Pistachio Donut", price: 20000 },
      { name: "Risol Cokelat", price: 19000 },
      { name: "Wonton Goreng", price: 16000 },
      { name: "Wonton Pedas (Rebus)", price: 16000 },
      { name: "Berry Choco Kunafa Pistachio", price: 36000 },
      { name: "Cireng Kuah Keju", price: 23000 },
      { name: "Dubai Tray Choco", price: 39000 },
      { name: "Mango Cloud Donut", price: 16000 },
      { name: "Singkong Balado", price: 15000 },
      { name: "STRAWBERRY CLOUD DONUT", price: 16000 },
    ],
    "Es Teler": [
      { name: "Es Teller Durian", price: 28000 },
      { name: "Es Teller Ice Cream", price: 28000 },
      { name: "Es Teler Keju", price: 23000 },
      { name: "Es Teller Original", price: 18000 },
    ],
  },
  "DURIAN, JUS & CEMILAN": {
    Minuman: [
      { name: "Alpokat Kocok GTC", price: 16000 },
      { name: "Buah naga kocok GTC", price: 18000 },
      { name: "Durian / Mix Alpokat GTC", price: 18000 },
      { name: "Durian Kocok GTC", price: 18000 },
      { name: "Jus Alpokat", price: 16000 },
      { name: "Jus Anggur", price: 16000 },
      { name: "Jus B. Naga", price: 15000 },
      { name: "Jus Jambu", price: 15000 },
      { name: "Jus Jeruk", price: 14000 },
      { name: "Jus Mangga", price: 16000 },
      { name: "Jus Melon", price: 15000 },
      { name: "Jus Nanas", price: 15000 },
      { name: "Jus Sirsak", price: 16000 },
      { name: "Jus Strawberry", price: 16000 },
      { name: "Mangga kocok GTC", price: 18000 },
      { name: "Stroberi kocok GTC", price: 18000 },
      { name: "Strobery kocok GTC", price: 18000 },
      { name: "Es Dawet", price: 15000 },
      { name: "Es Dawet Durian", price: 18000 },
      { name: "Jus Semangka", price: 15000 },
    ],
    "Pempek / Cemilan": [
      { name: "Bakso Goreng", price: 15000 },
      { name: "Kentang Goreng", price: 15000 },
      { name: "Mix Plater", price: 18000 },
      { name: "Mix Platter", price: 18000 },
      { name: "Nuget ayam", price: 15000 },
      { name: "Siomay goreng (ikan tengiri)", price: 16000 },
      { name: "Sosis goreng", price: 15000 },
      { name: "Kentang goreng", price: 15000 },
      { name: "Mendoan", price: 14000 },
      { name: "Pempek kapal selam GTC", price: 20500 },
      { name: "Sempolan ayam isi 5", price: 14000 },
      { name: "Tahu Bakso", price: 16000 },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════════════

function formatPriceK(price) {
  const k = price / 1000;
  return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
}

function countAllItems() {
  let total = 0;
  for (const subCats of Object.values(MENU_DATA)) {
    for (const items of Object.values(subCats)) {
      total += items.length;
    }
  }
  return total;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MIGRATION
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  const totalItems = countAllItems();
  const totalBrands = Object.keys(MENU_DATA).length;
  let totalSubCats = 0;
  for (const subCats of Object.values(MENU_DATA)) {
    totalSubCats += Object.keys(subCats).length;
  }

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║     GTC COFFEE & BISTRO — MENU DATABASE SYNC SCRIPT        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log(`  Brands: ${totalBrands}  |  Sub-Categories: ${totalSubCats}  |  Menu Items: ${totalItems}`);
  console.log("");

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 0: Verify database connectivity
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 0: Verifying database connectivity...");
  const { error: pingError } = await supabase.from("sub_brands").select("id").limit(1);
  if (pingError) {
    console.error("❌ Cannot connect to Supabase:", pingError.message);
    process.exit(1);
  }
  console.log("✓ Database connection OK\n");

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 1: Clear existing data (cascade deletes sub_categories, menus, best_sellers)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 1: Clearing existing relational data...");

  // Delete menus first (deepest), then sub_categories, then sub_brands
  const { error: delMenus } = await supabase.from("menus").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delMenus) console.log(`   ⚠ menus: ${delMenus.message}`);
  else console.log("   ✓ Cleared menus table");

  const { error: delBs } = await supabase.from("best_sellers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delBs) console.log(`   ⚠ best_sellers: ${delBs.message}`);
  else console.log("   ✓ Cleared best_sellers table");

  const { error: delSc } = await supabase.from("sub_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delSc) console.log(`   ⚠ sub_categories: ${delSc.message}`);
  else console.log("   ✓ Cleared sub_categories table");

  const { error: delSb } = await supabase.from("sub_brands").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delSb) console.log(`   ⚠ sub_brands: ${delSb.message}`);
  else console.log("   ✓ Cleared sub_brands table");

  console.log("");

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 2: Insert Sub-Brands
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 2: Inserting Sub-Brands...");
  const brandIdMap = {}; // brandName -> uuid

  for (const brandName of Object.keys(MENU_DATA)) {
    const meta = SUB_BRAND_META[brandName] || {
      description: "",
      icon_name: "coffee",
      image_url: null,
    };

    // Count total items in this brand
    let itemCount = 0;
    for (const items of Object.values(MENU_DATA[brandName])) {
      itemCount += items.length;
    }

    const { data, error } = await supabase
      .from("sub_brands")
      .insert([
        {
          name: brandName,
          description: meta.description,
          icon_name: meta.icon_name,
          image_url: meta.image_url,
          item_count: itemCount,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Failed to insert brand "${brandName}":`, error.message);
      continue;
    }

    brandIdMap[brandName] = data.id;
    console.log(`   ✓ ${brandName} (${itemCount} items) → id: ${data.id.slice(0, 8)}...`);
  }

  console.log(`   → ${Object.keys(brandIdMap).length}/${totalBrands} brands inserted\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 3: Insert Sub-Categories
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 3: Inserting Sub-Categories...");
  const subCatIdMap = {}; // "brandName::subCatName" -> uuid
  let subCatCount = 0;

  for (const [brandName, subCats] of Object.entries(MENU_DATA)) {
    const brandId = brandIdMap[brandName];
    if (!brandId) {
      console.log(`   ⚠ Skipping sub-categories for "${brandName}" (brand not inserted)`);
      continue;
    }

    for (const subCatName of Object.keys(subCats)) {
      const { data, error } = await supabase
        .from("sub_categories")
        .insert([{ sub_brand_id: brandId, name: subCatName }])
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Failed "${brandName}" → "${subCatName}":`, error.message);
        continue;
      }

      const key = `${brandName}::${subCatName}`;
      subCatIdMap[key] = data.id;
      subCatCount++;
      console.log(`   ✓ ${brandName} → ${subCatName} → id: ${data.id.slice(0, 8)}...`);
    }
  }

  console.log(`   → ${subCatCount}/${totalSubCats} sub-categories inserted\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 4: Bulk Insert Menu Items
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 4: Inserting Menu Items...");
  let insertedCount = 0;
  let failedCount = 0;

  for (const [brandName, subCats] of Object.entries(MENU_DATA)) {
    for (const [subCatName, items] of Object.entries(subCats)) {
      const key = `${brandName}::${subCatName}`;
      const subCategoryId = subCatIdMap[key];

      if (!subCategoryId) {
        console.log(`   ⚠ Skipping ${items.length} items for "${key}" (sub-category not inserted)`);
        failedCount += items.length;
        continue;
      }

      // Batch insert all items for this sub-category at once
      const rows = items.map((item) => ({
        sub_category_id: subCategoryId,
        name: item.name,
        price: item.price.toString(), // menus.price is TEXT
        image_url: null,
      }));

      const { data, error } = await supabase
        .from("menus")
        .insert(rows)
        .select();

      if (error) {
        console.error(`   ❌ Batch insert failed for "${key}":`, error.message);
        failedCount += items.length;
        continue;
      }

      for (const row of data) {
        insertedCount++;
        console.log(`   ✓ ${row.name} (${formatPriceK(parseInt(row.price))})`);
      }
    }
  }

  console.log(`   → ${insertedCount}/${totalItems} menu items inserted (${failedCount} failed)\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 5: Sync flat menu_items table (used by FullMenuModal)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("── Phase 5: Syncing flat menu_items table (FullMenuModal data source)...");

  // Clear existing
  const { error: delFlat } = await supabase
    .from("menu_items")
    .delete()
    .neq("id", 0);

  if (delFlat) {
    // Table might not exist — that's OK, MenuContext auto-creates it
    console.log(`   ⚠ menu_items clear: ${delFlat.message} (may not exist yet — OK)`);
  } else {
    console.log("   ✓ Cleared menu_items table");
  }

  // Build flat rows
  const flatRows = [];
  for (const [brand, subCats] of Object.entries(MENU_DATA)) {
    for (const [subCat, items] of Object.entries(subCats)) {
      for (const item of items) {
        flatRows.push({
          brand,
          sub_category: subCat,
          name: item.name,
          price: item.price,
        });
      }
    }
  }

  // Insert in batches of 50 to avoid payload limits
  const BATCH_SIZE = 50;
  let flatInserted = 0;

  for (let i = 0; i < flatRows.length; i += BATCH_SIZE) {
    const batch = flatRows.slice(i, i + BATCH_SIZE);
    const { data: inserted, error: insertErr } = await supabase
      .from("menu_items")
      .insert(batch)
      .select();

    if (insertErr) {
      console.log(`   ⚠ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${insertErr.message}`);
      continue;
    }

    flatInserted += inserted.length;
  }

  console.log(`   ✓ ${flatInserted}/${flatRows.length} flat menu_items inserted\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────────────────────────
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    MIGRATION COMPLETE                       ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Sub-Brands:      ${String(Object.keys(brandIdMap).length).padStart(4)} / ${totalBrands}                            ║`);
  console.log(`║  Sub-Categories:  ${String(subCatCount).padStart(4)} / ${totalSubCats}                           ║`);
  console.log(`║  Menu Items:      ${String(insertedCount).padStart(4)} / ${totalItems}                          ║`);
  console.log(`║  Flat menu_items: ${String(flatInserted).padStart(4)} / ${flatRows.length}                          ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n💥 Unhandled error:", err);
  process.exit(1);
});
