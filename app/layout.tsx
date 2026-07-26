import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { ReservationModal } from "@/components/sections/ReservationModal";
import { CareersModal } from "@/components/sections/CareersModal";
import { PrivacyModal } from "@/components/sections/PrivacyModal";

/**
 * Playfair Display — premium serif for display headings (H1, H2)
 * Loaded via next/font: zero CLS, preconnected, inlined subset, display:swap
 * with automatic fallback metric overrides to eliminate FOUT-induced shifts.
 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

/**
 * Inter — clean, highly legible sans-serif for body copy and UI
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1920,
        height: 840,
        alt: siteConfig.hero.imageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/hero-bg.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23121212"/><path d="M25 35h40v20c0 11-9 20-20 20s-20-9-20-20V35z" fill="none" stroke="%23D4924E" stroke-width="6"/><path d="M65 45h10c5.5 0 10 4.5 10 10s-4.5 10-10 10h-6" fill="none" stroke="%23D4924E" stroke-width="6"/><path d="M35 15v10m15-10v10" fill="none" stroke="%23D4924E" stroke-width="6" stroke-linecap="round"/></svg>',
        type: "image/svg+xml",
      }
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <ReservationModal />
        <CareersModal />
        <PrivacyModal />
      </body>
    </html>
  );
}
