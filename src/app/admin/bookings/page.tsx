import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import { AdminBackLink } from "../components/AdminBackLink";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BookingActions } from "./booking-actions";
import { formatIST } from "@/lib/format/datetime";
import {
  CalendarDays,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  Building2,
  Mail,
  Phone,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Consultation Bookings Ledger | Admin | Logic Intelligence Technologies",
  description: "Scheduled client discovery sessions, architectural reviews, and scoping calls.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

interface BookingRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  consultation_type: string;
  slot_time: string;
  timezone?: string | null;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending" | string;
  notes?: string | null;
  calendar_event_id?: string | null;
  meeting_url?: string | null;
  created_at: string;
}

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

export default async function AdminBookingsPage() {
  await requireCapabilityPage("bookings.read", "/admin/bookings");

  const { data: rawBookings, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  const bookings = (rawBookings ?? []) as BookingRow[];
  const totalCount = bookings.length;
  const scheduledCount = bookings.filter((b) =>
    ["Scheduled", "received", "pending_scheduling"].includes(b.status || "Scheduled")
  ).length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <CalendarDays className="w-3 h-3" />
              Operations Calendar
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Live Bookings Ledger
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Consultation Bookings
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Client discovery sessions, technical architectural reviews, and scoping calls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/book-consultation"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
          >
            <span>Public Booking Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Sessions
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <CalendarDays className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {error ? "—" : totalCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Booked consultations</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Scheduled
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-blue-700">
              {error ? "—" : scheduledCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Upcoming meetings</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Completed
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {error ? "—" : completedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Conducted sessions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Cancelled
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {error ? "—" : cancelledCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Archived or cancelled</p>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            Database Error
          </div>
          Could not load consultation bookings from the database.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Scheduled Consultations
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Client / Organization</th>
                  <th className="px-6 py-3.5 font-semibold">Format</th>
                  <th className="px-6 py-3.5 font-semibold">Scheduled Slot</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Context / Notes</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {bookings.map((b) => {
                  const statusKey = b.status || "Scheduled";
                  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Scheduled;
                  const Icon = cfg.icon;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                          {b.name}
                        </div>
                        <div className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5 flex items-center gap-1.5">
                          <a
                            href={`mailto:${b.email}`}
                            className="hover:text-[var(--lit-teal,#1FA9A2)] hover:underline"
                          >
                            {b.email}
                          </a>
                          {b.phone && (
                            <>
                              <span>·</span>
                              <a
                                href={`tel:${b.phone}`}
                                className="hover:text-[var(--lit-teal,#1FA9A2)]"
                              >
                                {b.phone}
                              </a>
                            </>
                          )}
                        </div>
                        {b.company && (
                          <div className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{b.company}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold">
                          <Video className="w-3 h-3" />
                          <span>{b.consultation_type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[var(--lit-navy,#0B2545)]">
                        <div>{formatIST(b.slot_time, "datetime")}</div>
                        {b.timezone && (
                          <div className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                            Client Zone: {b.timezone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--lit-text-muted,#52677C)] max-w-xs">
                        {b.notes ? (
                          <div className="line-clamp-2 leading-relaxed" title={b.notes}>
                            {b.notes}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No notes provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <BookingActions
                          bookingId={b.id}
                          email={b.email}
                          name={b.name}
                          currentStatus={b.status || "Pending"}
                          consultationType={b.consultation_type}
                          slotFormatted={formatIST(b.slot_time, "datetime")}
                          rawSlotTime={b.slot_time}
                          meetingUrl={b.calendar_event_id}
                        />
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center mx-auto">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                          No Consultations Booked
                        </h3>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          Prospective enterprise clients can book architectural reviews and discovery calls via the public scheduling portal.
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/book-consultation"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
                          >
                            <span>Open Booking Form</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
