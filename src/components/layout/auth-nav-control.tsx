"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, LogIn, LogOut, User, Sparkles, Briefcase, Shield } from "lucide-react";
import { getClientSupabase } from "@/lib/supabase/client";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

interface StaffEntitlement {
  hasActiveWorkspace: boolean;
  workspaceId: string | null;
  isSuperAdmin: boolean;
  safeRoleLabel?: string | null;
}

function resolveDisplayName(
  profileName: string | null | undefined,
  meta: Record<string, unknown> | undefined,
  email: string | null | undefined
): string {
  const candidates = [
    profileName,
    typeof meta?.full_name === "string" ? meta.full_name : null,
    typeof meta?.name === "string" ? meta.name : null,
    typeof meta?.given_name === "string" ? meta.given_name : null,
  ].filter((v): v is string => Boolean(v && String(v).trim()));

  if (candidates.length > 0) {
    return candidates[0].trim();
  }
  if (email && email.includes("@")) {
    const local = email.split("@")[0].replace(/[._]/g, " ").trim();
    if (local) return local;
  }
  return "Account";
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Global header auth control.
 * Logged out → LOGIN. Logged in → avatar + name + menu (Profile, AI, My Staff Workspace, Sign out).
 * Avoids LOGIN ↔ name flicker with a stable loading skeleton.
 */
export default function AuthNavControl({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entitlement, setEntitlement] = useState<StaffEntitlement | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUser = useCallback(async () => {
    try {
      const supabase = getClientSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        return;
      }

      const su = session.user;
      let displayName = "";
      let avatarUrl: string | null =
        typeof su.user_metadata?.avatar_url === "string"
          ? su.user_metadata.avatar_url
          : null;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", su.id)
          .maybeSingle();

        if (profile?.avatar_url) avatarUrl = profile.avatar_url;
        displayName = resolveDisplayName(
          profile?.full_name,
          su.user_metadata,
          su.email
        );
      } catch {
        displayName = resolveDisplayName(
          null,
          su.user_metadata,
          su.email
        );
      }

      setUser({
        id: su.id,
        email: su.email ?? null,
        displayName,
        avatarUrl,
      });

      // Fetch staff entitlement for verified workspace access
      try {
        const entRes = await fetch("/api/me/staff-workspace");
        if (entRes.ok) {
          const entData = await entRes.json();
          setEntitlement(entData);
        } else {
          setEntitlement(null);
        }
      } catch {
        setEntitlement(null);
      }
    } catch {
      setUser(null);
      setEntitlement(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void loadUser();

    const supabase = getClientSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    const supabase = getClientSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setEntitlement(null);
    router.refresh();
  };

  // Stable skeleton — prevents LOGIN → NAME flash
  if (!ready) {
    return (
      <div
        className={
          mobile
            ? "h-11 w-full rounded-xl bg-slate-100 border border-[var(--lit-border-light)] animate-pulse"
            : "hidden lg:block h-7.5 w-20 rounded-full bg-slate-100 border border-[var(--lit-border-light)] animate-pulse shrink-0"
        }
        aria-hidden
      />
    );
  }

  if (!user) {
    if (mobile) {
      return (
        <Link
          href="/login"
          className="flex items-center gap-2 w-full py-3 px-3 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-[var(--lit-navy)] border border-[var(--lit-border-light)] bg-white hover:bg-[var(--lit-cloud)] min-h-[44px] shadow-xs"
        >
          <LogIn className="w-4 h-4 text-[var(--lit-blue)]" />
          Login
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="hidden lg:inline-flex items-center gap-1.5 h-7.5 px-2.5 rounded-full text-[9.5px] font-bold text-[var(--lit-navy)] hover:text-[var(--lit-blue)] uppercase tracking-[0.10em] border border-[var(--lit-border-light)] bg-white hover:bg-[var(--lit-cloud)] transition-all shadow-xs shrink-0"
      >
        <LogIn className="w-2.5 h-2.5 text-[var(--lit-blue)]" />
        Login
      </Link>
    );
  }

  const shortName = user.displayName.split(/\s+/)[0]?.toUpperCase() || "ACCOUNT";
  const fullUpper = user.displayName.toUpperCase();
  const initials = initialsFrom(user.displayName);

  if (mobile) {
    return (
      <div className="rounded-xl border border-[var(--lit-border-light)] bg-[var(--lit-cloud)] p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-text-muted)]">
          Signed in as
        </p>
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt="User profile avatar"
              width={36}
              height={36}
              className="rounded-full object-cover border border-[var(--lit-border-light)]"
              unoptimized
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-[var(--lit-light-blue)] border border-[var(--lit-blue)]/20 text-[var(--lit-blue)] text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--lit-navy)] uppercase tracking-wide truncate">
              {fullUpper}
            </p>
            {user.email && (
              <p className="text-[11px] text-[var(--lit-text-muted)] truncate">{user.email}</p>
            )}
          </div>
        </div>
        <div className="pt-1 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-[var(--lit-ink)] hover:text-[var(--lit-blue)] hover:bg-white min-h-[44px]"
          >
            <User className="w-4 h-4 text-[var(--lit-blue)]" /> Profile
          </Link>
          <Link
            href="/ai"
            className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-[var(--lit-ink)] hover:text-[var(--lit-blue)] hover:bg-white min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-[var(--lit-teal)]" /> AI Assistant
          </Link>
          {entitlement?.hasActiveWorkspace && entitlement?.workspaceId && (
            <Link
              href="/staff/dashboard"
              className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-[var(--lit-blue)] hover:bg-white min-h-[44px]"
            >
              <Briefcase className="w-4 h-4 text-[var(--lit-blue)]" /> My Staff Workspace
            </Link>
          )}
          {entitlement?.isSuperAdmin && (
            <Link
              href="/admin/command-center"
              className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-[var(--lit-navy)] hover:bg-white min-h-[44px]"
            >
              <Shield className="w-4 h-4 text-[var(--lit-blue)]" /> Command Center
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-2 w-full py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-red-600 hover:bg-red-50 min-h-[44px] text-left"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative hidden lg:block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 h-7.5 pl-1 pr-2 rounded-full text-[9.5px] font-bold text-[var(--lit-navy)] uppercase tracking-[0.10em] border border-[var(--lit-border-light)] bg-white hover:bg-[var(--lit-cloud)] transition-all max-w-[8.5rem] shadow-xs shrink-0"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt="User profile avatar"
            width={20}
            height={20}
            className="rounded-full object-cover shrink-0"
            unoptimized
          />
        ) : (
          <span className="w-5 h-5 rounded-full bg-[var(--lit-light-blue)] text-[var(--lit-blue)] text-[8.5px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </span>
        )}
        <span className="truncate">{shortName}</span>
        <ChevronDown className={`w-3 h-3 text-[var(--lit-text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-[var(--lit-border-light)] bg-white shadow-xl py-1.5 z-50"
        >
          <div className="px-3 py-2 border-b border-[var(--lit-border-light)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lit-text-muted)]">
              Account
            </p>
            <p className="text-xs font-semibold text-[var(--lit-navy)] uppercase tracking-wide truncate mt-0.5">
              {fullUpper}
            </p>
          </div>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--lit-ink)] hover:text-[var(--lit-blue)] hover:bg-[var(--lit-cloud)]"
          >
            <User className="w-3.5 h-3.5 text-[var(--lit-blue)]" /> Profile
          </Link>
          <Link
            role="menuitem"
            href="/ai"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--lit-ink)] hover:text-[var(--lit-blue)] hover:bg-[var(--lit-cloud)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--lit-teal)]" /> AI Assistant
          </Link>
          {entitlement?.hasActiveWorkspace && entitlement?.workspaceId && (
            <Link
              role="menuitem"
              href="/staff/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--lit-blue)] hover:bg-[var(--lit-cloud)]"
            >
              <Briefcase className="w-3.5 h-3.5 text-[var(--lit-blue)]" /> My Staff Workspace
            </Link>
          )}
          {entitlement?.isSuperAdmin && (
            <Link
              role="menuitem"
              href="/admin/command-center"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--lit-navy)] hover:bg-[var(--lit-cloud)]"
            >
              <Shield className="w-3.5 h-3.5 text-[var(--lit-blue)]" /> Command Center
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-red-600 hover:bg-red-50 text-left"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
