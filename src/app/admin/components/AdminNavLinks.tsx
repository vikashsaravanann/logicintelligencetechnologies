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
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActiveNav(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                      active
                        ? "bg-indigo-500/15 text-indigo-200"
                        : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
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
