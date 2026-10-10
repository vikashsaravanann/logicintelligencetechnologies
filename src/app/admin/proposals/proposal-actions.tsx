"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, Loader2, CheckCircle2, ExternalLink, FileEdit } from "lucide-react";
import { toast } from "sonner";

interface ProposalActionsProps {
  proposalId: string;
  secureToken: string;
}

export function ProposalActions({ proposalId, secureToken }: ProposalActionsProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    if (sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/proposals/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success("Proposal email sent successfully to the client.");
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send proposal email";
      toast.error(msg);
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2.5">
      <Link
        href={`/admin/proposals/${proposalId}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs"
        title="Edit Proposal Details"
      >
        <FileEdit className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
        <span>Inspect</span>
      </Link>

      <button
        type="button"
        onClick={handleSendEmail}
        disabled={sending || sent}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
          sent
            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50"
        }`}
      >
        {sending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : sent ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        ) : (
          <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
        )}
        <span>{sending ? "Sending…" : sent ? "Dispatched" : "Dispatch"}</span>
      </button>

      <Link
        href={`/proposal/${secureToken}`}
        target="_blank"
        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors ml-1"
        title="Open Public Client View"
      >
        <span>Portal</span>
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}
