"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, LayoutDashboard, Users, Bot, Calendar, FileText, Headphones, ShieldCheck, Globe, ChevronRight } from "lucide-react";
import { useState } from "react";

const ADMIN_NAV_ITEMS = [
  { label: "Command Center", href: "/admin/command-center", icon: LayoutDashboard, description: "Overview & KPIs" },
  { label: "CRM Leads", href: "/admin/leads", icon: Users, description: "Inbound inquiries" },
  { label: "AI Chat Leads", href: "/admin/ai-leads", icon: Bot, description: "AI-captured leads" },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar, description: "Consultations" },
  { label: "Proposals", href: "/admin/proposals", icon: FileText, description: "SOWs & quotes" },
  { label: "Support", href: "/admin/support", icon: Headphones, description: "Tickets" },
  { label: "VoiceShield Access", href: "/admin/voiceshield-requests", icon: ShieldCheck, description: "Grant console access", highlight: true },
];

export function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1 text-sm">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/command-center" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? item.highlight
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "bg-primary/10 text-primary"
                  : item.highlight
                  ? "text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-neutral-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          title="View live website"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">Live Site</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-rose-400/70 hover:text-rose-300 transition-colors px-3 py-2 rounded-lg hover:bg-rose-500/10"
          title="Exit Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">Exit</span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden text-neutral-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle admin menu"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800 shadow-2xl lg:hidden flex flex-col z-50">
          <nav className="flex flex-col p-3 gap-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/command-center" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
                    isActive
                      ? item.highlight
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-primary/10 text-primary"
                      : item.highlight
                      ? "text-cyan-400 hover:bg-cyan-500/10"
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-[10px] font-normal normal-case text-neutral-500">{item.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              );
            })}
          </nav>
          <div className="flex gap-2 p-3 border-t border-neutral-800">
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" /> Live Site
            </Link>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Exit Admin
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
