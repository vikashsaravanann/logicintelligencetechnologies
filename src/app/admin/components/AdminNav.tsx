"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ADMIN_NAV_ITEMS } from "@/config/admin-nav";

export function AdminNav() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-tight text-white sm:text-sm">
              Logic Intelligence Technologies
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              Admin Command Center
            </p>
          </div>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Admin primary"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Exit
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-800 p-2 text-neutral-300 hover:bg-neutral-900 lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav
          id="admin-mobile-nav"
          className="border-t border-neutral-800 bg-neutral-950 px-4 py-3 lg:hidden"
          aria-label="Admin mobile"
        >
          <ul className="flex flex-col gap-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-900 hover:text-white"
              >
                Exit Admin
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
