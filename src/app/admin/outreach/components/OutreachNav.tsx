import Link from "next/link";
import {
  Send,
  Sparkles,
  Inbox,
  BookOpen,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

export type OutreachNavTab =
  | "overview"
  | "studio"
  | "queue"
  | "playbook"
  | "suppression"
  | "analytics";

interface OutreachNavProps {
  active: OutreachNavTab;
}

const TABS = [
  { key: "overview" as const, label: "Outreach Overview", href: "/admin/outreach", icon: Send },
  { key: "studio" as const, label: "Studio", href: "/admin/outreach/studio", icon: Sparkles },
  { key: "queue" as const, label: "Queue", href: "/admin/outreach/queue", icon: Inbox },
  { key: "playbook" as const, label: "Playbook", href: "/admin/outreach/playbook", icon: BookOpen },
  { key: "suppression" as const, label: "Suppression", href: "/admin/outreach/suppression", icon: ShieldAlert },
  { key: "analytics" as const, label: "Analytics", href: "/admin/outreach/analytics", icon: BarChart3 },
];

export function OutreachNav({ active }: OutreachNavProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--lit-border-light,#DFE7EF)] pb-3 text-xs scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                : "text-[var(--lit-text-muted,#52677C)] hover:bg-white hover:text-[var(--lit-navy,#0B2545)] border border-transparent hover:border-[var(--lit-border-light,#DFE7EF)] shadow-2xs"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isActive ? "text-[var(--lit-teal,#1FA9A2)]" : "text-slate-400"
              }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
