import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Calendar as CalendarIcon, Clock, Globe, ArrowRight, Download, Mail } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Consultation Confirmed | Logic Intelligence Technologies",
  description: "Your technical consultation session has been successfully scheduled with our engineering architects.",
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
    <PageShell>
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-3 font-heading">
            Consultation Confirmed
          </h1>
          <p className="text-sm text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
            Thank you{name ? `, ${name}` : ""}. A confirmation with calendar invites (.ics) and video conference links has been dispatched to your inbox.
          </p>

          {/* Appointment Card */}
          <div className="rounded-3xl border border-white/10 bg-[#151922] p-8 text-left mb-8 space-y-5 shadow-2xl">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                Session Type
              </span>
              <span className="text-lg font-bold text-white uppercase font-heading">
                {type || "Technical Discovery Session"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Date
                </span>
                <span className="text-sm font-semibold text-slate-200">{date || "Scheduled Date"}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Time Slot
                </span>
                <span className="text-sm font-semibold text-slate-200">{slot || "Selected Slot"}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Timezone
              </span>
              <span className="text-xs font-mono text-slate-300">{tz || "Asia/Kolkata"}</span>
            </div>
          </div>

          {/* Next Steps List */}
          <div className="rounded-2xl border border-white/5 bg-[#10131A] p-6 text-left mb-8 text-xs text-slate-400 space-y-2">
            <p className="font-bold font-mono text-cyan-400 uppercase tracking-wider text-xs mb-2">Next Steps</p>
            <p>1. Our engineering leadership reviews your initial architecture notes.</p>
            <p>2. We assemble relevant latency benchmarks and case references.</p>
            <p>3. You receive an automated reminder 1 hour prior to the briefing.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Return to Homepage
            </Link>
            <Link
              href="/resources"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              Explore Whitepapers
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
