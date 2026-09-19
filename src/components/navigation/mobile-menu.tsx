"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronDown, LogIn, Calendar, Mail } from "lucide-react";
import { PRIMARY_NAV, MORE_NAV_GROUPS, PRIMARY_CTA, NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  primaryNav?: NavItem[];
}

/**
 * Accessible, full-height mobile navigation drawer with accordion groups
 * and touch-friendly CTA controls.
 */
export function MobileMenu({
  isOpen,
  onClose,
  primaryNav = PRIMARY_NAV,
}: MobileMenuProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsVisible(true);
      setIsClosing(false);
    } else {
      if (isVisible) {
        setIsClosing(true);
        setTimeout(() => {
          setIsClosing(false);
          setIsVisible(false);
          setOpenGroup(null);
          document.body.style.overflow = "";
        }, 150); // Matches --modal-close-dur (150ms)
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isVisible]);

  const toggleGroup = (id: string) => {
    setOpenGroup((prev) => (prev === id ? null : id));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden transition-opacity duration-[150ms] ease-in-out",
          !isOpen || isClosing ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "t-modal fixed top-0 right-0 w-[min(88vw,380px)] h-[100dvh] bg-[#070b18] border-l border-white/10 lg:hidden z-[80] overflow-y-auto",
          isOpen && !isClosing ? "is-open" : "",
          isClosing ? "is-closing" : ""
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div className="flex flex-col px-5 pt-6 pb-12">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Navigation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Nav Links */}
          <nav aria-label="Mobile primary navigation" className="space-y-1 mb-6">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block py-3 text-sm font-bold tracking-[0.14em] uppercase text-zinc-200 hover:text-cyan-400 min-h-[44px] flex items-center transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* More Accordion Groups */}
          <div className="space-y-2 mb-8">
            {MORE_NAV_GROUPS.map((group) => {
              const isExpanded = openGroup === group.id;
              return (
                <div
                  key={group.id}
                  className="t-acc rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                  data-open={isExpanded}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="t-acc-head w-full flex items-center justify-between px-4 py-3.5 text-left min-h-[44px]"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                      {group.label}
                    </span>
                    <span className="t-acc-chevron text-zinc-400">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <div className="t-acc-panel bg-black/20">
                    <div className="t-acc-panel-inner">
                      <ul className="px-4 pb-3 space-y-1">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className="block py-2 text-xs font-semibold text-zinc-300 hover:text-cyan-400 transition-colors"
                            >
                              <div className="uppercase">{item.label}</div>
                              {item.description && (
                                <div className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full h-11 px-4 text-center rounded-xl font-bold text-white border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center gap-2 tracking-wider uppercase text-xs transition-colors"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              Client & Team Login
            </Link>

            <Link
              href={PRIMARY_CTA.href}
              onClick={onClose}
              className="w-full h-11 px-4 text-center rounded-xl font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 tracking-wider uppercase text-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              {PRIMARY_CTA.label}
            </Link>

            <Link
              href="/contact"
              onClick={onClose}
              className="w-full h-12 px-4 text-center rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 flex items-center justify-center gap-2 tracking-wider uppercase text-xs shadow-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              Start Project
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
