"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, X, Globe } from "lucide-react";
import { promoteCitationTarget, markCitationStatus } from "./actions";

type Status = "identified" | "queued" | "actioned" | "live" | "rejected";

/**
 * Per-target actions for the Citations tab. Promote routes a draft into the
 * existing outreach approval queue (nothing auto-sends); the mark buttons are
 * human-driven status transitions.
 */
export function CitationControls({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [url, setUrl] = useState("");

  function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setMsg(res.error ?? "Failed.");
      else {
        setShowUrl(false);
        setUrl("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {(status === "identified" || status === "rejected") && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => promoteCitationTarget(id))}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--lit-teal,#1FA9A2)]/40 bg-[var(--lit-teal,#1FA9A2)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--lit-teal,#1FA9A2)] transition-colors hover:bg-[var(--lit-teal,#1FA9A2)]/20 disabled:opacity-40"
            title="Create an outreach draft in the approval queue"
          >
            <Send className="h-3 w-3" />
            Promote to queue
          </button>
        )}
        {status === "queued" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => markCitationStatus({ id, status: "actioned" }))}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-40"
          >
            <Check className="h-3 w-3" />
            Mark actioned
          </button>
        )}
        {status === "actioned" && !showUrl && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setShowUrl(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
          >
            <Globe className="h-3 w-3" />
            Mark live
          </button>
        )}
        {status !== "live" && status !== "rejected" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => markCitationStatus({ id, status: "rejected" }))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            <X className="h-3 w-3" />
            Reject
          </button>
        )}
      </div>
      {showUrl && (
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… citation URL"
            className="w-56 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] px-2 py-1 text-[11px]"
          />
          <button
            type="button"
            disabled={pending || !url}
            onClick={() => run(() => markCitationStatus({ id, status: "live", citationUrl: url }))}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}
      {msg ? <span className="text-[11px] font-medium text-rose-600">{msg}</span> : null}
    </div>
  );
}
