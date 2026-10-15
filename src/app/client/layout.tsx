import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/config/company";
import { ClientNav } from "./components/client-nav";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 flex flex-col justify-between shrink-0 shadow-2xs">
        <div>
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <span className="relative block w-10 h-10 rounded-xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0 shadow-2xs group-hover:border-[var(--lit-teal,#1FA9A2)] transition-colors">
              <Image
                src={COMPANY.logoIconPath}
                alt={`${COMPANY.displayName} Logo`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </span>
            <div>
              <span className="text-xs font-bold tracking-wider text-[var(--lit-navy,#0B2545)] block uppercase font-mono">
                Client Portal
              </span>
              <span className="text-[10px] text-[var(--lit-teal,#1FA9A2)] font-semibold tracking-wider uppercase block">
                Enterprise Workspace
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <ClientNav />
        </div>

        {/* Footer / Status */}
        <div className="pt-6 mt-6 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] text-[var(--lit-text-muted,#52677C)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-semibold font-mono text-[10px]">
              Tenant Isolated (RLS)
            </span>
          </div>
          <p>© {new Date().getFullYear()} {COMPANY.displayName}</p>
          <div className="mt-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]/60 flex items-center justify-between">
            <Link
              href="/"
              className="text-[10px] text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] flex items-center gap-1 transition-colors"
            >
              <span>Main Site</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
            <span className="text-[9px] font-mono text-[var(--lit-text-muted,#52677C)]/70">v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Workspace Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[var(--lit-border-light,#DFE7EF)] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] font-mono uppercase tracking-wider">
              Client Workspace
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              V4 Production
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/engagement"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] text-xs font-semibold transition-colors"
              title="13-Stage Engagement Timeline"
            >
              <span>13 Stages</span>
            </Link>

            <Link
              href="/client/actions"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] text-xs font-semibold transition-colors"
              title="Approvals & Tasks"
            >
              <span>Approvals</span>
            </Link>

            <Link
              href="/client/notifications"
              className="relative p-2 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] transition-colors"
              title="Notifications"
            >
              <span className="sr-only">Notifications</span>
              <svg
                className="w-4 h-4 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-10 bg-[var(--lit-cloud,#F7F9FC)] flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
