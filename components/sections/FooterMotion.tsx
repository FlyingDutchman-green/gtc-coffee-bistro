'use client';

/**
 * FooterMotion — leaf animasi "use client" yang terisolasi untuk §4.5.
 *
 * baris desain.md §2.1 §4.5:
 *   - Pemicu: whileInView, once:true, margin:-50px
 *   - Durasi maksimal: 0.50s
 *   - Stagger: tidak ada di tingkat seksi (kolom footer mendapatkan penundaan individu)
 *   - Properti: hanya opacity (footer berada di bawah lipatan, pergeseran y minimal)
 *   - willChange: "opacity" pada elemen yang dianimasikan
 *   - prefers-reduced-motion: useReducedMotion() melompati semua animasi
 *
 * Interaksi mikro saat ikon sosial di-hover (aman untuk compositor):
 *   - scale(1.15) melalui CSS `group-hover:scale-[1.15]` — hanya transform
 *   - Tanpa pergeseran tata letak: ikon memiliki wadah berukuran tetap
 */

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const VIEWPORT = { once: true, margin: '-50px' } as const;

const fade = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] as const, delay },
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
      variants={fade}
      initial={shouldReduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={VIEWPORT}
      custom={delay}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </m.div>
  );
}

export function FooterMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
