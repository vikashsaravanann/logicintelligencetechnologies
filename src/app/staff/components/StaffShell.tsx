"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode, type ComponentType } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  MessageSquare,
  FileText,
  User,
  Activity,
  Inbox,
  LifeBuoy,
  FilePen,
  Receipt,
  Upload,
  Workflow,
  LineChart,
  Circle,
} from "lucide-react";
import { COMPANY } from "@/config/company";
import type { StaffIconKey, StaffNavItemSerializable } from "@/config/staff-nav";

/** Client-only icon registry — never import this mapping from a Server Component. */
const ICON_REGISTRY: Record<StaffIconKey, ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "list-todo": ListTodo,
  "folder-kanban": FolderKanban,
  "message-square": MessageSquare,
  "file-text": FileText,
  user: User,
  shield: Shield,
  activity: Activity,
  inbox: Inbox,
  "life-buoy": LifeBuoy,
  "file-pen": FilePen,
  receipt: Receipt,
  upload: Upload,
  workflow: Workflow,
  "line-chart": LineChart,
};

function resolveIcon(key: StaffIconKey | string | undefined) {
  if (key && key in ICON_REGISTRY) {
    return ICON_REGISTRY[key as StaffIconKey];
  }
  return Circle;
}

export type StaffShellNavItem = StaffNavItemSerializable;

export function StaffShell({
  fullName,
  jobTitle,
  department,
  employeeCode,
  email,
  navItems,
  children,
}: {
  fullName: string;
  jobTitle: string;
  department: string;
  employeeCode: string | null;
  email: string | null;
  navItems: StaffNavItemSerializable[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Staff portal">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = resolveIcon(item.iconKey);
        return (
          <Link
            key={item.id || item.href + item.label}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#0D7377)]"
                : "text-[var(--lit-ink,#121826)]/80 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-[var(--lit-ink,#121826)] antialiased">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <Link href="/staff/dashboard" className="flex items-center gap-2 min-w-0">
          <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Image
              src={COMPANY.logoIconPath}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            {COMPANY.displayName}
            <span className="ml-1.5 hidden text-[11px] font-medium text-slate-500 sm:inline">
              Staff Portal
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3 min-w-0">
          <div className="hidden text-right sm:block min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">{fullName}</p>
            <p className="truncate text-[11px] text-slate-500">
              {jobTitle}
              {employeeCode ? ` · ${employeeCode}` : ""}
            </p>
          </div>
          <div className="sm:hidden min-w-0 text-right">
            <p className="truncate text-xs font-medium text-slate-800">{jobTitle}</p>
            <p className="truncate text-[11px] text-slate-500">
              {department}
              {employeeCode ? ` · ${employeeCode}` : ""}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-white py-4 lg:block">
          <div className="mb-3 px-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Shield className="h-3 w-3" />
              Authorized modules
            </p>
          </div>
          <NavList />
          <div className="mt-6 border-t border-slate-100 px-4 pt-4">
            <p className="truncate text-[11px] text-slate-400">{email}</p>
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
                <span className="text-sm font-semibold">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3">
                <NavList onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
