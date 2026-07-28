/**
 * GTC Coffee & Bistro — Site Configuration
 * Single content source for all copy, links, and brand metadata.
 * Update this file to change any text without touching component JSX.
 */

export const siteConfig = {
  name: "GTC Coffee & Bistro",
  tagline: "Di Mana Setiap Cangkir Bercerita",
  description:
    "Kopi special buatan tangan, sajian makanan artisan, dan ruang bernuansa hangat yang membuat Anda betah. Rasakan pengalaman dari seni seduhan presisi kami.",
  url: "https://www.belanja-gtc-center.my.id",
  address: {
    street: "Jl. Raya Jatilondo, Coprayan",
    city: "Kec. Buaran, Kabupaten Pekalongan",
    province: "Jawa Tengah",
    postalCode: "51171",
    country: "Indonesia",
    mapsUrl: "https://www.google.com/maps/place/GTC+Coffee+%26+Bistro/@-6.9382898,109.6393303,17.27z/data=!4m6!3m5!1s0x2e7021463a3d2e57:0x1c677d73b01c0aa9!8m2!3d-6.9385212!4d109.6392308!16s%2Fg%2F11njzjkqlv?entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D",
    plusCode: "3J6Q+HM Coprayan",
    lat: -6.9175,
    lng: 107.6191,
  },
  contact: {
    phone: "0858-4228-7195",
    email: "gtc.center.manage@gmail.com",
  },
  hours: [
    { day: "Senin", open: "10:00", close: "00:00" },
    { day: "Selasa", open: "10:00", close: "00:00" },
    { day: "Rabu", open: "10:00", close: "00:00" },
    { day: "Kamis", open: "10:00", close: "00:00" },
    { day: "Jumat", open: "10:00", close: "00:00" },
    { day: "Sabtu", open: "10:00", close: "00:00" },
    { day: "Minggu", open: "10:00", close: "00:00" },
  ],
  social: {
    instagram: "https://www.instagram.com/gtc_coffeebistro57",
    facebook: "https://facebook.com/aqmarina.cuaem",
    tiktok: "https://www.tiktok.com/@gtc.coffee.bistro",
  },
  hero: {
    headline: "Savor the\nArt of Coffee",
    subheadline:
      "Biji kopi special, seduhan presisi, dan ruang yang dirancang untuk menginspirasi — setiap kunjungan adalah momen yang patut dikenang.",
    cta: {
      primary: { label: "Reserve a Table", href: "#reserve" },
      secondary: { label: "View Our Menu", href: "#menu" },
    },
    imageAlt:
      "Interior GTC Coffee & Bistro — lampu pijar hangat di atas latte buatan tangan pada meja kayu mengkilap",
  },

  about: {
    eyebrow: "THE VIBE",
    headline: "Modern Space,\nExceptional\nCoffee.",
    body: [
      "Hadir sebagai destinasi specialty coffee modern di Pekalongan, GTC Coffee & Bistro menawarkan lebih dari sekadar sajian kopi istimewa. Fasad kaca segitiga (A-frame) ikonik kami menyambut Anda ke dalam ruang berplafon tinggi dengan limpahan cahaya alami.",
      "Setiap sudut dirancang untuk memadukan estetika minimalis dan sentuhan industrial melalui jendela grid logam hitam yang elegan. Entah untuk sesi work-from-cafe (WFC) yang produktif atau bersantai bersama orang terdekat, atmosfer dinamis namun hangat ini diciptakan agar Anda betah berlama-lama.",
    ],
    pullQuote: {
      text: "Kami tidak terburu-buru dalam menyeduh. Kami tidak terburu-buru menikmati momen.",
      attribution: "— Pendiri, GTC Coffee & Bistro",
    },
    provenance: {
      headline: "Where Our Beans Come From",
      origins: [
        { region: "Ethiopia", note: "Yirgacheffe — aroma floral, bergamot, leci manis" },
        { region: "Indonesia", note: "Flores Bajawa — cokelat hitam pekat, nuansa kayu cedar" },
        { region: "Colombia", note: "Huila — manis karamel, plum merah, sentuhan akhir yang bersih" },
      ],
    },
    images: [
      {
        src: "/vibe-interior.jpg",
        alt: "Interior GTC — kursi berlengan kulit di bawah lampu Edison kuning",
        aspect: "4/5" as const,
      },
      {
        src: "/vibe-pour.jpg",
        alt: "Barista membuat latte art rosetta di cangkir keramik lebar",
        aspect: "4/5" as const,
      },
      {
        src: "/vibe-beans.jpg",
        alt: "Biji kopi single-origin Ethiopia Yirgacheffe di samping mangkuk cupping",
        aspect: "4/3" as const,
      },
    ],
  },
  footerNav: [
    { name: "About", href: "#about" },
    { name: "Menu", href: "#menu" },
    { name: "Hours & Location", href: "#hours" },
    { name: "Reserve", href: "#reserve" },
    { name: "Careers", href: "#careers" },
    { name: "Privacy Policy", href: "#privacy" },
  ],
} as const;
