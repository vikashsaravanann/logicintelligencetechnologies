"use client";

import { useState } from "react";
import { updateBookingStatus, sendAdminEmail } from "../actions";
import { Mail, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface BookingActionsProps {
  bookingId: string;
  email: string;
  name: string;
  currentStatus: string;
}

export function BookingActions({ bookingId, email, name, currentStatus }: BookingActionsProps) {
  const [updating, setUpdating] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

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
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEmail(!showEmail)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase transition-all"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
        
        {currentStatus !== "Completed" && (
          <button
            onClick={() => handleUpdateStatus("Completed")}
            disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase transition-all disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Complete
          </button>
        )}
        
        {currentStatus !== "Cancelled" && (
          <button
            onClick={() => handleUpdateStatus("Cancelled")}
            disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase transition-all disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Cancel
          </button>
        )}
      </div>

      {showEmail && (
        <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/90 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 mt-1 w-64 absolute right-8 z-10 shadow-xl">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-primary/50"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message to ${name}...`}
            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-primary/50 min-h-[80px] resize-none"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => setShowEmail(false)}
              className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || !message.trim() || !subject.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-black text-[10px] font-bold transition-all disabled:opacity-50"
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
