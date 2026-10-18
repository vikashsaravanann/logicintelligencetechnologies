"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/staff/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not update password.");
        setBusy(false);
        return;
      }
      setSuccess(data.message || "Password updated securely.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700" htmlFor="current-pw">
          Current password
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="current-pw"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 text-xs text-slate-600"
            onClick={() => setShowCurrent((v) => !v)}
          >
            {showCurrent ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700" htmlFor="new-pw">
          New password
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="new-pw"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={12}
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 text-xs text-slate-600"
            onClick={() => setShowNew((v) => !v)}
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Minimum 12 characters. Prefer a password manager.</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700" htmlFor="confirm-pw">
          Confirm new password
        </label>
        <input
          id="confirm-pw"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={12}
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {success}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update Password Securely"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
          onClick={() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
            setSuccess(null);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
