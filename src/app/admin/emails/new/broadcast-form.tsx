"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

function formatDeliveryStatus(data: {
  status?: string;
  skipped?: boolean;
  messageId?: string | null;
}): string {
  const status = (data.status || "unknown").toLowerCase();
  if (data.skipped) {
    return `Not delivered (${status}) — dry-run / preview / suppressed`;
  }
  if (status === "sent") {
    return data.messageId
      ? `Accepted by email provider · ${data.messageId}`
      : "Accepted by email provider (sent)";
  }
  if (status === "queued" || status === "processing") {
    return "Queued for delivery — not yet confirmed by provider";
  }
  return `Status: ${status}`;
}

/**
 * Admin single-recipient message (transactional).
 * Not a multi-recipient marketing blast.
 */
export function BroadcastForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/admin/send-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          type: "broadcast",
          email,
          fullName,
          data: { subject, message },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const bits = [
          data.error || "Failed to send",
          data.errorCategory ? `[${data.errorCategory}]` : "",
          data.errorCode ? `(${data.errorCode})` : "",
        ].filter(Boolean);
        throw new Error(bits.join(" "));
      }
      setSuccess(`${formatDeliveryStatus(data)} → ${email}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 flex flex-col">
      <p className="text-xs text-zinc-500">
        One transactional message via SMTP + outbox. Status reflects provider
        outcome — not a generic “Sent” on HTTP 200 alone.
      </p>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
          To (email)
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="recipient@example.com"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
          Name (optional)
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Recipient name"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
          Subject
        </label>
        <input
          required
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Email subject"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
          Message
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={8000}
          rows={8}
          placeholder="Write your message…"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}
      <div className="pt-4 flex justify-end gap-3">
        <a
          href="/admin/emails"
          className="px-6 py-3 rounded-xl border border-neutral-700 text-white font-bold text-sm hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
