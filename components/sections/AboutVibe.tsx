/**
 * AboutVibe — `components/sections/AboutVibe.tsx`
 *
 * Server Component (default RSC, tanpa "use client").
 * Semua animasi didelegasikan ke komponen leaf <AboutVibeMotion*>.
 *
 * Checklist kepatuhan PRD §4.2:
 *   ✅ Tata letak asimetris dua kolom menggunakan CSS Grid, BUKAN posisi yang dihitung JS
 *   ✅ next/image dengan pemuatan lambat bawaan (loading="lazy") — di bawah lipatan
 *      Tanpa `preload`, tanpa `loading="eager"`, tanpa `fetchPriority` — sesuai dokumentasi §loading
 *   ✅ Setiap slot gambar mendeklarasikan aspect-ratio sebelum gambar dimuat → CLS = 0
 *   ✅ Efek masuk melalui whileInView + viewport={{ once: true, margin: "-50px" }}
 *      (didelegasikan ke leaf AboutVibeMotion.tsx)
 *   ✅ "use client" diisolasi hanya pada AboutVibeMotion.tsx
 *
 * Arsitektur Grid:
 *   Tata letak asimetris ini menggunakan sistem area CSS Grid bernama:
 *   - Desktop (lg+): [teks | kolase] — rasio pembagian 5fr | 7fr
 *   - Kolase menggunakan CSS Grid 2×2 bersarang, di mana gambar potret besar
 *     mencakup dua baris dan dua gambar lebih kecil bertumpuk di kolom 2.
 *   - Tumpang tindih antar gambar dicapai dengan margin negatif pada gambar biji kopi,
 *     murni CSS — nol komputasi posisi JS.
 *   - Blok teks digeser secara vertikal via align-self: center + padding.
 */

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import {
  AboutVibeMotionProvider,
  Fade,
  StaggerList,
} from "./AboutVibeMotion";

export default function AboutVibe() {
  const { about } = siteConfig;

  return (
    <AboutVibeMotionProvider>
      <section
        id="about"
        aria-labelledby="about-heading"
        className="relative w-full overflow-hidden bg-espresso-900 py-24 md:py-32 lg:py-40"
      >
        {/* ── Tekstur latar belakang dekoratif ─────────────────────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(212,146,78,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">

          {/*
           * ── GRID ASIMETRIS UTAMA ──────────────────────────────────────
           * lg+  : [teks 5fr] [kolase 7fr]
           * md   : bertumpuk, teks di atas kolase
           * sm   : satu kolom
           *
           * PENTING: Semua ukuran kolom/baris ada di CSS (utilitas grid Tailwind).
           * TIDAK ADA komputasi posisi JS di bagian mana pun pada seksi ini.
           */}
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[5fr_7fr] lg:gap-20 xl:gap-28">

            {/* ══ KIRI: Blok teks ═══════════════════════════════════════ */}
            <div className="flex flex-col gap-8">

              {/* Alis teks */}
              <Fade delay={0}>
                <span className="inline-flex items-center gap-2 text-amber-bistro text-xs tracking-[0.25em] uppercase font-medium">
                  <span className="inline-block h-px w-6 bg-amber-bistro" aria-hidden="true" />
                  {about.eyebrow}
                </span>
              </Fade>

              {/* H2 — Playfair Display, multi-baris */}
              <Fade delay={0.1}>
                <h2
                  id="about-heading"
                  className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-crema-50 sm:text-5xl lg:text-[3.5rem]"
                >
                  {about.headline.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {i === 2 ? (
                        <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-bistro to-gold-accent">
                          {line}
                        </em>
                      ) : (
                        line
                      )}
                    </span>
                  ))}
                </h2>
              </Fade>

              {/* Paragraf isi */}
              <div className="flex flex-col gap-4">
                {about.body.map((para, i) => (
                  <Fade key={i} delay={0.18 + i * 0.1}>
                    <p className="text-crema-200/75 text-base leading-relaxed font-light max-w-lg">
                      {para}
                    </p>
                  </Fade>
                ))}
              </div>

              {/* Kutipan tarik */}
              <Fade delay={0.36}>
                <blockquote className="border-l-2 border-amber-bistro pl-5 my-2">
                  <p className="font-serif text-lg italic text-crema-100 leading-snug">
                    &ldquo;{about.pullQuote.text}&rdquo;
                  </p>
                  <footer className="mt-2 text-xs tracking-widest uppercase text-crema-300/50">
                    {about.pullQuote.attribution}
                  </footer>
                </blockquote>
              </Fade>

              {/* Tabel asal-usul */}
              <Fade delay={0.44}>
                <div className="pt-2">
                  <p className="text-xs tracking-[0.2em] uppercase text-crema-300/50 mb-4 font-medium">
                    {about.provenance.headline}
                  </p>
                  <StaggerList
                    items={about.provenance.origins}
                    baseDelay={0.5}
                  />
                </div>
              </Fade>

              {/* Desktop Badge: Neatly aligned below the list */}
              <Fade delay={0.52} className="hidden md:flex mt-2 lg:mt-6">
                <div className="pointer-events-none flex h-20 w-20 lg:h-24 lg:w-24 flex-col items-center justify-center rounded-full border border-amber-bistro/30 bg-espresso-900/80 backdrop-blur-sm shadow-xl">
                  <span className="font-serif text-2xl lg:text-3xl font-bold text-amber-bistro leading-none">
                    1
                  </span>
                  <span className="mt-0.5 text-[9px] tracking-widest uppercase text-crema-300/60 text-center leading-tight">
                    year of<br />craft
                  </span>
                </div>
              </Fade>
            </div>

            {/* ══ KANAN: Kolase gambar ════════════════════════════════════
             *
             * Struktur Grid (CSS Grid, tanpa JS):
             *
             *   kol 1 (potret besar)     kol 2 (dua bertumpuk)
             *   ┌──────────────────┐    ┌──────────────────┐
             *   │                  │    │  vibe-pour.jpg   │
             *   │  vibe-interior   │    │  [4:5 potret]    │
             *   │  [4:5 potret]    │    ├──────────────────┤
             *   │  row-span 2      │    │  vibe-beans.jpg  │
             *   │                  │    │  [19:6 lanskap]  │
             *   └──────────────────┘    └──────────────────┘
             ════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-8 md:block">
              <div
                className="relative grid grid-cols-2 gap-4 lg:gap-5 xl:gap-6"
                aria-label="Gallery — GTC Coffee & Bistro atmosphere"
              >

              {/* Kiri atas: potret interior */}
              <Fade delay={0.15} variant="fade" className="col-span-1">
                {/*
                 * aspect-ratio dideklarasikan SEBELUM gambar dimuat → CLS = 0
                 * Tailwind: aspect-[4/5]
                 * position:relative diwajibkan untuk gambar fill.
                 */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={about.images[0].src}
                    alt={about.images[0].alt}
                    fill
                    // Di bawah lipatan: pemuatan lambat bawaan (lazy loading).
                    // Tanpa preload / priority / fetchPriority (PRD §4.2)
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 420px"
                    className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                    style={{ willChange: "transform" }}
                  />
                  {/* Bayangan dalam yang halus untuk kedalaman */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl ring-1 ring-inset ring-crema-50/5"
                  />
                </div>
              </Fade>

              {/* Kanan atas: potret tuangan (pour) */}
              <Fade delay={0.25} variant="fade" className="col-span-1">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={about.images[1].src}
                    alt={about.images[1].alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 300px"
                    className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                    style={{ willChange: "transform" }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl ring-1 ring-inset ring-crema-50/5"
                  />
                </div>
              </Fade>

              {/* Bawah: biji lanskap lebar, mengisi penuh ruang kosong */}
              <Fade delay={0.35} variant="fade" className="col-span-2">
                <div className="relative w-full aspect-[19/6] overflow-hidden rounded-xl">
                  <Image
                    src={about.images[2].src}
                    alt={about.images[2].alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 300px"
                    className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                    style={{ willChange: "transform" }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl ring-1 ring-inset ring-crema-50/5"
                  />
                </div>
              </Fade>

              </div>

              {/* Lencana dekoratif (Mobile Only) - Sepenuhnya di luar frame gambar */}
              <div
                aria-hidden="true"
                className="flex justify-end pr-4 md:hidden"
              >
                <div className="pointer-events-none z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-amber-bistro/30 bg-espresso-900/80 backdrop-blur-sm shadow-xl">
                  <span className="font-serif text-2xl font-bold text-amber-bistro leading-none">
                    1
                  </span>
                  <span className="mt-0.5 text-[9px] tracking-widest uppercase text-crema-300/60 text-center leading-tight">
                    year of<br />craft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AboutVibeMotionProvider>
  );
}
