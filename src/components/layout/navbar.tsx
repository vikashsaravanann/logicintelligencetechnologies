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
      className={`relative inline-flex items-center h-10 px-3 text-xs font-semibold tracking-[0.05em] whitespace-nowrap transition-colors rounded-lg ${
        highlight
          ? isActive
            ? 'text-[var(--lit-blue)] font-bold bg-[var(--lit-light-blue)]'
            : 'text-[var(--lit-teal)] hover:text-[var(--lit-blue)] hover:bg-[var(--lit-cloud)]'
          : isActive
            ? 'text-[var(--lit-blue)] font-bold'
            : 'text-[var(--lit-text-secondary)] hover:text-[var(--lit-navy)] hover:bg-[var(--lit-cloud)]'
      }`}
    >
      {highlight && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)] mr-1.5 animate-pulse" />
      )}
      {children}
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute left-3 right-3 bottom-1 h-[2px] rounded-full bg-[var(--lit-blue)]"
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
    const onScroll = () => setScrolled(window.scrollY > 20);
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
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[var(--lit-cyan)] z-[60] origin-left"
        style={{ scaleX }}
      />
      <nav
        aria-label="Main navigation"
        className={`w-full transition-all duration-200 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-[var(--lit-border-light)] shadow-[0_4px_20px_rgba(15,23,42,0.06)] py-2"
            : "bg-white/90 backdrop-blur-sm border-[var(--lit-border-light)]/80 py-2.5"
        }`}
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-4 w-full h-11">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white ring-1 ring-[var(--lit-border-light)] group-hover:ring-[var(--lit-blue)]/50 transition-all p-0.5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={COMPANY.logoIconPath}
                  alt={`${COMPANY.displayName} logo`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[12px] font-bold text-[var(--lit-navy)] tracking-[0.12em] uppercase hidden min-[1480px]:inline group-hover:text-[var(--lit-blue)] transition-colors">
                {COMPANY.displayName.toUpperCase()}
              </span>
              <span className="text-[12px] font-bold text-[var(--lit-navy)] tracking-[0.10em] uppercase hidden min-[1280px]:inline min-[1480px]:hidden group-hover:text-[var(--lit-blue)] transition-colors">
                LOGIC INTELLIGENCE
              </span>
            </Link>

            <div className="hidden xl:flex items-center justify-center gap-1 flex-1 min-w-0">
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href} highlight={item.highlight}>
                  {item.label.toUpperCase()}
                </NavLink>
              ))}

              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center h-10 px-3 text-xs font-semibold tracking-[0.05em] rounded-lg transition-colors ${
                    moreOpen
                      ? "text-[var(--lit-blue)] bg-[var(--lit-cloud)]"
                      : "text-[var(--lit-text-secondary)] hover:text-[var(--lit-navy)] hover:bg-[var(--lit-cloud)]"
                  }`}
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  aria-controls="more-menu"
                >
                  MORE
                  <ChevronDown
                    className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${moreOpen ? "rotate-180 text-[var(--lit-blue)]" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <div className="fixed inset-x-0 top-[56px] flex justify-center px-4 lg:px-6 pt-2">
                      <motion.div
                        id="more-menu"
                        aria-label="All pages"
                        initial={{ opacity: 0, y: 8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.99 }}
                        transition={{ duration: 0.16 }}
                        className="w-full max-w-[1360px] max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--lit-border-light)] bg-white/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-6 grid grid-cols-6 gap-x-5 gap-y-6"
                      >
                        {MORE_NAV_GROUPS.map((group) => (
                          <div key={group.id} className="min-w-0">
                            <p className="px-2 mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue)] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)]" />
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
                                          ? "bg-[var(--lit-light-blue)] text-[var(--lit-blue)] font-bold border border-[var(--lit-blue)]/20"
                                          : "text-[var(--lit-text-secondary)] hover:bg-[var(--lit-cloud)] hover:text-[var(--lit-navy)]"
                                      }`}
                                    >
                                      <span>{item.label}</span>
                                      {item.description && (
                                        <span className="text-[9px] text-[var(--lit-text-muted)] tracking-wider lowercase font-normal line-clamp-1 mt-0.5">
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
                className="hidden min-[1680px]:inline-flex h-8 px-3.5 items-center rounded-full text-[10px] font-bold text-[var(--lit-navy)] uppercase tracking-[0.14em] border border-[var(--lit-border-light)] bg-white hover:bg-[var(--lit-cloud)] transition-all shadow-xs"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="hidden xl:inline-flex h-8 px-4 items-center rounded-full text-[10.5px] font-bold text-white uppercase tracking-[0.14em] bg-[var(--lit-blue)] hover:bg-[#0D47A1] shadow-xs transition-all"
              >
                Start Project
              </Link>
              <ThemeToggle className="hidden xl:grid" />
              <button
                type="button"
                className="xl:hidden text-[var(--lit-navy)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
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
              className="fixed top-0 right-0 w-[min(88vw,380px)] h-[100dvh] bg-white border-l border-[var(--lit-border-light)] shadow-2xl shadow-slate-900/20 xl:hidden z-40 overflow-y-auto"
            >
              <div className="flex flex-col px-5 pt-16 pb-10">
                <div className="space-y-1 mb-6">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-sm font-bold tracking-[0.12em] uppercase text-[var(--lit-ink)] hover:text-[var(--lit-blue)] min-h-[44px] flex items-center transition-colors"
                    >
                      {item.highlight && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)] mr-2 animate-pulse" />
                      )}
                      {item.label}
                    </Link>
                  ))}
                </div>

                {MORE_NAV_GROUPS.map((group) => {
                  const open = mobileGroupOpen === group.id;
                  return (
                    <div key={group.id} className="border-t border-[var(--lit-border-light)]">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between py-3.5 text-left min-h-[44px]"
                        onClick={() =>
                          setMobileGroupOpen(open ? null : group.id)
                        }
                        aria-expanded={open}
                      >
                        <span className={`text-xs font-bold uppercase tracking-[0.16em] ${open ? "text-[var(--lit-blue)]" : "text-[var(--lit-text-secondary)]"}`}>
                          {group.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${open ? "rotate-180 text-[var(--lit-blue)]" : "text-[var(--lit-text-muted)]"}`}
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
                                    className="block rounded-lg px-2.5 py-2.5 hover:bg-[var(--lit-cloud)] min-h-[44px] transition-colors"
                                  >
                                    <span className="block text-sm font-semibold text-[var(--lit-ink)] uppercase">
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="block text-xs text-[var(--lit-text-muted)] mt-0.5 tracking-wider">
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
                  className="mt-3 px-6 py-3.5 text-center rounded-xl font-bold text-white uppercase tracking-[0.12em] bg-[var(--lit-blue)] hover:bg-[#0D47A1] shadow-sm min-h-[48px] flex items-center justify-center transition-colors"
                >
                  Start Project
                </Link>
                <Link
                  href={PRIMARY_CTA.href}
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-3.5 text-center rounded-xl font-semibold text-[var(--lit-navy)] uppercase tracking-[0.12em] border border-[var(--lit-border-light)] bg-white hover:bg-[var(--lit-cloud)] min-h-[44px] flex items-center justify-center transition-colors shadow-xs"
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 xl:hidden"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
