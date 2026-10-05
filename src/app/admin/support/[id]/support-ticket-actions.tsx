"use client";

import { useState } from "react";
import { resolveSupportTicket, sendAdminEmail } from "../../actions";
import { CheckCircle2, Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface SupportTicketActionsProps {
  ticketId: string;
  email: string;
  status: string;
}

export function SupportTicketActions({ ticketId, email, status }: SupportTicketActionsProps) {
  const [resolving, setResolving] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveSupportTicket(ticketId);
      toast.success("Ticket marked as resolved");
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await sendAdminEmail(
        email,
        `Re: Support Ticket #${ticketId}`,
        replyText
      );
      toast.success("Reply sent successfully");
      setShowReply(false);
      setReplyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-3 w-full">
        <button
          onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all"
        >
          <Mail className="w-4 h-4" />
          Reply via Email
        </button>

        {status === "Open" && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold transition-all disabled:opacity-50"
          >
            {resolving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Mark as Resolved
          </button>
        )}
      </div>

      {showReply && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Type your reply to ${email}...`}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 min-h-[120px] resize-y"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
