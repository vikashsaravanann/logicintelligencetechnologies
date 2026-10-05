"use client";

import { useState } from "react";
import { sendAdminEmail } from "../../actions";
import { Mail, Loader2, Send } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShowEmail(!showEmail)}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all w-full sm:w-auto"
      >
        <Mail className="w-4 h-4" />
        Send Direct Email
      </button>

      {showEmail && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 mt-2">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Following up on your inquiry"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your message to ${name}...`}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 min-h-[120px] resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSendEmail}
              disabled={sending || !message.trim() || !subject.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
