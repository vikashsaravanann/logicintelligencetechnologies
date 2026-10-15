import { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  CalendarPlus,
  Building2,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getPortalContext } from "@/lib/client-portal/data";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Meetings & Consultations | Client Portal | Logic Intelligence Technologies",
  description: "Scheduled client discovery sessions, architectural reviews, and milestone consultations.",
};

export const revalidate = 0;

interface BookingRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  consultation_type: string;
  slot_time: string;
  timezone?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

export default async function ClientMeetingsPage() {
  const portal = await getPortalContext("/client/meetings");
  const userEmail = portal.user.email || "";

  // Query authenticated client's bookings by email using admin client
  let bookings: BookingRecord[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .ilike("email", userEmail)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      bookings = data;
    }
  } catch (err) {
    console.warn("Failed to fetch client bookings:", err);
  }

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    const d = new Date(b.slot_time);
    return !isNaN(d.getTime()) ? d >= now : true;
  });
  const pastBookings = bookings.filter((b) => {
    const d = new Date(b.slot_time);
    return !isNaN(d.getTime()) ? d < now : false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Upgrade 06 · Confirmed Only
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Client Consultation Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Meetings &amp; Consultations
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Confirmed architecture discovery sessions, sprint review appointments, and technical consultations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-cyan-300" />
            <span>Book New Review Call</span>
          </Link>
        </div>
      </div>

      {/* SLA & Video Conference Policy Banner */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider font-mono">
              Secure Video Teleconference Protocol
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Consultations are hosted via private Google Meet or MS Teams links sent directly to your registered email prior to the scheduled slot.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono uppercase text-[var(--lit-text-muted,#52677C)] block">
            Timezone Standard
          </span>
          <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] font-mono">
            Asia/Kolkata (IST · UTC+05:30)
          </span>
        </div>
      </div>

      {/* Upcoming / Active Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Upcoming &amp; Scheduled Sessions ({upcomingBookings.length})</span>
          </h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              No Upcoming Meetings Scheduled
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
              You do not have any pending architectural discovery sessions or milestone reviews. You can request a session anytime using our booking calendar.
            </p>
            <div className="pt-2">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs tracking-wide shadow-2xs transition-all"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-cyan-300" />
                <span>Schedule Consultation</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {b.status || "Scheduled"}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                      Ref #{b.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                    {b.consultation_type}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                    <div className="flex items-center gap-2 font-mono">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{b.slot_time}</span>
                    </div>
                    {b.timezone && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-slate-500">Zone:</span>
                        <span>{b.timezone}</span>
                      </div>
                    )}
                    {b.company && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{b.company}</span>
                      </div>
                    )}
                    {b.notes && (
                      <div className="p-2.5 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-slate-200 text-[11px] text-slate-700 mt-2">
                        <span className="font-semibold block text-[10px] uppercase font-mono text-slate-500">
                          Agenda / Scope Notes:
                        </span>
                        <span>{b.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LIT Engineering Lead Assigned</span>
                  </span>
                  <Link
                    href={`mailto:hello@logicintelligencetechnologies.in?subject=Reschedule%20Booking%20${b.id.slice(0, 8)}`}
                    className="text-xs text-[var(--lit-teal,#1FA9A2)] hover:underline font-semibold"
                  >
                    Reschedule
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Completed Consultations */}
      {pastBookings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins uppercase tracking-wider font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Past Discovery &amp; Review Sessions ({pastBookings.length})</span>
          </h2>

          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
            <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {pastBookings.map((b) => (
                <div key={b.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                        {b.consultation_type}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {b.status || "Concluded"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5 block">
                      {b.slot_time} · Created {formatIST(b.created_at)}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 self-start sm:self-auto">
                    Ref #{b.id.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
