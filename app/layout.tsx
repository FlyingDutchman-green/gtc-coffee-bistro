import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { ReservationModal } from "@/components/sections/ReservationModal";
import { CareersModal } from "@/components/sections/CareersModal";
import { PrivacyModal } from "@/components/sections/PrivacyModal";
import { MenuProvider } from "@/context/MenuContext";

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
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
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
        <MenuProvider>
          {children}
          <ReservationModal />
          <CareersModal />
          <PrivacyModal />
        </MenuProvider>
      </body>
    </html>
  );
}
