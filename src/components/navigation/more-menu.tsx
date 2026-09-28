"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MORE_NAV_GROUPS, NavGroup } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface MoreMenuProps {
  groups?: NavGroup[];
  className?: string;
  onNavigate?: () => void;
}

/**
 * Accessible desktop dropdown for company, products, and engage links.
 * Labels + descriptions always visible with high contrast on dark surface.
 */
export function MoreMenu({
  groups = MORE_NAV_GROUPS,
  className,
  onNavigate,
}: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = React.useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 150);
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen && !isClosing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isClosing, closeMenu]);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center h-11 px-2.5 text-xs font-semibold tracking-[0.14em] text-white hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="desktop-more-menu"
      >
        MORE
        <ChevronDown
          className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-cyan-400" : "text-white"
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id="desktop-more-menu"
        role="menu"
        data-origin="top-right"
        className={cn(
          "t-dropdown absolute top-full right-0 mt-2 w-[min(96vw,420px)] bg-[rgba(10,15,30,0.98)] border border-white/15 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-3 z-[90] grid grid-cols-2 gap-3 backdrop-blur-[24px]",
          isOpen && "is-open",
          isClosing && "is-closing"
        )}
      >
        {[0, 1].map((colIndex) => (
          <div key={colIndex} className="flex flex-col gap-2">
            {groups
              .filter((_, i) => i % 2 === colIndex)
              .map((group) => (
                <div key={group.id} className="min-w-0">
                  <p className="px-1.5 mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            if (onNavigate) onNavigate();
                          }}
                          className={cn(
                            "block rounded-lg px-1.5 py-1.5 transition-all group border border-transparent min-h-[36px]",
                            item.highlight
                              ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-cyan-500/40"
                              : "hover:bg-white/[0.06] hover:border-white/10"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-[11px] font-bold tracking-wide uppercase leading-tight",
                              item.highlight
                                ? "text-cyan-300 group-hover:text-cyan-200"
                                : "text-white group-hover:text-cyan-300"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.description ? (
                            <span className="block text-[10px] text-zinc-400 group-hover:text-zinc-300 mt-0.5 leading-snug uppercase tracking-wide">
                              {item.description}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoreMenu;
