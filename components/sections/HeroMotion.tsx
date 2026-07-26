"use client";

/**
 * HeroMotion — komponen leaf terisolasi "use client"
 *
 * Batasan animasi PRD §4.1:
 *   ✅ Properti khusus Compositor: opacity + y transform (tidak memicu layout/paint)
 *   ✅ Dipicu saat mount (bukan whileInView — elemen ini ada di atas lipatan/fold)
 *   ✅ Paket fitur LazyMotion + domAnimation (bukan paket `motion` penuh)
 *   ✅ prefers-reduced-motion: animasi dinonaktifkan via aturan CSS global +
 *      pengaman hook useReducedMotion() di dalam Framer Motion
 *   ✅ Anggaran JS Bundle: LazyMotion + domAnimation ≈ ~16KB gzip (vs ~31KB penuh)
 */

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/* ── Preset animasi bersama ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const, // kurva cubic-bezier kustom (rasa ease-out-expo)
      delay,
    },
  }),
};

/* ── Sub-komponen ──────────────────────────────────────────────────────── */

interface AnimatedProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "span" | "h1" | "h2";
}

function Animated({ children, delay = 0, className, as = "div" }: AnimatedProps) {
  const shouldReduce = useReducedMotion();
  const Tag = m[as] as typeof m.div;

  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial={shouldReduce ? "visible" : "hidden"}
      animate="visible"
      custom={delay}
    >
      {children}
    </Tag>
  );
}

/* ── Animasi Tombol CTA ───────────────────────────────────────────────── */
interface CTAButtonProps {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  delay?: number;
}

function CTAButton({ href, label, variant, delay = 0 }: CTAButtonProps) {
  const shouldReduce = useReducedMotion();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-widest uppercase transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950 focus-visible:outline-none";

  const styles = {
    primary:
      "bg-amber-bistro text-espresso-950 hover:bg-gold-accent hover:scale-[1.03] active:scale-100 shadow-lg shadow-amber-bistro/20",
    secondary:
      "border border-crema-200/40 text-crema-100 backdrop-blur-sm hover:bg-crema-50/10 hover:border-crema-100/60 hover:scale-[1.03] active:scale-100",
  };

  return (
    <m.a
      href={href}
      className={`${base} ${styles[variant]}`}
      variants={fadeUp}
      initial={shouldReduce ? "visible" : "hidden"}
      animate="visible"
      custom={delay}
      // Hanya-GPU: scale berbasis transform, tidak memicu layout
      style={{ willChange: "opacity, transform" }}
    >
      {variant === "primary" && (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}
      {label}
      {variant === "secondary" && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </m.a>
  );
}

/* ── Petunjuk gulir — animasi pantulan halus ───────────────────────────────── */
function ScrollCue() {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className="flex flex-col items-center gap-1.5 text-crema-300/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.6 }}
    >
      <span className="text-[10px] tracking-[0.2em] uppercase font-sans">Scroll</span>
      <m.div
        className="h-10 w-px bg-gradient-to-b from-crema-300/50 to-transparent"
        animate={shouldReduce ? {} : { scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        style={{ transformOrigin: "top", willChange: "transform, opacity" }}
      />
    </m.div>
  );
}

/* ── Pembungkus utama yang diekspor ──────────────────────────────────────────────── */

interface HeroMotionProps {
  headline: string;
  subheadline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export function HeroMotion({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
}: HeroMotionProps) {
  // Memisahkan judul pada baris baru untuk tampilan serif dua baris
  const lines = headline.split("\n");

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-10 md:px-16 lg:px-24 xl:px-32">
        {/* ── Label alis ── */}
        <Animated delay={0} className="mb-4">
          <span className="inline-flex items-center gap-2 text-amber-bistro text-xs tracking-[0.25em] uppercase font-medium">
            <span className="inline-block h-px w-6 bg-amber-bistro" aria-hidden="true" />
            Specialty Coffee & Bistro
          </span>
        </Animated>

        {/* ── H1 — Serif Playfair Display, dua baris visual ── */}
        <h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-crema-50 mb-6"
          // Tidak ada animasi pada elemen H1 itu sendiri — elemen anaknya yang dianimasikan
        >
          {lines.map((line, i) => (
            <Animated
              key={i}
              as="span"
              delay={0.1 + i * 0.15}
              className="block"
            >
              {i === 1 ? (
                <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-bistro via-gold-accent to-crema-300">
                  {line}
                </em>
              ) : (
                line
              )}
            </Animated>
          ))}
        </h1>

        {/* ── Sub-judul ── */}
        <Animated delay={0.42} as="p" className="max-w-xl text-crema-200/80 text-base md:text-lg leading-relaxed font-light mb-10">
          {subheadline}
        </Animated>

        {/* ── Baris CTA ── */}
        <Animated delay={0.58} className="flex flex-wrap items-center gap-4">
          <CTAButton href={ctaPrimary.href} label={ctaPrimary.label} variant="primary" delay={0.6} />
          <CTAButton href={ctaSecondary.href} label={ctaSecondary.label} variant="secondary" delay={0.7} />
        </Animated>

        {/* ── Indikator gulir (di bawah CTA, rata kanan) ── */}
        <div className="hidden lg:flex absolute bottom-10 right-12 xl:right-20">
          <ScrollCue />
        </div>
      </div>
    </LazyMotion>
  );
}
