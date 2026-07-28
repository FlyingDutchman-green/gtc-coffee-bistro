"use client";

import { useState, useEffect } from "react";

const POSITIONS = [
  {
    title: "BARISTA (Full-Time)",
    desc: "Ahli dalam espresso extraction, latte art, dan manual brew dengan standar presisi tinggi.",
  },
  {
    title: "FLOOR STAFF / SERVER (Full-Time)",
    desc: "Ramah, komunikatif, dan berdedikasi memberikan hospitality kelas premium untuk kenyamanan pelanggan.",
  },
  {
    title: "KITCHEN CREW / COOK (Full-Time)",
    desc: "Mampu menjaga ritme dapur dan menyajikan hidangan modern-industrial khas GTC dengan konsisten.",
  },
];

export function CareersModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.getAttribute("href")?.endsWith("#careers")) {
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
        aria-labelledby="careers-title"
      >
        {/* Header */}
        <div className="flex flex-row items-start justify-between border-b border-crema-50/10 px-6 py-5">
          <div className="flex flex-col gap-1.5 pr-4">
            <h2 id="careers-title" className="font-sans text-xl font-bold text-amber-bistro tracking-[0.2em] uppercase leading-none">
              CAREERS
            </h2>
            <p className="text-xs text-crema-300/60 font-medium">
              Bergabung Bersama Tim GTC Coffee & Bistro
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

        {/* Body (Positions List) */}
        <div className="px-6 py-2 overflow-y-auto max-h-[50vh] flex flex-col">
          <ul className="divide-y divide-crema-50/10">
            {POSITIONS.map((pos, idx) => (
              <li key={idx} className="py-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-crema-50 tracking-widest uppercase">
                  {pos.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-crema-200/70">
                  {pos.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-crema-50/10 bg-[#151515]">
          <a
            href="mailto:gtc.center.manage@gmail.com?subject=Lamaran%20Kerja%20GTC%20-%20[Nama%20Anda]"
            className="flex items-center justify-center w-full bg-amber-bistro hover:bg-gold-accent text-espresso-950 font-bold text-xs tracking-widest uppercase py-3.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          >
            Kirim CV & Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
