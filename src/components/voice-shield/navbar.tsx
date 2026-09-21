"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, Terminal } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Overview", href: "/voice-shield" },
  { label: "AI Agent", href: "/products/ai-website-agents" },
  { label: "Voice Agent", href: "/products/ai-voice-agents" },
  { label: "Founder", href: "/about/founder" },
];

export default function VoiceShieldNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isRequest =
    pathname === "/voice-shield/request" ||
    pathname?.startsWith("/voice-shield/request/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Request page owns its own chrome — do not render this bar (avoids double header + bleed)
  if (isRequest) return null;

  const solid = scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-[#050A15]/95 backdrop-blur-xl border-b border-emerald-500/10"
          : "bg-[#050A15]/70 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/voice-shield" className="flex items-center gap-2 group">
            <ShieldCheck className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="font-bold text-white tracking-tight">
              Voice<span className="text-emerald-400">Shield</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold tracking-widest uppercase transition-colors ${
                  pathname === link.href
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/voice-shield/request"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase hover:bg-emerald-500 hover:text-black transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              Request Access
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden text-zinc-300"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/5 pt-3 bg-[#050A15]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-2 py-2 text-sm text-zinc-300 hover:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/voice-shield/request"
              onClick={() => setIsOpen(false)}
              className="block px-2 py-2 text-sm font-bold text-emerald-400"
            >
              Request Access
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
