"use client";

/**
 * FullMenuModal — reads EXCLUSIVELY from SubBrandContext (sub_brands →
 * sub_categories → menus tables in Supabase).
 *
 * Data flow:
 *  • Tab bar  → subBrands[]            (sub_brands table, fetched on mount)
 *  • Sections → subCategories[brandId] (sub_categories table)
 *  • Items    → menus[subCatId]        (menus table)
 *
 * All sub-categories + their menus are fetched in exactly 2 Supabase queries
 * per tab via refetchMenusForBrand(), replacing the old N+1 pattern that caused
 * sub-categories to render as empty while their menus were still in-flight.
 *
 * totalItems is computed after the batch completes so it always matches the
 * actual item count visible in the admin dashboard.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSubBrand } from "@/context/SubBrandContext";
import type { SubBrand, SubCategory, Menu } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────────────────────── */

/** Convert a raw price string ("25000") to compact "25K" / "25.5K" format. */
function formatPriceK(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, "");
  const n = parseInt(cleaned, 10);
  if (isNaN(n)) return raw;
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return raw;
}

/** Parse a raw price string to an integer for Indonesian locale formatting. */
function parsePriceInt(raw: string): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────────────────────── */

interface SelectedMenuItem {
  id?: string;
  name: string;
  priceRaw: string;
  image_url?: string;
  category: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Props  — identical interface to previous implementation so all callers
 * (MenuGrid.tsx, MenuCategoryTabs.tsx) require zero changes.
 * ───────────────────────────────────────────────────────────────────────────── */
export interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently-active brand name (matched against SubBrand.name). */
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FullMenuModal
 * ───────────────────────────────────────────────────────────────────────────── */
export function FullMenuModal({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
}: FullMenuModalProps) {
  /* ── Animation state ─────────────────────────────────────────────────────── */
  const [show, setShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedMenuItem | null>(null);
  const [detailShow, setDetailShow] = useState(false);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  /* ── Live data from SubBrandContext ─────────────────────────────────────── */
  const {
    subBrands,
    subCategories,
    menus,
    refetchMenusForBrand,  // batch loader: 2 queries instead of N+1
    isLoadingCategories,
  } = useSubBrand();

  /* ── Resolve the active brand object from the name prop ─────────────────── */
  const resolvedBrand: SubBrand | undefined =
    subBrands.find((b) => b.name === activeCategory) ?? subBrands[0];

  const activeBrandId = resolvedBrand?.id ?? null;

  /* ── Sub-categories for the active brand ────────────────────────────────── */
  const activeCats: SubCategory[] = activeBrandId
    ? (subCategories[activeBrandId] ?? [])
    : [];

  const isFetchingActiveBrand = activeBrandId ? subCategories[activeBrandId] === undefined : false;

  /**
   * Total item count — sum over all sub-categories of the active brand.
   * After refetchMenusForBrand completes, every sub-cat slot is pre-filled
   * with [] (even if empty), so this accurately reflects the Supabase count.
   */
  const totalItems = activeCats.reduce(
    (sum, cat) => sum + (menus[cat.id]?.length ?? 0),
    0,
  );

  /* ── Body-scroll lock + open animation ──────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  /* ── Batch-fetch sub-categories + all their menus (2 queries total) ────────
     Called whenever the active brand or open state changes.
     refetchMenusForBrand pre-fills every sub-cat slot with [] so all sections
     render correctly in a single state update, eliminating the "Belum ada item"
     flash that the old N+1 approach caused. ─────────────────────────────────── */
  useEffect(() => {
    if (!activeBrandId || !isOpen) return;
    refetchMenusForBrand(activeBrandId);
  }, [activeBrandId, isOpen, refetchMenusForBrand]);

  /* ── Auto-scroll active tab into view ───────────────────────────────────── */
  useEffect(() => {
    if (activeBrandId && tabsRef.current[activeBrandId]) {
      tabsRef.current[activeBrandId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeBrandId, isOpen]);

  /* ── Detail modal open animation ────────────────────────────────────────── */
  useEffect(() => {
    if (selectedItem) {
      const t = setTimeout(() => setDetailShow(true), 10);
      return () => clearTimeout(t);
    } else {
      setDetailShow(false);
    }
  }, [selectedItem]);

  /* ── Handlers ────────────────────────────────────────────────────────────── */
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const handleCloseDetail = () => {
    setDetailShow(false);
    setTimeout(() => setSelectedItem(null), 250);
  };

  const handleSelectTab = (brand: SubBrand) => {
    setActiveCategory(brand.name);
  };

  if (!isOpen) return null;

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#121212]/95 backdrop-blur-md transition-opacity duration-300 ${
            show ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal Box */}
        <div
          className={`relative w-full max-w-2xl bg-[#121212] border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out max-h-[85vh] md:h-[80vh] md:min-h-[450px] ${
            show
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-title"
        >
          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-crema-50/10 px-6 py-5 bg-[#151515] shrink-0">
            <h2
              id="menu-title"
              className="font-sans text-xl font-bold text-amber-bistro tracking-[0.2em] uppercase leading-none"
            >
              FULL MENU
            </h2>
            <button
              onClick={handleClose}
              className="text-crema-300/50 hover:text-crema-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded-full p-1 -mt-1 -mr-1"
              aria-label="Close modal"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ── Brand Tab Navigation (one tab per sub_brand row in Supabase) ──── */}
          <div
            className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-none scroll-smooth [-webkit-overflow-scrolling:touch] border-b border-crema-50/10 bg-[#151515] shrink-0"
            role="tablist"
            aria-label="Sub-brand menu categories"
          >
            {subBrands.length === 0 ? (
              /* Skeleton tabs while subBrands are loading */
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 mx-2 my-4 h-3 w-16 rounded bg-crema-50/10 animate-pulse"
                />
              ))
            ) : (
              subBrands.map((brand) => {
                const isActive = resolvedBrand?.id === brand.id;
                return (
                  <button
                    key={brand.id}
                    ref={(el) => {
                      tabsRef.current[brand.id] = el;
                    }}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectTab(brand)}
                    className={`flex-shrink-0 px-4 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors relative focus-visible:outline-none focus-visible:bg-crema-50/5 ${
                      isActive
                        ? "text-amber-bistro"
                        : "text-crema-300/50 hover:text-crema-50"
                    }`}
                  >
                    {brand.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-bistro" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ── Brand label + live item count ─────────────────────────────────── */}
          <div className="px-6 pt-4 pb-1 flex items-center gap-2 shrink-0">
            <span className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium">
              {resolvedBrand?.name ?? ""}
            </span>
            <span className="text-[10px] text-crema-300/40 font-medium">
              — {isFetchingActiveBrand ? "memuat..." : `${totalItems} item`}
            </span>
          </div>

          {/* ── Sub-category sections + menu items ────────────────────────────── */}
          <div className="px-6 pb-4 overflow-y-auto flex-1 min-h-[350px] flex flex-col scrollbar-none overscroll-contain [overflow-anchor:none]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBrandId || "empty"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
                layout={false}
                className="flex flex-col transform-gpu will-change-[opacity,transform]"
              >
                {/* Overall loading state: batch fetch in progress, no cats yet */}
                {isLoadingCategories ? (
              <div className="flex flex-col gap-3 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-crema-50/5 animate-pulse"
                  />
                ))}
              </div>
            ) : isFetchingActiveBrand ? (
              null
            ) : activeCats.length === 0 ? (
              /* Brand has no sub-categories yet */
              <p className="py-8 text-center text-sm text-crema-300/40 italic">
                Belum ada kategori untuk brand ini.
              </p>
            ) : (
              activeCats.map((cat: SubCategory) => {
                /**
                 * undefined  → batch not yet finished for this cat (race guard;
                 *              normally the batch fills ALL cats in one setState)
                 * []         → fetched, genuinely empty sub-category
                 * [...items] → fetched with data — render all items
                 */
                const items: Menu[] | undefined = menus[cat.id];

                return (
                  <div key={cat.id} className="mb-2">
                    {/* Sticky sub-category header */}
                    <div className="sticky top-0 z-10 bg-[#121212]/98 backdrop-blur-sm py-2 mb-1">
                      <p className="text-[9px] tracking-[0.22em] uppercase text-amber-bistro/70 font-bold border-b border-amber-bistro/15 pb-1.5">
                        {cat.name}
                      </p>
                    </div>

                    {items === undefined ? (
                      /* Per-cat skeleton — only during a race condition; the
                         batch loader normally fills all cats simultaneously. */
                      <div className="h-8 rounded bg-crema-50/5 animate-pulse mb-1" />
                    ) : items.length === 0 ? (
                      <p className="text-[12px] text-crema-300/30 italic py-2 px-2">
                        Belum ada item.
                      </p>
                    ) : (
                      items.map((item: Menu, idx: number) => (
                        <button
                          key={`${cat.id}-${idx}`}
                          onClick={() =>
                            setSelectedItem({
                              id: item.id,
                              name: item.name,
                              priceRaw: item.price,
                              image_url: item.image_url ?? undefined,
                              category: cat.name,
                            })
                          }
                          className="w-full flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0 text-left group hover:bg-amber-bistro/5 active:bg-amber-bistro/10 rounded-lg px-2 -mx-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-bistro/50"
                          aria-label={`Lihat detail ${item.name}`}
                        >
                          <span className="text-[13px] font-medium text-crema-50 tracking-wide leading-snug group-hover:text-amber-bistro transition-colors duration-150">
                            {item.name}
                          </span>
                          <span className="font-mono text-[13px] font-bold text-amber-bistro whitespace-nowrap shrink-0">
                            {formatPriceK(item.price)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                );
              })
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Item Detail Modal ─────────────────────────────────────────────────── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-[250ms] ${
              detailShow ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleCloseDetail}
            aria-hidden="true"
          />

          {/* Detail Card */}
          <div
            className={`relative w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-[250ms] ease-out ${
              detailShow
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-menu-title"
          >
            {/* Close button */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 transition-all duration-150 rounded-full p-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Tutup detail menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Product Image */}
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

            {/* Content */}
            <div className="px-6 py-5 text-gray-900 overflow-y-auto">
              {/* Category badge */}
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 mb-3">
                {selectedItem.category}
              </span>

              {/* Item name */}
              <h3
                id="detail-menu-title"
                className="text-xl font-bold text-gray-900 leading-tight mb-3"
              >
                {selectedItem.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                  Harga
                </span>
                <span className="text-2xl font-black text-amber-600 tracking-tight">
                  Rp{" "}
                  {parsePriceInt(selectedItem.priceRaw).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
