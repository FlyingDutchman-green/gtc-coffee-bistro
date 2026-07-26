/**
 * Hero — `components/sections/Hero.tsx`
 *
 * Server Component (default RSC, tanpa "use client").
 * Interaksi animasi dipisahkan ke komponen leaf <HeroMotion> (lihat HeroMotion.tsx).
 *
 * Checklist kepatuhan PRD §4.1:
 *   ✅ next/image dengan preload={true} + loading="eager" + fetchPriority="high" (LCP)
 *      Catatan: priority sudah DEPRECATED di Next.js 16 — gunakan preload.
 *      preload TIDAK BOLEH digabung dengan loading atau fetchPriority sesuai dokumentasi.
 *      Gunakan preload={true} saja, atau loading="eager" + fetchPriority="high" saja.
 *      Kita menggunakan loading="eager" + fetchPriority="high" (tanpa preload) untuk kompatibilitas maksimal.
 *   ✅ Atribut `sizes` eksplisit untuk tiap breakpoint (pola asset-performance-wizard)
 *   ✅ Animasi H1: hanya opacity + y, dipicu saat mount, tanpa whileInView
 *   ✅ Container dengan aspect-ratio tetap sebelum gambar dimuat → CLS = 0
 *   ✅ Tombol CTA menggunakan elemen <a> semantik (lihat CTAButton di HeroMotion.tsx)
 *   ✅ Kode animasi diisolasi di komponen leaf "use client" HeroMotion
 *   ✅ LazyMotion + domAnimation di komponen animasi (bukan bundle penuh)
 */

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { HeroMotion } from "./HeroMotion";
import { MobileNavbar } from "./MobileNavbar";

export default function Hero() {
  const { hero } = siteConfig;

  return (
    /**
     * <header> sebagai penanda semantik (landmark) untuk hero utama.
     * aria-labelledby menghubungkannya ke H1 di dalam HeroMotion.
     */
    <header
      className="relative w-full"
      aria-label="GTC Coffee & Bistro — Hero"
    >
      {/*
       * ── Wadah aspect-ratio ──────────────────────────────────────────────
       * hero-aspect-shell (didefinisikan di globals.css) memesan ruang SEBELUM
       * gambar dimuat menggunakan aspect-ratio CSS, menjamin CLS = 0.
       * min-height mencegah keruntuhan (collapse) pada layar yang sangat sempit.
       */}
      <div className="hero-aspect-shell">

        {/*
         * ── LCP: Gambar latar hero ───────────────────────────────────────
         * priority={true}       → menonaktifkan lazy loading, menambah rel=preload
         * fetchPriority="high"  → mengatur API Fetch Priority (Chrome 101+)
         * atribut sizes disesuaikan tiap breakpoint agar browser memilih
         * sumber terkecil yang memadai dari srcset yang dihasilkan Next.js.
         * fill + object-cover meniru perilaku CSS background-size:cover
         * sambil tetap menjadi elemen <img> semantik (memenuhi syarat LCP, diindeks oleh pencarian).
         */}
        <Image
          src="/hero-bg.jpg"
          alt={hero.imageAlt}
          fill
          // Next.js 16: `priority` dihentikan penggunaannya. Gunakan loading="eager" +
          // fetchPriority="high" untuk gambar LCP (dokumentasi §preload).
          // JANGAN gabungkan preload={true} dengan loading atau fetchPriority.
          loading="eager"
          fetchPriority="high"
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
          className="object-cover object-center"
          // Next.js akan menyajikan AVIF, lalu WebP, lalu JPEG berdasarkan header Accept
        />

        {/*
         * ── Sistem overlay berlapis ───────────────────────────────────────
         * Lapisan 1: Gradien bawah yang pekat — teks terbaca di atas foto apa pun
         * Lapisan 2: Tepi vignette halus — bingkai sinematik
         * Lapisan 3: Warna hangat — kehangatan merek espresso
         * Semuanya melalui CSS: tanpa biaya layout/paint JS.
         */}

        {/* Lapisan 1: gradien utama untuk keterbacaan */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/55 to-transparent"
          style={{ zIndex: 1 }}
        />

        {/* Lapisan 2: vignette samping untuk kesan sinematik */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-espresso-950/40 via-transparent to-espresso-950/20"
          style={{ zIndex: 1 }}
        />

        {/* Lapisan 3: warna kuning hangat — menyatukan foto dengan palet merek */}
        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-multiply opacity-30"
          style={{
            background: "radial-gradient(ellipse at 70% 60%, #8b5e3c 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/*
         * ── Konten hero — lapisan animasi ────────────────────────────────
         * HeroMotion adalah satu-satunya komponen "use client" di bagian ini.
         * Komponen ini membungkus semua teks animasi + tombol CTA.
         * Posisinya absolut di atas gambar di dalam wadah.
         */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <HeroMotion
            headline={hero.headline}
            subheadline={hero.subheadline}
            ctaPrimary={hero.cta.primary}
            ctaSecondary={hero.cta.secondary}
          />
        </div>

        {/*
         * ── Logo tulisan merek (kiri atas) ───────────────────────────────
         * Dirender statis di server — tidak memerlukan JS klien.
         */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 sm:px-10 md:px-16 lg:px-24 xl:px-32"
          style={{ zIndex: 3 }}
        >
          {/* Logo tulisan */}
          <a
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className="flex items-baseline gap-2 group"
          >
            <span className="font-serif text-xl font-bold text-crema-50 tracking-tight group-hover:text-amber-bistro transition-colors duration-300">
              GTC
            </span>
            <span className="font-sans text-xs tracking-[0.2em] uppercase text-crema-300/70 font-light">
              Coffee & Bistro
            </span>
          </a>

          {/* Navigasi Mobile (Hamburger & Overlay) - hanya muncul di mobile/tablet */}
          <MobileNavbar />

          {/* Pil navigasi Desktop — penanda semantik navigasi */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1 rounded-full border border-crema-50/10 bg-espresso-950/50 backdrop-blur-md px-3 py-1.5"
          >
            {(["Menu", "About", "Hours", "Reserve"] as const).map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-1.5 text-xs tracking-widest uppercase text-crema-300/70 hover:text-crema-50 rounded-full hover:bg-crema-50/8 transition-all duration-200 font-medium"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/*
         * ── Lencana ambien melayang (dekoratif, aria-hidden) ────────────
         * Menambah kesan editorial premium; sepenuhnya digerakkan oleh CSS, tanpa JS.
         */}
        <aside
          aria-hidden="true"
          className="absolute right-6 sm:right-10 md:right-16 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3"
          style={{ zIndex: 2 }}
        >
          {/* Lencana cincin teks berputar */}
          <div className="relative h-24 w-24 flex items-center justify-center">
            <svg
              viewBox="0 0 96 96"
              className="absolute inset-0 animate-[spin_20s_linear_infinite] text-crema-300/30"
              fill="none"
              aria-hidden="true"
            >
              <path
                id="circle-text-path"
                d="M 48,48 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
              />
              <text className="text-[8.5px] fill-current" letterSpacing="3.2">
                <textPath href="#circle-text-path">
                  SPECIALTY COFFEE · ARTISAN FOOD · PEKALONGAN ·
                </textPath>
              </text>
            </svg>
            <div className="h-8 w-8 rounded-full bg-amber-bistro/20 border border-amber-bistro/40 flex items-center justify-center">
              <span className="text-amber-bistro text-xs font-serif font-bold">G</span>
            </div>
          </div>
        </aside>
      </div>

      {/*
       * ── Baris statistik — di bawah gambar hero, lebar penuh ───────────
       * Dirender di server, tanpa JS. Memberikan bukti sosial langsung di bawah lipatan (fold).
       */}
      <div
        className="w-full bg-espresso-900 border-t border-crema-50/5"
        aria-label="Key stats"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {[
            { value: "1+", label: "Years of Craft" },
            { value: "40+", label: "Specialty Blends" },
            { value: "4.1★", label: "Guest Rating" },
            { value: "100+", label: "Happy Regulars / Week" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="font-mono text-2xl font-bold text-amber-bistro leading-none">
                {stat.value}
              </span>
              <span className="font-sans text-[11px] text-crema-300/50 tracking-[0.18em] uppercase mt-1.5 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
