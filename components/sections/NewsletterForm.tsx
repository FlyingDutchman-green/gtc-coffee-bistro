'use client';

/**
 * NewsletterForm — leaf terisolasi "use client" untuk §4.5.
 *
 * Persyaratan PRD §4.5 (persis):
 *   "Pendaftaran buletin (jika disertakan) harus berupa <form> native dengan peningkatan progresif
 *    (progressive enhancement) — fungsional tanpa JS, ditingkatkan dengan leaf klien untuk
 *    validasi sebaris/umpan balik pengiriman."
 *
 * Implementasi sesuai panduan formulir Next.js 16 (forms.md):
 *   - useActionState(serverAction, initialState) menghubungkan formulir ke
 *     aksi server (server action). `formAction` yang dihasilkan diteruskan ke <form action>.
 *   - Tanpa JS: browser mengirimkan formulir sebagai POST standar — React
 *     merender respons yang dialirkan dari server (peningkatan progresif).
 *   - Dengan JS: React menyela, memanggil aksi server, memperbarui status
 *     sebaris tanpa memuat ulang seluruh halaman.
 *   - Boolean `pending` dari useActionState mendorong status pemuatan pada
 *     tombol kirim (dinonaktifkan + pemintal selama proses jaringan bolak-balik).
 *   - aria-live="polite" pada area umpan balik — pembaca layar (screen readers)
 *     mengumumkan pesan sukses/kesalahan saat berubah (WCAG 2.1 AA).
 *
 * Jaminan CLS = 0:
 *   Area umpan balik SELALU ada di DOM (tinggi telah dipesan),
 *   hanya mengubah konten teksnya — tidak ada penyisipan DOM yang memperluas tinggi.
 *   Ini adalah pola "pesan tempatnya di sisi server" dari PRD §4.5
 *   yang diterapkan pada area umpan balik formulir.
 *
 * Interaksi mikro (aman untuk compositor, desain.md §2):
 *   - Tombol kirim: scale(0.97) saat aktif (CSS, tanpa JS)
 *   - Cincin fokus input: outline CSS, tanpa perubahan tata letak
 *   - Status sukses: transisi opasitas pada ikon centang
 */

import { useActionState } from 'react';
import { subscribeNewsletter, type NewsletterState } from '@/lib/actions';

const INITIAL_STATE: NewsletterState = { status: 'idle', message: '' };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeNewsletter,
    INITIAL_STATE,
  );

  const isSuccess = state.status === 'success';
  const isError = state.status === 'error';
  const isInvalid = state.status === 'invalid';
  const hasMessage = state.message.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium mb-2">
          Stay in the Loop
        </p>
        <p className="text-xs text-crema-300/60 leading-relaxed">
          Biji kopi asli baru, menu musiman, dan pengumuman sesekali.
        </p>
      </div>

      {/*
       * <form> native — berfungsi tanpa JS (POST ke titik akhir aksi server).
       * Dengan JS, useActionState menyela dan memberikan umpan balik sebaris.
       */}
      <form
        action={formAction}
        noValidate           /* validasi klien disediakan oleh HTML5 + JS kita */
        className="flex flex-col gap-3"
      >
        {/* Input email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="newsletter-email"
            className="text-xs text-crema-300/60"
          >
            Alamat email
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={pending || isSuccess}
            placeholder="anda@contoh.com"
            aria-describedby="newsletter-feedback"
            aria-invalid={isInvalid ? 'true' : undefined}
            className={[
              'w-full rounded-xl border bg-espresso-950 px-4 py-3 text-sm text-crema-100',
              'placeholder:text-crema-300/30 outline-none',
              'transition-[border-color,box-shadow] duration-200',
              'focus:border-amber-bistro/60 focus:ring-2 focus:ring-amber-bistro/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isInvalid
                ? 'border-red-500/50 focus:border-red-500/70'
                : 'border-crema-50/10',
            ].join(' ')}
          />
        </div>

        {/*
         * Area umpan balik — SELALU ada di DOM (CLS = 0).
         * Tinggi telah dipesan melalui min-h-[1.25rem]. Teks berubah,
         * tidak ada elemen baru yang disisipkan, tidak ada pergeseran tata letak.
         * aria-live="polite" mengumumkan perubahan ke pembaca layar.
         */}
        <p
          id="newsletter-feedback"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={[
            'min-h-[1.25rem] text-xs leading-tight transition-opacity duration-300',
            hasMessage ? 'opacity-100' : 'opacity-0',
            isSuccess ? 'text-emerald-400' : '',
            isError ? 'text-red-400' : '',
            isInvalid ? 'text-red-400' : '',
            !isSuccess && !isError && !isInvalid ? 'text-crema-300/60' : '',
          ].join(' ')}
        >
          {state.message || '\u00A0' /* spasi tanpa pemisahan (non-breaking space) menjaga tinggi */}
        </p>

        {/* Tombol kirim */}
        <button
          type="submit"
          disabled={pending || isSuccess}
          className={[
            'w-full rounded-xl px-6 py-3 text-xs font-medium tracking-widest uppercase',
            'transition-all duration-200',
            /* Interaksi mikro hanya GPU: skala saat ditekan aktif */
            'active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-espresso-950',
            isSuccess
              ? 'bg-emerald-900/40 text-emerald-400 cursor-default ring-1 ring-emerald-500/20'
              : 'bg-amber-bistro text-espresso-950 hover:bg-gold-accent',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
          ].join(' ')}
          aria-label={
            pending
              ? 'Subscribing…'
              : isSuccess
              ? 'Subscribed successfully'
              : 'Subscribe to newsletter'
          }
        >
          {pending ? (
            /* Pemintal (Spinner) — animasi CSS, tanpa JS, aman untuk compositor (transform: rotate) */
            <span className="inline-flex items-center justify-center gap-2">
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Subscribing…
            </span>
          ) : isSuccess ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Subscribed
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>

      {/* Catatan privasi */}
      <p className="text-[10px] text-crema-300/35 leading-relaxed">
        Tanpa spam. Berhenti berlangganan kapan saja. Kami menghargai privasi Anda.
      </p>
    </div>
  );
}
