"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { COMPANY } from "@/config/company";
import { isActiveNav } from "@/config/admin-nav";

export interface PortalNavItem {
  label: string;
  href: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PortalNavGroup {
  label: string;
  items: PortalNavItem[];
}

export interface PortalHeaderProps {
  homeHref?: string;
  portalTitle?: string;
  primaryItems: PortalNavItem[];
  moreGroups?: PortalNavGroup[];
  roleLabel?: string;
  email?: string | null;
  actionsSlot?: React.ReactNode;
}

export function PortalHeader({
  homeHref = "/admin/command-center",
  portalTitle,
  primaryItems,
  moreGroups = [],
  roleLabel,
  email,
  actionsSlot,
}: PortalHeaderProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== "undefined") {
        setCurrentHash(window.location.hash.replace(/^#/, ""));
      }
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname, currentHash]);

  const allPrimaryHrefs = primaryItems.map((i) => i.href);
  const allMoreHrefs = moreGroups.flatMap((g) => g.items.map((i) => i.href));
  const allHrefs = [...allPrimaryHrefs, ...allMoreHrefs];

  const isAnyMoreActive = moreGroups.some((g) =>
    g.items.some((i) => isActiveNav(pathname, i.href, allHrefs, currentHash))
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 gap-3">
        {/* Left: Hamburger (mobile) + Logo & Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-[var(--lit-navy,#0B2545)] hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href={homeHref} className="flex min-w-0 items-center gap-2.5 group">
            <span className="relative block h-8 w-8 rounded-lg overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0 shadow-2xs group-hover:border-[var(--lit-teal,#1FA9A2)] transition-colors">
              <Image
                src={COMPANY.logoIconPath}
                alt={`${COMPANY.displayName} Logo`}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </span>
            <div className="min-w-0">
              <span className="truncate text-xs font-black tracking-wider text-[var(--lit-navy,#0B2545)] uppercase font-mono whitespace-nowrap block">
                LOGIC INTELLIGENCE TECHNOLOGIES
              </span>
              {portalTitle && (
                <span className="text-[10px] text-[var(--lit-teal,#1FA9A2)] font-bold tracking-wider uppercase block font-mono">
                  {portalTitle}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center: Desktop Primary Destinations (6-8 items) + More Dropdown */}
        <nav
          className="hidden md:flex items-center gap-1 min-w-0 flex-1 justify-center px-2"
          aria-label="Portal Navigation"
        >
          {primaryItems.map((item) => {
            const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  active
                    ? "bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)] font-bold border-[var(--lit-teal,#1FA9A2)]/40 shadow-2xs"
                    : "text-[var(--lit-text-muted,#52677C)] border-transparent hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Menu Dropdown */}
          {moreGroups.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all border ${
                  isAnyMoreActive || moreOpen
                    ? "bg-[var(--lit-navy,#0B2545)] text-white border-[var(--lit-navy,#0B2545)] shadow-2xs"
                    : "text-[var(--lit-text-muted,#52677C)] border-transparent hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {moreGroups.map((group) => (
                      <div key={group.label} className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2">
                          {group.label}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {group.items.map((item) => {
                            const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMoreOpen(false)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors block ${
                                  active
                                    ? "bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)] font-bold border border-[var(--lit-teal,#1FA9A2)]/30"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[var(--lit-navy,#0B2545)]"
                                }`}
                              >
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right: Role Badge, Email, Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {actionsSlot}

          {email && (
            <span className="hidden xl:inline-block max-w-[180px] truncate text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
              {email}
            </span>
          )}

          {roleLabel && (
            <span className="hidden sm:inline-block rounded-md border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] font-mono">
              {roleLabel}
            </span>
          )}

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)] min-h-[36px]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer (md:hidden) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-black/40 backdrop-blur-xs flex animate-in fade-in duration-150">
          <div className="w-80 max-w-[85vw] bg-white h-full border-r border-[var(--lit-border-light,#DFE7EF)] shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Primary links */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Primary Navigation
                </span>
                <div className="space-y-1">
                  {primaryItems.map((item) => {
                    const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                          active
                            ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Grouped More links */}
              {moreGroups.map((group) => (
                <div key={group.label} className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                    {group.label}
                  </span>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            active
                              ? "bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)] font-bold border border-[var(--lit-teal,#1FA9A2)]/30"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Footer */}
            <div className="pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-500 space-y-2">
              {email && <p className="font-mono text-[11px] truncate">{email}</p>}
              {roleLabel && (
                <span className="inline-block rounded-md border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] font-mono">
                  {roleLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  );
}

export function PortalShell({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-[var(--lit-ink,#121826)] selection:bg-[var(--lit-teal,#1FA9A2)]/20 antialiased">
      {header}
      <main className="w-full">{children}</main>
    </div>
  );
}
