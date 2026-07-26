"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

export function ReservationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    guests: "",
  });

  // Intercept any click on an anchor with href="#reserve" globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.getAttribute("href")?.endsWith("#reserve")) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Handle body scroll lock and animation sequencing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Slight delay to allow DOM to render before triggering CSS transition
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => setIsOpen(false), 300); // Wait for exit animation
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const message = `Halo GTC Coffee & Bistro, saya ingin melakukan reservasi meja atas nama ${formData.name} untuk tanggal ${formData.date} pukul ${formData.time} (Jumlah/Detail: ${formData.guests}).`;
    
    // Format phone number to WhatsApp API requirements (62 format)
    let phone = siteConfig.contact.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    } else if (!phone.startsWith("62")) {
      phone = "62" + phone;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full max-w-md bg-[#121212] border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crema-50/10 px-6 py-4">
          <h2 id="reservation-title" className="font-serif text-xl font-bold text-amber-bistro tracking-tight">
            Reserve a Table
          </h2>
          <button 
            onClick={handleClose}
            className="text-crema-300/50 hover:text-crema-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded-full p-1"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="res-name" className="text-[10px] tracking-widest uppercase text-crema-300/70 font-medium">Name / Nama</label>
            <input 
              id="res-name"
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-espresso-950/50 border border-crema-50/20 rounded-lg px-4 py-2.5 text-crema-50 text-sm focus:outline-none focus:border-amber-bistro focus:ring-1 focus:ring-amber-bistro transition-colors placeholder:text-crema-300/30"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-date" className="text-[10px] tracking-widest uppercase text-crema-300/70 font-medium">Date / Tanggal</label>
              <input 
                id="res-date"
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-espresso-950/50 border border-crema-50/20 rounded-lg px-4 py-2.5 text-crema-50 text-sm focus:outline-none focus:border-amber-bistro focus:ring-1 focus:ring-amber-bistro transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-time" className="text-[10px] tracking-widest uppercase text-crema-300/70 font-medium">Time / Waktu</label>
              <input 
                id="res-time"
                type="time" 
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-espresso-950/50 border border-crema-50/20 rounded-lg px-4 py-2.5 text-crema-50 text-sm focus:outline-none focus:border-amber-bistro focus:ring-1 focus:ring-amber-bistro transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="res-guests" className="text-[10px] tracking-widest uppercase text-crema-300/70 font-medium">Total Guests / Jumlah Orang</label>
            <input 
              id="res-guests"
              type="text" 
              required
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
              className="w-full bg-espresso-950/50 border border-crema-50/20 rounded-lg px-4 py-2.5 text-crema-50 text-sm focus:outline-none focus:border-amber-bistro focus:ring-1 focus:ring-amber-bistro transition-colors placeholder:text-crema-300/30"
              placeholder="e.g., 4 orang / Rombongan"
            />
          </div>

          <button 
            type="submit"
            className="mt-3 w-full bg-amber-bistro hover:bg-gold-accent text-espresso-950 font-bold text-xs tracking-widest uppercase py-3.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-bistro focus:ring-offset-2 focus:ring-offset-[#121212]"
          >
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}
