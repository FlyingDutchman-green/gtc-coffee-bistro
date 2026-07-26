"use client";

import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
 * Dataset master GTC — harga dalam integer (Rupiah).
 * Dikonversi ke format "XK" / "X.5K" saat render via formatPrice().
 * Struktur: Brand → Sub-kategori → Item[]
 * ───────────────────────────────────────────────────────────────────────────── */
const GTC_MENU_DATA: Record<string, Record<string, { name: string; price: number }[]>> = {

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
      { name: "MOURO PISTACIO",                           price: 25000 },
    ],
    "Cake & Ice Cream": [
      { name: "[PROMO] HOT DOG",                          price: 19000 },
      { name: "BANANA ICE CREAM",                         price: 13000 },
      { name: "BURGER MIX",                               price: 24000 },
      { name: "CHIKEN SPICY",                             price: 25000 },
      { name: "ICE CREAM",                                price: 20000 },
      { name: "MAC & CHEESE",                             price: 20000 },
    ],
    "Black Coffee": [
      { name: "AFFOGATO",                                 price: 21000 },
      { name: "AMERICANO",                                price: 15000 },
      { name: "COFFEE LATTE",                             price: 21000 },
      { name: "ESPRESSO",                                 price: 12000 },
      { name: "KOPI TUBRUK",                              price: 15000 },
      { name: "KOPI SANGER",                              price: 18000 },
      { name: "VIETNAM DRIP",                             price: 18000 },
    ],
    "Other": [
      { name: "AIR MINERAL",                              price:  6000 },
      { name: "BLUE SPARKLING",                           price: 12000 },
      { name: "GREEN TEA",                                price: 12000 },
      { name: "JERUK",                                    price: 10000 },
      { name: "LEMON SPARKLING",                          price: 12000 },
      { name: "MELON SPARKLING",                          price: 12000 },
      { name: "ORANGE SPARKLING",                         price: 12000 },
      { name: "RED SPARKLING",                            price: 12000 },
      { name: "TEH",                                      price:  6000 },
      { name: "THAI TEA",                                 price: 12000 },
      { name: "LEMON TEA",                                price: 12000 },
    ],
    "Frutycano": [
      { name: "BERRY HONEY AMERICANO",                    price: 23000 },
      { name: "LIMEPRESSO",                               price: 21000 },
      { name: "TRIPLE PEACH AMERICANO",                   price: 24000 },
      { name: "COCONUT BLACK",                            price: 19000 },
    ],
    "Milk Factory": [
      { name: "CHOCOLATTE",                               price: 20000 },
      { name: "DARK CHOCO",                               price: 20000 },
      { name: "MILOSAURUS",                               price: 21000 },
      { name: "OREO CREAMY LATTE",                        price: 21000 },
      { name: "REDVELVET",                                price: 20000 },
      { name: "STRAWBERRY LATTE",                         price: 20000 },
    ],
    "Matcha Base": [
      { name: "MATCHA CREAM CHEESE",                      price: 23000 },
      { name: "MATCHA ICE CREAM",                         price: 25000 },
      { name: "MATCHA LATTE",                             price: 20000 },
      { name: "MATCHA PISTACIO",                          price: 20000 },
      { name: "STRAWBERRY MATCHA",                        price: 23000 },
    ],
    "Taro": [
      { name: "TARO CREAM CHEESE",                        price: 20000 },
      { name: "TARO ICE CREAM",                           price: 23000 },
      { name: "TARO LATTE",                               price: 18000 },
    ],
    "Lava Toast": [
      { name: "TOAST ICE CREAM",                          price: 26000 },
      { name: "TOAST MATCHA",                             price: 20000 },
      { name: "TOAST MILO",                               price: 20000 },
    ],
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
      { name: "Durian Kocok GTC",                         price: 18000 },
      { name: "Jus Alpokat",                              price: 16000 },
      { name: "Jus Anggur",                               price: 16000 },
      { name: "Jus B. Naga",                              price: 15000 },
      { name: "Jus Jambu",                                price: 14000 },
      { name: "Jus Mangga",                               price: 16000 },
      { name: "Jus Melon",                                price: 15000 },
      { name: "Jus Nanas",                                price: 15000 },
      { name: "Jus Sirsak",                               price: 16000 },
      { name: "Jus Strawberry",                           price: 16000 },
      { name: "Mangga kocok GTC",                         price: 18000 },
      { name: "Melon kocok GTC",                          price: 18000 },
      { name: "Strobery kocok GTC",                       price: 18000 },
      { name: "Strobery kocok GTC Oreo",                  price: 18000 },
      { name: "Es Dawet",                                 price: 15000 },
      { name: "Es Dawet Durian",                          price: 18000 },
      { name: "Jus Semangka",                             price: 15000 },
      { name: "Jus Tomat",                                price: 15000 },
    ],
    "Pempek / Cemilan": [
      { name: "Cireng Goreng",                            price: 15000 },
      { name: "Kentang Goreng",                           price: 15000 },
      { name: "Mix Platter",                              price: 18000 },
      { name: "Nuget ayam",                               price: 15000 },
      { name: "Siomay goreng (Ikan tengiri)",             price: 16000 },
      { name: "Sosis goreng",                             price: 15000 },
      { name: "Otak Otak",                                price: 14000 },
      { name: "Pempek kapal selam GTC",                   price: 20500 },
      { name: "Ssempolan ayam isi 5",                     price: 14000 },
    ],
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
      { name: "Pink Dragon",                              price: 32000 },
      { name: "Tropical Green",                           price: 34000 },
      { name: "Tropical Twist",                           price: 28000 },
      { name: "UBE DELIGHT",                              price: 27000 },
      { name: "Banana Fudge",                             price: 29000 },
      { name: "Durian Mango",                             price: 28000 },
      { name: "Tropical Island",                          price: 28000 },
    ],
    "Dessert": [
      { name: "Cireng Ayam Suwir",                        price: 13000 },
      { name: "Dubai Pistachio Donut",                    price: 20000 },
      { name: "Risol Cokelat",                            price: 19000 },
      { name: "Wonton Goreng",                            price: 16000 },
      { name: "Wonton Pedas Kunala Pistacio",             price: 36000 },
      { name: "Berry Choco Kunafa Pistachio",             price: 36000 },
      { name: "Cireng Kuah Keju",                         price: 23000 },
      { name: "Dubai Tray Choco",                         price: 39000 },
      { name: "Mango Cloud Donut",                        price: 16000 },
      { name: "Singkong Balado",                          price: 15000 },
      { name: "Strawberry Cloud Donut",                   price: 16000 },
    ],
    "Es Teler": [
      { name: "Durian Ice Cream",                         price: 28000 },
      { name: "Es Teler Keju",                            price: 23000 },
      { name: "Es Teler Original",                        price: 18000 },
    ],
  },
};

/* Derived constants — auto-generated dari keys GTC_MENU_DATA agar selalu sinkron */
const CATEGORIES = Object.keys(GTC_MENU_DATA) as (keyof typeof GTC_MENU_DATA)[];

/* ─────────────────────────────────────────────────────────────────────────────
 * Helper: konversi harga integer ke format "XK" atau "X.5K"
 * 15000 → "15K" | 17500 → "17.5K" | 20500 → "20.5K"
 * ───────────────────────────────────────────────────────────────────────────── */
function formatPrice(price: number): string {
  const k = price / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k}K`;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Helper: hitung total item dalam satu brand
 * ───────────────────────────────────────────────────────────────────────────── */
function countItems(brand: string): number {
  const subCats = GTC_MENU_DATA[brand];
  if (!subCats) return 0;
  return Object.values(subCats).reduce((sum, items) => sum + items.length, 0);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Props
 * ───────────────────────────────────────────────────────────────────────────── */
export interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Komponen modal
 * ───────────────────────────────────────────────────────────────────────────── */
export function FullMenuModal({ isOpen, onClose, activeCategory, setActiveCategory }: FullMenuModalProps) {
  const [show, setShow] = useState(false);

  /* Pastikan activeCategory selalu valid — fallback ke tab pertama */
  const resolvedCategory = CATEGORIES.includes(activeCategory as typeof CATEGORIES[number])
    ? activeCategory
    : CATEGORIES[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  const subCategories = GTC_MENU_DATA[resolvedCategory] ?? {};
  const totalItems = countItems(resolvedCategory);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#121212]/95 backdrop-blur-md transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        className={`relative w-full max-w-2xl bg-[#121212] border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crema-50/10 px-6 py-5 bg-[#151515] shrink-0">
          <h2 id="menu-title" className="font-sans text-xl font-bold text-amber-bistro tracking-[0.2em] uppercase leading-none">
            FULL MENU
          </h2>
          <button
            onClick={handleClose}
            className="text-crema-300/50 hover:text-crema-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded-full p-1 -mt-1 -mr-1"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 7 Category Tabs */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-crema-50/10 bg-[#151515] shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors relative focus-visible:outline-none focus-visible:bg-crema-50/5 ${
                resolvedCategory === cat ? "text-amber-bistro" : "text-crema-300/50 hover:text-crema-50"
              }`}
            >
              {cat}
              {resolvedCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-bistro" />
              )}
            </button>
          ))}
        </div>

        {/* Brand + total item badge */}
        <div className="px-6 pt-4 pb-1 flex items-center gap-2 shrink-0">
          <span className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium">
            {resolvedCategory}
          </span>
          <span className="text-[10px] text-crema-300/40 font-medium">
            — {totalItems} item
          </span>
        </div>

        {/* Menu Items dengan sub-kategori sticky header */}
        <div className="px-6 pb-4 overflow-y-auto max-h-[60vh] flex flex-col">
          {Object.entries(subCategories).map(([subCat, items]) => (
            <div key={subCat} className="mb-2">
              {/* Sub-kategori sticky header */}
              <div className="sticky top-0 z-10 bg-[#121212]/98 backdrop-blur-sm py-2 mb-1">
                <p className="text-[9px] tracking-[0.22em] uppercase text-amber-bistro/70 font-bold border-b border-amber-bistro/15 pb-1.5">
                  {subCat}
                </p>
              </div>
              {/* Item rows */}
              {items.map((item, idx) => (
                <div
                  key={`${subCat}-${idx}`}
                  className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-[13px] font-medium text-crema-50 tracking-wide leading-snug">
                    {item.name}
                  </span>
                  <span className="font-mono text-[13px] font-bold text-amber-bistro whitespace-nowrap shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
