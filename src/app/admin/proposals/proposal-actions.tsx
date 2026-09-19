"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, Loader2, CheckCircle2 } from "lucide-react";
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

      toast.success("Email sent successfully to the client.");
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send email.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={handleSendEmail}
        disabled={sending || sent}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          sent
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
        }`}
      >
        {sending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : sent ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        <span>{sending ? "Sending..." : sent ? "Sent" : "Send Email"}</span>
      </button>

      <Link
        href={`/proposal/${secureToken}`}
        target="_blank"
        className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
      >
        <span>View Client Link</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
