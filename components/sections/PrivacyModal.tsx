"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  {
    title: "1. Pengumpulan Data",
    desc: "Kami hanya mengumpulkan informasi yang Anda berikan secara sukarela melalui formulir reservasi (Nama & Waktu) dan pendaftaran email informasi berkala (Newsletter).",
  },
  {
    title: "2. Penggunaan Informasi",
    desc: "Data Anda digunakan secara eksklusif untuk memproses konfirmasi pemesanan meja melalui WhatsApp serta mengirimkan pembaruan menu eksklusif GTC. Kami tidak pernah menjual atau membagikan data Anda kepada pihak ketiga.",
  },
  {
    title: "3. Keamanan & Hak Anda",
    desc: "Seluruh data digital dikelola dengan aman. Anda berhak meminta penghapusan email Anda dari sistem langganan kami kapan saja melalui tautan berhenti berlangganan.",
  },
];

export function PrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.getAttribute("href")?.endsWith("#privacy")) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
    setTimeout(() => setIsOpen(false), 300);
  };

  if (!isOpen) return null;

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
        className={`relative w-full max-w-lg bg-[#121212] border border-amber-bistro/30 shadow-[0_0_40px_rgba(212,146,78,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        {/* Header */}
        <div className="flex flex-row items-start justify-between border-b border-crema-50/10 px-6 py-5 bg-[#151515]">
          <div className="flex flex-col gap-1.5 pr-4">
            <h2 id="privacy-title" className="font-sans text-xl font-bold text-amber-bistro tracking-[0.2em] uppercase leading-none">
              PRIVACY POLICY
            </h2>
            <p className="text-xs text-crema-300/60 font-medium">
              Kebijakan Privasi GTC Coffee & Bistro
            </p>
          </div>
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

        {/* Body (Scrollable Policy Content) */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh] flex flex-col gap-6">
          {SECTIONS.map((section, idx) => (
            <section key={idx} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-crema-50">
                {section.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-gray-400">
                {section.desc}
              </p>
            </section>
          ))}
          <div className="pt-2 pb-2">
            <p className="text-[11px] text-crema-300/40 italic">
              Terakhir diperbarui: 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
