'use server';

/**
 * Aksi Server Buletin (Newsletter Server Action) — lib/actions.ts
 *
 * Berjalan di server. Terhubung ke NewsletterForm.tsx melalui useActionState.
 * Peningkatan progresif: berfungsi tanpa JS (POST formulir HTML standar),
 * dan dengan JS memberikan umpan balik sebaris melalui objek status useActionState.
 *
 * Implementasi MVP: memvalidasi email dan menyimulasikan langganan yang sukses.
 * Dalam produksi, ganti TODO dengan panggilan API penyedia email Anda
 * (Mailchimp, ConvertKit, Resend, dll.).
 *
 * Catatan keamanan (sesuai panduan formulir Next.js): jangan pernah mempercayai data
 * yang diberikan oleh klien. Validasi di sisi server menggunakan regex native — tanpa
 * mengimpor zod agar ukuran awal JS bundle tetap dalam anggaran PRD §3.
 */

export interface NewsletterState {
  status: 'idle' | 'success' | 'error' | 'invalid';
  message: string;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = formData.get('email');

  // Penjaga tipe (Type guard)
  if (typeof email !== 'string' || email.trim() === '') {
    return { status: 'invalid', message: 'Silakan masukkan alamat email Anda.' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_RE.test(trimmed)) {
    return { status: 'invalid', message: 'Silakan masukkan alamat email yang valid.' };
  }

  // TODO (produksi): panggil API penyedia email Anda di sini.
  // mis. await resend.contacts.create({ email: trimmed, audienceId: '...' });
  //
  // Untuk MVP, kami menyimulasikan perjalanan bolak-balik jaringan 300ms lalu mengembalikan sukses.
  await new Promise((r) => setTimeout(r, 300));

  // Simulasikan kesalahan server sesekali untuk pengujian ketahanan (hapus dalam produksi)
  // if (Math.random() < 0.1) return { status: 'error', message: 'Server error. Please try again.' };

  return {
    status: 'success',
    message: "Berhasil. Kami akan menghubungi Anda — tanpa pesan spam, kapan pun.",
  };
}
