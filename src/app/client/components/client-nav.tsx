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
  ChevronRight,
  GitBranch,
  Bell,
  CheckSquare,
  FileEdit,
  Calendar,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Milestone Journey", href: "/client/dashboard#journey", icon: GitBranch },
  { label: "Approvals & Tasks", href: "/client/actions", icon: CheckSquare },
  { label: "Notifications", href: "/client/notifications", icon: Bell },
  { label: "Change Requests (RFC)", href: "/client/change-requests", icon: FileEdit },
  { label: "Meetings & Scoping", href: "/client/meetings", icon: Calendar },
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
    <nav className="grid grid-cols-2 gap-2 md:block md:space-y-1" aria-label="Client Portal Navigation">
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
            className={`group flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 min-h-[42px] border ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white border-[var(--lit-navy,#0B2545)] shadow-xs"
                : "border-[var(--lit-border-light,#DFE7EF)] md:border-transparent text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-slate-50/70 md:bg-transparent"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isActive
                    ? "text-[var(--lit-teal,#1FA9A2)]"
                    : "text-[var(--lit-text-muted,#52677C)] group-hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>
            {isActive && (
              <ChevronRight className="w-3.5 h-3.5 text-white/50 shrink-0 hidden md:inline-block" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
