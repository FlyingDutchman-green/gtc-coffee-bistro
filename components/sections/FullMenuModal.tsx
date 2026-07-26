"use client";

import { useState, useEffect } from "react";

const MENU_DATA = [
  // MINUMAN (MOURO)
  { name: "MOURO Cold Brew Float", price: "35K", category: "MINUMAN (MOURO)" },
  { name: "Signature Iced Toffee Latte", price: "32K", category: "MINUMAN (MOURO)" },
  { name: "Lychee Jasmine Mocktail", price: "28K", category: "MINUMAN (MOURO)" },
  { name: "Matcha Oat Latte", price: "30K", category: "MINUMAN (MOURO)" },
  { name: "Espresso Tonic Grapefruit", price: "28K", category: "MINUMAN (MOURO)" },
  { name: "Brown Sugar Boba Latte", price: "30K", category: "MINUMAN (MOURO)" },
  { name: "Iced Pandan Coconut Latte", price: "28K", category: "MINUMAN (MOURO)" },
  // RAMENIKU
  { name: "Tonkotsu Black Garlic", price: "45K", category: "RAMENIKU" },
  { name: "Spicy Miso Mazemen", price: "42K", category: "RAMENIKU" },
  { name: "Shoyu Chicken Ramen", price: "38K", category: "RAMENIKU" },
  { name: "Gyoza Pan-Fried (6 pcs)", price: "28K", category: "RAMENIKU" },
  { name: "Shio Wagyu Ramen", price: "58K", category: "RAMENIKU" },
  { name: "Vegetarian Shitake Ramen", price: "35K", category: "RAMENIKU" },
  // MIE JAGOAN
  { name: "Mie Jagoan Spesial", price: "25K", category: "MIE JAGOAN" },
  { name: "Mie Jagoan Xtra Pedas", price: "28K", category: "MIE JAGOAN" },
  { name: "Mie Goreng Jagoan", price: "25K", category: "MIE JAGOAN" },
  { name: "Dimsum Platter (4 pcs)", price: "22K", category: "MIE JAGOAN" },
  { name: "Mie Kuah Jagoan Pedas", price: "25K", category: "MIE JAGOAN" },
  { name: "Baso Aci Kuah Jagoan", price: "20K", category: "MIE JAGOAN" },
  // AYAM KERATON
  { name: "Ayam Bakar Keraton", price: "38K", category: "AYAM KERATON" },
  { name: "Ayam Goreng Rempah", price: "35K", category: "AYAM KERATON" },
  { name: "Ayam Penyet Bumbu Keraton", price: "35K", category: "AYAM KERATON" },
  { name: "Sambal Platter Premium", price: "18K", category: "AYAM KERATON" },
  { name: "Paket Nasi Ayam Keraton", price: "42K", category: "AYAM KERATON" },
  { name: "Sate Ayam Keraton (10 pcs)", price: "32K", category: "AYAM KERATON" },
  // EL NASGOR
  { name: "El Nasgor Wagyu", price: "58K", category: "EL NASGOR" },
  { name: "El Nasgor Kampung Premium", price: "35K", category: "EL NASGOR" },
  { name: "El Nasgor Seafood Spesial", price: "45K", category: "EL NASGOR" },
  { name: "El Nasgor Vegetarian", price: "28K", category: "EL NASGOR" },
  { name: "El Nasgor Pete Istimewa", price: "32K", category: "EL NASGOR" },
  // GOLDEN TELLER & CEMILAN
  { name: "Golden Es Teller Spesial", price: "25K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Jus Alpukat Kocok", price: "22K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Pisang Crispy Mozzarella", price: "20K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Fresh Fruit Platter", price: "22K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Es Campur Golden", price: "20K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Roti Bakar Cokelat Keju", price: "18K", category: "GOLDEN TELLER & CEMILAN" },
  { name: "Singkong Goreng Crispy", price: "15K", category: "GOLDEN TELLER & CEMILAN" },
];

const CATEGORIES = [
  "MINUMAN (MOURO)",
  "RAMENIKU",
  "MIE JAGOAN",
  "AYAM KERATON",
  "EL NASGOR",
  "GOLDEN TELLER & CEMILAN",
];

export interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export function FullMenuModal({ isOpen, onClose, activeCategory, setActiveCategory }: FullMenuModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  const filteredItems = MENU_DATA.filter(item => item.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#121212]/95 backdrop-blur-md transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full max-w-2xl bg-[#121212] border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crema-50/10 px-6 py-5 bg-[#151515]">
          <h2 id="menu-title" className="font-sans text-xl font-bold text-amber-bistro tracking-[0.2em] uppercase leading-none">
            FULL MENU
          </h2>
          <button 
            onClick={handleClose}
            className="text-crema-300/50 hover:text-crema-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded-full p-1 -mt-1 -mr-1"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Tabs — scrollable for 6 wider brand names */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-crema-50/10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors relative focus-visible:outline-none focus-visible:bg-crema-50/5 ${
                activeCategory === cat ? "text-amber-bistro" : "text-crema-300/50 hover:text-crema-50"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-bistro" />
              )}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="px-6 py-2 overflow-y-auto max-h-[65vh] flex flex-col">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 group py-4 border-b border-white/5 last:border-0">
              <span className="text-[15px] font-medium text-crema-50 tracking-widest uppercase">
                {item.name}
              </span>
              <span className="font-mono text-[14px] font-bold text-amber-bistro">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
