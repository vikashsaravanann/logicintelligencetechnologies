"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, Terminal } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Overview", href: "/voice-shield" },
];

export default function VoiceShieldNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 font-sans border-b ${
          scrolled
            ? "bg-[#030712]/80 backdrop-blur-xl border-cyan-900/30 shadow-lg shadow-cyan-900/10 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between">
            
            {/* Logo (Left) */}
            <div className="flex items-center gap-3 relative z-10">
              <Link href="/voice-shield" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-tight text-white leading-none mb-0.5 group-hover:text-cyan-50 transition-colors">
                    VOICESHIELD
                  </span>
                  <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase leading-none">
                    LIT PRODUCT
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav (Absolute Center) */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
              <nav className="flex items-center gap-6 pointer-events-auto">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`text-[10px] font-mono font-bold tracking-[0.15em] uppercase transition-colors hover:text-cyan-300 px-4 py-2 ${
                        isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-slate-400"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Empty Right Side for Balance or Mobile Toggle */}
            <div className="flex items-center gap-4 relative z-10 w-8 lg:w-auto">
              <button
                className="lg:hidden p-2 text-slate-300 hover:text-cyan-300 transition-colors ml-auto"
                onClick={() => setMobileMenu(true)}
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] bg-[#030712]/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex justify-end p-5">
            <button
              onClick={() => setMobileMenu(false)}
              className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-8 pt-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="text-lg font-mono font-bold tracking-[0.15em] text-slate-200 hover:text-cyan-400 uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
