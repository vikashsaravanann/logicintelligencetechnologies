"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

const PRIMARY_NAV = [
  { href: "/", label: "HOME" },
  { href: "/ai", label: "AI" },
  { href: "/work", label: "WORK" },
  { href: "/packages", label: "PACKAGES" },
  { href: "/about", label: "ABOUT" },
  { href: "/jobs", label: "JOBS" },
];

const MORE_NAV = [
  { href: "/services", label: "SERVICES" },
  { href: "/industries", label: "INDUSTRIES" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/resources", label: "RESOURCES" },
  { href: "/about/founder", label: "FOUNDER" },
  { href: "/book-consultation", label: "BOOK CALL" },
  { href: "/client/login", label: "CLIENT PORTAL" },
  { href: "/support", label: "SUPPORT" },
  { href: "/blog", label: "BLOG" },
  { href: "/checklist", label: "CHECKLIST" },
  { href: "/discovery", label: "DISCOVERY" },
  { href: "/free-demo", label: "FREE DEMO" },
  { href: "/press", label: "PRESS" },
  { href: "/careers", label: "CAREERS" },
];

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link href={href} className={`relative inline-flex items-center h-11 px-2 text-xs font-semibold tracking-[0.14em] ${isActive ? "text-primary" : "text-zinc-200 hover:text-primary"}`}>
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] origin-left" style={{ scaleX }} />
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-[rgba(10,15,30,0.85)] backdrop-blur-[20px] border-b border-white/[0.08] py-2.5" : "bg-transparent py-3"}`}>
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6">
          <div className="flex items-center gap-4 w-full h-11">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-primary to-accent">
                <img src={COMPANY.logoIconPath} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-white tracking-[0.14em] hidden lg:inline">{COMPANY.displayName.toUpperCase()}</span>
            </Link>

            <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
              ))}
              <div className="relative">
                <button type="button" className="inline-flex items-center h-11 px-2 text-xs font-semibold tracking-[0.14em] text-zinc-200 hover:text-primary" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-haspopup="true">
                  MORE <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute top-full right-0 w-[220px] bg-[rgba(10,15,30,0.98)] border border-white/[0.08] rounded-2xl shadow-xl p-2 z-[80]">
                      {MORE_NAV.map((item) => (
                        <Link key={item.href} href={item.href} className="block px-3 py-2.5 rounded-lg text-[12px] font-semibold tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5" onClick={() => setMoreOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Link href="/book-consultation" className="hidden lg:inline-flex h-8 px-4 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.14em] border border-white/20 bg-white/5 hover:bg-white/10">Book Call</Link>
              <Link href="/contact" className="hidden lg:inline-flex h-8 px-4 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.14em] bg-gradient-to-r from-blue-600 to-cyan-500">Start Project</Link>
              <ThemeToggle className="hidden lg:grid" />
              <button type="button" className="lg:hidden text-white p-2 min-h-[44px] min-w-[44px]" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close menu" : "Open menu"}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed top-0 right-0 w-[min(85vw,360px)] h-[100dvh] bg-[rgba(10,15,30,0.98)] border-l border-white/10 lg:hidden z-40 overflow-y-auto">
              <div className="flex flex-col px-6 py-16 space-y-2">
                {[...PRIMARY_NAV, ...MORE_NAV].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="py-3 text-base font-bold tracking-[0.16em] uppercase text-zinc-300 hover:text-white min-h-[44px] flex items-center">
                    {item.label}
                  </Link>
                ))}
                <Link href="/contact" onClick={() => setIsOpen(false)} className="mt-6 px-6 py-4 text-center rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500">Start Project</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden" />
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
