import { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  ArrowRight,
  Mail,
  FileText,
  CalendarCheck2,
  Sparkles,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";

export const metadata: Metadata = {
  title: "Consultation Confirmed | Logic Intelligence Technologies",
  description:
    "Your technical consultation session has been successfully scheduled with our engineering architects.",
};

interface Props {
  searchParams: Promise<{
    name?: string;
    type?: string;
    date?: string;
    slot?: string;
    tz?: string;
  }>;
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const { name, type, date, slot, tz } = await searchParams;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-8">
          <BackButton fallbackHref="/book-consultation" label="Back to Calendar" inline />
        </div>

        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold uppercase tracking-wider mb-3">
            Consultation Scheduled & Confirmed
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
            Consultation Confirmed
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            Thank you{name ? `, ${name}` : ""}. A confirmation email with calendar invites (.ics) and video conference links has been dispatched to your inbox.
          </p>

          {/* Appointment Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 text-left mb-8 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#1565C0] uppercase tracking-wider block mb-1">
                  Session Type
                </span>
                <span className="text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                  {type || "Technical Discovery Session"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-auto">
                <CalendarCheck2 className="w-3.5 h-3.5" />
                Slot Reserved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#1565C0]" />
                  Date
                </span>
                <span className="text-sm font-semibold text-slate-900">{date || "Scheduled Date"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#1565C0]" />
                  Time Slot
                </span>
                <span className="text-sm font-semibold text-slate-900">{slot || "Selected Slot"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-[#1565C0]" />
                Timezone
              </span>
              <span className="text-xs font-mono text-slate-800">{tz || "Asia/Kolkata (IST)"}</span>
            </div>
          </div>

          {/* Next Steps List */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 text-left mb-8 text-xs text-slate-600 shadow-2xs space-y-2.5">
            <p className="font-bold font-poppins text-[var(--lit-navy,#0B2545)] text-sm mb-1.5">
              Next Steps for Your Briefing
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#1565C0]">1.</span>
              <span>Our solutions engineering leads review your initial architecture notes and requirements.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#1565C0]">2.</span>
              <span>We assemble relevant latency benchmarks, cloud topologies, and case study references.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#1565C0]">3.</span>
              <span>You receive an automated calendar reminder with the video link 1 hour prior to the briefing.</span>
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="lit-btn lit-btn-primary w-full sm:w-auto justify-center text-xs"
            >
              Return to Homepage
            </Link>
            <Link
              href="/resources"
              className="lit-btn lit-btn-secondary w-full sm:w-auto justify-center text-xs"
            >
              Explore Whitepapers
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
