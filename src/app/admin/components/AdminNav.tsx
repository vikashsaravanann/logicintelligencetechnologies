"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const ADMIN_NAV_ITEMS = [
  { label: "Command Center", href: "/admin/command-center" },
  { label: "Leads", href: "/admin/leads" },
  { label: "AI Leads", href: "/admin/ai-leads" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Proposals", href: "/admin/proposals" },
  { label: "Support", href: "/admin/support" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/command-center" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors whitespace-nowrap ${
                isActive ? "text-primary border-b-2 border-primary py-5" : "text-neutral-300 hover:text-white py-5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          title="Exit Admin"
        >
          <LogOut className="w-4 h-4" />
          <span className="uppercase tracking-wider">Exit</span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden text-neutral-300 hover:text-white p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle admin menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-neutral-950 border-b border-neutral-800 shadow-xl lg:hidden flex flex-col p-4 z-50">
          <nav className="flex flex-col gap-2">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/command-center" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-neutral-800 my-2" />
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Exit Admin
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
