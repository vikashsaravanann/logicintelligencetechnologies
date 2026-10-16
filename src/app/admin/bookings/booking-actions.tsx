"use client";

import { useState } from "react";
import Link from "next/link";
import { updateBookingStatus, sendAdminEmail } from "../actions";
import { ConfirmBookingModal } from "./components/ConfirmBookingModal";
import { Mail, CheckCircle2, XCircle, Loader2, Send, X, Eye } from "lucide-react";
import { toast } from "sonner";

interface BookingActionsProps {
  bookingId: string;
  email: string;
  name: string;
  currentStatus: string;
  consultationType?: string;
  slotFormatted?: string;
  rawSlotTime?: string;
  meetingUrl?: string | null;
}

export function BookingActions({
  bookingId,
  email,
  name,
  currentStatus,
  consultationType,
  slotFormatted,
  rawSlotTime,
  meetingUrl,
}: BookingActionsProps) {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send email";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-end">
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/bookings/${bookingId}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-blue,#1565C0)] hover:text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
          title="Inspect Complete Client Details & Architecture Notes"
        >
          <Eye className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
          <span>Inspect</span>
        </Link>

        <ConfirmBookingModal
          bookingId={bookingId}
          name={name}
          email={email}
          consultationType={consultationType}
          slotFormatted={slotFormatted}
          rawSlotTime={rawSlotTime}
          initialMeetUrl={meetingUrl}
          triggerLabel={currentStatus === "Pending" ? "Confirm" : "Meet Link"}
        />

        <button
          type="button"
          onClick={() => setShowEmail(!showEmail)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
          title="Compose Email"
        >
          <Mail className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
          <span>Email</span>
        </button>

        {currentStatus !== "Completed" && (
          <button
            type="button"
            onClick={() => handleUpdateStatus("Completed")}
            disabled={updating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            title="Mark as Completed"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            <span>Complete</span>
          </button>
        )}

        {currentStatus !== "Cancelled" && (
          <button
            type="button"
            onClick={() => handleUpdateStatus("Cancelled")}
            disabled={updating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            title="Cancel Booking"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 text-rose-600" />}
            <span>Cancel</span>
          </button>
        )}
      </div>

      {showEmail && (
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xl flex flex-col gap-2.5 mt-2 w-72 absolute right-0 top-full z-30 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Send Email to {name.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => setShowEmail(false)}
              className="p-1 rounded-md text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--lit-navy,#0B2545)] focus:outline-hidden focus:border-[var(--lit-teal,#1FA9A2)]"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message to ${name}...`}
            className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-lg p-2.5 text-xs text-[var(--lit-navy,#0B2545)] focus:outline-hidden focus:border-[var(--lit-teal,#1FA9A2)] min-h-[85px] resize-none"
          />
          <div className="flex justify-end items-center gap-2 pt-1 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <button
              type="button"
              onClick={() => setShowEmail(false)}
              className="px-2.5 py-1 text-[11px] font-bold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sending || !message.trim() || !subject.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
