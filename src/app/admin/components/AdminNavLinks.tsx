"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveNav, type AdminNavGroupView } from "@/config/admin-nav";

/** Grouped admin nav links with active highlighting. Used by sidebar + drawer. */
export function AdminNavLinks({
  groups,
  onNavigate,
}: {
  groups: AdminNavGroupView[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "";
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-text-muted,#52677C)]">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isActiveNav(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[36px] items-center rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)] ${
                      active
                        ? "bg-[var(--lit-teal,#1FA9A2)]/10 font-bold text-[var(--lit-navy,#0B2545)] border-l-2 border-[var(--lit-teal,#1FA9A2)]"
                        : "text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)] hover:text-[var(--lit-navy,#0B2545)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
