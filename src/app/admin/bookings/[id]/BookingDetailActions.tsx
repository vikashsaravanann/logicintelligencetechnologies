import { useState } from "react";
import { updateBookingStatus, sendConsultationConfirmationAction, sendAdminEmail } from "../../actions";
import { ConfirmBookingModal } from "../components/ConfirmBookingModal";
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Video,
  Copy,
  Check,
  CalendarCheck2,
} from "lucide-react";
import { toast } from "sonner";

interface BookingDetailActionsProps {
  bookingId: string;
  email: string;
  name: string;
  currentStatus: string;
  meetingUrl: string;
  consultationType?: string;
  slotFormatted?: string;
  rawSlotTime?: string;
}

export function BookingDetailActions({
  bookingId,
  email,
  name,
  currentStatus,
  meetingUrl,
  consultationType,
  slotFormatted,
  rawSlotTime,
}: BookingDetailActionsProps) {
  const [updating, setUpdating] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking status updated to ${status}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendInvite = async () => {
    setSendingInvite(true);
    try {
      const res = await sendConsultationConfirmationAction(bookingId);
      toast.success(`Confirmation email & calendar invite dispatched to ${res.recipient}!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to dispatch confirmation email");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyMeet = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    toast.success("Google Meet link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendCustomEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    try {
      await sendAdminEmail(email, emailSubject, emailBody);
      toast.success("Email sent successfully");
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Confirm & Set Meet Link */}
      <ConfirmBookingModal
        bookingId={bookingId}
        name={name}
        email={email}
        consultationType={consultationType}
        slotFormatted={slotFormatted}
        rawSlotTime={rawSlotTime}
        initialMeetUrl={meetingUrl}
        triggerLabel={currentStatus === "Pending" ? "Confirm Session" : "Update Meet Link"}
        variant="primary"
      />

      {/* Copy Meet Link */}
      <button
        type="button"
        onClick={handleCopyMeet}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)] text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
        title="Copy Google Meet URL"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
        )}
        <span>{copied ? "Copied" : "Copy Meet Link"}</span>
      </button>

      {/* Send Ad-Hoc Email */}
      <button
        type="button"
        onClick={() => setShowEmailModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)] text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
        title="Compose email to client"
      >
        <Mail className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
        <span>Compose Email</span>
      </button>

      {/* Status Transitions */}
      {currentStatus !== "Completed" && (
        <button
          type="button"
          onClick={() => handleUpdateStatus("Completed")}
          disabled={updating}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Mark Completed</span>
        </button>
      )}

      {currentStatus !== "Cancelled" && (
        <button
          type="button"
          onClick={() => handleUpdateStatus("Cancelled")}
          disabled={updating}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>Cancel Session</span>
        </button>
      )}

      {/* Modal for Compose Email */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Compose Email to {name}
                </h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)]">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2 text-xs text-[var(--lit-navy,#0B2545)] focus:outline-hidden focus:border-[var(--lit-blue,#1565C0)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
                  Message Content
                </label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={`Write your message to ${name}...`}
                  className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-3 text-xs text-[var(--lit-navy,#0B2545)] focus:outline-hidden focus:border-[var(--lit-blue,#1565C0)] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendCustomEmail}
                disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all disabled:opacity-50"
              >
                {sendingEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
