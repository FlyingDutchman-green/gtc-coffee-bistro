"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
 * Interface untuk selected item
 * ───────────────────────────────────────────────────────────────────────────── */
interface SelectedMenuItem {
  id?: number;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  description?: string;
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
  const [selectedItem, setSelectedItem] = useState<SelectedMenuItem | null>(null);
  const [detailShow, setDetailShow] = useState(false);
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

  /* Animasi masuk detail modal */
  useEffect(() => {
    if (selectedItem) {
      const timer = setTimeout(() => setDetailShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setDetailShow(false);
    }
  }, [selectedItem]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const handleCloseDetail = () => {
    setDetailShow(false);
    setTimeout(() => setSelectedItem(null), 250);
  };

  if (!isOpen) return null;

  const subCategories = menuData[resolvedCategory] ?? {};

  // Calculate total items
  let totalItems = 0;
  if (menuData[resolvedCategory]) {
    totalItems = Object.values(menuData[resolvedCategory]).reduce((sum, items) => sum + items.length, 0);
  }

  return (
    <>
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
                {/* Item rows — clickable */}
                {items.map((item, idx) => (
                  <button
                    key={`${subCat}-${idx}`}
                    onClick={() =>
                      setSelectedItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url ?? undefined,
                        category: subCat,
                        description: undefined,
                      })
                    }
                    className="w-full flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0 text-left group hover:bg-amber-bistro/5 active:bg-amber-bistro/10 rounded-lg px-2 -mx-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-bistro/50"
                    aria-label={`Lihat detail ${item.name}`}
                  >
                    <span className="text-[13px] font-medium text-crema-50 tracking-wide leading-snug group-hover:text-amber-bistro transition-colors duration-150">
                      {item.name}
                    </span>
                    <span className="font-mono text-[13px] font-bold text-amber-bistro whitespace-nowrap shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Detail Menu Modal ──────────────────────────────────────────────── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Detail */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-250 ${detailShow ? "opacity-100" : "opacity-0"}`}
            onClick={handleCloseDetail}
            aria-hidden="true"
          />

          {/* Detail Card */}
          <div
            className={`relative w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-250 ease-out ${detailShow ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-menu-title"
          >
            {/* Tombol Close pojok kanan atas */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 transition-all duration-150 rounded-full p-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Tutup detail menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Gambar Produk */}
            <div className="relative w-full aspect-square shrink-0 bg-gray-100 overflow-hidden">
              {selectedItem.image_url ? (
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              ) : (
                /* Placeholder jika tidak ada gambar */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200">
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="w-16 h-16 text-gray-300"
                    aria-hidden="true"
                  >
                    <rect width="64" height="64" rx="12" fill="currentColor" />
                    <path
                      d="M20 44 L28 32 L34 40 L40 34 L48 44 Z"
                      fill="white"
                      opacity="0.7"
                    />
                    <circle cx="24" cy="26" r="4" fill="white" opacity="0.7" />
                  </svg>
                  <span className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                    Foto tidak tersedia
                  </span>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="px-6 py-5 text-gray-900 overflow-y-auto">
              {/* Badge Kategori */}
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 mb-3">
                {selectedItem.category}
              </span>

              {/* Nama Menu */}
              <h3
                id="detail-menu-title"
                className="text-xl font-bold text-gray-900 leading-tight mb-3"
              >
                {selectedItem.name}
              </h3>

              {/* Deskripsi (jika ada) */}
              {selectedItem.description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {selectedItem.description}
                </p>
              )}

              {/* Harga */}
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                  Harga
                </span>
                <span className="text-2xl font-black text-amber-600 tracking-tight">
                  Rp {selectedItem.price.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
