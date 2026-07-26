/**
 * MenuGrid — `components/sections/MenuGrid.tsx`
 *
 * Server Component (RSC default, tanpa "use client").
 * Semua interaktivitas dan animasi didelegasikan ke leaf <MenuCategoryTabs>.
 *
 * Checklist kepatuhan PRD §4.3:
 *   Enam kategori sub-brand operasional:
 *   MINUMAN (MOURO) | RAMENIKU | MIE JAGOAN | AYAM KERATON | EL NASGOR | GOLDEN TELLER & CEMILAN
 *   ✅ Mobile: geser horizontal scroll-snap (CSS asli, tanpa penangan sentuh JS)
 *      Keputusan didokumentasikan di desain.md §1.1
 *   ✅ Kartu = gambar (wadah aspect-ratio, lazy next/image) + nama + teaser + jumlah
 *   ✅ Tidak ada perluasan saat hover yang mengubah tata letak — hanya skala/opasitas, batas kartu tetap
 *      (overflow-hidden pada wadah gambar memotong skala di dalam batas)
 *   ✅ Daftar item lengkap melalui "use client" diisolasi hanya pada MenuCategoryTabs.tsx
 *   ✅ Efek masuk bertahap: whileInView + opasitas+y per desain.md §2.1
 *   ✅ Tidak ada preload/fetchPriority pada gambar kategori — semuanya di bawah lipatan
 *
 * Aliran data (Sourcing statis PRD §2):
 *   menuCategories (lib/menu-data.ts) → MenuGrid (RSC) → MenuCategoryTabs (client)
 *   Semua data diselesaikan saat build time. Tidak ada pengambilan runtime di jalur kritis.
 */

import { menuCategories } from "@/lib/menu-data";
import { MenuCategoryTabs } from "./MenuCategoryTabs";

export default function MenuGrid() {
  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="relative w-full bg-espresso-950 py-24 md:py-32 lg:py-40"
    >
      {/* Garis pemisah atas yang halus */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-crema-50/10 to-transparent"
      />

      {/* Cahaya radial dekoratif — murni CSS, tanpa JS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,146,78,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">

        {/* ── Header Seksi ──────────────────────────────────────────── */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-16">
          <div className="flex flex-col gap-3">
            {/* Alis teks */}
            <span className="inline-flex items-center gap-2 text-amber-bistro text-xs tracking-[0.25em] uppercase font-medium">
              <span className="inline-block h-px w-6 bg-amber-bistro" aria-hidden="true" />
              What We Serve
            </span>

            {/*
             * H2 — Serif Playfair Display.
             * Statis dirender dari server — tidak ada animasi di tingkat header
             * (header seksi berada di atas grid kategori yang memiliki animasinya sendiri).
             * id terhubung ke aria-labelledby pada <section>.
             */}
            <h2
              id="menu-heading"
              className="font-serif text-4xl font-bold leading-tight tracking-tight text-crema-50 sm:text-5xl"
            >
              Six Reasons to{" "}
              <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-bistro to-gold-accent">
                Stay Longer
              </em>
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-crema-300/65 font-light">
              Enam sub-brand kuliner GTC tersaji dalam satu tempat — ketuk kategori mana pun untuk menelusuri menu lengkap, atau singgah dan tanyakan sajian spesial hari ini.
            </p>
          </div>

          {/* CTA "Menu Lengkap" — jangkar (anchor) semantik, dapat dinavigasi keyboard */}
          <a
            href="#menu-full"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-crema-50/15 px-6 py-2.5 text-xs font-medium tracking-widest uppercase text-crema-200 hover:border-amber-bistro/50 hover:text-amber-bistro transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950"
          >
            Full Menu
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/*
         * ── Grid interaktif — didelegasikan ke leaf "use client" ──────────
         *
         * MenuCategoryTabs menerima data statis `categories` (objek biasa yang
         * dapat diserialisasi) dari Server Component ini — ini adalah pola oper data
         * RSC → komponen klien yang benar.
         *
         * Tata letak grid (grid-cols-6 / grid-cols-3 / grid-cols-2 / scroll-snap)
         * diimplementasikan di dalam MenuCategoryTabs menggunakan utilitas Tailwind dan
         * CSS scroll-snap — tanpa komputasi tata letak JS.
         */}
        <MenuCategoryTabs categories={menuCategories} />
      </div>
    </section>
  );
}
