"use client";

import { useState } from "react";
import { useMenu } from "@/context/MenuContext";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { menuData, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();

  const [activeBrand, setActiveBrand] = useState(categories[0] || "");
  const [editingItem, setEditingItem] = useState<{ subCat: string; index: number } | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0 });

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ subCat: "", name: "", price: 0 });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Password salah!");
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 text-crema-50">
        <form onSubmit={handleLogin} className="bg-[#151515] p-8 rounded-2xl border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] w-full max-w-md">
          <h1 className="text-2xl font-bold text-amber-bistro tracking-widest text-center mb-6 uppercase">Admin Login</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium text-crema-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-crema-50 focus:outline-none focus:border-amber-bistro transition-colors"
              placeholder="Masukkan password admin"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-bistro text-[#121212] font-bold py-2 px-4 rounded-lg hover:bg-amber-bistro/90 transition-colors uppercase tracking-widest text-sm"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  const subCategories = menuData[activeBrand] || {};

  return (
    <div className="min-h-screen bg-[#121212] text-crema-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-bistro tracking-widest uppercase">Admin Dashboard</h1>
            <p className="text-crema-300 mt-2">Kelola data menu GTC Coffee & Bistro</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm font-medium text-crema-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Brand Tabs */}
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

        {/* Content Area */}
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

          {isAdding && (
            <div className="mb-8 p-4 bg-[#1A1A1A] border border-amber-bistro/30 rounded-xl">
              <h3 className="text-sm font-bold text-amber-bistro mb-4 uppercase tracking-wider">Menu Baru</h3>
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

          {Object.entries(subCategories).length === 0 ? (
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
                          const isEditing = editingItem?.subCat === subCat && editingItem?.index === idx;
                          return (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 pr-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
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
                                        if (confirm(`Yakin ingin menghapus ${item.name}?`)) {
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
