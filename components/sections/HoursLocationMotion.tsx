"use client";

/**
 * HoursLocationMotion — komponen leaf terisolasi "use client" untuk animasi masuk §4.4.
 *
 * desain.md §2.1 baris §4.4:
 *   - Pemicu: whileInView, once:true, margin:-50px
 *   - Durasi maksimal: 0.55s
 *   - Stagger: tidak ada (bagian ini memiliki dua kolom, bukan daftar)
 *   - Properti: opacity + y (khusus compositor)
 *   - willChange: "opacity, transform" pada elemen yang dianimasikan
 *   - prefers-reduced-motion: useReducedMotion() menonaktifkan semua animasi
 */

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const VIEWPORT = { once: true, margin: "-50px" } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
      delay,
    },
  }),
};

interface FadeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Fade({ children, delay = 0, className }: FadeProps) {
  const shouldReduce = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={fadeUp}
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

export function HoursLocationMotionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
