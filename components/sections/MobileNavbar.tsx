"use client";

import { useState, useEffect } from "react";

export function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Smooth scroll logic after closing animation starts
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (targetId === "") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
  };

  const navLinks = [
    { name: "Home", href: "" },
    { name: "The Vibe", href: "about" },
    { name: "Our Menu", href: "menu" },
    { name: "Opening Hours", href: "hours" },
    { name: "Reserve", href: "reserve" },
  ];

  return (
    <div className="block md:hidden">
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-espresso-950/50 backdrop-blur-md border border-crema-50/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro transition-colors"
        aria-label="Toggle mobile menu"
        aria-expanded={isMenuOpen}
      >
        <span
          className={`absolute h-[1.5px] w-5 bg-crema-50 transition-all duration-300 ease-in-out ${
            isMenuOpen ? "rotate-45" : "-translate-y-[6px]"
          }`}
        />
        <span
          className={`absolute h-[1.5px] w-5 bg-crema-50 transition-all duration-300 ease-in-out ${
            isMenuOpen ? "scale-0 opacity-0" : "translate-y-0"
          }`}
        />
        <span
          className={`absolute h-[1.5px] w-5 bg-crema-50 transition-all duration-300 ease-in-out ${
            isMenuOpen ? "-rotate-45" : "translate-y-[6px]"
          }`}
        />
      </button>

      {/* Full-Screen Glassmorphic Overlay Panel */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500 ease-in-out ${
          isMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8 text-center px-6">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={`#${link.href}`}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="font-sans text-sm tracking-widest uppercase text-crema-50 hover:text-amber-bistro transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-bistro rounded px-2 py-1"
              style={{
                transitionDelay: isMenuOpen ? `${index * 75 + 150}ms` : "0ms",
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
