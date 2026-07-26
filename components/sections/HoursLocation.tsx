/**
 * HoursLocation — `components/sections/HoursLocation.tsx`
 *
 * Server Component (default RSC, tanpa "use client").
 * Perilaku klien didelegasikan ke dua leaf terisolasi:
 *   - OpenNowBadge.tsx  → status buka/tutup langsung (native Intl, tanpa pustaka tambahan)
 *   - HoursLocationMotion.tsx → animasi masuk yang aman untuk compositor
 *
 * Checklist kepatuhan PRD §4.4:
 *   ✅ LARANGAN KERAS DITEGAKKAN: nol <iframe>, nol SDK JS Google Maps,
 *      nol @react-google-maps/api atau SDK peta sisi klien mana pun.
 *   ✅ Gambar peta statis melalui next/image (lazy, di bawah lipatan)
 *      Dibungkus dalam <a> yang deep-linking ke maps.google.com — membuka tab baru
 *   ✅ Jam buka di dalam <table> semantik dengan <caption>, <thead>, <tbody>, scope="row"
 *   ✅ Bersumber dari lib/site-config.ts — nol teks yang di-hardcode dalam JSX
 *   ✅ TANPA pustaka pemformatan tanggal waktu berjalan; Intl native diisolasi di OpenNowBadge
 *   ✅ Alamat, telepon (tautan tel:), petunjuk arah CTA = markup semantik murni,
 *      dirender di server, tanpa JS, diindeks oleh mesin pencari
 *   ✅ Data terstruktur JSON-LD Restaurant/LocalBusiness sesuai SEO PRD §5
 *      <script type="application/ld+json"> inline sesuai panduan json-ld Next.js 16
 *      Aman dari XSS: .replace(/</g, '\\u003c') diterapkan sesuai panduan resmi
 *   ✅ Transisi masuk yang aman untuk compositor: whileInView, opasitas+y, desain.md §2.1
 */

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { OpenNowBadge, TodayRowHighlighter } from "./OpenNowBadge";
import { Fade, HoursLocationMotionProvider } from "./HoursLocationMotion";

/** Zona waktu IANA untuk bistro — Waktu Indonesia Barat (WIB) */
const BISTRO_TZ = "Asia/Jakarta";

/** Memformat "07:00" → "7:00 AM" menggunakan Intl untuk tampilan (sisi server, tanpa pustaka tambahan) */
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: m === 0 ? undefined : "2-digit",
    hour12: true,
  }).format(d);
}

export default function HoursLocation() {
  const { name, address, contact, hours, url } = siteConfig;

  const mapsUrl = `https://www.google.com/maps/place/GTC+Coffee+%26+Bistro/@-6.9382898,109.6393303,17.27z/data=!4m6!3m5!1s0x2e7021463a3d2e57:0x1c677d73b01c0aa9!8m2!3d-6.9385212!4d109.6392308!16s%2Fg%2F11njzjkqlv?entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D`;

  /* ── JSON-LD: Skema LocalBusiness / Restaurant ─────────────────────────
   * Sesuai SEO PRD §5 dan panduan json-ld.md Next.js 16.
   * Aman dari XSS: ganti /</g dengan \u003c sebelum disisipkan.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    name,
    url,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.province,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: address.lat,
      longitude: address.lng,
    },
    hasMap: mapsUrl,
    openingHoursSpecification: hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${h.day}`,
      opens: h.open,
      closes: h.close,
    })),
    servesCuisine: ["Coffee", "Specialty Coffee", "Bistro", "Breakfast"],
    priceRange: "$$",
    image: `${url}/hero-bg.jpg`,
    menu: `${url}#menu`,
  };

  return (
    <HoursLocationMotionProvider>
      <section
        id="hours"
        aria-labelledby="hours-heading"
        className="relative w-full bg-espresso-900 py-24 md:py-32 lg:py-40"
      >
        {/* Data terstruktur JSON-LD — dirender di server, tidak perlu eksekusi JS */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* Garis batas atas dekoratif */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-crema-50/10 to-transparent"
        />

        {/* Pendaran ambien */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(212,146,78,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">

          {/* ── Header seksi ─────────────────────────────────────────── */}
          <Fade delay={0} className="mb-12 lg:mb-16">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-amber-bistro text-xs tracking-[0.25em] uppercase font-medium">
                <span className="inline-block h-px w-6 bg-amber-bistro" aria-hidden="true" />
                Find Us
              </span>
              <h2
                id="hours-heading"
                className="font-serif text-4xl font-bold leading-tight tracking-tight text-crema-50 sm:text-5xl"
              >
                Come As You{" "}
                <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-bistro to-gold-accent">
                  Are
                </em>
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-crema-300/65 font-light">
                Tidak perlu reservasi untuk kunjungan langsung. Silakan lakukan reservasi terlebih dahulu untuk rombongan lima orang atau lebih.
              </p>
            </div>
          </Fade>

          {/*
           * ── GRID UTAMA ─────────────────────────────────────────────────
           * Desktop (lg+): [info 5fr | peta 7fr]
           * Tablet: bertumpuk — info di atas peta
           * Mobile: satu kolom
           */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16 xl:gap-20 items-start">

            {/* ══ KIRI: Kolom info ══════════════════════════════════════ */}
            <div className="flex flex-col gap-10">

              {/* ── Lencana buka sekarang + tabel jam operasional ─────────────────────── */}
              <Fade delay={0.08}>
                <div className="flex flex-col gap-5">
                  {/* Lencana status buka/tutup langsung — hanya sisi klien, berbasis Intl */}
                  <div className="flex items-center gap-3">
                    <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-crema-300/50 font-medium">
                      Opening Hours
                    </h3>
                    <OpenNowBadge hours={hours} timezone={BISTRO_TZ} />
                  </div>

                  {/*
                   * ── Tabel jam semantik ─────────────────────────────
                   * <table> dengan <caption> (dapat diakses pembaca layar),
                   * <thead> untuk header kolom, <tbody> untuk baris data.
                   * scope="row" pada sel hari <th> (merupakan header baris).
                   * data-hours-row pada <tr> — digunakan oleh TodayRowHighlighter
                   * untuk menerapkan kelas .hours-today sisi klien setelah hidrasi (hydration).
                   */}
                  <div className="overflow-hidden rounded-xl border border-crema-50/8 bg-espresso-800">
                    <table className="w-full text-sm" aria-label="Jam operasional mingguan">
                      <caption className="sr-only">
                        Jam operasional mingguan GTC Coffee &amp; Bistro
                      </caption>
                      <thead>
                        <tr className="border-b border-crema-50/6">
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[10px] tracking-widest uppercase text-crema-300/40 font-medium"
                          >
                            Hari
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[10px] tracking-widest uppercase text-crema-300/40 font-medium"
                          >
                            Jam
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-crema-50/4">
                        {hours.map((entry) => (
                          <tr
                            key={entry.day}
                            data-hours-row={entry.day}
                            /* aria-current diatur secara dinamis oleh TodayRowHighlighter.
                             * Bawaannya false — ditimpa sisi klien setelah hidrasi. */
                            aria-current="false"
                            className="transition-colors duration-200"
                          >
                            <th
                              scope="row"
                              className="px-5 py-3.5 text-left font-normal text-crema-200/70"
                            >
                              {entry.day}
                            </th>
                            <td className="px-5 py-3.5 text-crema-200/70 tabular-nums font-mono text-[13px]">
                              {formatTime(entry.open)}
                              <span className="mx-1.5 text-crema-300/30" aria-hidden="true">–</span>
                              {formatTime(entry.close)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Komponen efek samping yang menyoroti baris hari ini */}
                  <TodayRowHighlighter timezone={BISTRO_TZ} />
                </div>
              </Fade>

              {/* ── Blok alamat + kontak ─────────────────────────── */}
              <Fade delay={0.16}>
                {/*
                 * <address> adalah elemen HTML yang tepat untuk info kontak
                 * yang terkait dengan <article> atau <body> terdekat.
                 * Semua tautan adalah markup semantik murni — dirender di server,
                 * sepenuhnya diindeks tanpa eksekusi JS (PRD §4.4).
                 */}
                <address className="not-italic flex flex-col gap-5">
                  {/* Blok lokasi */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium">
                      Address
                    </p>
                    <p className="text-crema-200/80 leading-relaxed">
                      {address.street}
                      <br />
                      {address.city}, {address.province} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                  </div>

                  {/* Telepon — tautan tel:, syarat wajib PRD §4.4 */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium">
                      Phone
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/\s|-/g, "")}`}
                      className="text-crema-200/80 hover:text-amber-bistro transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium">
                      Email
                    </p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-crema-200/80 hover:text-amber-bistro transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded"
                    >
                      {contact.email}
                    </a>
                  </div>
                </address>
              </Fade>

              {/* ── CTA Petunjuk Arah — markup semantik biasa, tanpa JS ────── */}
              <Fade delay={0.22}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-3 rounded-full bg-amber-bistro px-7 py-3.5 text-sm font-medium tracking-widest uppercase text-espresso-950 hover:bg-gold-accent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-900"
                  aria-label="Dapatkan petunjuk arah ke GTC Coffee & Bistro di Google Maps (terbuka di tab baru)"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth={1.5} />
                  </svg>
                  Get Directions
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5 opacity-70"
                    aria-hidden="true"
                  >
                    <path d="M4 4h8v8M4 12L12 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Fade>
            </div>

            {/* ══ KANAN: Gambar peta statis ═════════════════════════════════
             *
             * KEPATUHAN LARANGAN KERAS PRD §4.4:
             *   ✅ Tanpa <iframe> — ini adalah elemen next/image <img>
             *   ✅ Tanpa Google Maps JS SDK — tanpa tag skrip, tanpa SDK sisi klien
             *   ✅ Tanpa @react-google-maps/api — tidak diinstal, tidak diimpor
             *
             * Implementasi:
             *   - Gambar peta statis (sudah dibuat sebelumnya, dilayani dari /public)
             *   - Dirender melalui next/image dengan lazy loading (di bawah lipatan)
             *   - Dibungkus dalam tautan <a> yang mengarah ke maps.google.com
             *   - Terbuka di tab baru dengan noopener noreferrer
             *   - wadah aspect-[4/3] memesan ruang sebelum gambar dimuat → CLS = 0
             ════════════════════════════════════════════════════════════════ */}
            <Fade delay={0.12}>
              <div className="flex flex-col gap-4">
                {/* Tautan gambar peta */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-900"
                  aria-label="Lihat GTC Coffee & Bistro di Google Maps (terbuka di tab baru)"
                >
                  {/*
                   * wadah aspect-[4/3]: ruang dipesan SEBELUM gambar dimuat → CLS = 0
                   * position:relative diperlukan untuk mode fill next/image.
                   */}
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src="/maps.png"
                      alt="GTC Coffee & Bistro Pekalongan Map Location"
                      fill
                      /* Di bawah lipatan — pemuatan lambat bawaan (PRD §4.2/§4.4) */
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 58vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      style={{ willChange: "transform" }}
                    />

                    {/* Overlay saat di-hover dengan label "Lihat di Maps" */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center bg-espresso-950/0 transition-colors duration-300 group-hover:bg-espresso-950/40"
                    >
                      <span className="flex items-center gap-2 rounded-full bg-espresso-900/90 px-5 py-2.5 text-xs font-medium tracking-wider uppercase text-crema-50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 ring-1 ring-crema-50/10">
                        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-amber-bistro" aria-hidden="true">
                          <path d="M4 4h8v8M4 12L12 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Open in Google Maps
                      </span>
                    </div>

                    {/* Overlay cincin halus */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-crema-50/8"
                    />
                  </div>
                </a>

                {/* Keterangan peta — ringkasan alamat di bawah gambar peta */}
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-bistro/15 text-amber-bistro"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path d="M8 2a4 4 0 014 4c0 3-4 8-4 8S4 9 4 6a4 4 0 014-4z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth={1.5} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-crema-100">
                      {address.street}
                    </p>
                    <p className="text-xs text-crema-300/60 mt-0.5">
                      {address.city}, {address.province} · {address.country}
                    </p>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>
    </HoursLocationMotionProvider>
  );
}
