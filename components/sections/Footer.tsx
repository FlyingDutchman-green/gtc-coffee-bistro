/**
 * Footer — `components/sections/Footer.tsx`
 *
 * Server Component (RSC default, tanpa "use client").
 * Perilaku klien didelegasikan ke:
 *   - NewsletterForm.tsx → Pengiriman formulir, peningkatan progresif (progressive enhancement), useActionState
 *   - FooterMotion.tsx → animasi masuk yang aman untuk compositor
 *
 * Checklist kepatuhan PRD §4.5:
 *   ✅ Elemen <footer> semantik sepenuhnya
 *   ✅ Pendaftaran buletin sebagai <form> native dengan peningkatan progresif (terisolasi)
 *   ✅ Ikon sosial sebagai SVG sebaris (tanpa font web icon-font, nol permintaan HTTP tambahan)
 *   ✅ Tautan yang dapat dinavigasi keyboard dengan status fokus yang terlihat (WCAG 2.1 AA)
 *   ✅ Interaksi mikro ringan (opacity/scale pada ikon) dengan nol pergeseran tata letak
 *   ✅ Tidak ada spanduk (banner) cookie yang menggeser tata letak
 */

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { NewsletterForm } from "./NewsletterForm";
import { Fade, FooterMotionProvider } from "./FooterMotion";

/* ── Ikon Sosial SVG Sebaris (Inline) ────────────────────────────────────────────── */
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3.81l.19-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterMotionProvider>
      <footer
        className="relative w-full border-t border-crema-50/10 bg-espresso-950 pt-20 pb-10"
        aria-labelledby="footer-heading"
      >
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>

        {/* Aksen latar belakang dekoratif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-bistro/20 to-transparent"
        />

        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            
            {/* ══ KIRI: Buletin (Newsletter) ═══════════════════════════════════════ */}
            <Fade delay={0}>
              <div className="flex flex-col gap-6 lg:max-w-xs">
                <Link
                  href="/"
                  className="font-serif text-2xl font-bold tracking-tight text-crema-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded w-fit"
                  aria-label="GTC Coffee & Bistro home"
                >
                  GTC
                  <span className="text-amber-bistro">.</span>
                </Link>
                {/* 
                 * NewsletterForm adalah Komponen Klien yang mengimplementasikan 
                 * pola peningkatan progresif useActionState.
                 */}
                <NewsletterForm />
              </div>
            </Fade>

            {/* ══ KANAN: Navigasi & Kontak ════════════════════════════ */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              
              {/* Tautan Navigasi */}
              <Fade delay={0.1}>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-crema-300/50 font-medium">
                    Explore
                  </h3>
                  <nav aria-label="Footer navigation">
                    <ul role="list" className="flex flex-col gap-3">
                      {siteConfig.footerNav.slice(0, 3).map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="text-sm text-crema-200/70 hover:text-amber-bistro transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded w-fit"
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Fade>

              {/* Tautan Hukum & Lainnya */}
              <Fade delay={0.15}>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-crema-300/50 font-medium">
                    Site
                  </h3>
                  <nav aria-label="Legal and secondary navigation">
                    <ul role="list" className="flex flex-col gap-3">
                      {siteConfig.footerNav.slice(3).map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="text-sm text-crema-200/70 hover:text-amber-bistro transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded w-fit"
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Fade>

              {/* Tautan Sosial */}
              <Fade delay={0.2} className="col-span-2 sm:col-span-1">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-crema-300/50 font-medium">
                    Connect
                  </h3>
                  <ul role="list" className="flex items-center gap-4">
                    <li>
                      <a
                        href={siteConfig.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-10 w-10 items-center justify-center rounded-full bg-espresso-900 ring-1 ring-crema-50/10 text-crema-200/70 hover:text-amber-bistro hover:bg-espresso-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950"
                        aria-label="Follow us on Instagram (opens in a new tab)"
                      >
                        <InstagramIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={siteConfig.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-10 w-10 items-center justify-center rounded-full bg-espresso-900 ring-1 ring-crema-50/10 text-crema-200/70 hover:text-amber-bistro hover:bg-espresso-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950"
                        aria-label="Like us on Facebook (opens in a new tab)"
                      >
                        <FacebookIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={siteConfig.social.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-10 w-10 items-center justify-center rounded-full bg-espresso-900 ring-1 ring-crema-50/10 text-crema-200/70 hover:text-amber-bistro hover:bg-espresso-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950"
                        aria-label="Follow us on TikTok (opens in a new tab)"
                      >
                        <TikTokIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    </li>
                  </ul>
                </div>
              </Fade>
            </div>
          </div>

          {/* ── Bilah Bawah ────────────────────────────────────────────────── */}
          <Fade delay={0.3}>
            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-crema-50/10 pt-8 sm:flex-row">
              <p className="text-xs text-crema-300/40">
                &copy; {new Date().getFullYear()} {siteConfig.name}. Hak cipta dilindungi undang-undang.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-crema-300/30">
                Made By Meri From Pekalongan
              </p>
            </div>
          </Fade>

        </div>
      </footer>
    </FooterMotionProvider>
  );
}
