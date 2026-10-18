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
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href={homeHref}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg shrink-0"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 bg-white p-0.5 flex items-center justify-center shadow-2xs group-hover:border-teal-500 transition-colors">
              <Image
                src="/assets/logo-icon.webp"
                alt="Logic Intelligence Technologies"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono font-black text-xs uppercase tracking-tight text-[var(--lit-navy,#0B2545)] whitespace-nowrap">
                LOGIC INTELLIGENCE TECHNOLOGIES
              </span>
              {portalTitle && (
                <span className="text-[10px] font-semibold text-[var(--lit-teal,#1FA9A2)] uppercase tracking-wider font-mono truncate">
                  {portalTitle}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar (6-8 items + More) */}
        <nav
          aria-label="Portal primary navigation"
          className="hidden md:flex items-center gap-1 min-w-0 flex-1 justify-center max-w-4xl px-2"
        >
          {primaryItems.map((item) => {
            const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-[var(--lit-navy,#0B2545)] hover:bg-slate-100/80"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--lit-blue,#1565C0)] rounded-full" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isAnyMoreActive
                    ? "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-[var(--lit-navy,#0B2545)] hover:bg-slate-100/80"
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    moreOpen ? "rotate-180 text-[var(--lit-blue,#1565C0)]" : ""
                  }`}
                />
              </button>

              {/* White More Popover Menu */}
              {moreOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="max-h-[75vh] overflow-y-auto space-y-4 pr-1">
                    {moreGroups.map((group) => (
                      <div key={group.label} className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                          {group.label}
                        </div>
                        <div className="space-y-0.5">
                          {group.items.map((subItem) => {
                            const subActive = isActiveNav(
                              pathname,
                              subItem.href,
                              allHrefs,
                              currentHash
                            );
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMoreOpen(false)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                                  subActive
                                    ? "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[var(--lit-navy,#0B2545)]"
                                }`}
                                role="menuitem"
                              >
                                <span className="flex items-center gap-2 truncate">
                                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                                  <span>{subItem.label}</span>
                                </span>
                                {subItem.badge && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                                    {subItem.badge}
                                  </span>
                                )}
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

        {/* Right: User / Role / Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {actionsSlot}
          {roleLabel && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200/80 font-mono">
              <Shield className="w-3 h-3" />
              <span>{roleLabel}</span>
            </span>
          )}
          {email && (
            <span className="hidden lg:inline text-xs text-[var(--lit-text-muted,#52677C)] font-medium max-w-[180px] truncate">
              {email}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Pure White background) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-black/40 backdrop-blur-xs z-50 flex flex-col">
          <div className="bg-white border-b border-[var(--lit-border-light,#DFE7EF)] shadow-xl max-h-[85vh] overflow-y-auto p-4 space-y-6">
            {/* Primary Mobile Items */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                Navigation
              </div>
              {primaryItems.map((item) => {
                const active = isActiveNav(pathname, item.href, allHrefs, currentHash);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* More Groups in Mobile Drawer */}
            {moreGroups.map((group) => (
              <div key={group.label} className="space-y-1 pt-2 border-t border-slate-100">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((subItem) => {
                    const subActive = isActiveNav(pathname, subItem.href, allHrefs, currentHash);
                    const Icon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          subActive
                            ? "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{subItem.label}</span>
                        </span>
                        {subItem.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Mobile Footer with User Meta */}
            {(roleLabel || email) && (
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                {roleLabel && <div>Role: <span className="font-semibold text-slate-800">{roleLabel}</span></div>}
                {email && <div>Account: <span className="font-semibold text-slate-800">{email}</span></div>}
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  );
}

export { PortalShell } from "./portal-shell";
