"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientSupabase } from "@/lib/supabase/client";

export function SessionsClient() {
  const supabase = getClientSupabase();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signOut(scope: "local" | "others" | "global") {
    setBusy(scope);
    setError(null);
    setMessage(null);
    try {
      const { error: soErr } = await supabase.auth.signOut({ scope });
      if (soErr) {
        setError(soErr.message);
        return;
      }
      if (scope === "local" || scope === "global") {
        router.replace("/login");
        router.refresh();
        return;
      }
      setMessage("Other sessions signed out. This browser remains signed in.");
    } catch (e: any) {
      setError(e?.message || "Sign-out failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">This session</h2>
        <p className="text-sm text-slate-600">Ends authentication in the current browser only.</p>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => signOut("local")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-60"
        >
          {busy === "local" ? "Signing out…" : "Sign out this session"}
        </button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Other sessions</h2>
        <p className="text-sm text-slate-600">
          Revokes refresh tokens on other devices. This session stays active.
        </p>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => signOut("others")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-60"
        >
          {busy === "others" ? "Working…" : "Sign out other sessions"}
        </button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">All sessions</h2>
        <p className="text-sm text-slate-600">
          Global sign-out. You will need to sign in again on every device.
        </p>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => signOut("global")}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy === "global" ? "Signing out…" : "Sign out all sessions"}
        </button>
      </section>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
    </div>
  );
}
