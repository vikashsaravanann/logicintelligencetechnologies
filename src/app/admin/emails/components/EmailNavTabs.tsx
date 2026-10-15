"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Mail, 
  Settings, 
  Inbox, 
  Activity, 
  CheckSquare, 
  ShieldAlert, 
  Send,
  FileText
} from "lucide-react";

export function EmailNavTabs() {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Overview", href: "/admin/emails", icon: BarChart3 },
    { name: "Compose", href: "/admin/emails/new", icon: Send },
    { name: "Mailboxes & Identity", href: "/admin/emails/mailboxes", icon: Mail },
    { name: "Outbox Queue", href: "/admin/emails/outbox", icon: Inbox },
    { name: "Template Previews", href: "/admin/email-preview", icon: FileText },
    { name: "Action Approvals", href: "/admin/automations/approvals", icon: CheckSquare },
    { name: "Incidents & DLQ", href: "/admin/automations/dead-letter", icon: ShieldAlert },
    { name: "n8n Flow Engine", href: "/admin/automations/n8n", icon: Settings },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 border border-transparent hover:border-slate-200"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--lit-teal,#1FA9A2)]" : ""}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
