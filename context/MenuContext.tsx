"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";



/* ─────────────────────────────────────────────────────────────────────────────
 * Dataset master GTC — harga dalam integer (Rupiah).
 * Dikonversi ke format "XK" / "X.5K" saat render via formatPrice().
 * ───────────────────────────────────────────────────────────────────────────── */
const INITIAL_MENU_DATA: Record<string, Record<string, { name: string; price: number }[]>> = {
  /* ── MINUMAN (MOURO) ───────────────────────────────────────────────────── */
  "MINUMAN (MOURO)": {
    "Coffee Latte": [
      { name: "[PAKET HEMAT] LATTE ICE & BABY CROISSANT", price: 25000 },
      { name: "[PROMO] MOURO OAT COFFEE",                 price: 24000 },
      { name: "MOURO AREN",                               price: 21000 },
      { name: "MOURO BUTTERSCOTCH",                       price: 25000 },
      { name: "MOURO CARAMEL MACHIATO",                   price: 25000 },
      { name: "MOURO HAZELNUT",                           price: 22000 },
      { name: "MOURO OAT MATCHA",                         price: 25000 },
      { name: "MOURO PANDAN",                             price: 22000 },
      { name: "MOURO PISTACIO",                           price: 25000 }
    ],
    "Cake & Ice Cream": [
      { name: "[PROMO] HOT DOG",                          price: 19000 },
      { name: "BANANA ICE CREAM",                         price: 13000 },
      { name: "BURGER MIX",                               price: 24000 },
      { name: "CHIKEN SPICY",                             price: 25000 },
      { name: "ICE CREAM",                                price: 20000 },
      { name: "MAC & CHEESE",                             price: 20000 }
    ],
    "Black Coffee": [
      { name: "AFFOGATO",                                 price: 21000 },
      { name: "AMERICANO",                                price: 15000 },
      { name: "ESPRESSO",                                 price: 12000 },
      { name: "KOPI SANGER",                              price: 18000 },
      { name: "KOPI TUBRUK",                              price: 15000 },
      { name: "VIETNAM DRIP",                             price: 18000 },
      { name: "COFFEE LATTE",                             price: 21000 }
    ],
    "Other": [
      { name: "AIR MINERAL",                              price:  6000 },
      { name: "BLUE SPARKLING",                           price: 12000 },
      { name: "GREEN TEA",                                price: 12000 },
      { name: "JERUK",                                    price: 10000 },
      { name: "LEMON SPARKLING",                          price: 12000 },
      { name: "LEMON TEA",                                price: 12000 },
      { name: "MELON SPARKLING",                          price: 12000 },
      { name: "ORANGE SPARKLING",                         price: 12000 },
      { name: "PINK LAVA",                                price: 12000 },
      { name: "RED SPARKLING",                            price: 12000 },
      { name: "TEH",                                      price:  6000 },
      { name: "THAI TEA",                                 price: 12000 }
    ],
    "Frutycano": [
      { name: "BERRY HONEY AMERICANO",                    price: 23000 },
      { name: "LIMEPRESSO",                               price: 21000 },
      { name: "TRIPLE PEACH AMERICANO",                   price: 24000 },
      { name: "COCONUT BLACK",                            price: 19000 }
    ],
    "Milk Factory": [
      { name: "CHOCOLATTE",                               price: 20000 },
      { name: "DARK CHOCO",                               price: 20000 },
      { name: "MILOSAURUS",                               price: 21000 },
      { name: "OREO CREAMY LATTE",                        price: 21000 },
      { name: "REDVELVET",                                price: 20000 },
      { name: "STRAWBERRY LATTE",                         price: 20000 }
    ],
    "Matcha Base": [
      { name: "MATCHA CREAM CHEESE",                      price: 23000 },
      { name: "MATCHA ICE CREAM",                         price: 25000 },
      { name: "MATCHA PISTACIO",                          price: 23000 },
      { name: "STRAWBERRY MATCHA",                        price: 23000 },
      { name: "MATCHA LATTE",                             price: 20000 }
    ],
    "Taro": [
      { name: "TARO CREAM CHEESE",                        price: 20000 },
      { name: "TARO ICE CREAM",                           price: 23000 },
      { name: "TARO LATTE",                               price: 18000 }
    ],
    "Lava Toast": [
      { name: "TOAST ICE CREAM",                          price: 26000 },
      { name: "TOAST MATCHA",                             price: 20000 },
      { name: "TOAST MILO",                               price: 20000 }
    ]
  },
  /* ── RAMENIKU ──────────────────────────────────────────────────────────── */
  "RAMENIKU": {
    "Ramen": [
      { name: "HOKAIDO RAMEN",                            price: 23000 },
      { name: "KOBE RAMEN",                               price: 23000 },
      { name: "OSAKA RAMEN",                              price: 23000 },
      { name: "TOKYO RAMEN",                              price: 23000 },
    ],
    "Snack": [
      { name: "CORN RIBS",                                price: 15000 },
      { name: "ENOKI CRISPY",                             price: 15000 },
      { name: "GYOZA",                                    price: 23000 },
    ],
  },
  /* ── MIE JAGOAN ────────────────────────────────────────────────────────── */
  "MIE JAGOAN": {
    "Snack": [
      { name: "Cireng",                                   price: 12000 },
      { name: "Croffle",                                  price: 16000 },
      { name: "Risol",                                    price: 12000 },
    ],
    "Dimsum": [
      { name: "Lumpia Udang",                             price: 15500 },
      { name: "Udang Keju",                               price: 15500 },
      { name: "Udang Rambutan",                           price: 15500 },
      { name: "Siomay Ayam",                              price: 15500 },
    ],
    "Mie V. Manis": [
      { name: "Mie Level V.Manis Lv 0",                  price: 15000 },
      { name: "Mie Level V.Manis Lv 1",                  price: 15000 },
      { name: "Mie Level V.Manis Lv 2",                  price: 15000 },
      { name: "Mie Level V.Manis Lv 3",                  price: 15000 },
      { name: "Mie Level V.Manis Lv 4",                  price: 15000 },
      { name: "Mie Level V.Manis Lv 5",                  price: 17500 },
      { name: "Mie Level V.Manis Lv 6",                  price: 17500 },
      { name: "Mie Level V.Manis Lv 7",                  price: 17500 },
      { name: "Mie Level V.Manis Lv 8",                  price: 17500 },
    ],
    "Mie V. Asin": [
      { name: "Mie Level V.Asin Lv 1",                   price: 15000 },
      { name: "Mie Level V.Asin Lv 2",                   price: 15000 },
      { name: "Mie Level V.Asin Lv 3",                   price: 15000 },
      { name: "Mie Level V.Asin Lv 4",                   price: 15000 },
      { name: "Mie Level V.Asin Lv 5",                   price: 17500 },
      { name: "Mie Level V.Asin Lv 6",                   price: 17500 },
      { name: "Mie Level V.Asin Lv 7",                   price: 17500 },
      { name: "Mie Level V.Asin Lv 8",                   price: 17500 },
    ],
    "Nasi Daun Jeruk": [
      { name: "Nasi Daun Jeruk Ayam Krikil Sambal Geprek",  price: 25000 },
      { name: "Nasi Daun Jeruk Kulit Crispy Sambal Geprek", price: 25000 },
      { name: "Nasi Daun Jeruk Kulit Crispy Sambal Matah",  price: 25000 },
      { name: "Nasi Daun Jeruk Ayam Krikil Sambal Matah",   price: 25000 },
    ],
    "Spaghetti": [
      { name: "Spaghetti Bolognese",                      price: 24000 },
      { name: "Spaghetti Carbonara",                      price: 26000 },
    ],
  },
  /* ── AYAM KERATON ──────────────────────────────────────────────────────── */
  "AYAM KERATON": {
    "Paket Hemat": [
      { name: "Ayam Bakar hitam manis Paket Hemat (ayam negeri)", price: 19000 },
      { name: "Ayam Kremes Paket Hemat (ayam negeri)",            price: 19000 },
    ],
    "Harga Ayam Pejantan": [
      { name: "Ayam Bakar kampung hitam manis",           price: 35000 },
      { name: "Ayam Goreng Telur",                        price: 35000 },
      { name: "Ayam Kremes kampung",                      price: 35000 },
      { name: "Ayam Rempah keraton",                      price: 35000 },
    ],
    "Menu Lainnya": [
      { name: "BOCI GTC",                                 price: 17000 },
      { name: "Roti Bakar Coklat",                        price: 18000 },
      { name: "Roti Bakar Coklat Keju",                   price: 19000 },
      { name: "Roti Bakar Keju",                          price: 18000 },
      { name: "Tahu Bakso",                               price: 21000 },
    ],
  },
  /* ── DURIAN, JUS & CEMILAN ─────────────────────────────────────────────── */
  "DURIAN, JUS & CEMILAN": {
    "Minuman": [
      { name: "Alpokat Kocok GTC",                        price: 16000 },
      { name: "Buah naga kocok GTC",                      price: 18000 },
      { name: "Durian / Mix Alpokat GTC",                 price: 18000 },
      { name: "Durian Kocok GTC",                         price: 18000 },
      { name: "Jus Alpokat",                              price: 16000 },
      { name: "Jus Anggur",                               price: 16000 },
      { name: "Jus B. Naga",                              price: 15000 },
      { name: "Jus Jambu",                                price: 15000 },
      { name: "Jus Jeruk",                                price: 14000 },
      { name: "Jus Mangga",                               price: 16000 },
      { name: "Jus Melon",                                price: 15000 },
      { name: "Jus Nanas",                                price: 15000 },
      { name: "Jus Sirsak",                               price: 16000 },
      { name: "Jus Strawberry",                           price: 16000 },
      { name: "Mangga kocok GTC",                         price: 18000 },
      { name: "Stroberi kocok GTC",                       price: 18000 },
      { name: "Strobery kocok GTC",                       price: 18000 },
      { name: "Es Dawet",                                 price: 15000 },
      { name: "Es Dawet Durian",                          price: 18000 },
      { name: "Jus Semangka",                             price: 15000 }
    ],
    "Pempek / Cemilan": [
      { name: "Bakso Goreng",                             price: 15000 },
      { name: "Kentang Goreng",                           price: 15000 },
      { name: "Mix Plater",                               price: 18000 },
      { name: "Mix Platter",                              price: 18000 },
      { name: "Nuget ayam",                               price: 15000 },
      { name: "Siomay goreng (ikan tengiri)",             price: 16000 },
      { name: "Sosis goreng",                             price: 15000 },
      { name: "Kentang goreng",                           price: 15000 },
      { name: "Mendoan",                                  price: 14000 },
      { name: "Pempek kapal selam GTC",                   price: 20500 },
      { name: "Sempolan ayam isi 5",                      price: 14000 },
      { name: "Tahu Bakso",                               price: 16000 }
    ]
  },
  /* ── EL NASGOR ─────────────────────────────────────────────────────────── */
  "EL NASGOR": {
    "Makanan Berat": [
      { name: "Bihun goreng spesial",                     price: 23000 },
      { name: "Bihun goreng Telor",                       price: 17000 },
      { name: "Indomie Goreng Telor",                     price: 15000 },
      { name: "Kwetiau Goreng Spesial",                   price: 25000 },
      { name: "Nasgor Ayam",                              price: 20000 },
      { name: "Nasgor Telor",                             price: 17000 },
      { name: "Nasi Ayam Suwir",                          price: 17000 },
      { name: "Nasi Bakar Tongkol",                       price: 17000 },
      { name: "Nasi Goreng Spesial",                      price: 24000 },
      { name: "Nasi Putih",                               price:  6000 },
      { name: "Paket Nasi Taichan",                       price: 25000 },
      { name: "Paket Soto Segeran & Nasi",                price: 21000 },
      { name: "Sate Kulit Usus Taichan",                  price: 15000 },
      { name: "Taichan Daging",                           price: 25000 },
    ],
  },
  /* ── GOLDEN TELLER ─────────────────────────────────────────────────────── */
  "GOLDEN TELLER": {
    "Smoothie Bowl": [
      { name: "Berry Booster",                            price: 39000 },
      { name: "Pina Colada",                              price: 33000 },
      { name: "Pink Dragon",                              price: 29000 },
      { name: "Tropical Green",                           price: 34000 },
      { name: "Tropical Twist",                           price: 28000 },
      { name: "UBE DELIGHT",                              price: 27000 },
      { name: "Banana Fudge",                             price: 27000 },
      { name: "Golden Durian",                            price: 29000 },
      { name: "Golden Mango",                             price: 28000 },
      { name: "Tropical Island",                          price: 28000 }
    ],
    "Dessert": [
      { name: "Cireng Ayam Suwir",                        price: 13000 },
      { name: "Dubai Pistachio Donut",                    price: 20000 },
      { name: "Risol Cokelat",                            price: 19000 },
      { name: "Wonton Goreng",                            price: 16000 },
      { name: "Wonton Pedas (Rebus)",                     price: 16000 },
      { name: "Berry Choco Kunafa Pistachio",             price: 36000 },
      { name: "Cireng Kuah Keju",                         price: 23000 },
      { name: "Dubai Tray Choco",                         price: 39000 },
      { name: "Mango Cloud Donut",                        price: 16000 },
      { name: "Singkong Balado",                          price: 15000 },
      { name: "STRAWBERRY CLOUD DONUT",                   price: 16000 }
    ],
    "Es Teler": [
      { name: "Es Teller Durian",                         price: 28000 },
      { name: "Es Teller Ice Cream",                      price: 28000 },
      { name: "Es Teler Keju",                            price: 23000 },
      { name: "Es Teller Original",                       price: 18000 }
    ]
  },
};

export type MenuItemDB = {
  id?: number;
  brand: string;
  sub_category: string;
  name: string;
  price: number;
  image_url?: string;
};

type MenuData = Record<string, Record<string, MenuItemDB[]>>;
export type MenuItem = { name: string; price: number; image_url?: string };

interface MenuContextType {
  menuData: MenuData;
  categories: string[];
  addMenuItem: (brand: string, subCat: string, item: MenuItem) => Promise<void>;
  updateMenuItem: (brand: string, subCat: string, index: number, item: MenuItem) => Promise<void>;
  deleteMenuItem: (brand: string, subCat: string, index: number) => Promise<void>;
  addSubCategory: (brand: string, subCat: string) => void;
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuData, setMenuData] = useState<MenuData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Derive categories dynamically from live menuData so that newly added
  // brands fetched from Supabase appear in MenuCategoryTabs' card grid.
  // NOTE: FullMenuModal no longer reads from this context — it reads directly
  // from SubBrandContext (sub_brands → sub_categories → menus) which is the
  // canonical live-data source for all newly-created sub-brands.
  // Fall back to INITIAL_MENU_DATA keys while menuData is still loading.
  const categories =
    Object.keys(menuData).length > 0
      ? Object.keys(menuData)
      : Object.keys(INITIAL_MENU_DATA);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data, error } = await supabase.from("menu_items").select("*");
      
      if (error) {
        console.error("Error fetching menu data", error);
        // Fallback to initial data if table doesn't exist yet
        organizeData(getSeedData());
        setIsLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        // Seed
        const seedData = getSeedData();
        const { data: inserted, error: insertError } = await supabase.from("menu_items").insert(seedData).select();
        
        if (insertError) {
          console.error("Error seeding data", insertError);
          organizeData(seedData); // fallback to local
        } else if (inserted) {
          organizeData(inserted as MenuItemDB[]);
        }
      } else {
        organizeData(data as MenuItemDB[]);
      }
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  function getSeedData(): MenuItemDB[] {
    const seedData: MenuItemDB[] = [];
    for (const [brand, subCats] of Object.entries(INITIAL_MENU_DATA)) {
      for (const [subCat, items] of Object.entries(subCats)) {
        for (const item of items) {
          seedData.push({
            brand,
            sub_category: subCat,
            name: item.name,
            price: item.price
          });
        }
      }
    }
    return seedData;
  }

  function organizeData(data: MenuItemDB[]) {
    const formatted: MenuData = {};
    // ensure brands from INITIAL_MENU_DATA exist to keep tabs orderly
    Object.keys(INITIAL_MENU_DATA).forEach(b => formatted[b] = {});
    
    for (const row of data) {
      if (!formatted[row.brand]) formatted[row.brand] = {};
      if (!formatted[row.brand][row.sub_category]) formatted[row.brand][row.sub_category] = [];
      formatted[row.brand][row.sub_category].push(row);
    }
    
    // Sort items by id or name if needed, assuming insertion order is fine
    setMenuData(formatted);
  }

  const addMenuItem = async (brand: string, subCat: string, item: MenuItem) => {
    const newItem: Omit<MenuItemDB, "id"> = {
      brand,
      sub_category: subCat,
      name: item.name,
      price: item.price,
      ...(item.image_url !== undefined ? { image_url: item.image_url } : {}),
    };
    const { data, error } = await supabase.from("menu_items").insert([newItem]).select();
    
    if (error) {
      alert("Gagal menambah menu ke database: " + error.message);
      return;
    }
    
    if (data && data[0]) {
      setMenuData((prev) => {
        const newData = { ...prev };
        if (!newData[brand]) newData[brand] = {};
        if (!newData[brand][subCat]) newData[brand][subCat] = [];
        newData[brand][subCat] = [...newData[brand][subCat], data[0] as MenuItemDB];
        return newData;
      });
    }
  };

  const updateMenuItem = async (brand: string, subCat: string, index: number, item: MenuItem) => {
    const existing = menuData[brand]?.[subCat]?.[index];
    if (!existing || !existing.id) {
      alert("ID item tidak ditemukan, tidak bisa diupdate ke database.");
      return;
    }

    const updatePayload: { name: string; price: number; image_url?: string } = {
      name: item.name,
      price: item.price,
    };
    if (item.image_url !== undefined) {
      updatePayload.image_url = item.image_url;
    }

    const { error } = await supabase
      .from("menu_items")
      .update(updatePayload)
      .eq("id", existing.id);

    if (error) {
      alert("Gagal mengupdate menu: " + error.message);
      return;
    }

    setMenuData((prev) => {
      const newData = { ...prev };
      if (newData[brand] && newData[brand][subCat]) {
        const newItems = [...newData[brand][subCat]];
        newItems[index] = {
          ...newItems[index],
          name: item.name,
          price: item.price,
          ...(item.image_url !== undefined ? { image_url: item.image_url } : {}),
        };
        newData[brand][subCat] = newItems;
      }
      return newData;
    });
  };

  const deleteMenuItem = async (brand: string, subCat: string, index: number) => {
    const existing = menuData[brand]?.[subCat]?.[index];
    if (!existing || !existing.id) {
      alert("ID item tidak ditemukan, tidak bisa dihapus dari database.");
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", existing.id);

    if (error) {
      alert("Gagal menghapus menu: " + error.message);
      return;
    }

    setMenuData((prev) => {
      const newData = { ...prev };
      if (newData[brand] && newData[brand][subCat]) {
        const newItems = [...newData[brand][subCat]];
        newItems.splice(index, 1);
        newData[brand][subCat] = newItems;
      }
      return newData;
    });
  };

  const addSubCategory = (brand: string, subCat: string) => {
    setMenuData((prev) => {
      if (prev[brand] && prev[brand][subCat]) return prev;
      const newData = { ...prev };
      if (!newData[brand]) newData[brand] = {};
      newData[brand][subCat] = [];
      return newData;
    });
  };

  return (
    <MenuContext.Provider value={{ menuData, categories, addMenuItem, updateMenuItem, deleteMenuItem, addSubCategory, isLoading }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
