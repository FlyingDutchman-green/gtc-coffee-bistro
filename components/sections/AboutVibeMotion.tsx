"use client";

/**
 * AboutVibeMotion — komponen leaf terisolasi "use client" untuk animasi masuk §4.2.
 *
 * Batasan animasi PRD §4.2:
 *   ✅ whileInView (BUKAN dipicu saat mount — seksi ini berada di bawah lipatan)
 *   ✅ viewport={{ once: true, margin: "-50px" }} — terpicu sekali, 50px sebelum tepi viewport
 *   ✅ Khusus Compositor: opacity + y transform (tidak memicu layout/paint)
 *   ✅ LazyMotion + domAnimation (bukan bundle penuh — Anggaran JS PRD §3)
 *   ✅ prefers-reduced-motion: useReducedMotion() menonaktifkan semua animasi
 *   ✅ willChange: "opacity, transform" — petunjuk compositing GPU
 *
 * Pola stagger (bertahap) — aman untuk 60fps pada ponsel spesifikasi rendah (Moto G4):
 *   - Durasi: maks 0.65s (bukan 1s+; SoC rendah butuh frame singkat)
 *   - Offset stagger: 0.12s per item (12 item × 0.12 = maks total 1.44s)
 *   - Easing: cubic-bezier(0.22, 1, 0.36, 1) — ease-out-expo, frame berat
 *     berada di depan saat elemen pertama kali masuk tampilan, bukan tersebar seiring waktu.
 */

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/* ── Konfigurasi viewport bersama (spesifikasi pasti PRD §4.2) ───────────────────────── */
const VIEWPORT = { once: true, margin: "-50px" } as const;

/* ── Varian dasar fade-up (pudar ke atas) ────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
      delay,
    },
  }),
};

/* ── Varian hanya fade (untuk slot gambar — hindari pergeseran y pada grid kolase) ── */
const fadeOnly = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
      delay,
    },
  }),
};

/* ── Pembungkus animasi yang dapat digunakan kembali ─────────────────────────────────────────── */
interface FadeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "up" | "fade";
}

export function Fade({ children, delay = 0, className, variant = "up" }: FadeProps) {
  const shouldReduce = useReducedMotion();
  const variants = variant === "fade" ? fadeOnly : fadeUp;

  return (
    <m.div
      className={className}
      variants={variants}
      initial={shouldReduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      custom={delay}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </m.div>
  );
}

/* ── Daftar bertahap — menggerakkan daftar asal-usul (provenance) ─────────────────── */
interface StaggerListProps {
  items: readonly { region: string; note: string }[];
  baseDelay?: number;
}

export function StaggerList({ items, baseDelay = 0 }: StaggerListProps) {
  const shouldReduce = useReducedMotion();

  return (
    <ul className="space-y-3" role="list">
      {items.map((item, i) => (
        <m.li
          key={item.region}
          variants={fadeUp}
          initial={shouldReduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          custom={baseDelay + i * 0.1}
          style={{ willChange: "opacity, transform" }}
          className="flex items-start gap-3 text-sm"
        >
          <span
            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-bistro"
            aria-hidden="true"
          />
          <span>
            <span className="font-semibold text-crema-100">{item.region}</span>
            <span className="text-crema-300/70"> — {item.note}</span>
          </span>
        </m.li>
      ))}
    </ul>
  );
}

/* ── Pembungkus Provider — memuat LazyMotion sekali untuk seluruh seksi ─────── */
export function AboutVibeMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
