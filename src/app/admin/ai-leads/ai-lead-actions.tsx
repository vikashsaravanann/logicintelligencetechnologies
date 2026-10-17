"use client";

import { useState } from "react";
import { sendAdminEmail } from "../actions";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface AiLeadActionsProps {
  email: string;
  name: string;
}

export function AiLeadActions({ email, name }: AiLeadActionsProps) {
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
    <div className="flex flex-col items-end relative">
      <button
        onClick={() => setShowEmail(!showEmail)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] text-[10px] font-bold uppercase transition-all shadow-2xs cursor-pointer"
      >
        <Mail className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
        Email
      </button>

      {showEmail && (
        <div className="p-3.5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 mt-1 w-72 absolute right-0 top-9 z-30 shadow-xl">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-2 text-xs text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message to ${name}...`}
            className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-2 text-xs text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] min-h-[80px] resize-none shadow-2xs"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => setShowEmail(false)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || !message.trim() || !subject.trim()}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
