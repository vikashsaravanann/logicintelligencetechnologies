"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MORE_NAV_GROUPS, NavGroup } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface MoreMenuProps {
  groups?: NavGroup[];
  className?: string;
  onNavigate?: () => void;
}

/**
 * Accessible desktop dropdown menu for company solutions, resources, tools, and support.
 */
export function MoreMenu({
  groups = MORE_NAV_GROUPS,
  className,
  onNavigate,
}: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center h-11 px-2.5 text-xs font-semibold tracking-[0.14em] text-zinc-200 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="desktop-more-menu"
      >
        MORE
        <ChevronDown
          className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="desktop-more-menu"
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-[min(92vw,640px)] bg-[rgba(10,15,30,0.96)] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 z-[80] grid grid-cols-2 gap-5 backdrop-blur-[24px]"
          >
            {groups.map((group) => (
              <div key={group.id} className="min-w-0">
                <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        role="menuitem"
                        onClick={() => {
                          setIsOpen(false);
                          if (onNavigate) onNavigate();
                        }}
                        className="block rounded-lg px-2.5 py-2 hover:bg-white/[0.06] hover:border hover:border-white/10 transition-all group"
                      >
                        <span className="block text-[12px] font-bold tracking-wide text-zinc-200 group-hover:text-cyan-300">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="block text-[11px] text-zinc-400 group-hover:text-zinc-300 mt-0.5 leading-snug">
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
  );
}

export default MoreMenu;
