"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StaffSetupPasswordForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Password confirmation does not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/staff/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword: confirm, workspaceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not update password.");
        setBusy(false);
        return;
      }
      router.replace("/staff/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700" htmlFor="pw">
          New password
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700" htmlFor="pw2">
          Confirm password
        </label>
        <input
          id="pw2"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={12}
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save password and continue"}
      </button>
    </form>
  );
}
