"use client";

import { useState, useEffect } from "react";
import { Menu, X, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AdminNavGroupView } from "@/config/admin-nav";
import { AdminNavLinks } from "./AdminNavLinks";

/** Mobile drawer trigger + panel for the admin nav (hidden on lg+). */
export function AdminMobileNav({
  groups,
  roleLabel,
  email,
}: {
  groups: AdminNavGroupView[];
  roleLabel: string;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] lg:hidden shadow-2xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="admin-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--lit-navy,#0B2545)]/40 backdrop-blur-xs lg:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            id="admin-drawer"
            className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(84vw,320px)] flex-col overflow-y-auto border-r border-[var(--lit-border-light,#DFE7EF)] bg-white px-5 pb-6 pt-5 shadow-xl lg:hidden"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
                  <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">LIT Admin</span>
                </div>
                <p className="truncate text-xs font-mono text-[var(--lit-text-muted,#52677C)]">{email ?? "Signed in"}</p>
                <span className="mt-1.5 inline-block rounded-md border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                  {roleLabel}
                </span>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AdminNavLinks groups={groups} onNavigate={() => setOpen(false)} />
            <form action="/auth/signout" method="post" className="mt-6 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <button
                type="submit"
                className="w-full rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3 py-2 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
