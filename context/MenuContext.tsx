"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

type MenuData = typeof INITIAL_MENU_DATA;
type MenuItem = { name: string; price: number };

interface MenuContextType {
  menuData: MenuData;
  categories: string[];
  addMenuItem: (brand: string, subCat: string, item: MenuItem) => void;
  updateMenuItem: (brand: string, subCat: string, index: number, item: MenuItem) => void;
  deleteMenuItem: (brand: string, subCat: string, index: number) => void;
  addSubCategory: (brand: string, subCat: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuData, setMenuData] = useState<MenuData>(INITIAL_MENU_DATA);

  const categories = Object.keys(menuData);

  const addMenuItem = (brand: string, subCat: string, item: MenuItem) => {
    setMenuData((prev) => {
      const newData = { ...prev };
      if (!newData[brand]) newData[brand] = {};
      if (!newData[brand][subCat]) newData[brand][subCat] = [];
      newData[brand][subCat] = [...newData[brand][subCat], item];
      return newData;
    });
  };

  const updateMenuItem = (brand: string, subCat: string, index: number, item: MenuItem) => {
    setMenuData((prev) => {
      const newData = { ...prev };
      if (newData[brand] && newData[brand][subCat]) {
        const newItems = [...newData[brand][subCat]];
        newItems[index] = item;
        newData[brand][subCat] = newItems;
      }
      return newData;
    });
  };

  const deleteMenuItem = (brand: string, subCat: string, index: number) => {
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
      if (prev[brand] && prev[brand][subCat]) return prev; // already exists
      const newData = { ...prev };
      if (!newData[brand]) newData[brand] = {};
      newData[brand][subCat] = [];
      return newData;
    });
  };

  return (
    <MenuContext.Provider value={{ menuData, categories, addMenuItem, updateMenuItem, deleteMenuItem, addSubCategory }}>
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
