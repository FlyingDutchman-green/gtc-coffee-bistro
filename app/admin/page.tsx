"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { supabase } from "@/lib/supabase";
import { uploadMenuImage } from "@/lib/storage";
import { useMenu } from "@/context/MenuContext";
import type { User } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────────────────────── */
interface AddFormState {
  subCat: string;
  name: string;
  price: number;
  imageFile: File | null;
  imagePreview: string | null;
}

interface EditFormState {
  name: string;
  price: number;
  imageFile: File | null;
  imagePreview: string | null;
  existingImageUrl: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Komponen kecil: Image Upload Field
 * ───────────────────────────────────────────────────────────────────────────── */
interface ImageUploadFieldProps {
  preview: string | null;
  existingUrl?: string | null;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  id: string;
}

function ImageUploadField({
  preview,
  existingUrl,
  uploading,
  onFileSelect,
  onClear,
  id,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = preview ?? existingUrl ?? null;

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setRawImage(url);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(rawImage, croppedAreaPixels);
      if (croppedFile) {
        onFileSelect(croppedFile);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memotong gambar.");
    }
    setRawImage(null);
  };

  return (
    <div>
      <label className="block text-xs text-crema-300 mb-1">
        Foto Menu{" "}
        <span className="text-crema-300/40 font-normal">(opsional)</span>
      </label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {/* Cropper Modal */}
      {rawImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium tracking-wide">Potong Gambar</h3>
              <p className="text-crema-300/60 text-xs mt-1">Geser untuk mengatur area, gunakan slider untuk zoom.</p>
            </div>
            
            <div className="relative w-full h-80 bg-black">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs text-crema-300 block mb-2">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-bistro"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRawImage(null)}
                  className="px-4 py-2 text-sm text-crema-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCropDone}
                  className="px-4 py-2 text-sm bg-amber-bistro text-[#121212] font-bold rounded hover:bg-amber-bistro/90 transition-colors"
                >
                  Selesai Potong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {displaySrc ? (
        /* Preview gambar */
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 group">
          <Image
            src={displaySrc}
            alt="Preview foto menu"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={displaySrc.startsWith("blob:")}
          />
          {/* Overlay tombol ganti/hapus */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="bg-amber-bistro text-[#121212] text-xs font-bold px-3 py-1.5 rounded-md hover:bg-amber-bistro/90 transition-colors disabled:opacity-50"
            >
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={uploading}
              className="bg-red-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone / tombol pilih */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-white/10 hover:border-amber-bistro/40 rounded-lg py-6 flex flex-col items-center gap-2 text-crema-300/50 hover:text-crema-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18M3.75 4.5h16.5M12 3v9"
            />
          </svg>
          <span className="text-xs font-medium tracking-wide">
            Klik untuk pilih foto
          </span>
          <span className="text-[10px] text-crema-300/30">
            JPG, PNG, WEBP · Maks 5 MB
          </span>
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Halaman utama Admin Dashboard
 * ───────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { menuData, categories, addMenuItem, updateMenuItem, deleteMenuItem, isLoading } =
    useMenu();

  const [activeBrand, setActiveBrand] = useState(categories[0] || "");
  const [editingItem, setEditingItem] = useState<{
    subCat: string;
    index: number;
  } | null>(null);

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    price: 0,
    imageFile: null,
    imagePreview: null,
    existingImageUrl: null,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({
    subCat: "",
    name: "",
    price: 0,
    imageFile: null,
    imagePreview: null,
  });

  // State loading upload terpisah untuk Add dan Edit
  const [addUploading, setAddUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  // ── Proteksi halaman: cek sesi Supabase ──────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }
      setUser(currentUser);
      setAuthLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Sinkronkan activeBrand saat categories terisi dari Supabase
  useEffect(() => {
    if (categories.length > 0 && !activeBrand) {
      setActiveBrand(categories[0]);
    }
  }, [categories, activeBrand]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  /* ── Helper: buat blob preview dan simpan File ke state ── */
  const handleAddFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setAddForm((prev) => ({ ...prev, imageFile: file, imagePreview: url }));
  }, []);

  const handleAddClearImage = useCallback(() => {
    setAddForm((prev) => {
      if (prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return { ...prev, imageFile: null, imagePreview: null };
    });
  }, []);

  const handleEditFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setEditForm((prev) => ({ ...prev, imageFile: file, imagePreview: url }));
  }, []);

  const handleEditClearImage = useCallback(() => {
    setEditForm((prev) => {
      if (prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return {
        ...prev,
        imageFile: null,
        imagePreview: null,
        existingImageUrl: null,
      };
    });
  }, []);

  /* ── Simpan menu baru (Add) ─────────────────────────────────────────────── */
  const handleSaveAdd = async () => {
    if (!addForm.subCat || !addForm.name || !addForm.price) {
      alert("Harap isi semua kolom!");
      return;
    }

    setAddUploading(true);
    try {
      let imageUrl: string | undefined;

      if (addForm.imageFile) {
        imageUrl = await uploadMenuImage(addForm.imageFile, "menu");
      }

      await addMenuItem(activeBrand, addForm.subCat, {
        name: addForm.name,
        price: Number(addForm.price),
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });

      // Reset form
      if (addForm.imagePreview) URL.revokeObjectURL(addForm.imagePreview);
      setIsAdding(false);
      setAddForm({ subCat: "", name: "", price: 0, imageFile: null, imagePreview: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(`Gagal menyimpan menu: ${message}`);
    } finally {
      setAddUploading(false);
    }
  };

  /* ── Simpan perubahan menu (Edit) ───────────────────────────────────────── */
  const handleSaveEdit = async (subCat: string, index: number) => {
    setEditUploading(true);
    try {
      let imageUrl: string | undefined;

      if (editForm.imageFile) {
        // Upload foto baru
        imageUrl = await uploadMenuImage(editForm.imageFile, "menu");
      } else if (editForm.existingImageUrl === null) {
        // User mengklik hapus foto → kirim string kosong agar kolom di-clear
        imageUrl = "";
      }
      // else: tidak ada perubahan foto → imageUrl tetap undefined (tidak diupdate)

      await updateMenuItem(activeBrand, subCat, index, {
        name: editForm.name,
        price: Number(editForm.price),
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      });

      if (editForm.imagePreview) URL.revokeObjectURL(editForm.imagePreview);
      setEditingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(`Gagal menyimpan perubahan: ${message}`);
    } finally {
      setEditUploading(false);
    }
  };

  // ── Render loading auth ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-amber-bistro"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-crema-300/50 text-sm tracking-widest uppercase">
            Memeriksa sesi...
          </p>
        </div>
      </div>
    );
  }

  const subCategories = menuData[activeBrand] || {};

  return (
    <div className="min-h-screen bg-[#121212] text-crema-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-bistro tracking-widest uppercase">
              Admin Dashboard
            </h1>
            <p className="text-crema-300/60 mt-1 text-sm">
              Login sebagai:{" "}
              <span className="text-crema-300">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-crema-300 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </header>

        {/* ── Brand Tabs ── */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-crema-50/10 mb-8 pb-2 gap-2">
          {categories.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                activeBrand === brand
                  ? "bg-amber-bistro text-[#121212]"
                  : "bg-[#151515] text-crema-300 hover:text-crema-50 hover:bg-white/5 border border-white/5"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* ── Content Area ── */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-widest uppercase">
              {activeBrand}
            </h2>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-500/20 px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-colors"
            >
              + Tambah Menu
            </button>
          </div>

          {/* ── Add Form ── */}
          {isAdding && (
            <div className="mb-8 p-5 bg-[#1A1A1A] border border-amber-bistro/30 rounded-xl">
              <h3 className="text-sm font-bold text-amber-bistro mb-4 uppercase tracking-wider">
                Menu Baru
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-crema-300 mb-1">
                    Sub-Kategori
                  </label>
                  <input
                    type="text"
                    value={addForm.subCat}
                    onChange={(e) =>
                      setAddForm({ ...addForm, subCat: e.target.value })
                    }
                    disabled={addUploading}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                    placeholder="Contoh: Coffee Latte"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crema-300 mb-1">
                    Nama Menu
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    disabled={addUploading}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                    placeholder="Nama menu..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-crema-300 mb-1">
                    Harga (Angka)
                  </label>
                  <input
                    type="number"
                    value={addForm.price || ""}
                    onChange={(e) =>
                      setAddForm({ ...addForm, price: Number(e.target.value) })
                    }
                    disabled={addUploading}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none disabled:opacity-50"
                    placeholder="25000"
                  />
                </div>
              </div>

              {/* Upload foto — Add */}
              <div className="mb-4">
                <ImageUploadField
                  id="add-image-upload"
                  preview={addForm.imagePreview}
                  uploading={addUploading}
                  onFileSelect={handleAddFileSelect}
                  onClear={handleAddClearImage}
                />
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={handleSaveAdd}
                  disabled={addUploading}
                  className="flex items-center gap-2 bg-amber-bistro text-[#121212] px-4 py-1.5 rounded-md text-sm font-bold transition-colors hover:bg-amber-bistro/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {addUploading ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
                <button
                  onClick={() => {
                    handleAddClearImage();
                    setIsAdding(false);
                    setAddForm({
                      subCat: "",
                      name: "",
                      price: 0,
                      imageFile: null,
                      imagePreview: null,
                    });
                  }}
                  disabled={addUploading}
                  className="bg-white/5 text-crema-300 px-4 py-1.5 rounded-md text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* ── Menu Loading ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-crema-300/50">
              <svg
                className="animate-spin h-5 w-5 text-amber-bistro"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm tracking-wider">
                Memuat data menu dari Supabase...
              </span>
            </div>
          ) : Object.entries(subCategories).length === 0 ? (
            <p className="text-crema-300 text-center py-8">
              Belum ada menu di kategori ini.
            </p>
          ) : (
            <div className="space-y-8">
              {Object.entries(subCategories).map(([subCat, items]) => (
                <div key={subCat}>
                  <h3 className="text-sm font-bold text-amber-bistro mb-3 uppercase tracking-widest border-b border-white/10 pb-2">
                    {subCat}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-crema-300/50 border-b border-white/5">
                          <th className="pb-2 font-medium w-8" />
                          <th className="pb-2 font-medium">Nama Menu</th>
                          <th className="pb-2 font-medium w-32">Harga</th>
                          <th className="pb-2 font-medium w-48 text-right">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {items.map((item, idx) => {
                          const isEditing =
                            editingItem?.subCat === subCat &&
                            editingItem?.index === idx;
                          return (
                            <tr
                              key={idx}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              {/* Thumbnail */}
                              <td className="py-3 pr-3">
                                {item.image_url ? (
                                  <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={item.image_url}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={1.5}
                                      className="w-4 h-4 text-crema-300/20"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </td>

                              {/* Nama */}
                              <td className="py-3 pr-4">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editForm.name}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          name: e.target.value,
                                        })
                                      }
                                      disabled={editUploading}
                                      className="w-full bg-[#121212] border border-white/20 rounded px-2 py-1 focus:border-amber-bistro outline-none disabled:opacity-50"
                                    />
                                    {/* Upload foto — Edit (inline) */}
                                    <ImageUploadField
                                      id={`edit-image-${subCat}-${idx}`}
                                      preview={editForm.imagePreview}
                                      existingUrl={editForm.existingImageUrl}
                                      uploading={editUploading}
                                      onFileSelect={handleEditFileSelect}
                                      onClear={handleEditClearImage}
                                    />
                                  </div>
                                ) : (
                                  <span className="font-medium text-crema-50">
                                    {item.name}
                                  </span>
                                )}
                              </td>

                              {/* Harga */}
                              <td className="py-3 pr-4">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        price: Number(e.target.value),
                                      })
                                    }
                                    disabled={editUploading}
                                    className="w-24 bg-[#121212] border border-white/20 rounded px-2 py-1 focus:border-amber-bistro outline-none font-mono disabled:opacity-50"
                                  />
                                ) : (
                                  <span className="font-mono text-amber-bistro">
                                    {item.price}
                                  </span>
                                )}
                              </td>

                              {/* Aksi */}
                              <td className="py-3 text-right">
                                {isEditing ? (
                                  <div className="flex justify-end gap-2 items-center">
                                    <button
                                      onClick={() =>
                                        handleSaveEdit(subCat, idx)
                                      }
                                      disabled={editUploading}
                                      className="flex items-center gap-1 text-green-400 hover:text-green-300 font-medium text-xs px-2 py-1 bg-green-400/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {editUploading ? (
                                        <>
                                          <svg
                                            className="animate-spin h-3 w-3"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                          >
                                            <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                            />
                                            <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                          </svg>
                                          Uploading...
                                        </>
                                      ) : (
                                        "Simpan"
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (editForm.imagePreview)
                                          URL.revokeObjectURL(
                                            editForm.imagePreview
                                          );
                                        setEditingItem(null);
                                      }}
                                      disabled={editUploading}
                                      className="text-crema-300 hover:text-crema-50 font-medium text-xs px-2 py-1 bg-white/5 rounded disabled:opacity-50"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-3">
                                    <button
                                      onClick={() => {
                                        setEditingItem({ subCat, index: idx });
                                        setEditForm({
                                          name: item.name,
                                          price: item.price,
                                          imageFile: null,
                                          imagePreview: null,
                                          existingImageUrl:
                                            item.image_url ?? null,
                                        });
                                      }}
                                      className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Yakin ingin menghapus "${item.name}"?`
                                          )
                                        ) {
                                          deleteMenuItem(
                                            activeBrand,
                                            subCat,
                                            idx
                                          );
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 font-medium text-xs transition-colors"
                                    >
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
