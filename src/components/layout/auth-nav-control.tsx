"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, LogIn, LogOut, User, Sparkles } from "lucide-react";
import { getClientSupabase } from "@/lib/supabase/client";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

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
 * Logged out → LOGIN. Logged in → avatar + name + menu (Profile, AI, Sign out).
 * Avoids LOGIN ↔ name flicker with a stable loading skeleton.
 */
export default function AuthNavControl({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUser = useCallback(async () => {
    try {
      const supabase = getClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user;
      if (!u) {
        setUser(null);
        setReady(true);
        return;
      }
      const meta = (u.user_metadata || {}) as Record<string, unknown>;
      let profileName: string | null = null;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", u.id)
          .maybeSingle();
        profileName = (profile as { full_name?: string } | null)?.full_name ?? null;
      } catch {
        // profiles table may be unavailable; fall back to metadata
      }
      const avatarUrl =
        (typeof meta.avatar_url === "string" && meta.avatar_url) ||
        (typeof meta.picture === "string" && meta.picture) ||
        null;
      setUser({
        id: u.id,
        email: u.email ?? null,
        displayName: resolveDisplayName(profileName, meta, u.email),
        avatarUrl,
      });
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void loadUser();
    const supabase = getClientSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });
    return () => {
      sub.subscription.unsubscribe();
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
    router.refresh();
  };

  // Stable skeleton — prevents LOGIN → NAME flash
  if (!ready) {
    return (
      <div
        className={
          mobile
            ? "h-11 w-full rounded-xl bg-white/5 border border-white/10 animate-pulse"
            : "hidden lg:block h-8 w-24 rounded-full bg-white/5 border border-white/10 animate-pulse"
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
          className="flex items-center gap-2 w-full py-3 px-3 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-zinc-200 border border-white/15 bg-white/5 hover:bg-white/10 min-h-[44px]"
        >
          <LogIn className="w-4 h-4 text-cyan-400" />
          Login
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="hidden lg:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[10px] font-bold text-zinc-200 hover:text-white uppercase tracking-[0.14em] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-400/40 transition-all shadow-sm"
      >
        <LogIn className="w-3 h-3 text-cyan-400" />
        Login
      </Link>
    );
  }

  const shortName = user.displayName.split(/\s+/)[0]?.toUpperCase() || "ACCOUNT";
  const fullUpper = user.displayName.toUpperCase();
  const initials = initialsFrom(user.displayName);

  if (mobile) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
          Signed in as
        </p>
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={36}
              height={36}
              className="rounded-full object-cover border border-white/15"
              unoptimized
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-white uppercase tracking-wide truncate">
              {fullUpper}
            </p>
            {user.email && (
              <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
            )}
          </div>
        </div>
        <div className="pt-1 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5 min-h-[44px]"
          >
            <User className="w-4 h-4" /> Profile
          </Link>
          <Link
            href="/ai"
            className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </Link>
          {user.email?.toLowerCase().endsWith('@logicintelligencetechnologies.in') && (
            <Link
              href="/admin/command-center"
              className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" /> Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-2 w-full py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5 min-h-[44px] text-left"
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
        className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full text-[10px] font-bold text-zinc-100 uppercase tracking-[0.12em] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-400/40 transition-all max-w-[11rem]"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={22}
            height={22}
            className="rounded-full object-cover shrink-0"
            unoptimized
          />
        ) : (
          <span className="w-[22px] h-[22px] rounded-full bg-cyan-500/25 text-cyan-300 text-[9px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </span>
        )}
        <span className="truncate">{shortName}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-white/10 bg-[#0c1224]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 z-50"
        >
          <div className="px-3 py-2 border-b border-white/8">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Account
            </p>
            <p className="text-xs font-semibold text-white uppercase tracking-wide truncate mt-0.5">
              {fullUpper}
            </p>
          </div>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5"
          >
            <User className="w-3.5 h-3.5" /> Profile
          </Link>
          <Link
            role="menuitem"
            href="/ai"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Assistant
          </Link>
          {user.email?.toLowerCase().endsWith('@logicintelligencetechnologies.in') && (
            <Link
              role="menuitem"
              href="/admin/command-center"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30"
            >
              <Sparkles className="w-3.5 h-3.5" /> Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-300 hover:text-white hover:bg-white/5 text-left"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
