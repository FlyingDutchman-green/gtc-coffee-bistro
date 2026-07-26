"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useMenu } from "@/context/MenuContext";
import type { User } from "@supabase/supabase-js";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { menuData, categories, addMenuItem, updateMenuItem, deleteMenuItem, isLoading } = useMenu();

  const [activeBrand, setActiveBrand] = useState(categories[0] || "");
  const [editingItem, setEditingItem] = useState<{ subCat: string; index: number } | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ subCat: "", name: "", price: 0 });

  // ── Proteksi halaman: cek sesi Supabase ─────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }
      setUser(currentUser);
      setAuthLoading(false);
    };

    checkSession();

    // Dengarkan perubahan sesi (logout dari tab lain, token kadaluarsa, dsb.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const handleSaveEdit = (subCat: string, index: number) => {
    updateMenuItem(activeBrand, subCat, index, { name: editForm.name, price: Number(editForm.price) });
    setEditingItem(null);
  };

  const handleSaveAdd = () => {
    if (!addForm.subCat || !addForm.name || !addForm.price) {
      alert("Harap isi semua kolom!");
      return;
    }
    addMenuItem(activeBrand, addForm.subCat, { name: addForm.name, price: Number(addForm.price) });
    setIsAdding(false);
    setAddForm({ subCat: "", name: "", price: 0 });
  };

  // Tampilkan loading saat cek auth atau data sedang dimuat
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-amber-bistro" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-crema-300/50 text-sm tracking-widest uppercase">Memeriksa sesi...</p>
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
              Login sebagai: <span className="text-crema-300">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-crema-300 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
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
            <h2 className="text-xl font-bold tracking-widest uppercase">{activeBrand}</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-500/20 px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-colors"
            >
              + Tambah Menu
            </button>
          </div>

          {/* ── Add Form ── */}
          {isAdding && (
            <div className="mb-8 p-4 bg-[#1A1A1A] border border-amber-bistro/30 rounded-xl">
              <h3 className="text-sm font-bold text-amber-bistro mb-4 uppercase tracking-wider">
                Menu Baru
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-crema-300 mb-1">Sub-Kategori</label>
                  <input
                    type="text"
                    value={addForm.subCat}
                    onChange={(e) => setAddForm({ ...addForm, subCat: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none"
                    placeholder="Contoh: Coffee Latte"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crema-300 mb-1">Nama Menu</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none"
                    placeholder="Nama menu..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-crema-300 mb-1">Harga (Angka)</label>
                  <input
                    type="number"
                    value={addForm.price || ""}
                    onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-white/10 rounded-md px-3 py-1.5 text-sm focus:border-amber-bistro outline-none"
                    placeholder="25000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAdd}
                  className="bg-amber-bistro text-[#121212] px-4 py-1.5 rounded-md text-sm font-bold transition-colors hover:bg-amber-bistro/90"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="bg-white/5 text-crema-300 px-4 py-1.5 rounded-md text-sm hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* ── Menu Loading ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-crema-300/50">
              <svg className="animate-spin h-5 w-5 text-amber-bistro" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm tracking-wider">Memuat data menu dari Supabase...</span>
            </div>
          ) : Object.entries(subCategories).length === 0 ? (
            <p className="text-crema-300 text-center py-8">Belum ada menu di kategori ini.</p>
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
                          <th className="pb-2 font-medium w-1/2">Nama Menu</th>
                          <th className="pb-2 font-medium w-1/4">Harga</th>
                          <th className="pb-2 font-medium w-1/4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {items.map((item, idx) => {
                          const isEditing =
                            editingItem?.subCat === subCat && editingItem?.index === idx;
                          return (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 pr-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, name: e.target.value })
                                    }
                                    className="w-full bg-[#121212] border border-white/20 rounded px-2 py-1 focus:border-amber-bistro outline-none"
                                  />
                                ) : (
                                  <span className="font-medium text-crema-50">{item.name}</span>
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, price: Number(e.target.value) })
                                    }
                                    className="w-24 bg-[#121212] border border-white/20 rounded px-2 py-1 focus:border-amber-bistro outline-none font-mono"
                                  />
                                ) : (
                                  <span className="font-mono text-amber-bistro">{item.price}</span>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                {isEditing ? (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(subCat, idx)}
                                      className="text-green-400 hover:text-green-300 font-medium text-xs px-2 py-1 bg-green-400/10 rounded"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      onClick={() => setEditingItem(null)}
                                      className="text-crema-300 hover:text-crema-50 font-medium text-xs px-2 py-1 bg-white/5 rounded"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-3">
                                    <button
                                      onClick={() => {
                                        setEditingItem({ subCat, index: idx });
                                        setEditForm({ name: item.name, price: item.price });
                                      }}
                                      className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Yakin ingin menghapus "${item.name}"?`)) {
                                          deleteMenuItem(activeBrand, subCat, idx);
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
