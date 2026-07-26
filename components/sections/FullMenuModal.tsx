"use client";

import { useState, useEffect } from "react";

import { useMenu } from "@/context/MenuContext";

/* ─────────────────────────────────────────────────────────────────────────────
 * Helper: konversi harga integer ke format "XK" atau "X.5K"
 * 15000 → "15K" | 17500 → "17.5K" | 20500 → "20.5K"
 * ───────────────────────────────────────────────────────────────────────────── */
function formatPrice(price: number): string {
  const k = price / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k}K`;
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
  const { menuData, categories } = useMenu();

  /* Pastikan activeCategory selalu valid — fallback ke tab pertama */
  const resolvedCategory = categories.includes(activeCategory)
    ? activeCategory
    : categories[0] || "";

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

  const subCategories = menuData[resolvedCategory] ?? {};
  
  // Calculate total items
  let totalItems = 0;
  if (menuData[resolvedCategory]) {
    totalItems = Object.values(menuData[resolvedCategory]).reduce((sum, items) => sum + items.length, 0);
  }

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

        {/* Category Tabs */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-crema-50/10 bg-[#151515] shrink-0">
          {categories.map(cat => (
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
