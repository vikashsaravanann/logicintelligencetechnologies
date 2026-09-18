"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PRIMARY_NAV, MORE_NAV_GROUPS, PRIMARY_CTA } from "@/config/navigation";
import AuthNavControl from "@/components/layout/auth-nav-control";

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center h-11 px-2 text-xs font-semibold tracking-[0.14em] whitespace-nowrap transition-colors ${
        isActive ? "text-primary" : "text-zinc-200 hover:text-primary"
      }`}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute left-1/2 -translate-x-1/2 bottom-1 h-1.5 w-1.5 rounded-full bg-primary"
        />
      )}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsOpen(false);
      setMoreOpen(false);
      setMobileGroupOpen(null);
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setMoreOpen(false);
        setMobileGroupOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [moreOpen]);

  return (
    <header id="header" className="fixed top-0 left-0 right-0 w-full z-50">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      <nav
        aria-label="Main navigation"
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(10,15,30,0.85)] backdrop-blur-[20px] border-b border-white/[0.08] py-2.5"
            : "bg-transparent py-3"
        }`}
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6">
          <div className="flex items-center gap-4 w-full h-11">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-primary to-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COMPANY.logoIconPath}
                  alt={`${COMPANY.displayName} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-white tracking-[0.14em] hidden md:inline">
                {COMPANY.displayName.toUpperCase()}
              </span>
            </Link>

            <div className="hidden md:flex items-center justify-center gap-0.5 flex-1 min-w-0">
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label.toUpperCase()}
                </NavLink>
              ))}

              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  className="inline-flex items-center h-11 px-2 text-xs font-semibold tracking-[0.14em] text-zinc-200 hover:text-primary transition-colors"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  aria-controls="more-menu"
                >
                  MORE
                  <ChevronDown
                    className={`w-3.5 h-3.5 ml-1 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      id="more-menu"
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-[min(92vw,640px)] bg-[rgba(10,15,30,0.98)] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 p-4 z-[80] grid grid-cols-2 gap-4"
                    >
                      {MORE_NAV_GROUPS.map((group) => (
                        <div key={group.id} className="min-w-0">
                          <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                            {group.label}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  role="menuitem"
                                  onClick={() => setMoreOpen(false)}
                                  className="block rounded-lg px-2 py-2 hover:bg-white/[0.06] transition-colors group"
                                >
                                  <span className="block text-[12px] font-semibold tracking-wide text-zinc-200 group-hover:text-white uppercase">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="block text-[11px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 leading-snug uppercase tracking-wider">
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
              <Link
                href={PRIMARY_CTA.href}
                className="hidden md:inline-flex h-8 px-4 items-center rounded-full text-[10px] font-bold text-white uppercase tracking-[0.14em] border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="hidden md:inline-flex h-8 px-4 items-center rounded-full text-[10px] font-bold text-white uppercase tracking-[0.14em] bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity"
              >
                Start Project
              </Link>
              <ThemeToggle className="hidden md:grid" />
              <button
                type="button"
                className="md:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 w-[min(88vw,380px)] h-[100dvh] bg-[rgba(10,15,30,0.98)] border-l border-white/10 md:hidden z-40 overflow-y-auto"
            >
              <div className="flex flex-col px-5 pt-16 pb-10">
                <div className="space-y-1 mb-6">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-sm font-bold tracking-[0.14em] uppercase text-zinc-300 hover:text-white min-h-[44px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {MORE_NAV_GROUPS.map((group) => {
                  const open = mobileGroupOpen === group.id;
                  return (
                    <div key={group.id} className="border-t border-white/[0.06]">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between py-3.5 text-left min-h-[44px]"
                        onClick={() =>
                          setMobileGroupOpen(open ? null : group.id)
                        }
                        aria-expanded={open}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                          {group.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
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
                                    <span className="block text-sm font-semibold text-zinc-200 uppercase">
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="block text-xs text-zinc-500 mt-0.5 uppercase tracking-wider">
                                        {item.description}
                                      </span>
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

                <div onClick={() => setIsOpen(false)} className="mb-3"><AuthNavControl mobile /></div>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-4 text-center rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 min-h-[48px] flex items-center justify-center"
                >
                  Start Project
                </Link>
                <Link
                  href={PRIMARY_CTA.href}
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-3.5 text-center rounded-xl font-semibold text-zinc-200 border border-white/15 hover:bg-white/5 min-h-[44px] flex items-center justify-center"
                >
                  Book a Consultation
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
