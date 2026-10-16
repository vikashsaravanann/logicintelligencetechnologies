import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { formatIST } from "@/lib/format/datetime";
import { BookingDetailActions } from "./BookingDetailActions";
import {
  CalendarDays,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  Video,
  FileText,
  User,
  Globe,
  Tag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  formatConsultationDateTime,
  getConsultationDurationMinutes,
  DEFAULT_CONSULTATION_MEETING_URL,
} from "@/lib/calendar/consultation-ics";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Inspect Consultation Booking | Admin | Logic Intelligence Technologies",
  description: "Detailed client requirements, architecture scope, and consultation scheduling record.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  received: {
    label: "Received",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  pending_scheduling: {
    label: "Pending Verification",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  Pending: {
    label: "Pending Confirmation",
    badge: "border-amber-300 bg-amber-50 text-amber-900 font-bold",
    icon: Clock,
  },
  Scheduled: {
    label: "Scheduled",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Clock,
  },
  Completed: {
    label: "Completed",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
};

export default async function BookingInspectPage({ params }: Props) {
  await requireCapabilityPage("bookings.read", "/admin/bookings");
  const { id } = await params;

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const statusKey = booking.status || "Scheduled";
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Scheduled;
  const StatusIcon = cfg.icon;

  const durationMinutes = getConsultationDurationMinutes(booking.consultation_type || "");
  const durationLabel = `${durationMinutes} Mins`;
  const slotFormatted = formatConsultationDateTime(
    booking.slot_time,
    booking.timezone || "Asia/Kolkata"
  );
  const meetingUrl = booking.calendar_event_id || booking.meeting_url || DEFAULT_CONSULTATION_MEETING_URL;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/bookings" label="Bookings Ledger" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <CalendarCheck2 className="w-3 h-3" />
              Consultation Inspection
            </span>
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              Ref #{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {booking.name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            {booking.consultation_type} · Submitted {formatIST(booking.created_at)}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${cfg.badge}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{cfg.label}</span>
          </span>
          <BookingDetailActions
            bookingId={booking.id}
            email={booking.email}
            name={booking.name}
            currentStatus={statusKey}
            meetingUrl={meetingUrl}
            consultationType={booking.consultation_type}
            slotFormatted={slotFormatted}
            rawSlotTime={booking.slot_time}
          />
        </div>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Profile Card */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <User className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Client Contact Information
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Full Name
              </span>
              <span className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                {booking.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Work Email
              </span>
              <a
                href={`mailto:${booking.email}`}
                className="font-mono text-xs text-[var(--lit-blue,#1565C0)] hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{booking.email}</span>
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Phone / WhatsApp
              </span>
              {booking.phone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${booking.phone}`}
                    className="font-mono text-xs text-slate-800 hover:text-[var(--lit-teal,#1FA9A2)] flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{booking.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100"
                  >
                    WhatsApp
                  </a>
                </div>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Company / Organization
              </span>
              {booking.company ? (
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.company}</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">Independent / Individual</span>
              )}
            </div>
          </div>
        </div>

        {/* Consultation Format & Slot Card */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <Clock className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Scheduled Slot & Format
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Format
              </span>
              <span className="font-bold text-sm text-[var(--lit-navy,#0B2545)] block">
                {booking.consultation_type}
              </span>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                Duration: {durationLabel}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Scheduled Slot Time
              </span>
              <span className="font-bold text-xs text-[var(--lit-blue,#1565C0)] block">
                {slotFormatted}
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                Raw UTC: {booking.slot_time}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Client Timezone
              </span>
              <span className="font-mono text-xs text-slate-700 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.timezone || "Asia/Kolkata (IST)"}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Calendar ID / Reference
              </span>
              <span className="font-mono text-xs text-slate-600">
                #{booking.id}
              </span>
            </div>
          </div>
        </div>

        {/* Teleconference & Access Card */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <Video className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Video Teleconference Access
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Platform
              </span>
              <span className="font-semibold text-slate-800">
                Google Meet (Encrypted HD)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Meeting URL
              </span>
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[var(--lit-blue,#1565C0)] hover:underline break-all flex items-center gap-1"
              >
                <span>{meetingUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="pt-2">
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Google Meet</span>
              </a>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[11px] text-[var(--lit-text-muted,#52677C)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              Calendar invite with Google Meet link is automatically sent to client upon confirmation.
            </div>
          </div>
        </div>
      </div>

      {/* Full Client Architecture Notes & Scope Requirements */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Client Architecture Scope &amp; Briefing Notes
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            {booking.notes ? `${booking.notes.length} characters` : "None"}
          </span>
        </div>

        {booking.notes ? (
          <div className="p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap selection:bg-[#E7F3FF]">
            {booking.notes}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
            No additional notes or architecture brief was provided by the client during slot reservation.
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Review these notes with the engineering lead prior to the briefing call.</span>
          </div>
          <span className="font-mono text-[11px]">
            Created {formatIST(booking.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
