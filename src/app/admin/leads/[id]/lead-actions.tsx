"use client";

import { useState } from "react";
import { sendAdminEmail } from "../../actions";
import { Mail, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

interface LeadActionsProps {
  email: string;
  name: string;
}

export function LeadActions({ email, name }: LeadActionsProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (!message.trim() || !subject.trim()) return;
    setSending(true);
    try {
      await sendAdminEmail(email, subject, message);
      toast.success("Email sent successfully");
      setShowEmail(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full sm:w-auto">
      <button
        onClick={() => setShowEmail(!showEmail)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all w-full sm:w-auto"
      >
        <Mail className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
        <span>{showEmail ? "Close Email Draft" : "Send Direct Email"}</span>
      </button>

      {showEmail && (
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-md flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-2 w-full max-w-xl">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-2.5">
            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              Compose Message to {name}
            </span>
            <button
              onClick={() => setShowEmail(false)}
              className="p-1 rounded-md text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)] hover:text-[var(--lit-navy,#0B2545)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1 block">
              Recipient
            </label>
            <input
              type="text"
              readOnly
              value={email}
              className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--lit-text-muted,#52677C)] select-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1 block">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Following up on your enterprise inquiry"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-lg px-3 py-2 text-xs text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:border-[var(--lit-teal,#1FA9A2)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1 block">
              Message Body
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your message to ${name}...`}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-lg p-3 text-xs text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:border-[var(--lit-teal,#1FA9A2)] min-h-[120px] resize-y"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSendEmail}
              disabled={sending || !message.trim() || !subject.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Email</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
