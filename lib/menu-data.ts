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
  featured: readonly MenuItem[];
}

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "mouro",
    name: "MINUMAN (MOURO)",
    teaser: "Kopi premium pour-over, mocktail signature, dan seduhan teh pilihan dari MOURO — sub-brand minuman unggulan GTC yang menggabungkan presisi dan cita rasa",
    itemCount: 16,
    image: {
      src: "/menu-coffee.jpg",
      alt: "Iced latte MOURO dengan cold foam amber dalam gelas tinggi di atas meja kayu gelap",
    },
    imageAspect: "aspect-[3/4]",
    // Desktop: 1/6 viewport width; tablet: 1/3; mobile: full scroll-snap slide
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "MOURO Cold Brew Float", description: "Cold brew 18 jam dari biji Flores Bajawa, diapungkan di atas es krim vanilla bean, dan ditaburi fleur de sel. Keseimbangan pahit-manis yang sempurna.", price: "35K", isSignature: true },
      { name: "Signature Iced Toffee Latte", description: "Espresso double-shot, saus toffee homemade, susu segar dingin, dan cold foam karamel asin. Ikon minuman GTC yang selalu habis terjual.", price: "32K", isSignature: true },
      { name: "Lychee Jasmine Mocktail", description: "Teh jasmine yang diseduh dingin, sirup leci segar, air soda premium, dan bunga viola. Elegan dan menyegarkan tanpa alkohol.", price: "28K" },
      { name: "Matcha Oat Latte", description: "Matcha ceremonial grade-A dari Uji, dikocok halus dengan susu oat dingin. Seimbang antara umami dan creamy dalam setiap tegukan.", price: "30K" },
    ] as const,
  },
  {
    id: "rameniku",
    name: "RAMENIKU",
    teaser: "Ramen Jepang otentik dengan kaldu yang direbus 12 jam, mie segar buatan tangan, dan gyoza renyah — cita rasa Tokyo hadir di Pekalongan",
    itemCount: 12,
    image: {
      src: "/menu-food.jpg",
      alt: "Semangkuk ramen tonkotsu RAMENIKU dengan telur ajitsuke, chashu babi, dan nori di atas kaldu bening keemasan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "Tonkotsu Black Garlic", description: "Kaldu babi rebus 12 jam dengan minyak bawang putih hitam, mie keriting springy, chashu meleleh, telur ajitsuke setengah matang, dan acar jahe.", price: "45K", isSignature: true },
      { name: "Spicy Miso Mazemen", description: "Ramen tanpa kuah: mie tebal berlumur saus miso pedas-gurih, mentega, bawang putih sangrai, daging cincang, dan daun bawang hijau segar.", price: "42K", isSignature: true },
      { name: "Shoyu Chicken Ramen", description: "Kaldu ayam bening beraroma shoyu gelap, mie lurus halus, ayam grill, wakame, dan naruto fish cake. Klasik Jepang yang menenangkan.", price: "38K" },
      { name: "Gyoza Pan-Fried (6 pcs)", description: "Kulit pangsit tipis renyah di bagian bawah, berisi campuran daging babi, kol, dan jahe. Disajikan dengan saus ponzu pedas manis.", price: "28K" },
    ] as const,
  },
  {
    id: "mie-jagoan",
    name: "MIE JAGOAN",
    teaser: "Mie lokal berkarakter pedas nampol dengan bumbu rahasia GTC, disajikan bersama pilihan dimsum premium — sajian nusantara yang tak terbantahkan kenikmatannya",
    itemCount: 10,
    image: {
      src: "/menu-desserts.jpg",
      alt: "Semangkuk Mie Jagoan dengan telur setengah matang, pangsit goreng, dan sambal merah di mangkuk hitam elegan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "Mie Jagoan Spesial", description: "Mie kuning kenyal dengan bumbu Jagoan yang legendaris — perpaduan rempah pilihan, saus tiram, dan cabai rawit segar. Tersedia pilihan level pedas 1-5.", price: "25K", isSignature: true },
      { name: "Mie Jagoan Xtra Pedas", description: "Versi brutal dari Mie Jagoan: tambahan cabai habanero, sambal matah, dan keripik level 10. Tantangan untuk jiwa-jiwa pemberani.", price: "28K", isSignature: true },
      { name: "Dimsum Platter (4 pcs)", description: "Pilihan 4 buah dimsum dari: siomay udang, hakau, lumpia goreng crispy, atau pangsit kuah. Cocok untuk pendamping mie atau dimakan sendiri.", price: "22K" },
      { name: "Mie Goreng Jagoan", description: "Versi goreng kering dari mie jagoan: wok-fried dengan api besar, telur orak-arik, sayuran crunchy, dan taburan bawang goreng garing.", price: "25K" },
    ] as const,
  },
  {
    id: "ayam-keraton",
    name: "AYAM KERATON",
    teaser: "Hidangan ayam tradisional Indonesia premium yang dimarinasi dengan rempah keraton turun-temurun, disajikan lengkap dengan pilihan sambal autentik khas nusantara",
    itemCount: 11,
    image: {
      src: "/menu-breakfast.jpg",
      alt: "Ayam Bakar Keraton berkilauan dengan kecap, disajikan di atas piring bambu dengan sambal dan lalapan hijau",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "Ayam Bakar Keraton", description: "Ayam kampung pilihan dimarinasi bumbu keraton 12 jam — ketumbar, kemiri, lengkuas, kunyit — lalu dibakar sempurna di arang. Disajikan dengan nasi putih, sambal terasi, dan lalapan.", price: "38K", isSignature: true },
      { name: "Ayam Goreng Rempah", description: "Ayam kampung yang diungkep dengan 12 rempah nusantara lalu digoreng hingga kulit keemasan renyah. Bagian dalam tetap juicy dan penuh rasa.", price: "35K", isSignature: true },
      { name: "Sambal Platter Premium", description: "Tiga varian sambal: sambal terasi bakar, sambal ijo pedas, dan sambal mangga muda segar. Disajikan dalam cobek batu dengan lalapan dan kerupuk.", price: "18K" },
      { name: "Ayam Penyet Bumbu Keraton", description: "Ayam goreng dipenyet di atas cobek, disiram sambal bawang mentah yang pedas segar, dilengkapi tahu tempe goreng dan nasi putih panas.", price: "35K" },
    ] as const,
  },
  {
    id: "el-nasgor",
    name: "EL NASGOR",
    teaser: "Nasi goreng kelas atas dengan sentuhan kreatif dan bahan premium — varian signature EL NASGOR mengangkat sajian rumahan menjadi pengalaman kuliner yang mengagumkan",
    itemCount: 9,
    image: {
      src: "/menu-drinks.jpg",
      alt: "Nasi Goreng Wagyu EL NASGOR yang mengepul dengan telur ceplok crispy dan irisan wagyu di atas piring hitam elegan",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "El Nasgor Wagyu", description: "Nasi goreng wok-fired dengan irisan wagyu grade A, telur ceplok crispy, saus teriyaki homemade, dan truffle oil. Puncak dari seni nasi goreng.", price: "58K", isSignature: true },
      { name: "El Nasgor Kampung Premium", description: "Nasi goreng bumbu kampung klasik yang diangkat: ayam suwir asap, telur dadar gulung, pete panggang, dan kerupuk udang jumbo.", price: "35K", isSignature: true },
      { name: "El Nasgor Seafood Spesial", description: "Perpaduan udang tiger, cumi segar, dan kerang hijau dalam nasi goreng berbumbu hitam cuttlefish ink yang dramatic dan penuh umami.", price: "45K" },
      { name: "El Nasgor Vegetarian", description: "Nasi goreng plant-based: jamur shiitake, edamame, jagung manis bakar, dan saus tamari. Lezat tanpa kompromi untuk pencinta gaya hidup sehat.", price: "28K" },
    ] as const,
  },
  {
    id: "golden-teller",
    name: "GOLDEN TELLER & CEMILAN",
    teaser: "Es teller manis khas GTC, jus buah segar cold-pressed, dan cemilan ringan artisan — penutup sempurna untuk setiap kunjungan ke GTC Coffee & Bistro",
    itemCount: 14,
    image: {
      src: "/menu-coffee.jpg",
      alt: "Es teller Golden GTC yang berwarna-warni dengan alpukat, kelapa muda, nangka, dan susu kental manis di atas batu es hancur",
    },
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 640px) 85vw, (max-width: 1024px) 32vw, 17vw",
    featured: [
      { name: "Golden Es Teller Spesial", description: "Es teller premium dengan alpukat Malang matang, kelapa muda segar, nangka harum, kolang-kaling, dan limpahan susu kental manis. Definisi kemewahan sederhana.", price: "25K", isSignature: true },
      { name: "Jus Alpukat Kocok", description: "Alpukat pilihan dikocok dengan susu full cream, sedikit kopi espresso, dan madu asli. Kental, creamy, dan mengenyangkan — sarapan dalam satu gelas.", price: "22K", isSignature: true },
      { name: "Pisang Crispy Mozzarella", description: "Pisang raja goreng berlapis tepung crispy, isian keju mozzarella meleleh, drizzle cokelat Belgia, dan taburan almond slice panggang.", price: "20K" },
      { name: "Fresh Fruit Platter", description: "Irisan buah-buahan tropis segar pilihan harian: semangka, melon, mangga harum, stroberi, dan anggur hitam. Disajikan dingin dengan saus yoghurt honey.", price: "22K" },
    ] as const,
  },
] as const;
