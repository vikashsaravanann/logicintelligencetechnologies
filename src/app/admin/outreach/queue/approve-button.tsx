"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, CheckCheck, AlertCircle, FileCheck } from "lucide-react";
import { approveDraft } from "../studio/actions";

interface ApproveButtonProps {
  messageId: string;
  disabled?: boolean;
}

export function ApproveButton({ messageId, disabled }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function onApprove() {
    setLoading(true);
    setMsg(null);
    setError(false);
    try {
      const r = await approveDraft(messageId);
      setMsg(r.message);
      if (r.ok) {
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
      setMsg("Action failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={onApprove}
        disabled={loading || disabled}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        title={
          disabled
            ? "Resolve blocker gates in Outreach Studio first"
            : "Sign off on draft content (QA approval). Note: Dispatch remains a separate controlled step subject to legal policy gating."
        }
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileCheck className="h-3.5 w-3.5" />
        )}
        <span>Approve Draft Content</span>
      </button>

      {msg ? (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium font-mono ${
            error ? "text-rose-600" : "text-emerald-700"
          }`}
        >
          {error && <AlertCircle className="w-3 h-3" />}
          {msg}
        </span>
      ) : null}
    </div>
  );
}

interface BatchApproveButtonProps {
  messageIds: string[];
}

export function BatchApproveButton({ messageIds }: BatchApproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const count = messageIds.length;
  if (count === 0) return null;

  async function onBatchApprove() {
    if (
      !window.confirm(
        `Approve draft content for all ${count} QA-verified messages?\n\nNote: This signs off on draft content only. Dispatch remains governed by legal compliance and controlled gateway transmission.`
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus(`Approving 0 of ${count}...`);

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < messageIds.length; i++) {
      const id = messageIds[i];
      try {
        const res = await approveDraft(id);
        if (res.ok) succeeded++;
        else failed++;
      } catch {
        failed++;
      }
      setStatus(`Approving ${i + 1} of ${count}...`);
    }

    setLoading(false);
    setStatus(`Batch complete: ${succeeded} draft(s) approved for content${failed > 0 ? `, ${failed} failed` : ""}. Dispatches remain governed by legal gates.`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onBatchApprove}
        disabled={loading || count === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#12365e] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        title="Approve message content for all passing drafts. Does not trigger email dispatches."
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--lit-teal,#1FA9A2)]" />
        ) : (
          <CheckCheck className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
        )}
        <span>Batch Approve Draft Content ({count})</span>
      </button>

      {status ? (
        <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
          {status}
        </span>
      ) : null}
    </div>
  );
}
