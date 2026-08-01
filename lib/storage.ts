import { supabase } from "@/lib/supabase";

export const MENU_IMAGES_BUCKET = "menu-images";
export const SUB_BRAND_ASSETS_BUCKET = "sub-brand-assets";

/**
 * Upload file gambar ke Supabase Storage bucket 'menu-images'.
 *
 * @param file       - File yang dipilih user dari <input type="file">
 * @param prefix     - Prefix opsional untuk nama file (e.g. slug kategori)
 * @returns          - Public URL gambar yang sudah diupload
 * @throws           - Error jika upload gagal
 */
export async function uploadMenuImage(
  file: File,
  prefix: string = "item"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  // Nama file unik: prefix_timestamp.ext  →  item_1722186000000.jpg
  const fileName = `${prefix}_${Date.now()}.${ext}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload gagal: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Gagal mendapatkan public URL gambar.");
  }

  return data.publicUrl;
}

/**
 * Hapus file gambar dari Supabase Storage berdasarkan full public URL-nya.
 * Aman dipanggil meski URL tidak dikenali — error diabaikan secara diam-diam.
 */
export async function deleteMenuImage(publicUrl: string): Promise<void> {
  try {
    // Ekstrak path relatif dari public URL
    // Format: .../storage/v1/object/public/menu-images/public/xxx.jpg
    const marker = `/${MENU_IMAGES_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = publicUrl.slice(idx + marker.length);

    await supabase.storage.from(MENU_IMAGES_BUCKET).remove([filePath]);
  } catch {
    // Gagal hapus tidak boleh crash alur utama
  }
}

/**
 * Upload gambar sub-brand (cropped) ke bucket 'sub-brand-assets'.
 *
 * @param file   - File yang sudah di-crop dari komponen cropper
 * @param prefix - Prefix nama file, default "sub-brand"
 * @returns        Public URL file
 */
export async function uploadSubBrandAsset(
  file: File,
  prefix: string = "sub-brand"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${prefix}_${Date.now()}.${ext}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(SUB_BRAND_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload sub-brand asset gagal: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(SUB_BRAND_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Gagal mendapatkan public URL sub-brand asset.");
  }

  return data.publicUrl;
}

/**
 * Hapus sub-brand asset dari storage berdasarkan public URL-nya.
 * Aman dipanggil meski URL tidak dikenali — error diabaikan.
 */
export async function deleteSubBrandAsset(publicUrl: string): Promise<void> {
  try {
    const marker = `/${SUB_BRAND_ASSETS_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = publicUrl.slice(idx + marker.length);
    await supabase.storage.from(SUB_BRAND_ASSETS_BUCKET).remove([filePath]);
  } catch {
    // Gagal hapus tidak boleh crash alur utama
  }
}
