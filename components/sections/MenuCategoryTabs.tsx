"use client";

/**
 * MenuCategoryTabs — komponen leaf terisolasi "use client" untuk PRD §4.3.
 *
 * Tanggung jawab ganda (keduanya membutuhkan JS klien):
 *   1. Animasi masuk kartu bertahap melalui Framer Motion whileInView
 *   2. Status tab/akordeon untuk panel daftar item lengkap di bawah grid
 *
 * Batasan PRD §4.3 yang dipatuhi di sini:
 *   ✅ Tanpa perluasan hover yang mengubah tata letak — hanya skala/opasitas
 *      pada batas kartu yang tetap (elemen div kartu itu sendiri tidak berubah ukuran)
 *   ✅ whileInView + viewport={{ once: true, margin: "-50px" }} per desain.md §2.1
 *   ✅ Khusus Compositor: opacity + y (tidak memicu layout/paint)
 *   ✅ LazyMotion + domAnimation (Anggaran JS Bundle PRD §3)
 *   ✅ prefers-reduced-motion dihormati melalui useReducedMotion()
 *   ✅ willChange: "opacity, transform" pada elemen yang dianimasikan
 *   ✅ Stagger (bertahap): 0.08s/kartu per desain.md §2.1 §4.3 row
 *   ✅ Durasi animasi maksimal: 0.60s per desain.md §2.1
 *
 * Perilaku hover (hanya pembungkus dalam kartu — kartu luar berukuran tetap):
 *   - Gambar: scale(1.06) via CSS transition — terkomposisi GPU
 *   - Permukaan kartu: overlay kuning amber opacity-0 → opacity-100 — khusus compositor
 *   - Batas kartu: pendaran halus via box-shadow — statis, tidak dianimasikan
 *   TIDAK ADA: animasi height/width/padding/margin — dilarang per desain.md §2
 */

import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { useState, useId, useRef, useEffect } from "react";
import Image from "next/image";
import type { MenuCategory } from "@/lib/menu-data";
import { FullMenuModal } from "./FullMenuModal";
import { useMenu } from "@/context/MenuContext";

const CARD_TO_MODAL_TAB: Record<string, string> = {
  "GOLDEN TELLER & CEMILAN": "GOLDEN TELLER",
};

/* ── Konfigurasi animasi bersama (desain.md §2.1 baris MenuGrid) ─────────────────── */
const VIEWPORT = { once: true, margin: "-50px" } as const;

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const panelVariant = {
  hidden: { opacity: 0, x: 25 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -25, transition: { duration: 0.25, ease: "easeIn" as const } },
};

/* ── Peta ikon kategori (SVG sebaris — tanpa font ikon, tanpa permintaan HTTP ekstra) ── */
const CategoryIcon = ({ id, className }: { id: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    // MINUMAN (MOURO) — ikon cangkir kopi
    mouro: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12l-1.5 9H7.5L6 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 11S6 14 6 16a6 6 0 0012 0c0-2-1.5-5-1.5-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6h2a2 2 0 010 4h-2" />
      </svg>
    ),
    // RAMENIKU — ikon mangkuk ramen
    rameniku: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16v1a8 8 0 01-16 0v-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7c0-1.1.9-2 2-2h4a2 2 0 012 2v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7c0-1 .5-2 1.5-2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7c0-1 .5-2 1.5-2.5" />
      </svg>
    ),
    // MIE JAGOAN — ikon garpu mie
    "mie-jagoan": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12c4 0 6-2 6-4V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3l1 5-1 5 1 3v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 3v18" />
      </svg>
    ),
    // AYAM KERATON — ikon api/bakaran
    "ayam-keraton": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0 1.5-1 2.5-1 4a1 1 0 002 0c0-1.5-1-2.5-1-4z" />
      </svg>
    ),
    // EL NASGOR — ikon panci wok
    "el-nasgor": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10c0 5 2 9 7 9s7-4 7-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10h2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7c1-2 2-3 4-3s3 1 4 3" />
      </svg>
    ),
    // GOLDEN TELLER & CEMILAN — ikon es / bintang
    "golden-teller": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };
  return <>{icons[id] ?? null}</>;
};

/* ── Kartu Kategori ───────────────────────────────────────────────────────── */
interface CardProps {
  category: MenuCategory;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  panelId: string;
  dynamicItemCount: number;
}

function CategoryCard({ category, index, isSelected, onSelect, panelId, dynamicItemCount }: CardProps) {
  const shouldReduce = useReducedMotion();

  return (
    <m.div
      className="relative flex flex-col h-full"
      variants={cardVariant}
      initial={shouldReduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      custom={index * 0.08}
      style={{ willChange: "opacity, transform" }}
    >
      <button
        type="button"
        id={`tab-${category.id}`}
        aria-controls={panelId}
        aria-selected={isSelected}
        aria-expanded={isSelected}
        role="tab"
        onClick={(e) => onSelect(category.id, e)}
        className={[
          /* h-full: mengisi tinggi m.div agar semua kartu dalam satu baris grid sama tinggi */
          "group relative flex flex-col overflow-hidden rounded-2xl text-left h-full",
          "ring-1 transition-shadow duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950",
          isSelected
            ? "ring-amber-bistro/60 shadow-lg shadow-amber-bistro/10"
            : "ring-crema-50/8 hover:ring-crema-50/20 hover:shadow-xl hover:shadow-espresso-950/60",
        ].join(" ")}
      >
        {/*
         * ── Wadah gambar: aspect-ratio dideklarasikan SEBELUM gambar dimuat → CLS = 0 ──
         * Kelas Tailwind aspect-ratio (`aspect-[3/4]`) dikendalikan dari
         * category.imageAspect di menu-data.ts.
         * `position: relative` diperlukan untuk mode fill next/image.
         * overflow-hidden pada elemen INI memotong efek hover scale(1.06)
         * sehingga gambar diukur DALAM batas tetap — tanpa pergeseran tata letak.
         */}
        <div className={`relative w-full ${category.imageAspect} overflow-hidden`}>
          <Image
            src={category.image.src}
            alt={category.image.alt}
            fill
            /* Di bawah lipatan — pemuatan lambat bawaan per PRD §4.2/§4.3.
             * Tidak ada preload / fetchPriority / loading="eager" di sini. */
            sizes={category.imageSizes}
            className={[
              "object-cover object-center",
              /* Transformasi skala hanya compositor — nol dampak tata letak.
               * Parent overflow-hidden memotongnya pada batas kartu tetap. */
              "transition-transform duration-700 ease-out",
              "group-hover:scale-[1.06]",
            ].join(" ")}
            style={{ willChange: "transform" }}
          />

          {/* Overlay gradien: selalu ada, opacity dianimasikan saat hover (khusus compositor) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/20 to-transparent transition-opacity duration-300 group-hover:opacity-80"
          />

          {/* Overlay merek kuning amber saat hover — hanya opacity (compositor) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-amber-bistro/0 transition-[opacity] duration-300 group-hover:bg-amber-bistro/8"
            style={{ mixBlendMode: "multiply" }}
          />

          {/* Ikon kategori — lencana kiri atas */}
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-espresso-900/70 backdrop-blur-sm text-amber-bistro ring-1 ring-crema-50/10"
          >
            <CategoryIcon id={category.id} className="h-4 w-4" />
          </div>

          {/* Lencana jumlah item — kanan atas */}
          <span className="absolute top-3 right-3 rounded-full bg-espresso-900/70 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-crema-300/80 ring-1 ring-crema-50/10">
            {dynamicItemCount} items
          </span>
        </div>

        {/* Blok info kartu — flex-1 mengisi sisa tinggi setelah gambar.
           * justify-between: judul selalu di atas, deskripsi selalu di bawah.
           * min-h-[5.5rem]: baseline seragam meski nama brand panjang/pendek. */}
        <div className="flex flex-1 flex-col justify-between bg-espresso-800 px-4 py-4 min-h-[5.5rem] transition-colors duration-300 group-hover:bg-espresso-700">
          {/* Baris atas: nama brand + chevron — min-h-[2.5rem] & items-start
              memastikan baris ini tidak kolaps saat nama brand wrap ke 2 baris */}
          <div className="flex min-h-[2.5rem] items-start justify-between gap-2">
            <span className="font-sans text-sm font-semibold tracking-wide text-crema-50 leading-snug">
              {category.name}
            </span>
            {/* Indikator terpilih — memutar panah (hanya transform). JANGAN UBAH. */}
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className={`mt-0.5 h-4 w-4 shrink-0 text-amber-bistro transition-transform duration-300 ${isSelected ? "rotate-90" : "rotate-0"}`}
              aria-hidden="true"
            >
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Deskripsi selalu di bawah karena justify-between pada parent */}
          <p className="font-sans text-xs leading-relaxed text-crema-300/65 line-clamp-2 mt-1.5">
            {category.teaser}
          </p>
        </div>
      </button>
    </m.div>
  );
}

/* ── Panel Item (muncul di bawah kotak grid penuh saat kategori dipilih) ─────────── */
interface PanelProps {
  category: MenuCategory;
  panelId: string;
  onOpenFullMenu: (categoryName: string) => void;
  allBestSellers?: any[];
}

function ItemPanel({ category, panelId, onOpenFullMenu, allBestSellers = [] }: PanelProps) {
  const bestSellers = allBestSellers.filter((bs: any) => bs.sub_brands?.name === category.name).slice(0, 3);

  return (
    <m.div
      key={category.id}
      id={panelId}
      role="tabpanel"
      aria-labelledby={`tab-${category.id}`}
      variants={panelVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ willChange: "opacity, transform" }}
      className="rounded-2xl border border-crema-50/8 bg-espresso-800 p-6 md:p-8"
    >
      {/* Header panel */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] tracking-[0.2em] uppercase text-[#D4A373] font-medium">
            Best Sellers
          </p>
          <h3 className="font-serif text-2xl font-bold text-crema-50">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-crema-300/65">{category.teaser}</p>
        </div>
      </div>

      {/* MOBILE LIST (Hidden on sm+) */}
      <div className="flex sm:hidden flex-col gap-5 mb-6 mt-4">
        {bestSellers.length === 0 && <p className="text-crema-300/40 text-sm italic">Belum ada menu best seller</p>}
        {bestSellers.map((item: any) => (
          <div key={item.name} className="flex items-end justify-between gap-4 group">
            <span className="text-[14px] font-bold tracking-wide text-white">
              {item.name}
            </span>
            <div className="flex-1 border-b-[1.5px] border-dotted border-white/20 mb-[5px] opacity-60 transition-opacity group-hover:opacity-100" />
            <span className="text-[14px] font-bold font-mono text-[#D4A373]">
              {item.price}
            </span>
          </div>
        ))}
      </div>

      {/* DESKTOP GRID (Hidden on mobile) */}
      <ul
        role="list"
        className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {bestSellers.length === 0 && <p className="text-crema-300/40 text-sm italic col-span-3">Belum ada menu best seller</p>}
        {bestSellers.map((item: any) => (
          <li
            key={item.id || item.name}
            className={[
              "relative flex flex-col rounded-xl overflow-hidden",
              "bg-espresso-900 ring-1 ring-crema-50/6",
              "transition-transform duration-200 ease-out hover:scale-[1.02]",
              "hover:ring-amber-bistro/30",
            ].join(" ")}
            style={{ willChange: "transform" }}
          >
            {item.image_url ? (
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image src={item.image_url as string} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 28vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/90 via-transparent to-transparent" />
                {item.badge && (
                   <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-[#121212] bg-amber-bistro font-bold px-2 py-0.5 rounded-full">
                     {item.badge}
                   </span>
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-[4/3] bg-espresso-800 flex items-center justify-center">
                 {item.badge && (
                   <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-[#121212] bg-amber-bistro font-bold px-2 py-0.5 rounded-full">
                     {item.badge}
                   </span>
                 )}
                 <span className="text-amber-bistro/40 text-3xl font-serif">{item.name.charAt(0)}</span>
              </div>
            )}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
              <span className="text-sm font-semibold text-crema-100 leading-snug">
                {item.name}
              </span>
              <p className="text-xs leading-relaxed text-crema-300/60 line-clamp-2">
                {item.description}
              </p>
              <span className="mt-auto pt-2 text-sm font-bold text-[#D4A373] font-mono">
                {item.price}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tombol CTA lihat menu lengkap */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onOpenFullMenu(category.name);
          }}
          className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-bistro hover:text-gold-accent transition-colors duration-200 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-800 rounded"
        >
          FULL {category.name.toUpperCase()} MENU &rarr;
        </button>
      </div>
    </m.div>
  );
}

/* ── Ekspor root — grid interaktif lengkap + panel ─────────────────────── */
interface MenuCategoryTabsProps {
  categories: readonly MenuCategory[];
  allBestSellers?: any[];
}

export function MenuCategoryTabs({ categories, allBestSellers = [] }: MenuCategoryTabsProps) {
  const shouldReduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const { menuData } = useMenu();

  const getDynamicItemCount = (categoryName: string) => {
    const brand = CARD_TO_MODAL_TAB[categoryName] ?? categoryName;
    const subCategories = menuData[brand];
    if (!subCategories) return 0;
    return Object.values(subCategories).reduce((sum, items) => sum + items.length, 0);
  };

  // Tab State
  const [selectedId, setSelectedId] = useState<string>(categories[0].id);
  const panelId = useId();
  const fullPanelId = `menu-panel-${panelId}`;
  const selectedCategory = categories.find((c) => c.id === selectedId)!;

  // Lifted Modal State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("MINUMAN (MOURO)");

  const handleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedId((prev) => (prev === id ? "" : id));
  };

  const handleOpenFullMenu = (categoryName: string) => {
    /* Peta dari 6 nama kartu homepage ke 7 tab modal.
     * "GOLDEN TELLER & CEMILAN" (kartu) → "GOLDEN TELLER" (tab modal). */
    setActiveCategory(CARD_TO_MODAL_TAB[categoryName] ?? categoryName);
    setIsMenuOpen(true);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.getAttribute("href")?.endsWith("#menu-full")) {
        e.preventDefault();
        setIsMenuOpen(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      const atStart = scrollLeft <= 5;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 5;
      
      setIsAtStart((prev) => (prev !== atStart ? atStart : prev));
      setIsAtEnd((prev) => (prev !== atEnd ? atEnd : prev));
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Set initial state
    }
    
    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="flex flex-col gap-6">
        {/*
         * ── GRID RESPONSIF / PITA GULIR ─────────────────────────────
         *
         * Mobile (< 640px): pita gulir horizontal snap-x
         *   Per desain.md §1.1: scroll-snap-type: x mandatory melalui `snap-x snap-mandatory`
         *   Pengguliran asli CSS — tanpa penangan sentuh JS (tetap di luar utas utama)
         *   Setiap kartu: snap-start, shrink-0, lebar 85vw
         *
         * Tablet (640px – 1023px): grid-cols-3 dengan wrap
         * Desktop (≥ 1024px): grid-cols-5 per PRD §4.3
         */}
        <div className="relative">
          <div
            ref={scrollRef}
            role="tablist"
            aria-label="Menu categories"
            className={[
              /* Ponsel: pita gulir snap-x horizontal dengan flex.
               * items-stretch EKSPLISIT: paksa semua kartu sama tinggi
               * mengikuti kartu tertinggi, baik di mode flex (mobile)
               * maupun grid (tablet/desktop). */
              "flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
              /* Sembunyikan bilah gulir dekoratif tanpa memblokir fungsi gulir */
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              /* Tablet: grid 2→3 kolom, items-stretch diteruskan otomatis */
              "sm:grid sm:grid-cols-2 sm:items-stretch sm:overflow-x-visible sm:pb-0 sm:snap-none",
              /* Mid-tablet: 3 kolom */
              "md:grid-cols-3",
              /* Desktop: semua 6 brand card dalam satu baris */
              "lg:grid-cols-6",
            ].join(" ")}
          >
            {categories.map((category, index) => (
              <div
                key={category.id}
                /* Mobile: kartu snap lebar tetap; tablet/desktop: otomatis.
                 * h-full: isi penuh tinggi cross-axis yang sudah di-stretch
                 * oleh items-stretch pada parent. flex-col meneruskan rantai
                 * ke m.div dan button di dalamnya. */
                className="shrink-0 w-[78vw] snap-start sm:w-auto sm:snap-align-none flex flex-col h-full"
              >
                <CategoryCard
                  category={category}
                  index={index}
                  isSelected={selectedId === category.id}
                  onSelect={handleSelect}
                  panelId={fullPanelId}
                  dynamicItemCount={getDynamicItemCount(category.name)}
                />
              </div>
            ))}
          </div>

          {/* Tombol scroll ke kiri (Mundur) */}
          {!isAtStart && (
            <button
              type="button"
              onClick={() => {
                if (isAtEnd) {
                  scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                  scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 block md:hidden h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-amber-bistro ring-1 ring-crema-50/10 hover:bg-black/60 transition-all duration-300 shadow-lg"
              aria-label="Scroll previous"
            >
              <div className="flex h-full w-full items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>
          )}

          {/* Tombol scroll ke kanan (Maju) */}
          {!isAtEnd && (
            <button
              type="button"
              onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 block md:hidden h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-amber-bistro ring-1 ring-crema-50/10 hover:bg-black/60 transition-all duration-300 shadow-lg"
              aria-label="Scroll next"
            >
              <div className="flex h-full w-full items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}
        </div>
        
        {/* ── Panel item — AnimatePresence untuk animasi masuk/keluar ── */}
        <AnimatePresence mode="wait">
          {selectedId && (
            <ItemPanel
              key={selectedCategory.id}
              category={selectedCategory}
              panelId={fullPanelId}
              onOpenFullMenu={handleOpenFullMenu}
              allBestSellers={allBestSellers}
            />
          )}
        </AnimatePresence>
      </div>
      <FullMenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />
    </LazyMotion>
  );
}
