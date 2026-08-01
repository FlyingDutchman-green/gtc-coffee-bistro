/**
 * GTC Coffee & Bistro — Menu Data
 *
 * Static, typed content module per PRD §2.
 * No runtime CMS fetch — data lives here in MVP.
 * Future CMS integration must be additive (wrap this module, don't replace it)
 * and must not regress Core Web Vitals budgets defined in PRD §3.
 *
 * Six operational sub-brand categories (platform schema):
 *   MINUMAN (MOURO) | RAMENIKU | MIE JAGOAN | AYAM KERATON | EL NASGOR | GOLDEN TELLER & CEMILAN
 */

export interface MenuItem {
  name: string;
  description: string;
  price: string; // e.g. "45K" — intentionally a string for locale flexibility
  isSignature?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  teaser: string;
  itemCount: number;
  image: {
    src: string;
    alt: string;
  };
  /** Tailwind aspect ratio class for the card image shell, e.g. "aspect-[3/4]" */
  imageAspect: string;
  /** Sizes attribute tuned to the grid breakpoints in MenuGrid.tsx */
  imageSizes: string;
  
}

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "mouro",
    name: "MINUMAN (MOURO)",
    teaser: "Kopi premium pour-over, mocktail signature, dan seduhan teh pilihan dari MOURO — sub-brand minuman unggulan GTC yang menggabungkan presisi dan cita rasa",
    itemCount: 16,
    image: {
      src: "/menu-mouro.jpg",
      alt: "Iced latte MOURO dengan cold foam amber dalam gelas tinggi di atas meja kayu gelap",
    },
    imageAspect: "aspect-[3/4]",
    // Desktop: 1/6 viewport width; tablet: 1/3; mobile: full scroll-snap slide
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
  {
    id: "rameniku",
    name: "RAMENIKU",
    teaser: "Ramen Jepang otentik dengan kaldu yang direbus 12 jam, mie segar buatan tangan, dan gyoza renyah — cita rasa Tokyo hadir di Pekalongan",
    itemCount: 12,
    image: {
      src: "/menu-ramen.jpg",
      alt: "Semangkuk ramen tonkotsu RAMENIKU dengan telur ajitsuke, chashu babi, dan nori di atas kaldu bening keemasan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
  {
    id: "mie-jagoan",
    name: "MIE JAGOAN",
    teaser: "Mie lokal berkarakter pedas nampol dengan bumbu rahasia GTC, disajikan bersama pilihan dimsum premium — sajian nusantara yang tak terbantahkan kenikmatannya",
    itemCount: 10,
    image: {
      src: "/menu-mie.jpg",
      alt: "Semangkuk Mie Jagoan dengan telur setengah matang, pangsit goreng, dan sambal merah di mangkuk hitam elegan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
  {
    id: "ayam-keraton",
    name: "AYAM KERATON",
    teaser: "Hidangan ayam tradisional Indonesia premium yang dimarinasi dengan rempah keraton turun-temurun, disajikan lengkap dengan pilihan sambal autentik khas nusantara",
    itemCount: 11,
    image: {
      src: "/menu-ayam.jpg",
      alt: "Ayam Bakar Keraton berkilauan dengan kecap, disajikan di atas piring bambu dengan sambal dan lalapan hijau",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
  {
    id: "el-nasgor",
    name: "EL NASGOR",
    teaser: "Nasi goreng kelas atas dengan sentuhan kreatif dan bahan premium — varian signature EL NASGOR mengangkat sajian rumahan menjadi pengalaman kuliner yang mengagumkan",
    itemCount: 9,
    image: {
      src: "/menu-nasgor.jpg",
      alt: "Nasi Goreng Wagyu EL NASGOR yang mengepul dengan telur ceplok crispy dan irisan wagyu di atas piring hitam elegan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
  {
    id: "golden-teller",
    name: "GOLDEN TELLER & CEMILAN",
    teaser: "Es teller manis khas GTC, jus buah segar cold-pressed, dan cemilan ringan artisan — penutup sempurna untuk setiap kunjungan ke GTC Coffee & Bistro",
    itemCount: 14,
    image: {
      src: "/menu-golden-teller.jpg",
      alt: "Es teller Golden GTC yang berwarna-warni dengan alpukat, kelapa muda, nangka, dan susu kental manis di atas batu es hancur",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    
  },
] as const;
