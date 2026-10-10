"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Receipt,
  MessageSquare,
  HelpCircle,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/client/projects", icon: Briefcase },
  { label: "Documents Vault", href: "/client/documents", icon: FileText },
  { label: "Invoices & Billing", href: "/client/invoices", icon: Receipt },
  { label: "Messages", href: "/client/messages", icon: MessageSquare },
  { label: "Support Tickets", href: "/client/support", icon: HelpCircle },
  { label: "Account Profile", href: "/profile", icon: User },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5" aria-label="Client Portal Navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/client/dashboard"
            ? pathname === "/client/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-[var(--lit-teal,#1FA9A2)]"
                    : "text-[var(--lit-text-muted,#52677C)] group-hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              />
              <span>{item.label}</span>
            </div>
            {isActive && (
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
