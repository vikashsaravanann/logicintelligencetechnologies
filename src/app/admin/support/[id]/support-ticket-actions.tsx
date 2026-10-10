"use client";

import { useState } from "react";
import {
  resolveSupportTicket,
  replyToSupportTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
  addSupportInternalNote,
} from "../../actions";
import {
  CheckCircle2,
  Mail,
  Loader2,
  Send,
  Lock,
  MessageSquare,
  ShieldAlert,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SupportTicketActionsProps {
  ticketId: string;
  email: string;
  status: string;
  priority?: string;
}

const STATUS_OPTIONS = [
  { value: "Open", label: "Open", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  { value: "In Progress", label: "In Progress", badge: "border-blue-200 bg-blue-50 text-blue-800" },
  {
    value: "Waiting on Client",
    label: "Waiting on Client",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  { value: "Resolved", label: "Resolved", badge: "border-slate-200 bg-slate-50 text-slate-700" },
  { value: "Closed", label: "Closed", badge: "border-slate-200 bg-slate-50 text-slate-700" },
];

const PRIORITY_OPTIONS = [
  { value: "Urgent", label: "Urgent", badge: "border-rose-200 bg-rose-50 text-rose-800" },
  { value: "High", label: "High", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  { value: "Medium", label: "Medium", badge: "border-blue-200 bg-blue-50 text-blue-800" },
  { value: "Low", label: "Low", badge: "border-slate-200 bg-slate-50 text-slate-700" },
];

export function SupportTicketActions({
  ticketId,
  email,
  status: initialStatus,
  priority: initialPriority = "Medium",
}: SupportTicketActionsProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus || "Open");
  const [currentPriority, setCurrentPriority] = useState(initialPriority || "Medium");
  const [resolving, setResolving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const [composerMode, setComposerMode] = useState<"reply" | "internal_note">("reply");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const isResolvedOrClosed = ["resolved", "closed"].includes(currentStatus.toLowerCase());

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveSupportTicket(ticketId);
      setCurrentStatus("Resolved");
      toast.success("Ticket marked as resolved");
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const handleStatusSelect = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      if (newStatus === "Resolved") {
        await resolveSupportTicket(ticketId);
      } else {
        await updateSupportTicketStatus(ticketId, newStatus);
      }
      setCurrentStatus(newStatus);
      toast.success(`Status changed to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrioritySelect = async (newPriority: string) => {
    if (newPriority === currentPriority) return;
    setUpdatingPriority(true);
    try {
      await updateSupportTicketPriority(ticketId, newPriority);
      setCurrentPriority(newPriority);
      toast.success(`Priority set to ${newPriority}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update priority");
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      if (composerMode === "internal_note") {
        await addSupportInternalNote(ticketId, replyText);
        toast.success("Internal note added to ticket thread");
        setReplyText("");
      } else {
        await replyToSupportTicket(ticketId, replyText);
        toast.success(`Reply sent and emailed to ${email || "client"}`);
        setReplyText("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action & Controls Toolbar */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status & Priority Selection */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] flex items-center gap-1">
                <span>Ticket Status</span>
                {updatingStatus && <Loader2 className="w-3 h-3 animate-spin text-[var(--lit-teal,#1FA9A2)]" />}
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {STATUS_OPTIONS.map((opt) => {
                  const isCurrent = currentStatus.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusSelect(opt.value)}
                      disabled={updatingStatus || resolving}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        isCurrent
                          ? `${opt.badge} font-bold ring-2 ring-offset-1 ring-slate-400/30`
                          : "border-slate-200 bg-white text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider on large screens */}
            <div className="hidden lg:block w-px h-10 bg-[var(--lit-border-light,#DFE7EF)]" />

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] flex items-center gap-1">
                <span>Priority Level</span>
                {updatingPriority && <Loader2 className="w-3 h-3 animate-spin text-[var(--lit-teal,#1FA9A2)]" />}
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isCurrent = currentPriority.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handlePrioritySelect(opt.value)}
                      disabled={updatingPriority || resolving}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        isCurrent
                          ? `${opt.badge} font-bold ring-2 ring-offset-1 ring-slate-400/30`
                          : "border-slate-200 bg-white text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Resolve Button */}
          {!isResolvedOrClosed && (
            <div className="pt-2 lg:pt-0">
              <button
                onClick={handleResolve}
                disabled={resolving || updatingStatus}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-50"
              >
                {resolving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Mark as Resolved</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reply Composer Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs p-6 space-y-4">
        {/* Composer Mode Toggle Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComposerMode("reply")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                composerMode === "reply"
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Reply to Client</span>
            </button>

            <button
              type="button"
              onClick={() => setComposerMode("internal_note")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                composerMode === "internal_note"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:text-amber-800 hover:bg-amber-50 border border-[var(--lit-border-light,#DFE7EF)]"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Internal Note</span>
            </button>
          </div>

          <span className="text-[11px] font-mono font-medium text-[var(--lit-text-muted,#52677C)] hidden sm:inline">
            {composerMode === "reply" ? "Sends email notification" : "Private to LIT team"}
          </span>
        </div>

        {/* Mode Explanatory Notice */}
        {composerMode === "reply" ? (
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-900 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Public Response:</span> This reply will be dispatched via email to{" "}
              <span className="font-mono font-semibold">{email || "the ticket requester"}</span> and appended to the official support thread.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Internal Staff Note:</span> This note will only be visible to LIT operators inside the admin console. No emails are sent to the client.
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={
            composerMode === "reply"
              ? `Write your response to ${email || "the client"}...`
              : "Record private technical notes, troubleshooting steps, or handoff context..."
          }
          rows={5}
          className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-3.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:bg-white resize-y transition-colors"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium">
            {replyText.length > 0 && `${replyText.length} characters`}
          </div>

          <div className="flex items-center gap-2">
            {replyText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setReplyText("")}
                disabled={sending}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleSendMessage}
              disabled={sending || !replyText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-50 ${
                composerMode === "reply"
                  ? "bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : composerMode === "reply" ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{composerMode === "reply" ? "Send Reply via Email" : "Post Internal Note"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
