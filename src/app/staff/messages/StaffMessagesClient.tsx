"use client";

import { useState } from "react";

type Thread = {
  threadId: string;
  clientEmail: string;
  subject: string | null;
  engagementRef: string | null;
  projectTitle: string | null;
  updatedAt: string | null;
  lastPreview: string | null;
};

type Msg = {
  id: string;
  sender: string;
  senderName: string;
  role?: string;
  content: string;
  timestamp: string;
  status: string;
};

export function StaffMessagesClient({
  initialThreads,
  staffName,
}: {
  initialThreads: Thread[];
  staffName: string;
}) {
  const [threads] = useState(initialThreads);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openThread(id: string) {
    setActive(id);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/staff/messages?threadId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load thread");
        return;
      }
      setMessages(data.thread?.messages || []);
      setClientEmail(data.thread?.clientEmail || "");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!active || !draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: active, content: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Send failed");
        return;
      }
      setMessages((m) => [...m, data.message]);
      setDraft("");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Assigned threads
        </div>
        {threads.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No client conversations yet. Assign projects to this staff member to receive messages.
          </p>
        ) : (
          <ul className="max-h-[480px] overflow-y-auto divide-y divide-slate-100">
            {threads.map((t) => (
              <li key={t.threadId}>
                <button
                  type="button"
                  onClick={() => openThread(t.threadId)}
                  className={`w-full px-3 py-3 text-left text-sm hover:bg-slate-50 ${
                    active === t.threadId ? "bg-teal-50" : ""
                  }`}
                >
                  <p className="font-medium text-slate-900 truncate">
                    {t.projectTitle || t.subject || t.clientEmail}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{t.clientEmail}</p>
                  {t.lastPreview ? (
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{t.lastPreview}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white">
        {!active ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
            Select a conversation to view and reply.
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{clientEmail}</p>
              <p className="text-xs text-slate-500">Replying as {staffName}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.sender === "team"
                      ? "ml-auto bg-teal-50 text-slate-900"
                      : "bg-slate-50 text-slate-800"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-slate-500">
                    {m.senderName}
                    {m.role ? ` · ${m.role}` : ""}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.content}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{m.timestamp}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-3">
              {error ? (
                <p className="mb-2 text-xs text-red-700">{error}</p>
              ) : null}
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Write a client-visible reply…"
                />
                <button
                  type="button"
                  disabled={busy || !draft.trim()}
                  onClick={sendReply}
                  className="self-end rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? "…" : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
