import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import Hero from "@/components/sections/Hero";
import AboutVibe from "@/components/sections/AboutVibe";
import MenuGrid from "@/components/sections/MenuGrid";
import HoursLocation from "@/components/sections/HoursLocation";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

/**
 * GTC Coffee & Bistro — Root Page (/)
 *
 * PRD §4 sections implemented:
 *   §4.1 Hero        ✅ — LCP image, serif H1, GPU motion, CTA
 *   §4.2 AboutVibe   ✅ — Asymmetric CSS grid, image collage, whileInView
 *   §4.3 MenuGrid    ✅ — 5-col grid, scroll-snap mobile, category tabs, stagger
 *   §4.4 HoursLocation ✅ — static map (no iframe/SDK), semantic table, JSON-LD
 *   §4.5 Footer      ✅ — semantic footer, newsletter form, inline SVG social icons
 */
export default function HomePage() {
  return (
    <main id="main-content">
      {/* §4.1 — Hero: LCP element, serif H1 animation, primary CTA */}
      <Hero />

      {/* §4.2 — About / The Vibe: asymmetric CSS grid, image collage, whileInView */}
      <AboutVibe />

      {/* §4.3 — Menu Grid: 5-col desktop, 3-col tablet, scroll-snap mobile, stagger */}
      <MenuGrid />

      {/* §4.4 — Hours & Location: static map, semantic table, JSON-LD, open-now badge */}
      <HoursLocation />

      {/* §4.5 — Footer: semantic footer, newsletter progressive enhancement, social icons */}
      <Footer />
    </main>
  );
}
