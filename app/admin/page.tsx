"use client";

/**
 * app/admin/page.tsx — GTC Admin Dashboard
 *
 * Manages: Sub-Brands · Sub-Categories · Menus · Best Sellers
 *
 * Layout:
 *  - Header: title left | [+ Tambah Sub Brand] [Logout] right
 *  - Horizontal sub-brand tab strip
 *  - Menu tab: Sub-categories, per-cat "+ Tambah Menu", menu rows with ★ Best Seller toggle
 *  - Best Sellers tab: list active BS, "Edit Detail" (desc + badge only), real-time slot indicator
 *
 * Star-toggle workflow:
 *  - If menu IS a best seller → gold star → click removes it from best_sellers
 *  - If menu is NOT a best seller:
 *      · Quota full (3/3) → disabled + toast "Kuota Best Seller sudah penuh (Maksimal 3)!"
 *      · Quota available → open SetBestSellerModal (pre-filled name/price/image, user adds desc+badge)
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { supabase } from "@/lib/supabase";
import { uploadSubBrandAsset, uploadMenuImage, deleteSubBrandAsset } from "@/lib/storage";
import { useSubBrand } from "@/context/SubBrandContext";
import {
  createSubBrand,
  updateSubBrand,
  deleteSubBrand,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createMenu,
  updateMenu,
  deleteMenu,
  createBestSeller,
  updateBestSeller,
  deleteBestSeller,
} from "@/lib/actions";
import type { User } from "@supabase/supabase-js";
import type { SubBrand, SubCategory, Menu, BestSeller } from "@/lib/types";

// ══════════════════════════════════════════════════════════════════════════════
// Toast Notification
// ══════════════════════════════════════════════════════════════════════════════
interface ToastProps {
  message: string;
  type?: "error" | "success";
  onDismiss: () => void;
}

function Toast({ message, type = "error", onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[500]",
        "flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl",
        "text-sm font-medium tracking-wide max-w-sm text-center",
        "animate-[slideUpFade_0.3s_ease-out_both]",
        type === "error"
          ? "bg-red-500/95 text-white border border-red-400/30"
          : "bg-green-600/95 text-white border border-green-500/30",
      ].join(" ")}
    >
      <span>{type === "error" ? "⚠" : "✓"}</span>
      <span>{message}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// useToast hook
// ══════════════════════════════════════════════════════════════════════════════
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const show = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, showToast: show, dismissToast: dismiss };
}

// ══════════════════════════════════════════════════════════════════════════════
// Reusable: Image Upload + Crop Field
// ══════════════════════════════════════════════════════════════════════════════
interface ImageUploadFieldProps {
  preview: string | null;
  existingUrl?: string | null;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  id: string;
  aspectRatio?: number;
  label?: string;
}

function ImageUploadField({
  preview,
  existingUrl,
  uploading,
  onFileSelect,
  onClear,
  id,
  aspectRatio = 1,
  label = "Foto",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = preview ?? existingUrl ?? null;
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropComplete = useCallback(
    (_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const handleCropDone = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(rawImage, croppedAreaPixels);
      if (cropped) onFileSelect(cropped);
    } catch {
      alert("Gagal memotong gambar.");
    }
    setRawImage(null);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-crema-300 mb-1">
        {label}{" "}
        <span className="text-crema-300/40 font-normal">(opsional)</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {rawImage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium tracking-wide">Potong Gambar</h3>
              <p className="text-crema-300/60 text-xs mt-1">Geser untuk mengatur area, gunakan slider untuk zoom.</p>
            </div>
            <div className="relative w-full h-72 bg-black">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor={`zoom-${id}`} className="text-xs text-crema-300 block mb-2">Zoom</label>
                <input
                  id={`zoom-${id}`}
                  name={`zoom-${id}`}
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-bistro"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setRawImage(null)} className="px-4 py-2 text-sm text-crema-300 hover:text-white transition-colors">
                  Batal
                </button>
                <button type="button" onClick={handleCropDone} className="px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded hover:bg-amber-bistro/90 transition-colors">
                  Selesai Potong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {displaySrc ? (
        <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-white/10 group">
          <Image
            src={displaySrc}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={displaySrc.startsWith("blob:")}
          />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-2 w-max opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-amber-bistro text-[#121212] text-xs font-bold px-3 py-1.5 rounded-md hover:bg-amber-bistro/90 disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-nowrap">
              Ganti Foto
            </button>
            <button type="button" onClick={onClear} disabled={uploading} className="bg-red-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-500 disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-nowrap">
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-white/10 hover:border-amber-bistro/40 rounded-lg py-6 flex flex-col items-center gap-2 text-crema-300/50 hover:text-crema-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18M12 3v9" />
          </svg>
          <span className="text-xs font-medium tracking-wide">Klik untuk pilih foto</span>
          <span className="text-[10px] text-crema-300/30">JPG, PNG, WEBP · Maks 5 MB</span>
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Reusable: Spinner
// ══════════════════════════════════════════════════════════════════════════════
function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Set Best Seller Modal
// Opens when star is clicked and quota is available.
// Pre-fills Name, Price, Image URL from the menu row.
// User only fills: Description (required) + Badge (default "SIGNATURE").
// ══════════════════════════════════════════════════════════════════════════════
interface SetBestSellerModalProps {
  menu: Menu;
  subBrandId: string;
  onClose: () => void;
  onSaved: () => void;
}

function SetBestSellerModal({ menu, subBrandId, onClose, onSaved }: SetBestSellerModalProps) {
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("SIGNATURE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Custom image state
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

  // Cropper state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = useCallback(
    (_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const handleCropDone = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(rawImage, croppedAreaPixels);
      if (croppedFile) {
        setCustomImageFile(croppedFile);
        setCustomImagePreview(URL.createObjectURL(croppedFile));
      }
    } catch {
      alert("Gagal memotong gambar.");
    }
    setRawImage(null);
  };

  // Option to crop existing image directly
  const handleCropExisting = async () => {
    if (!menu.image_url) return;
    try {
      setSaving(true);
      const res = await fetch(menu.image_url);
      const blob = await res.blob();
      setRawImage(URL.createObjectURL(blob));
    } catch {
      alert("Gagal memuat gambar bawaan untuk di-crop. Anda bisa upload gambar baru.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!description.trim()) {
      setError("Deskripsi Best Seller wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      let finalImageUrl = menu.image_url ?? null;
      
      // Jika ada custom crop, upload ke bucket sub-brand-assets
      if (customImageFile) {
        finalImageUrl = await uploadSubBrandAsset(customImageFile, "bs-custom");
      }

      const res = await createBestSeller({
        sub_brand_id: subBrandId,
        name: menu.name,
        description: description.trim(),
        price: menu.price,
        badge: badge.trim(),
        image_url: finalImageUrl,
      });
      if (res?.success) {
        if (customImagePreview) URL.revokeObjectURL(customImagePreview);
        // showToast("Menu berhasil ditambahkan sebagai Best Seller", "success"); // Not in scope of Modal directly, handled by onSaved
        onSaved();
      } else {
        setError(res?.error || "Gagal menyimpan.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  // Preview to show: custom crop > existing menu image
  const displayImage = customImagePreview ?? menu.image_url ?? null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-amber-bistro/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium mb-1">★ Set Best Seller</p>
            <h2 className="text-base font-bold text-crema-50">{menu.name}</h2>
            <p className="text-xs text-crema-300/50 mt-0.5 font-mono">{menu.price}</p>
          </div>
          <button onClick={onClose} disabled={saving} className="text-crema-300/50 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Preview & Crop Actions */}
        <div>
          {displayImage ? (
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-white/10 group bg-black">
              <Image 
                src={displayImage} 
                alt={menu.name} 
                fill 
                className="object-cover" 
                sizes="400px" 
                unoptimized={displayImage.startsWith("blob:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-3 text-[10px] text-crema-300/80 font-medium bg-black/40 px-2 py-0.5 rounded">
                {customImagePreview ? "Custom Crop Best Seller" : "Gambar menu (Otomatis dipakai)"}
              </span>
            </div>
          ) : (
             <div className="relative w-full aspect-[4/3] rounded-lg border border-dashed border-white/10 flex items-center justify-center bg-white/5">
                <span className="text-xs text-crema-300/40">Tidak ada gambar</span>
             </div>
          )}

          {/* Action Button */}
          <div className="mt-3 flex gap-2">
            <input 
              id={`bs-file-input-${menu.id}`}
              name={`bs-file-input-${menu.id}`}
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 border border-amber-bistro/30 text-amber-bistro text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-bistro/10 transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload Gambar Baru
            </button>
            {menu.image_url && !customImagePreview && (
              <button
                onClick={handleCropExisting}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 border border-amber-bistro/30 text-amber-bistro text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-bistro/10 transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Sesuaikan / Potong
              </button>
            )}
            {customImagePreview && (
              <button
                onClick={() => {
                  if (customImagePreview) URL.revokeObjectURL(customImagePreview);
                  setCustomImageFile(null);
                  setCustomImagePreview(null);
                }}
                disabled={saving}
                className="px-3 py-2 text-xs font-bold border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Hapus Custom
              </button>
            )}
          </div>
        </div>

        {/* User-input fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor={`bs-desc-${menu.id}`} className="block text-xs text-crema-300 mb-1.5">
              Deskripsi Best Seller <span className="text-amber-bistro">*</span>
            </label>
            <textarea
              id={`bs-desc-${menu.id}`}
              name={`bs-desc-${menu.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Deskripsikan mengapa menu ini spesial untuk ditampilkan di landing page..."
              className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50 resize-none"
            />
          </div>
          <div>
            <label htmlFor={`bs-badge-${menu.id}`} className="block text-xs text-crema-300 mb-1.5">Badge / Tag</label>
            <input
              id={`bs-badge-${menu.id}`}
              name={`bs-badge-${menu.id}`}
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              disabled={saving}
              placeholder="SIGNATURE"
              className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded-lg hover:bg-amber-bistro/90 disabled:opacity-60"
          >
            {saving && <Spinner className="h-3.5 w-3.5" />}
            {saving ? "Menyimpan..." : "★ Set Best Seller"}
          </button>
        </div>
      </div>

      {/* Cropper Modal overlay */}
      {rawImage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium tracking-wide">Potong Gambar Khusus Best Seller</h3>
              <p className="text-crema-300/60 text-xs mt-1">Sesuaikan area gambar dengan rasio 4:3 (Lanskap).</p>
            </div>
            <div className="relative w-full h-72 bg-black">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor={`bs-zoom-${menu.id}`} className="text-xs text-crema-300 block mb-2">Zoom</label>
                <input
                  id={`bs-zoom-${menu.id}`}
                  name={`bs-zoom-${menu.id}`}
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-bistro"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setRawImage(null)} className="px-4 py-2 text-sm text-crema-300 hover:text-white transition-colors">
                  Batal
                </button>
                <button type="button" onClick={handleCropDone} className="px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded hover:bg-amber-bistro/90 transition-colors">
                  Selesai Potong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-Brand Modal (Create / Edit)
// ══════════════════════════════════════════════════════════════════════════════
interface SubBrandModalProps {
  editing: SubBrand | null;
  onClose: () => void;
  onSaved: () => void;
}

function SubBrandModal({ editing, onClose, onSaved }: SubBrandModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [iconName, setIconName] = useState(editing?.icon_name ?? "coffee");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(editing?.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
  }, []);

  const handleClear = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setExistingUrl(null);
  }, [imagePreview]);

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Nama wajib diisi."); return; }
    setSaving(true);
    try {
      let imageUrl: string | null | undefined = undefined;
      if (imageFile) {
        if (editing?.image_url) await deleteSubBrandAsset(editing.image_url);
        imageUrl = await uploadSubBrandAsset(imageFile, "brand");
      } else if (existingUrl === null && editing?.image_url) {
        await deleteSubBrandAsset(editing.image_url);
        imageUrl = null;
      }
      const payload = {
        name,
        description,
        icon_name: iconName,
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      };
      const result = editing
        ? await updateSubBrand(editing.id, payload)
        : await createSubBrand(payload);
      if (!result.success) { setError(result.error ?? "Gagal menyimpan."); return; }
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-amber-bistro font-bold tracking-widest uppercase text-sm">
            {editing ? "Edit Sub-Brand" : "Tambah Sub-Brand"}
          </h2>
          <button onClick={onClose} className="text-crema-300/50 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="sb-name" className="block text-xs text-crema-300 mb-1">Nama Sub-Brand *</label>
            <input id="sb-name" name="sb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={saving}
              placeholder="Contoh: MOURO, RAMENIKU..."
              className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50" />
          </div>
          <div>
            <label htmlFor="sb-desc" className="block text-xs text-crema-300 mb-1">Deskripsi</label>
            <textarea id="sb-desc" name="sb-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} rows={3}
              placeholder="Teaser singkat untuk kartu brand..."
              className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50 resize-none" />
          </div>
          <div>
            <label htmlFor="sb-icon" className="block text-xs text-crema-300 mb-1">Icon Name</label>
            <input id="sb-icon" name="sb-icon" type="text" value={iconName} onChange={(e) => setIconName(e.target.value)} disabled={saving}
              placeholder="coffee / ramen / noodle / chicken..."
              className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50" />
          </div>
          <ImageUploadField id="sub-brand-image" preview={imagePreview} existingUrl={existingUrl} uploading={saving}
            onFileSelect={handleFileSelect} onClear={handleClear} aspectRatio={3 / 4} label="Foto Brand" />
        </div>
        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded-lg hover:bg-amber-bistro/90 disabled:opacity-60">
            {saving && <Spinner className="h-3.5 w-3.5" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Delete Sub-Brand Confirmation Dialog
// Destructive — warns about cascading data loss.
// ══════════════════════════════════════════════════════════════════════════════
interface DeleteSubBrandDialogProps {
  brand: SubBrand;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteSubBrandDialog({ brand, onCancel, onConfirm }: DeleteSubBrandDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-crema-50">Hapus Sub-Brand?</h2>
            <p className="text-xs text-crema-300/60 mt-0.5">
              <span className="text-amber-bistro font-semibold">{brand.name}</span>
            </p>
          </div>
        </div>

        {/* Warning body */}
        <p className="text-sm text-crema-300/80 leading-relaxed bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
          Apakah Anda yakin ingin menghapus sub-brand ini? Semua kategori, menu, dan best seller di dalamnya akan terhapus permanen.
        </p>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-1 border-t border-white/5">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-60 transition-colors"
          >
            {deleting && <Spinner className="h-3.5 w-3.5" />}
            {deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Best Sellers Panel — Tab "Best Sellers"
// Shows active BS list, "Edit Detail" (desc + badge only), slot indicator.
// ══════════════════════════════════════════════════════════════════════════════
interface BestSellersPanelProps {
  subBrandId: string;
  bestSellers: BestSeller[];
  onRefetch: () => void;
}

function BestSellersPanel({ bestSellers, onRefetch }: BestSellersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", badge: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  // ── Delete Best Seller confirmation dialog state ──────────────────────────
  const [deletingBs, setDeletingBs] = useState<BestSeller | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleOpenEdit = (bs: BestSeller) => {
    setEditingId(bs.id);
    setEditForm({ description: bs.description, badge: bs.badge });
    setError("");
  };

  const handleSaveEdit = async (bsId: string) => {
    setSaving(true);
    setError("");
    try {
      const result = await updateBestSeller(bsId, {
        description: editForm.description.trim(),
        badge: editForm.badge.trim(),
      });
      if (!result.success) { setError(result.error ?? "Gagal."); return; }
      setEditingId(null);
      startTransition(() => { onRefetch(); });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBs) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const result = await deleteBestSeller(deletingBs.id);
      if (!result.success) {
        setDeleteError(result.error ?? "Gagal menghapus.");
        return;
      }
      setDeletingBs(null);
      startTransition(() => { onRefetch(); });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {/* ── Delete Best Seller confirmation dialog ── */}
      {deletingBs && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-amber-bistro/20 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-bistro/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-amber-bistro">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-crema-50">Hapus dari Best Seller?</h2>
                <p className="text-xs text-crema-300/60 mt-0.5">
                  <span className="text-amber-bistro font-semibold">{deletingBs.name}</span>
                </p>
              </div>
            </div>

            {/* Warning body */}
            <p className="text-sm text-crema-300/80 leading-relaxed bg-amber-bistro/5 border border-amber-bistro/15 rounded-xl px-4 py-3">
              Hapus{" "}
              <span className="text-crema-50 font-semibold">&ldquo;{deletingBs.name}&rdquo;</span>{" "}
              dari daftar Best Seller? Item ini tidak akan tampil di landing page, namun menu aslinya tetap tersimpan.
            </p>

            {deleteError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1 border-t border-white/5">
              <button
                onClick={() => { setDeletingBs(null); setDeleteError(""); }}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-bistro hover:bg-amber-bistro/90 text-[#121212] font-bold rounded-lg disabled:opacity-60 transition-colors"
              >
                {deleteLoading && <Spinner className="h-3.5 w-3.5" />}
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Slot indicator */}
      <div className="flex items-center gap-2 mb-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 w-10 rounded-full transition-all duration-300 ${
              i < bestSellers.length ? "bg-amber-bistro shadow-[0_0_8px_rgba(212,146,78,0.6)]" : "bg-white/10"
            }`}
          />
        ))}
        <span className="text-xs text-crema-300/50 ml-1 font-mono">{bestSellers.length}/3 slot aktif</span>
        {bestSellers.length === 3 && (
          <span className="text-[10px] bg-amber-bistro/15 text-amber-bistro border border-amber-bistro/25 px-2 py-0.5 rounded-full tracking-wider">
            🔒 Penuh
          </span>
        )}
      </div>

      <p className="text-xs text-crema-300/40 mb-4">
        Gunakan tombol ★ di Tab Menu untuk menambah best seller dari menu yang ada.
        Di sini Anda hanya dapat mengedit Deskripsi dan Badge.
      </p>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 mb-4">{error}</p>
      )}

      {bestSellers.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-xl py-12 text-center">
          <p className="text-3xl mb-2 opacity-40">☆</p>
          <p className="text-crema-300/40 text-sm">Belum ada best seller.</p>
          <p className="text-crema-300/30 text-xs mt-1">Klik tombol ★ pada baris menu di Tab Menu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bestSellers.map((bs) => {
            const isEditing = editingId === bs.id;
            return (
              <div
                key={bs.id}
                className="bg-[#1a1a1a] border border-amber-bistro/10 rounded-xl p-4 hover:border-amber-bistro/25 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      {bs.image_url && (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={bs.image_url} alt={bs.name} fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-crema-50">{bs.name}</p>
                        <p className="text-xs font-mono text-amber-bistro">{bs.price}</p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`edit-bs-desc-${bs.id}`} className="block text-xs text-crema-300 mb-1">Deskripsi Best Seller</label>
                      <textarea
                        id={`edit-bs-desc-${bs.id}`}
                        name={`edit-bs-desc-${bs.id}`}
                        value={editForm.description}
                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                        disabled={saving}
                        rows={3}
                        className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-sm focus:border-amber-bistro outline-none resize-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-bs-badge-${bs.id}`} className="block text-xs text-crema-300 mb-1">Badge / Tag</label>
                      <input
                        id={`edit-bs-badge-${bs.id}`}
                        name={`edit-bs-badge-${bs.id}`}
                        type="text"
                        value={editForm.badge}
                        onChange={(e) => setEditForm((p) => ({ ...p, badge: e.target.value }))}
                        disabled={saving}
                        className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(bs.id)}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-400/20 disabled:opacity-50"
                      >
                        {saving && <Spinner className="h-3 w-3" />}
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={saving}
                        className="bg-white/5 text-crema-300 px-3 py-1.5 rounded text-xs hover:bg-white/10 disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {bs.image_url && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={bs.image_url} alt={bs.name} fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-crema-50 truncate">{bs.name}</p>
                          {bs.badge && (
                            <span className="text-[9px] tracking-widest uppercase text-amber-bistro font-medium">{bs.badge}</span>
                          )}
                        </div>
                        <span className="font-mono text-amber-bistro text-sm font-bold flex-shrink-0">{bs.price}</span>
                      </div>
                      {bs.description && (
                        <p className="text-xs text-crema-300/60 mt-1 line-clamp-2">{bs.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(bs)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium whitespace-nowrap"
                      >
                        Edit Detail
                      </button>
                      <button
                        onClick={() => { setDeleteError(""); setDeletingBs(bs); }}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-Category Section — Tab "Menu"
// Includes star-toggle button on every menu row.
// ══════════════════════════════════════════════════════════════════════════════
interface SubCategorySectionProps {
  subBrandId: string;
  subCategories: SubCategory[];
  menus: Record<string, Menu[]>;
  bestSellers: BestSeller[];          // needed for star-toggle logic
  onRefetchCategories: () => void;
  onRefetchMenus: (subCatId: string) => void;
  onRefetchBestSellers: () => void;   // called after toggle
}

function SubCategorySection({
  subBrandId,
  subCategories,
  menus,
  bestSellers,
  onRefetchCategories,
  onRefetchMenus,
  onRefetchBestSellers,
}: SubCategorySectionProps) {
  const { showToast, toast, dismissToast } = useToast();

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const [addMenuFor, setAddMenuFor] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "", price: "",
    imageFile: null as File | null, imagePreview: null as string | null,
  });
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [editMenuId, setEditMenuId] = useState<string | null>(null);
  const [editMenuForm, setEditMenuForm] = useState({
    name: "", price: "",
    imageFile: null as File | null, imagePreview: null as string | null,
    existingUrl: null as string | null,
  });
  const [editMenuSaving, setEditMenuSaving] = useState(false);

  // Star-toggle state
  const [bsModal, setBsModal] = useState<Menu | null>(null);   // menu waiting to become BS
  const [starLoading, setStarLoading] = useState<string | null>(null); // menu id being processed

  // ── Accordion open/closed state keyed by sub-category ID ─────────────────
  // All panels start open (true). New sub-categories inherit open state on first toggle.
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const isCatOpen = (id: string): boolean => openCats[id] !== false; // default open
  const toggleCat = (id: string) =>
    setOpenCats((prev) => ({ ...prev, [id]: !isCatOpen(id) }));

  const bsCount = bestSellers.length;
  const bsMenuNames = new Set(bestSellers.map((b) => b.name)); // for lookup (name-based match)
  // Better: match by name+price since we don't store menu_id in best_sellers
  const getBestSellerForMenu = (menu: Menu) =>
    bestSellers.find((b) => b.name === menu.name && b.price === menu.price) ?? null;

  const handleAddMenuFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setMenuForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
  }, []);
  const handleAddMenuClear = useCallback(() => {
    if (menuForm.imagePreview) URL.revokeObjectURL(menuForm.imagePreview);
    setMenuForm((p) => ({ ...p, imageFile: null, imagePreview: null }));
  }, [menuForm.imagePreview]);
  const handleEditMenuFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setEditMenuForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
  }, []);
  const handleEditMenuClear = useCallback(() => {
    if (editMenuForm.imagePreview) URL.revokeObjectURL(editMenuForm.imagePreview);
    setEditMenuForm((p) => ({ ...p, imageFile: null, imagePreview: null, existingUrl: null }));
  }, [editMenuForm.imagePreview]);

  const handleSaveCat = async () => {
    setCatError("");
    if (!newCatName.trim()) { setCatError("Nama wajib diisi."); return; }
    setCatSaving(true);
    try {
      const result = await createSubCategory({ sub_brand_id: subBrandId, name: newCatName });
      if (!result.success) { setCatError(result.error ?? "Gagal."); return; }
      setNewCatName(""); setShowAddCat(false);
      onRefetchCategories();
    } finally { setCatSaving(false); }
  };

  const handleUpdateCat = async (id: string) => {
    if (!editCatName.trim()) return;
    const result = await updateSubCategory(id, editCatName);
    if (!result.success) { alert(result.error); return; }
    setEditCatId(null);
    onRefetchCategories();
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Hapus sub-kategori "${name}" beserta semua menu-nya?`)) return;
    const result = await deleteSubCategory(id);
    if (!result.success) { alert(result.error); return; }
    onRefetchCategories();
  };

  const handleSaveMenu = async (subCatId: string) => {
    setMenuError("");
    if (!menuForm.name.trim() || !menuForm.price.trim()) { setMenuError("Nama dan harga wajib diisi."); return; }
    setMenuSaving(true);
    try {
      let imageUrl: string | null = null;
      if (menuForm.imageFile) imageUrl = await uploadMenuImage(menuForm.imageFile, "menu");
      const result = await createMenu({ sub_category_id: subCatId, name: menuForm.name, price: menuForm.price, image_url: imageUrl });
      if (!result.success) { setMenuError(result.error ?? "Gagal."); return; }
      if (menuForm.imagePreview) URL.revokeObjectURL(menuForm.imagePreview);
      setMenuForm({ name: "", price: "", imageFile: null, imagePreview: null });
      setAddMenuFor(null);
      onRefetchMenus(subCatId);
    } finally { setMenuSaving(false); }
  };

  const handleUpdateMenu = async (menu: Menu) => {
    setEditMenuSaving(true);
    try {
      let imageUrl: string | null | undefined = undefined;
      if (editMenuForm.imageFile) imageUrl = await uploadMenuImage(editMenuForm.imageFile, "menu");
      else if (editMenuForm.existingUrl === null) imageUrl = null;
      const result = await updateMenu(menu.id, {
        name: editMenuForm.name,
        price: editMenuForm.price,
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      });
      if (!result.success) { alert(result.error); return; }
      if (editMenuForm.imagePreview) URL.revokeObjectURL(editMenuForm.imagePreview);
      setEditMenuId(null);
      onRefetchMenus(menu.sub_category_id);
    } finally { setEditMenuSaving(false); }
  };

  const handleDeleteMenu = async (menu: Menu) => {
    if (!confirm(`Hapus menu "${menu.name}"?`)) return;
    const result = await deleteMenu(menu.id);
    if (!result.success) { alert(result.error); return; }
    onRefetchMenus(menu.sub_category_id);
  };

  // ── Star toggle ──────────────────────────────────────────────────────────
  const handleStarToggle = async (menu: Menu) => {
    const matched = getBestSellerForMenu(menu);

    if (matched) {
      // Already a best seller → remove
      setStarLoading(menu.id);
      try {
        const result = await deleteBestSeller(matched.id);
        if (!result.success) { alert(result.error); return; }
        onRefetchBestSellers();
      } finally {
        setStarLoading(null);
      }
      return;
    }

    // Not a best seller → check quota
    if (bsCount >= 3) {
      showToast("Kuota Best Seller sudah penuh (Maksimal 3)!", "error");
      return;
    }

    // Open modal for description + badge
    setBsModal(menu);
  };

  return (
    <>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      {/* Set Best Seller Modal */}
      {bsModal && (
        <SetBestSellerModal
          key={bsModal.id}
          menu={bsModal}
          subBrandId={subBrandId}
          onClose={() => setBsModal(null)}
          onSaved={() => {
            setBsModal(null);
            onRefetchBestSellers();
          }}
        />
      )}

      {/* ── Add Sub-Category Modal ── */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-amber-bistro/30 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-amber-bistro font-bold tracking-widest uppercase text-sm">Tambah Sub-Kategori</h2>
              <button
                onClick={() => { setShowAddCat(false); setNewCatName(""); setCatError(""); }}
                disabled={catSaving}
                className="text-crema-300/50 hover:text-white transition-colors disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div>
              <label htmlFor="new-cat-name" className="block text-xs text-crema-300 mb-1.5">Nama Sub-Kategori <span className="text-amber-bistro">*</span></label>
              <input
                id="new-cat-name"
                name="new-cat-name"
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                disabled={catSaving}
                placeholder="Nama sub-kategori baru..."
                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveCat(); if (e.key === "Escape") { setShowAddCat(false); setNewCatName(""); setCatError(""); } }}
                autoFocus
              />
            </div>
            {catError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{catError}</p>
            )}
            {/* Footer */}
            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => { setShowAddCat(false); setNewCatName(""); setCatError(""); }}
                disabled={catSaving}
                className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCat}
                disabled={catSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded-lg hover:bg-amber-bistro/90 disabled:opacity-60"
              >
                {catSaving && <Spinner className="h-3.5 w-3.5" />}
                {catSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* ── Add Sub Category trigger ── */}
        <div className="mb-5">
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-2 text-sm font-bold text-crema-300 hover:text-amber-bistro border border-white/10 hover:border-amber-bistro/30 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Sub-Kategori
          </button>
        </div>

        {/* ── Best seller quota bar (visible in Menu tab) ── */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-[10px] text-crema-300/40 uppercase tracking-wider">Kuota Best Seller:</span>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                i < bsCount ? "bg-amber-bistro" : "bg-white/10"
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-crema-300/50">{bsCount}/3</span>
        </div>

        {/* ── Sub Category List ── */}
        {subCategories.length === 0 ? (
          <p className="text-crema-300/40 text-sm text-center py-8">Belum ada sub-kategori. Tambahkan terlebih dahulu.</p>
        ) : (
          subCategories.map((cat) => {
            const catMenus = menus[cat.id] ?? [];
            return (
              <div key={cat.id} className="border border-white/5 rounded-xl overflow-hidden">
                {/* Sub-category header — clicking anywhere on the row toggles accordion */}
                <div
                  className="flex items-center justify-between bg-[#1a1a1a] px-4 py-3 border-b border-white/5 cursor-pointer select-none"
                  onClick={() => { if (editCatId !== cat.id) toggleCat(cat.id); }}
                >
                  {editCatId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="flex-1 bg-[#121212] border border-amber-bistro/50 rounded px-2 py-1 text-sm focus:border-amber-bistro outline-none"
                        onKeyDown={(e) => { if (e.key === "Enter") handleUpdateCat(cat.id); if (e.key === "Escape") setEditCatId(null); }}
                      />
                      <button onClick={() => handleUpdateCat(cat.id)} className="text-green-400 text-xs font-bold">Simpan</button>
                      <button onClick={() => setEditCatId(null)} className="text-crema-300/50 text-xs">Batal</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Animated chevron */}
                        <svg
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                          className={`h-3.5 w-3.5 flex-shrink-0 text-amber-bistro/60 transition-transform duration-300 ${
                            isCatOpen(cat.id) ? "rotate-0" : "-rotate-90"
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        {/* Title + count stacked vertically */}
                        <div className="flex flex-col items-start gap-0.5 min-w-0">
                          <h3 className="text-sm font-bold text-amber-bistro uppercase tracking-widest leading-none">{cat.name}</h3>
                          <span className="text-xs text-crema-300/40 leading-none">{catMenus.length} menu</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); }} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCat(cat.id, cat.name)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Accordion body: CSS-grid height transition ── */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isCatOpen(cat.id)
                      ? "grid-rows-[1fr] opacity-100 pointer-events-auto"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    {/* Add Menu Modal — rendered as global overlay when this category is active */}
                    {addMenuFor === cat.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
                        <div className="bg-[#1a1a1a] border border-amber-bistro/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-bistro font-medium mb-0.5">Tambah Menu</p>
                              <h2 className="text-base font-bold text-crema-50">{cat.name}</h2>
                            </div>
                            <button
                              onClick={() => { handleAddMenuClear(); setAddMenuFor(null); setMenuError(""); }}
                              disabled={menuSaving}
                              className="text-crema-300/50 hover:text-white transition-colors disabled:opacity-40"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {/* Body */}
                          <div className="space-y-4">
                            <div>
                              <label htmlFor={`menu-name-${cat.id}`} className="block text-xs text-crema-300 mb-1.5">Nama Menu <span className="text-amber-bistro">*</span></label>
                              <input
                                id={`menu-name-${cat.id}`}
                                name={`menu-name-${cat.id}`}
                                type="text"
                                value={menuForm.name}
                                onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))}
                                disabled={menuSaving}
                                placeholder="Nama menu..."
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label htmlFor={`menu-price-${cat.id}`} className="block text-xs text-crema-300 mb-1.5">Harga <span className="text-amber-bistro">*</span></label>
                              <input
                                id={`menu-price-${cat.id}`}
                                name={`menu-price-${cat.id}`}
                                type="text"
                                value={menuForm.price}
                                onChange={(e) => setMenuForm((p) => ({ ...p, price: e.target.value }))}
                                disabled={menuSaving}
                                placeholder="25K"
                                className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-2 text-sm focus:border-amber-bistro outline-none disabled:opacity-50 font-mono"
                              />
                            </div>
                            <ImageUploadField
                              id={`menu-add-${cat.id}`}
                              preview={menuForm.imagePreview}
                              uploading={menuSaving}
                              onFileSelect={handleAddMenuFileSelect}
                              onClear={handleAddMenuClear}
                              label="Foto Menu"
                            />
                          </div>
                          {menuError && (
                            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{menuError}</p>
                          )}
                          {/* Footer */}
                          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                            <button
                              onClick={() => { handleAddMenuClear(); setAddMenuFor(null); setMenuError(""); }}
                              disabled={menuSaving}
                              className="px-4 py-2 text-sm text-crema-300 hover:text-white bg-white/5 rounded-lg disabled:opacity-50"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveMenu(cat.id)}
                              disabled={menuSaving}
                              className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded-lg hover:bg-amber-bistro/90 disabled:opacity-60"
                            >
                              {menuSaving && <Spinner className="h-3.5 w-3.5" />}
                              {menuSaving ? "Menyimpan..." : "Simpan Menu"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Menu table with ★ Best Seller toggle ── */}
                    {catMenus.length > 0 && (
                      <div className="overflow-x-auto whitespace-nowrap scrollbar-none">
                        <table className="min-w-[768px] w-full text-sm text-left">
                          <thead>
                            <tr className="text-crema-300/40 border-b border-white/5">
                              <th className="px-4 py-2 font-medium w-8" />
                              <th className="px-2 py-2 font-medium">Nama Menu</th>
                              <th className="px-2 py-2 font-medium w-28">Harga</th>
                              <th className="px-4 py-2 font-medium text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {catMenus.map((menu) => {
                              const isEditingMenu = editMenuId === menu.id;
                              const matchedBs = getBestSellerForMenu(menu);
                              const isBs = matchedBs !== null;
                              const isStarLoading = starLoading === menu.id;
                              const isStarDisabled = !isBs && bsCount >= 3;

                              return (
                                <tr key={menu.id} className="hover:bg-white/[0.02] transition-colors">
                                  {/* Thumbnail */}
                                  <td className="px-4 py-2.5">
                                    {menu.image_url ? (
                                      <div className="relative w-7 h-7 rounded overflow-hidden">
                                        <Image src={menu.image_url} alt={menu.name} fill className="object-cover" sizes="28px" />
                                      </div>
                                    ) : (
                                      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-crema-300/20">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                                        </svg>
                                      </div>
                                    )}
                                  </td>

                                  {/* Name / Edit form */}
                                  <td className="px-2 py-2.5">
                                    {isEditingMenu ? (
                                      <div className="space-y-1.5">
                                        <input id={`edit-menu-name-${menu.id}`} name={`edit-menu-name-${menu.id}`} type="text" value={editMenuForm.name}
                                          onChange={(e) => setEditMenuForm((p) => ({ ...p, name: e.target.value }))}
                                          disabled={editMenuSaving}
                                          className="w-full bg-[#121212] border border-white/20 rounded px-2 py-1 text-sm focus:border-amber-bistro outline-none" />
                                        <ImageUploadField id={`menu-edit-${menu.id}`} preview={editMenuForm.imagePreview}
                                          existingUrl={editMenuForm.existingUrl} uploading={editMenuSaving}
                                          onFileSelect={handleEditMenuFileSelect} onClear={handleEditMenuClear} label="Foto" />
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="text-crema-50 font-medium">{menu.name}</span>
                                        {isBs && (
                                          <span className="text-[9px] bg-amber-bistro/15 text-amber-bistro border border-amber-bistro/25 px-1.5 py-0.5 rounded-full tracking-wider font-medium">
                                            ★ BS
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Price */}
                                  <td className="px-2 py-2.5">
                                    {isEditingMenu ? (
                                      <input id={`edit-menu-price-${menu.id}`} name={`edit-menu-price-${menu.id}`} type="text" value={editMenuForm.price}
                                        onChange={(e) => setEditMenuForm((p) => ({ ...p, price: e.target.value }))}
                                        disabled={editMenuSaving}
                                        className="w-24 bg-[#121212] border border-white/20 rounded px-2 py-1 text-sm focus:border-amber-bistro outline-none font-mono" />
                                    ) : (
                                      <span className="font-mono text-amber-bistro">{menu.price}</span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="px-4 py-2.5 text-right">
                                    {isEditingMenu ? (
                                      <div className="flex justify-end gap-2 items-center">
                                        <button onClick={() => handleUpdateMenu(menu)} disabled={editMenuSaving}
                                          className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-bold bg-green-400/10 px-2 py-1 rounded disabled:opacity-50">
                                          {editMenuSaving && <Spinner className="h-3 w-3" />}
                                          Simpan
                                        </button>
                                        <button onClick={() => { if (editMenuForm.imagePreview) URL.revokeObjectURL(editMenuForm.imagePreview); setEditMenuId(null); }}
                                          disabled={editMenuSaving} className="text-crema-300 text-xs bg-white/5 px-2 py-1 rounded">
                                          Batal
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-end items-center gap-2">
                                        {/* ★ Best Seller Toggle */}
                                        <button
                                          onClick={() => handleStarToggle(menu)}
                                          disabled={isStarLoading || isStarDisabled}
                                          title={
                                            isBs
                                              ? "Hapus dari Best Seller"
                                              : isStarDisabled
                                              ? "Kuota penuh (3/3)"
                                              : "Set sebagai Best Seller"
                                          }
                                          className={[
                                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all duration-200",
                                            isBs
                                              ? "bg-amber-bistro/20 text-amber-bistro border border-amber-bistro/40 hover:bg-amber-bistro/30 shadow-[0_0_8px_rgba(212,146,78,0.2)]"
                                              : isStarDisabled
                                              ? "bg-white/5 text-crema-300/25 cursor-not-allowed border border-white/5"
                                              : "bg-white/5 text-crema-300/60 border border-white/10 hover:bg-amber-bistro/10 hover:text-amber-bistro hover:border-amber-bistro/30",
                                          ].join(" ")}
                                        >
                                          {isStarLoading ? (
                                            <Spinner className="h-3 w-3" />
                                          ) : (
                                            <span className={isBs ? "text-amber-bistro" : ""}>{isBs ? "★" : "☆"}</span>
                                          )}
                                          <span className="hidden sm:inline">{isBs ? "Best Seller" : "Set BS"}</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setEditMenuId(menu.id);
                                            setEditMenuForm({ name: menu.name, price: menu.price, imageFile: null, imagePreview: null, existingUrl: menu.image_url ?? null });
                                          }}
                                          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                                        >
                                          Edit
                                        </button>
                                        <button onClick={() => handleDeleteMenu(menu)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                                          Hapus
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {catMenus.length === 0 && addMenuFor !== cat.id && (
                      <p className="text-crema-300/40 text-sm text-center py-5 px-4">Belum ada menu di sub-kategori ini.</p>
                    )}

                    {/* ── Tambah Menu — full-width trigger at accordion bottom ── */}
                    {addMenuFor !== cat.id && (
                      <div className="px-4 py-3 border-t border-white/5">
                        <button
                          onClick={() => { setAddMenuFor(cat.id); setMenuError(""); }}
                          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 bg-green-400/8 hover:bg-green-400/15 border border-dashed border-green-400/25 hover:border-green-400/50 px-4 py-2.5 rounded-lg transition-all duration-200"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Tambah Menu
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const {
    subBrands,
    subCategories,
    menus,
    bestSellers,
    isLoadingBrands,
    refetchSubBrands,
    refetchSubCategories,
    refetchMenus,
    refetchBestSellers,
  } = useSubBrand();

  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "bestsellers">("menu");
  const [showSubBrandModal, setShowSubBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<SubBrand | null>(null);
  const [deleteDialogBrand, setDeleteDialogBrand] = useState<SubBrand | null>(null);

  const activeBrand = subBrands.find((b) => b.id === activeBrandId) ?? null;
  const activeCats = activeBrandId ? (subCategories[activeBrandId] ?? []) : [];
  const activeBestSellers = activeBrandId ? (bestSellers[activeBrandId] ?? []) : [];

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/admin/login"); return; }
      setUser(u);
      setAuthLoading(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!activeBrandId && subBrands.length > 0) {
      setActiveBrandId(subBrands[0].id);
    }
  }, [subBrands, activeBrandId]);

  useEffect(() => {
    if (activeBrandId) {
      refetchSubCategories(activeBrandId);
      refetchBestSellers(activeBrandId);
    }
  }, [activeBrandId, refetchSubCategories, refetchBestSellers]);

  useEffect(() => {
    const cats = activeBrandId ? (subCategories[activeBrandId] ?? []) : [];
    cats.forEach((cat) => refetchMenus(cat.id));
  }, [subCategories, activeBrandId, refetchMenus]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const handleDeleteBrand = async (brand: SubBrand) => {
    const result = await deleteSubBrand(brand.id);
    if (!result.success) throw new Error(result.error ?? "Gagal menghapus sub-brand.");
    // ── Active-state fallback guard ───────────────────────────────────────────
    // If the deleted brand was active, switch focus to the first remaining brand
    // (or null if the list becomes empty) to prevent reading properties of undefined.
    if (activeBrandId === brand.id) {
      const remaining = subBrands.filter((b) => b.id !== brand.id);
      setActiveBrandId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteDialogBrand(null);
    refetchSubBrands();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-amber-bistro" />
          <p className="text-crema-300/50 text-sm tracking-widest uppercase">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-crema-50 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">

        {/* ── HEADER ── */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-bistro tracking-widest uppercase">Admin Dashboard</h1>
          <p className="text-crema-300/60 mt-1 mb-3 text-sm">
            Login sebagai: <span className="text-crema-300">{user?.email}</span>
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-medium text-crema-300 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </header>

        {/* ── SUB-BRAND TABS ── */}
        {isLoadingBrands ? (
          <div className="flex items-center gap-2 py-4 text-crema-300/50">
            <Spinner className="h-4 w-4 text-amber-bistro" />
            <span className="text-sm">Memuat sub-brand...</span>
          </div>
        ) : subBrands.length === 0 ? (
          <div className="bg-[#151515] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-crema-300/50 text-sm">Belum ada sub-brand. Klik tombol di bawah untuk memulai.</p>
            <button
              onClick={() => { setEditingBrand(null); setShowSubBrandModal(true); }}
              className="flex items-center gap-2 text-sm font-bold text-[#121212] bg-amber-bistro hover:bg-amber-bistro/90 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Sub Brand
            </button>
          </div>
        ) : (
          <>
            {/* ── Sub-brand tab strip + action buttons: horizontally scrollable on mobile ── */}
            <div className="overflow-x-auto whitespace-nowrap scrollbar-none border-b border-white/5 mb-6">
              <div className="inline-flex items-center justify-between w-full min-w-max pb-1 gap-4">
                {/* Tab strip */}
                <div className="flex gap-1 flex-shrink-0">
                  {subBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => { setActiveBrandId(brand.id); setActiveTab("menu"); }}
                      className={`px-4 py-2.5 rounded-t-lg text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap flex-shrink-0 ${
                        activeBrandId === brand.id
                          ? "bg-amber-bistro text-[#121212]"
                          : "text-crema-300 hover:text-crema-50 hover:bg-white/5"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>

                {/* Inline action buttons — right of tabs */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  {/* Edit active sub-brand */}
                  <button
                    id="btn-edit-sub-brand"
                    onClick={() => {
                      if (!activeBrand) return;
                      setEditingBrand(activeBrand);
                      setShowSubBrandModal(true);
                    }}
                    disabled={!activeBrand}
                    title={activeBrand ? `Edit: ${activeBrand.name}` : "Pilih sub-brand terlebih dahulu"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-400 border-blue-400/25 bg-blue-400/8 hover:bg-blue-400/20 hover:border-blue-400/50"
                  >
                    {/* Edit3 icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  {/* Delete active sub-brand */}
                  <button
                    id="btn-delete-sub-brand"
                    onClick={() => { if (activeBrand) setDeleteDialogBrand(activeBrand); }}
                    disabled={!activeBrand}
                    title={activeBrand ? `Hapus: ${activeBrand.name}` : "Pilih sub-brand terlebih dahulu"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 border-red-400/25 bg-red-400/8 hover:bg-red-400/20 hover:border-red-400/50"
                  >
                    {/* Trash2 icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                    </svg>
                    <span className="hidden sm:inline">Hapus</span>
                  </button>

                  {/* Add sub-brand */}
                  <button
                    id="btn-add-sub-brand"
                    onClick={() => { setEditingBrand(null); setShowSubBrandModal(true); }}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-[#121212] bg-amber-bistro hover:bg-amber-bistro/90 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Sub Brand
                  </button>
                </div>
              </div>
            </div>

            {activeBrand && (
              <div className="bg-[#151515] border border-white/5 rounded-2xl p-5 sm:p-6">
                {/* Brand info + sub-tab toggle */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    {activeBrand.image_url && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={activeBrand.image_url} alt={activeBrand.name} fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold tracking-widest uppercase text-crema-50">{activeBrand.name}</h2>
                      {activeBrand.description && (
                        <p className="text-xs text-crema-300/50 mt-0.5 line-clamp-1">{activeBrand.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1.5 flex-shrink-0">
                    {(["menu", "bestsellers"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors rounded-lg border ${
                          activeTab === tab ? "bg-amber-bistro text-[#121212] border-amber-bistro" : "text-crema-300/60 hover:text-crema-50 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {tab === "menu" ? "Menu" : (
                          <span className="flex items-center gap-1">
                            ★ Best Sellers
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                              activeBestSellers.length >= 3
                                ? "bg-amber-bistro text-[#121212]"
                                : "bg-white/10 text-crema-300"
                            }`}>
                              {activeBestSellers.length}/3
                            </span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === "menu" && (
                  <SubCategorySection
                    subBrandId={activeBrandId ?? ""}
                    subCategories={activeCats}
                    menus={menus}
                    bestSellers={activeBestSellers}
                    onRefetchCategories={() => refetchSubCategories(activeBrandId ?? "")}
                    onRefetchMenus={refetchMenus}
                    onRefetchBestSellers={() => refetchBestSellers(activeBrandId ?? "")}
                  />
                )}

                {activeTab === "bestsellers" && (
                  <BestSellersPanel
                    subBrandId={activeBrandId ?? ""}
                    bestSellers={activeBestSellers}
                    onRefetch={() => refetchBestSellers(activeBrandId ?? "")}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showSubBrandModal && (
        <SubBrandModal
          editing={editingBrand}
          onClose={() => { setShowSubBrandModal(false); setEditingBrand(null); }}
          onSaved={() => refetchSubBrands()}
        />
      )}

      {deleteDialogBrand && (
        <DeleteSubBrandDialog
          brand={deleteDialogBrand}
          onCancel={() => setDeleteDialogBrand(null)}
          onConfirm={() => handleDeleteBrand(deleteDialogBrand)}
        />
      )}

      {/* Keyframe for toast */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
