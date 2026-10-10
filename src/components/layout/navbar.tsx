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
  highlight,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center h-11 px-2.5 text-xs font-semibold tracking-[0.06em] whitespace-nowrap transition-colors ${
        highlight
          ? isActive
            ? 'text-[var(--corp-cyan)] font-bold'
            : 'text-[var(--corp-teal)] hover:text-[var(--corp-cyan)]'
          : isActive
            ? 'text-white'
            : 'text-[#B5BECC] hover:text-white'
      }`}
    >
      {highlight && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--corp-cyan)] mr-1.5 animate-pulse" />
      )}
      {children}
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-4 rounded-full bg-gradient-to-r from-[var(--corp-teal)] to-[var(--corp-cyan)] shadow-[0_0_8px_rgba(69,217,210,0.7)]"
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
    const onScroll = () => setScrolled(window.scrollY > 40);
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
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--corp-cobalt)] via-[var(--corp-teal)] to-[var(--corp-cyan)] z-[60] origin-left"
        style={{ scaleX }}
      />
      <nav
        aria-label="Main navigation"
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#07090D]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] py-2.5"
            : "bg-transparent py-3"
        }`}
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-4 w-full h-11">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#10131A] ring-1 ring-white/15 group-hover:ring-[var(--corp-cyan)]/50 transition-all p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COMPANY.logoIconPath}
                  alt={`${COMPANY.displayName} logo`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[11px] font-bold text-white tracking-[0.14em] uppercase hidden min-[1480px]:inline group-hover:text-[var(--corp-cyan)] transition-colors">
                {COMPANY.displayName.toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-white tracking-[0.12em] uppercase hidden min-[1280px]:inline min-[1480px]:hidden group-hover:text-[var(--corp-cyan)] transition-colors">
                LOGIC INTELLIGENCE
              </span>
            </Link>

            <div className="hidden xl:flex items-center justify-center gap-0.5 flex-1 min-w-0">
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href} highlight={item.highlight}>
                  {item.label.toUpperCase()}
                </NavLink>
              ))}

              <div ref={moreRef}>
                <button
                  type="button"
                  className={`inline-flex items-center h-11 px-2.5 text-xs font-semibold tracking-[0.06em] transition-colors ${
                    moreOpen ? "text-[var(--corp-cyan)]" : "text-[#B5BECC] hover:text-white"
                  }`}
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  aria-controls="more-menu"
                >
                  MORE
                  <ChevronDown
                    className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${moreOpen ? "rotate-180 text-[var(--corp-cyan)]" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <div className="absolute inset-x-0 top-full flex justify-center px-4 lg:px-6 pt-2">
                      <motion.div
                        id="more-menu"
                        aria-label="All pages"
                        initial={{ opacity: 0, y: 8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.99 }}
                        transition={{ duration: 0.16 }}
                        className="w-full max-w-[1360px] max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0B0F17]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 grid grid-cols-6 gap-x-5 gap-y-6"
                      >
                        {MORE_NAV_GROUPS.map((group) => (
                          <div key={group.id} className="min-w-0">
                            <p className="px-2 mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--corp-cyan)] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--corp-cyan)]/70" />
                              {group.label}
                            </p>
                            <ul className="space-y-0.5">
                              {group.items.map((item) => {
                                const active = pathname === item.href;
                                return (
                                  <li key={item.href}>
                                    <Link
                                      href={item.href}
                                      onClick={() => setMoreOpen(false)}
                                      title={item.description}
                                      aria-current={active ? "page" : undefined}
                                      className={`flex flex-col rounded-lg px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-all ${
                                        active
                                          ? "bg-[var(--corp-cyan)]/15 text-[var(--corp-cyan)] border border-[var(--corp-cyan)]/25"
                                          : "text-[#B5BECC] hover:bg-white/[0.06] hover:text-white"
                                      }`}
                                    >
                                      <span>{item.label}</span>
                                      {item.description && (
                                        <span className="text-[9px] text-[#B5BECC]/60 tracking-wider lowercase font-normal line-clamp-1 mt-0.5">
                                          {item.description}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              <AuthNavControl />
              <Link
                href={PRIMARY_CTA.href}
                className="hidden min-[1680px]:inline-flex h-8 px-3.5 items-center rounded-full text-[10px] font-bold text-white uppercase tracking-[0.14em] border border-white/20 bg-white/[0.04] hover:bg-white/10 hover:border-white/30 transition-all"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="hidden xl:inline-flex h-8 px-4 items-center rounded-full text-[10.5px] font-bold text-[#07090D] uppercase tracking-[0.14em] bg-gradient-to-r from-[var(--corp-teal)] to-[var(--corp-cyan)] hover:opacity-95 shadow-[0_0_15px_rgba(69,217,210,0.3)] transition-all"
              >
                Start Project
              </Link>
              <ThemeToggle className="hidden xl:grid" />
              <button
                type="button"
                className="xl:hidden text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              aria-label="Site navigation"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 w-[min(88vw,380px)] h-[100dvh] bg-[#07090D]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl shadow-black/80 xl:hidden z-40 overflow-y-auto"
            >
              <div className="flex flex-col px-5 pt-16 pb-10">
                <div className="space-y-1 mb-6">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-sm font-bold tracking-[0.14em] uppercase text-white hover:text-[var(--corp-cyan)] min-h-[44px] flex items-center transition-colors"
                    >
                      {item.highlight && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--corp-cyan)] mr-2 animate-pulse" />
                      )}
                      {item.label}
                    </Link>
                  ))}
                </div>

                {MORE_NAV_GROUPS.map((group) => {
                  const open = mobileGroupOpen === group.id;
                  return (
                    <div key={group.id} className="border-t border-white/[0.08]">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between py-3.5 text-left min-h-[44px]"
                        onClick={() =>
                          setMobileGroupOpen(open ? null : group.id)
                        }
                        aria-expanded={open}
                      >
                        <span className={`text-xs font-bold uppercase tracking-[0.16em] ${open ? "text-[var(--corp-cyan)]" : "text-[#B5BECC]"}`}>
                          {group.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${open ? "rotate-180 text-[var(--corp-cyan)]" : "text-[#B5BECC]/60"}`}
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
                                    className="block rounded-lg px-2.5 py-2.5 hover:bg-white/[0.05] min-h-[44px] transition-colors"
                                  >
                                    <span className="block text-sm font-semibold text-white uppercase">
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="block text-xs text-[#B5BECC] mt-0.5 tracking-wider">
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

                <div onClick={() => setIsOpen(false)} className="mb-3 pt-4"><AuthNavControl mobile /></div>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-3.5 text-center rounded-xl font-bold text-[#07090D] uppercase tracking-[0.12em] bg-gradient-to-r from-[var(--corp-teal)] to-[var(--corp-cyan)] shadow-[0_0_20px_rgba(69,217,210,0.3)] min-h-[48px] flex items-center justify-center transition-opacity hover:opacity-95"
                >
                  Start Project
                </Link>
                <Link
                  href={PRIMARY_CTA.href}
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-3.5 text-center rounded-xl font-semibold text-white uppercase tracking-[0.12em] border border-white/20 bg-white/[0.04] hover:bg-white/10 min-h-[44px] flex items-center justify-center transition-colors"
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
              className="fixed inset-0 bg-black/60 z-30 xl:hidden"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
