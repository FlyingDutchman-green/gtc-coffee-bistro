"use client";

/**
 * OpenNowBadge — leaf terisolasi "use client" untuk status buka/tutup PRD §4.4.
 *
 * Batasan PRD §4.4:
 *   "tidak ada pustaka pemformatan tanggal waktu berjalan (runtime) pada jalur kritis;
 *    gunakan Intl native hanya jika status 'buka sekarang' diperlukan,
 *    dihitung pada sisi klien dalam komponen leaf yang terisolasi."
 *
 * Implementasi:
 *   - HANYA menggunakan API Date + Intl native — tanpa impor pustaka
 *   - Render awal: null (menghindari ketidakcocokan hidrasi; lencana muncul setelah hidrasi)
 *   - `Intl.DateTimeFormat` dengan zona waktu bistro menyelesaikan waktu lokal
 *     dengan benar di perangkat pengunjung mana pun terlepas dari zona waktu mereka sendiri
 *   - Juga menyoroti baris hari ini di tabel jam melalui atribut data saat komponen dimuat
 */

"use client";

import { useEffect, useState } from "react";

interface HourEntry {
  readonly day: string;
  readonly open: string;
  readonly close: string;
}

interface OpenNowBadgeProps {
  hours: readonly HourEntry[];
  /** Zona waktu IANA untuk bistro, mis. "Asia/Jakarta" */
  timezone: string;
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Mengembalikan { isOpen, todayDayName, closingTime } yang dihitung terhadap zona waktu lokal bistro.
 * Menggunakan Intl native — tanpa date-fns, tanpa moment, tanpa luxon.
 */
function computeOpenState(
  hours: readonly HourEntry[],
  timezone: string
): { isOpen: boolean; todayDayName: string; closingTime: string | null } {
  // Dapatkan waktu saat ini yang dinyatakan dalam zona waktu lokal bistro
  const now = new Date();

  // Nama hari kerja penuh dalam lokal bistro (mis. "Monday")
  const todayDayName = new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    weekday: "long",
  }).format(now);

  // Jam dan menit saat ini dalam zona waktu bistro
  const localTimeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const nowMinutes =
    parseInt(localTimeParts.hour ?? "0", 10) * 60 +
    parseInt(localTimeParts.minute ?? "0", 10);

  const todayEntry = hours.find(
    (h) => h.day.toLowerCase() === todayDayName.toLowerCase()
  );

  if (!todayEntry) {
    return { isOpen: false, todayDayName, closingTime: null };
  }

  const openMinutes = parseMinutes(todayEntry.open);
  let closeMinutes = parseMinutes(todayEntry.close);

  if (closeMinutes === 0) {
    closeMinutes = 24 * 60; // Convert 00:00 to 24:00 (1440 minutes) to correctly bound the current day
  }

  let isOpen = false;
  if (closeMinutes <= openMinutes) {
    isOpen = nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  } else {
    isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }

  return {
    isOpen,
    todayDayName,
    closingTime: isOpen ? todayEntry.close : null,
  };
}

export function OpenNowBadge({ hours, timezone }: OpenNowBadgeProps) {
  // null = belum dihidrasi — tidak merender apa pun untuk menghindari ketidakcocokan hidrasi
  const [state, setState] = useState<{
    isOpen: boolean;
    todayDayName: string;
    closingTime: string | null;
  } | null>(null);

  useEffect(() => {
    setState(computeOpenState(hours, timezone));

    // Sorot baris hari ini di tabel jam melalui data-attribute
    const todayName = new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      weekday: "long",
    }).format(new Date());

    const rows = document.querySelectorAll<HTMLTableRowElement>(
      "[data-hours-row]"
    );
    rows.forEach((row) => {
      if (
        row.dataset.hoursRow?.toLowerCase() === todayName.toLowerCase()
      ) {
        row.setAttribute("aria-current", "true");
        row.classList.add("hours-today");
      }
    });
  }, [hours, timezone]);

  // Sebelum hidrasi — tidak merender apa pun (tanpa pergeseran tata letak, tanpa ketidakcocokan)
  if (state === null) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        state.isOpen
          ? "bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-400/30"
          : "bg-espresso-700 text-crema-300/60 ring-1 ring-crema-50/10",
      ].join(" ")}
      aria-label={
        state.isOpen
          ? `Sedang buka — tutup pada ${state.closingTime}`
          : "Sedang tutup"
      }
    >
      <span
        className={[
          "inline-block h-1.5 w-1.5 rounded-full",
          state.isOpen ? "bg-emerald-400 animate-pulse" : "bg-crema-300/40",
        ].join(" ")}
        aria-hidden="true"
      />
      {state.isOpen
        ? `Buka sekarang · Tutup ${state.closingTime}`
        : "Tutup sekarang"}
    </span>
  );
}

/**
 * TodayHighlight — menyisipkan kelas CSS untuk baris jam hari ini.
 * Dirender sebagai saudara (sibling) ke tabel; berjalan HANYA setelah hidrasi.
 * Diekspor secara terpisah sehingga dapat ditempatkan di dekat tabel di pohon RSC.
 */
export function TodayRowHighlighter({
  timezone,
}: {
  timezone: string;
}) {
  useEffect(() => {
    const todayName = new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      weekday: "long",
    }).format(new Date());

    document
      .querySelectorAll<HTMLElement>("[data-hours-row]")
      .forEach((el) => {
        const isToday =
          el.dataset.hoursRow?.toLowerCase() === todayName.toLowerCase();
        el.setAttribute("aria-current", isToday ? "true" : "false");
        el.classList.toggle("hours-today", isToday);
      });
  }, [timezone]);

  return null; // komponen efek samping murni, tidak merender apa pun
}
