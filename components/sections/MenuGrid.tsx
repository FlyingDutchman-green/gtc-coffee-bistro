"use client";

/**
 * components/sections/MenuGrid.tsx — Dynamic Sub-Brands + Best Sellers
 *
 * ✅ Fetches sub_brands and best_sellers from Supabase (via SubBrandContext)
 * ✅ Clicking a sub-brand card activates it (gold border/glow)
 * ✅ Best-sellers section below reactively shows up to 3 items for the active brand
 * ✅ RSC-compatible: this whole file is "use client" (below-fold interactive)
 * ✅ Portrait blueprint layout: 6-col high-density cards + horizontal best-seller rows
 * ✅ Smooth Framer Motion transitions: card opacity depth + panel fade/slide on brand switch
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSubBrand } from "@/context/SubBrandContext";
import { FullMenuModal } from "@/components/sections/FullMenuModal";
import type { SubBrand, BestSeller } from "@/lib/types";

// ── Utility: convert raw price string to K-suffix format ────────────────────
// e.g. "35000" → "35K", "28500" → "28.5K"
function formatPriceK(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return raw;
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return raw;
}

// ── Utility: get icon character for a brand ─────────────────────────────────
function getBrandIcon(iconName: string, brandName: string): string {
  const iconMap: Record<string, string> = {
    coffee: "☕",
    ramen: "🍜",
    chicken: "🍗",
    noodle: "🍝",
    rice: "🍚",
    bistro: "🍽",
    food: "🍴",
    drink: "🥤",
  };
  const key = (iconName ?? "").toLowerCase();
  for (const [k, v] of Object.entries(iconMap)) {
    if (key.includes(k)) return v;
  }
  return brandName.charAt(0).toUpperCase();
}

// ── TIER 1: Outer height wrapper — expands/collapses on open/close only ─────
const heightWrapperVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto" as const,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
};

// ── TIER 2: Inner content cross-fade — smooth horizontal slide on brand switch
const contentFadeVariants = {
  initial: { opacity: 0, x: 25 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: -25,
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

// ── Section header scroll-in variant ──────────────────────────────────────────
const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ── TIER 3: Premium Entrance Animation ─────────────────────────────────────────
const carouselContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardItemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 70, damping: 16 },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Sub-Brand Portrait Card — high-density vertical portrait layout
// ══════════════════════════════════════════════════════════════════════════════
function SubBrandCard({
  brand,
  isActive,
  onClick,
}: {
  brand: SubBrand;
  isActive: boolean;
  onClick: () => void;
}) {
  const icon = getBrandIcon(brand.icon_name ?? "", brand.name);

  return (
    <motion.button
      variants={cardItemVariants}
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "group relative flex flex-col overflow-hidden rounded-xl text-left",
        // Fixed-width snap card across all viewports; sized per breakpoint
        "w-[82vw] sm:w-[300px] md:w-[220px] lg:w-[200px] xl:w-[210px] shrink-0 snap-center",
        // Hardware-accelerated: opacity + ring + shadow all transition together
        "transition-all duration-300 ease-out focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950",
        // Inactive cards dim to 60% — hovering or active restores to full opacity
        // This creates the "depth" effect: active card pops, others recede
        isActive
          ? "opacity-100 ring-2 ring-amber-bistro shadow-[0_0_20px_2px_rgba(212,146,78,0.25)]"
          : "opacity-60 hover:opacity-100 ring-1 ring-crema-50/10 hover:ring-amber-bistro/40 hover:shadow-lg hover:shadow-espresso-950/60",
      ].join(" ")}
    >
      {/* ── Top Bar: Icon circle + Count badge ─────────────────────────────── */}
      <div
        className={[
          "flex items-center justify-between px-2.5 py-2",
          isActive ? "bg-amber-bistro/15" : "bg-espresso-800",
          "transition-colors duration-300",
        ].join(" ")}
      >
        {/* Icon in muted circle */}
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-espresso-700 text-[11px] leading-none"
          aria-hidden="true"
        >
          {icon}
        </span>
        {/* Item count badge */}
        <span
          className={[
            "rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
            isActive
              ? "bg-amber-bistro text-espresso-950"
              : "bg-espresso-700 text-crema-300/80",
            "transition-colors duration-300",
          ].join(" ")}
        >
          {brand.item_count > 0 ? `${brand.item_count} items` : "—"}
        </span>
      </div>

      {/* ── Portrait Image Area ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {brand.image_url ? (
          <Image
            src={brand.image_url}
            alt={brand.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 16vw"
            style={{ willChange: "transform" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-espresso-800 to-espresso-900 flex items-center justify-center">
            <span className="font-serif text-5xl font-bold text-amber-bistro/25 select-none">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-espresso-950/10 to-transparent"
        />
        {/* Active gold overlay — CSS opacity transition, no mount/unmount flash */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-amber-bistro/12 mix-blend-overlay transition-opacity duration-300"
          style={{ opacity: isActive ? 1 : 0 }}
        />
      </div>

      {/* ── Text Content Area (Bottom) ──────────────────────────────────────── */}
      <div
        className={[
          "flex flex-col gap-1 px-2.5 py-2.5 transition-colors duration-300",
          isActive ? "bg-espresso-700" : "bg-espresso-800 group-hover:bg-espresso-700",
        ].join(" ")}
      >
        {/* Brand title with chevron */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={[
              "font-sans text-[10px] font-bold uppercase tracking-widest leading-tight truncate",
              isActive ? "text-amber-bistro" : "text-crema-50",
              "transition-colors duration-300",
            ].join(" ")}
          >
            {brand.name}
          </span>
          {/* Chevron rotates smoothly on active */}
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className={[
              "h-2.5 w-2.5 shrink-0 text-amber-bistro transition-transform duration-300",
              isActive ? "rotate-90" : "rotate-0",
            ].join(" ")}
            aria-hidden="true"
          >
            <path
              d="M4.5 2.5L7.5 6L4.5 9.5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Description — always visible */}
        {brand.description && (
          <p className="font-sans text-[9px] leading-relaxed text-crema-300/60 line-clamp-3 sm:line-clamp-2">
            {brand.description}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Horizontal Best Seller Item Row — split left text / right image layout
// ══════════════════════════════════════════════════════════════════════════════
function BestSellerRow({ item }: { item: BestSeller }) {
  return (
    <li className="flex items-center rounded-xl overflow-hidden ring-1 ring-amber-bistro/12 bg-espresso-900 hover:ring-amber-bistro/30 transition-all duration-300 group">
      {/* Left: Text column — grows to fill available space, no overflow */}
      <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0 px-3 py-3">
        {/* Menu name */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-medium tracking-wider text-crema-300/45 uppercase leading-none">
            Nama menu
          </span>
          <span className="text-xs font-bold text-crema-50 leading-snug line-clamp-1">
            {item.name}
          </span>
        </div>
        {/* Description */}
        {item.description && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-medium tracking-wider text-crema-300/45 uppercase leading-none">
              Deskripsi
            </span>
            <span className="text-[10px] text-crema-300/65 leading-relaxed line-clamp-2">
              {item.description}
            </span>
          </div>
        )}
        {/* Price in K-format */}
        <div className="pt-0.5">
          <span className="font-mono text-base font-bold text-amber-bistro tracking-tight">
            {formatPriceK(item.price)}
          </span>
        </div>
      </div>

      {/* Right: 4:3 landscape image frame — fixed aspect so image is never squished */}
      <div className="relative flex-shrink-0 w-28 aspect-[4/3] self-center m-2 rounded-lg overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url as string}
            alt={item.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="112px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-espresso-800 to-espresso-950 flex items-center justify-center">
            <span className="font-serif text-2xl font-bold text-amber-bistro/20 select-none">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Subtle left-edge gradient for blending with card bg */}
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-espresso-900/40 to-transparent" />
        {/* Badge pinned to bottom */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1 bg-espresso-950/80 backdrop-blur-sm">
          <span className="text-[7px] tracking-[0.18em] uppercase font-bold text-amber-bistro leading-none">
            {item.badge || "SIGNATURE"}
          </span>
        </div>
      </div>
    </li>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Best Sellers Content — pure inner content, animated by parent wrappers
// ══════════════════════════════════════════════════════════════════════════════
function BestSellersContent({
  brand,
  items,
}: {
  brand: SubBrand;
  items: BestSeller[];
}) {
  const capped = items.slice(0, 3);

  return (
    <div className="rounded-2xl border border-amber-bistro/20 bg-espresso-800 overflow-hidden shadow-[0_0_40px_-8px_rgba(212,146,78,0.18)]">
      {/* ── Section Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8 border-b border-amber-bistro/10">
        <p className="mb-1 text-[10px] tracking-[0.2em] uppercase text-[#D4A373] font-medium">
          ✦ Best Sellers
        </p>
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-crema-50 uppercase tracking-wide">
          {brand.name}
        </h3>
        {brand.description && (
          <p className="mt-2 text-sm text-crema-300/65 leading-relaxed max-w-2xl">
            {brand.description}
          </p>
        )}
      </div>

      {/* ── Items ───────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 md:px-8">
        {capped.length === 0 ? (
          <p className="text-crema-300/40 text-sm py-8 text-center">
            Belum ada menu best seller untuk sub-brand ini.
          </p>
        ) : (
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capped.map((item) => (
              <BestSellerRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer redirect link ─────────────────────────────────────────────── */}
      <div className="px-6 pb-5 md:px-8 md:pb-6 flex justify-end">
        <a
          href="#menu-full"
          className="group inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-amber-bistro/70 hover:text-amber-bistro transition-colors duration-200"
          aria-label={`View full ${brand.name} menu`}
        >
          FULL MENU
          <span
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-Brands Grid — 6-column portrait grid + single best-seller panel
// ══════════════════════════════════════════════════════════════════════════════
function SubBrandsGrid() {
  const {
    subBrands,
    bestSellers,
    isLoadingBrands,
    refetchBestSellers,
  } = useSubBrand();

  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // ── Carousel scroll position tracking (for conditional arrow visibility) ──
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setIsAtStart(scrollLeft <= 5);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial state
    return () => el.removeEventListener("scroll", handleScroll);
  }, [subBrands]); // re-attach when brands load

  // ── Full Menu Modal state (local to this component tree) ──────────────────
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [fullMenuCategory, setFullMenuCategory] = useState("MINUMAN (MOURO)");

  // Intercept any #menu-full anchor clicks globally (mirrors MenuCategoryTabs)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.getAttribute("href")?.endsWith("#menu-full")) {
        e.preventDefault();
        setIsFullMenuOpen(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const activeBrand = subBrands.find((b) => b.id === activeId) ?? null;
  const activeBestSellers = activeId ? (bestSellers[activeId] ?? []) : [];

  // Pre-fetch best sellers for first brand on mount (runs once)
  useEffect(() => {
    if (!didInitRef.current && subBrands.length > 0) {
      didInitRef.current = true;
      setActiveId(subBrands[0].id);
      refetchBestSellers(subBrands[0].id);
    }
  }, [subBrands, refetchBestSellers]);

  const handleSelect = useCallback(
    (brand: SubBrand) => {
      setActiveId((prev) => {
        if (prev === brand.id) return null; // toggle-to-collapse
        refetchBestSellers(brand.id);
        // Scroll to panel smoothly on mobile
        setTimeout(() => {
          panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 50);
        return brand.id;
      });
    },
    [refetchBestSellers],
  );

  if (isLoadingBrands) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton: horizontal scroll row */}
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse">
              <div className="h-9 bg-espresso-800" />
              <div className="aspect-[3/4] bg-espresso-800/80" />
              <div className="bg-espresso-800 px-2.5 py-2.5 flex flex-col gap-1.5">
                <div className="h-2.5 bg-espresso-700 rounded w-3/4" />
                <div className="h-2 bg-espresso-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subBrands.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Sub-brand portrait card carousel (unified horizontal slider) ── */}
      <div className="relative w-full group">
        {/* Scrollable carousel container — single horizontal row at all sizes */}
        <motion.div
          key={subBrands.length}
          ref={carouselRef}
          variants={carouselContainerVariants}
          initial="initial"
          animate="animate"
          role="tablist"
          aria-label="Sub-brand categories"
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none gap-4 pb-4"
        >
          {subBrands.map((brand) => (
            <SubBrandCard
              key={brand.id}
              brand={brand}
              isActive={activeId === brand.id}
              onClick={() => handleSelect(brand)}
            />
          ))}
        </motion.div>

        {/* ── Floating slide navigation buttons (visible at all viewports) ── */}
        {!isAtStart && (
          <button
            type="button"
            onClick={() => carouselRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-amber-bistro ring-1 ring-crema-50/15 hover:bg-black/70 transition-all duration-300 shadow-lg flex items-center justify-center"
            aria-label="Scroll previous"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {!isAtEnd && (
          <button
            type="button"
            onClick={() => carouselRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-amber-bistro ring-1 ring-crema-50/15 hover:bg-black/70 transition-all duration-300 shadow-lg flex items-center justify-center"
            aria-label="Scroll next"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Two-tier animated best sellers panel ───────────────────────────── */}
      {/* TIER 1: Outer height wrapper — static key, only collapses on null  */}
      {/* TIER 2: Inner content cross-fade — dynamic key per active brand    */}
      <div ref={panelRef}>
        <AnimatePresence>
          {activeBrand && (
            <motion.div
              key="best-sellers-panel-container"
              variants={heightWrapperVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  variants={contentFadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <BestSellersContent brand={activeBrand} items={activeBestSellers} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Full Menu Modal ─────────────────────────────────────────────────── */}
      <FullMenuModal
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        activeCategory={fullMenuCategory}
        setActiveCategory={setFullMenuCategory}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Root export — unified single section, no dead props
// ══════════════════════════════════════════════════════════════════════════════
export default function MenuGrid() {
  return (
    <>
      {/* ── Unified: Six Reasons to Stay Longer ─────────────────────────── */}
      <section
        id="menu"
        aria-labelledby="menu-heading"
        className="relative w-full bg-espresso-950 py-24 md:py-32 lg:py-40"
      >
        {/* Top separator */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-crema-50/10 to-transparent"
        />
        {/* Decorative radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,146,78,0.05) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">
          {/* Section header — scroll-triggered entry */}
          <motion.div
            className="flex flex-col gap-6 mb-12 md:flex-row md:justify-between md:items-end lg:mb-16"
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-[#D4A373] text-xs tracking-[0.25em] uppercase font-medium">
                <span className="inline-block h-px w-6 bg-[#D4A373]" aria-hidden="true" />
                What We Serve
              </span>
              <h2
                id="menu-heading"
                className="font-serif text-4xl font-bold leading-tight tracking-tight text-crema-50 sm:text-5xl"
              >
                Seven Reasons to{" "}
                <span className="font-serif text-amber-500/90">
                  Stay Longer
                </span>
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-crema-300/65 font-light">
                Tujuh sub-brand kuliner GTC tersaji dalam satu tempat — ketuk kategori mana pun
                untuk menelusuri menu lengkap, atau singgah dan tanyakan sajian spesial hari ini.
              </p>
            </div>
            {/* Full Menu action button — triggers MenuCategoryTabs modal via #menu-full anchor */}
            <div className="shrink-0">
              <a
                href="#menu-full"
                className="group inline-flex items-center gap-2 rounded-full border border-amber-bistro/40 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A373] transition-all duration-300 hover:border-amber-bistro hover:bg-amber-bistro/10 hover:shadow-[0_0_20px_-4px_rgba(212,146,78,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950"
                aria-label="View the full menu"
              >
                Full Menu
                <span
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </div>
          </motion.div>

          {/* Dynamic sub-brands grid + single best sellers panel */}
          <SubBrandsGrid />
        </div>
      </section>
    </>
  );
}
