"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Video, ExternalLink, X, CalendarCheck2 } from "lucide-react";
import { sendConsultationConfirmationAction } from "../../actions";
import { toast } from "sonner";

interface ConfirmBookingModalProps {
  bookingId: string;
  name: string;
  email: string;
  consultationType?: string;
  slotFormatted?: string;
  rawSlotTime?: string;
  initialMeetUrl?: string | null;
  triggerLabel?: string;
  variant?: "primary" | "table-button";
}

export function ConfirmBookingModal({
  bookingId,
  name,
  email,
  consultationType = "Technical Consultation",
  slotFormatted,
  rawSlotTime,
  initialMeetUrl,
  triggerLabel = "Confirm",
  variant = "table-button",
}: ConfirmBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [meetUrl, setMeetUrl] = useState(initialMeetUrl || "");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = meetUrl.trim();
    if (!cleanUrl) {
      toast.error("Please provide a real Google Meet URL");
      return;
    }
    if (!cleanUrl.startsWith("https://meet.google.com/")) {
      toast.error("Google Meet link must start with https://meet.google.com/");
      return;
    }

    setLoading(true);
    try {
      await sendConsultationConfirmationAction(bookingId, cleanUrl, rawSlotTime);
      toast.success(`Consultation confirmed! Google Meet invitation dispatched to ${email}`);
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm consultation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "primary" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          title="Confirm consultation and dispatch real Google Meet link with calendar invite"
        >
          <CalendarCheck2 className="w-3.5 h-3.5" />
          <span>{triggerLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
          title="Confirm booking and dispatch official Google Meet link"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{triggerLabel}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                    Confirm Consultation Session
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                    Dispatch official Google Meet link and calendar (.ics)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Coordinates Strip */}
            <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[var(--lit-text-muted,#52677C)]">Client</span>
                <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[var(--lit-text-muted,#52677C)]">Email</span>
                <span className="font-mono text-[var(--lit-teal,#1FA9A2)]">{email}</span>
              </div>
              {slotFormatted ? (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[var(--lit-text-muted,#52677C)]">Scheduled Slot</span>
                  <span className="font-bold text-slate-900">{slotFormatted}</span>
                </div>
              ) : null}
            </div>

            {/* Google Meet Form */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real Google Meet URL</span>
                  </label>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
                    title="Open meet.google.com/new in a new tab to create an instant meeting"
                  >
                    <span>Generate on Google Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  required
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--lit-navy,#0B2545)] focus:outline-hidden focus:border-emerald-500"
                />
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1.5 leading-relaxed">
                  Enter a valid Google Meet link created from your Google Calendar or Google Workspace. This link will be embedded into the client&apos;s email and attached calendar invitation.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !meetUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck2 className="w-3.5 h-3.5" />}
                  <span>{loading ? "Confirming & Sending…" : "Confirm & Send Meet Invite"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
