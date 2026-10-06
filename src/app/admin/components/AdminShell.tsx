import Link from "next/link";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { navViewForRole } from "@/config/admin-nav";
import { ROLE_LABELS, type StaffRole } from "@/config/roles";
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
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-neutral-800 bg-neutral-950/95 px-4 backdrop-blur-md">
        <AdminMobileNav groups={groups} roleLabel={ROLE_LABELS[role]} email={email} />
        <Link href="/admin/command-center" className="flex min-w-0 items-center gap-2">
          <Shield className="h-5 w-5 shrink-0 text-indigo-400" aria-hidden />
          <span className="truncate text-sm font-semibold tracking-tight">
            Logic Intelligence Technologies
          </span>
        </Link>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <span className="max-w-[200px] truncate text-xs text-neutral-400">{email ?? "Signed in"}</span>
          <span className="rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
            {ROLE_LABELS[role]}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-neutral-800 lg:block">
          <nav aria-label="Admin" className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-3 py-5">
            <AdminNavLinks groups={groups} />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
