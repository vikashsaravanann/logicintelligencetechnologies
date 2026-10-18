"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Reply failed");
        return;
      }
      setMessage("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <label className="text-xs font-medium text-slate-700">Reply to client</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        required
      />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
