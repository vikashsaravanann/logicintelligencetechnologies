"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PRIMARY_NAV, MORE_NAV_GROUPS, PRIMARY_CTA } from "@/config/navigation";
import AuthNavControl from "@/components/layout/auth-nav-control";
import { Button } from "@/components/ui/button";

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex items-center h-11 px-2.5 text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap transition-colors ${
        active ? "text-primary" : "text-zinc-300 hover:text-white"
      }`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute left-2.5 right-2.5 bottom-1.5 h-px bg-primary origin-left transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const closeAll = useCallback(() => {
    setIsOpen(false);
    setMoreOpen(false);
    setMobileGroupOpen(null);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(closeAll);
    return () => cancelAnimationFrame(handle);
  }, [pathname, closeAll]);

  // Escape closes menus; body scroll lock + focus management for the mobile dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isOpen) menuButtonRef.current?.focus();
      closeAll();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) {
      const first = panelRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeAll]);

  // Keep Tab focus inside the open mobile dialog
  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [moreOpen]);

  const dur = reduced ? 0 : 0.18;

  return (
    <header id="header" className="fixed top-0 left-0 right-0 w-full z-50">
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] origin-left"
        style={{ scaleX: reduced ? 0 : scaleX }}
      />
      <nav
        aria-label="Main navigation"
        className={`w-full transition-[background-color,border-color,padding] duration-300 border-b ${
          scrolled
            ? "bg-[rgba(10,21,48,0.88)] backdrop-blur-md border-white/[0.09] py-2"
            : "bg-gradient-to-b from-[#0A1530]/70 to-transparent border-transparent py-3"
        }`}
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6">
          <div className="flex items-center gap-4 w-full h-11">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${COMPANY.displayName} home`}>
              <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COMPANY.logoIconPath}
                  alt={`${COMPANY.displayName} logo`}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display text-[11px] font-bold text-white tracking-[0.14em] hidden 2xl:inline">
                {COMPANY.displayName.toUpperCase()}
              </span>
            </Link>

            <div className="hidden xl:flex items-center justify-center gap-0.5 flex-1 min-w-0">
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label.toUpperCase()}
                </NavLink>
              ))}

              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  className="inline-flex items-center h-11 px-2.5 text-[11px] font-semibold tracking-[0.1em] text-zinc-300 hover:text-white transition-colors"
                  onClick={() => setMoreOpen((v) => !v)}
                  onKeyDown={(e) => e.key === "Escape" && setMoreOpen(false)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  aria-controls="more-menu"
                >
                  MORE
                  <ChevronDown aria-hidden className={`w-3.5 h-3.5 ml-1 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      id="more-menu"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: dur }}
                      className="absolute top-full right-0 mt-2 w-[min(92vw,640px)] bg-[#0B1735] border border-white/10 rounded-2xl shadow-[0_24px_60px_-20px_rgba(2,8,24,0.9)] p-4 z-[80] grid grid-cols-2 gap-4"
                    >
                      {MORE_NAV_GROUPS.map((group) => (
                        <div key={group.id} className="min-w-0">
                          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                            {group.label}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMoreOpen(false)}
                                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                                  className="block rounded-lg px-2 py-2 hover:bg-white/[0.06] transition-colors group"
                                >
                                  <span className="block text-[12px] font-semibold tracking-wide text-white group-hover:text-primary uppercase">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="block text-[11px] text-zinc-400 group-hover:text-zinc-300 mt-0.5 leading-snug uppercase tracking-wider">
                                      {item.description}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <AuthNavControl />
              <Button asChild variant="secondary" size="sm" className="hidden xl:inline-flex text-xs">
                <Link href={PRIMARY_CTA.href}>Book Consultation</Link>
              </Button>
              <Button asChild size="sm" className="hidden xl:inline-flex text-xs">
                <Link href="/contact">Start Project</Link>
              </Button>
              <ThemeToggle className="hidden xl:grid" />
              <button
                ref={menuButtonRef}
                type="button"
                className="xl:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/[0.08]"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#050B1C]/70 z-[55] xl:hidden"
              aria-hidden
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              onKeyDown={trapFocus}
              initial={reduced ? { opacity: 0 } : { x: "100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 w-[min(88vw,380px)] h-[100dvh] bg-[#0B1735] border-l border-white/10 xl:hidden z-[70] overflow-y-auto overscroll-contain"
            >
              <div className="flex flex-col px-5 pt-5 pb-10">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      menuButtonRef.current?.focus();
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white hover:bg-white/[0.08]"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" aria-hidden />
                  </button>
                </div>
                <div className="space-y-0.5 mb-5">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                      className={`flex items-center min-h-[44px] px-2 rounded-lg text-sm font-semibold tracking-[0.12em] uppercase ${
                        isActivePath(pathname, item.href) ? "text-primary bg-primary/[0.07]" : "text-zinc-200 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {MORE_NAV_GROUPS.map((group) => {
                  const open = mobileGroupOpen === group.id;
                  return (
                    <div key={group.id} className="border-t border-white/[0.07]">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-2 py-3 text-left min-h-[44px]"
                        onClick={() => setMobileGroupOpen(open ? null : group.id)}
                        aria-expanded={open}
                        aria-controls={`mobile-group-${group.id}`}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">{group.label}</span>
                        <ChevronDown aria-hidden className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            id={`mobile-group-${group.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: dur }}
                            className="overflow-hidden"
                          >
                            <ul className="pb-3 space-y-0.5">
                              {group.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block rounded-lg px-2 py-2.5 hover:bg-white/[0.05] min-h-[44px]"
                                  >
                                    <span className="block text-sm font-semibold text-white uppercase">{item.label}</span>
                                    {item.description && (
                                      <span className="block text-xs text-zinc-400 mt-0.5 uppercase tracking-wider">{item.description}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div onClick={() => setIsOpen(false)} className="mt-3 mb-3">
                  <AuthNavControl mobile />
                </div>
                <Button asChild size="lg" className="mt-3 w-full">
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    Start Project
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="mt-3 w-full">
                  <Link href={PRIMARY_CTA.href} onClick={() => setIsOpen(false)}>
                    Book a Consultation
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
