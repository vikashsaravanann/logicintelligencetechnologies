"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900 lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            id="admin-drawer"
            className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(84vw,320px)] flex-col overflow-y-auto border-r border-neutral-800 bg-neutral-950 px-4 pb-6 pt-4 lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-xs text-neutral-400">{email ?? "Signed in"}</p>
                <span className="mt-1 inline-block rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                  {roleLabel}
                </span>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-neutral-300"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNavLinks groups={groups} onNavigate={() => setOpen(false)} />
            <form action="/auth/signout" method="post" className="mt-6">
              <button
                type="submit"
                className="w-full rounded-lg border border-neutral-700 px-3 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
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
