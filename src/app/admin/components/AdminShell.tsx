import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { navViewForRole } from "@/config/admin-nav";
import { ROLE_LABELS, type StaffRole } from "@/config/roles";
import { COMPANY } from "@/config/company";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminNavLinks } from "./AdminNavLinks";

/**
 * Admin chrome: a persistent sidebar (desktop) and a drawer (mobile), both
 * filtered to the signed-in staff member's capabilities, plus the account email,
 * role badge and sign-out. Server component — receives the resolved session.
 */
export function AdminShell({
  role,
  email,
  children,
}: {
  role: StaffRole;
  email: string | null;
  children: ReactNode;
}) {
  // Serializable (label+href only) — functions like `match` cannot cross the
  // server→client boundary into the nav client components.
  const groups = navViewForRole(role);

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] font-sans text-[var(--lit-ink,#121826)] selection:bg-[var(--lit-teal,#1FA9A2)]/20 antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-2xs">
        <AdminMobileNav groups={groups} roleLabel={ROLE_LABELS[role]} email={email} />
        <Link href="/admin/command-center" className="flex min-w-0 items-center gap-2.5 group">
          <span className="relative block h-8 w-8 rounded-lg overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0 shadow-2xs group-hover:border-[var(--lit-teal,#1FA9A2)] transition-colors">
            <Image
              src={COMPANY.logoIconPath}
              alt={`${COMPANY.displayName} Logo`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </span>
          <span className="truncate text-xs font-black tracking-wider text-[var(--lit-navy,#0B2545)] uppercase font-mono">
            LOGIC INTELLIGENCE TECHNOLOGIES
          </span>
        </Link>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <span className="max-w-[220px] truncate text-xs text-[var(--lit-text-muted,#52677C)] font-mono">{email ?? "Signed in"}</span>
          <span className="rounded-md border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
            {ROLE_LABELS[role]}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[var(--lit-border-light,#DFE7EF)] bg-white lg:block shadow-2xs">
          <nav aria-label="Admin" className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-4 py-6">
            <AdminNavLinks groups={groups} />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
