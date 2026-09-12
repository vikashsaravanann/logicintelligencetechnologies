import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Calendar as CalendarIcon, Clock, Globe, ArrowRight, Download, Mail } from "lucide-react";

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
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 w-full text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
          Consultation Confirmed!
        </h1>
        <p className="text-sm text-zinc-400 mb-8">
          Thank you{name ? `, ${name}` : ""}. A confirmation email with calendar invites (.ics) and video conference links has been sent to your inbox.
        </p>

        {/* Appointment Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left mb-8 space-y-4">
          <div className="border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
              Session Format
            </span>
            <span className="text-base font-bold text-white">
              {type || "Technical Discovery Session"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-primary" />
                <span>Date</span>
              </span>
              <span className="text-sm font-semibold text-zinc-200">{date || "Scheduled Date"}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                <span>Time Slot</span>
              </span>
              <span className="text-sm font-semibold text-zinc-200">{slot || "Selected Slot"}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
              <Globe className="w-3 h-3 text-primary" />
              <span>Timezone</span>
            </span>
            <span className="text-xs text-zinc-300">{tz || "Asia/Kolkata"}</span>
          </div>
        </div>

        {/* Next Steps List */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-left mb-8 text-xs text-zinc-400 space-y-2">
          <p className="font-bold text-white uppercase tracking-wider text-xs mb-2">What happens next?</p>
          <p>1. Our engineering team reviews any project notes you submitted.</p>
          <p>2. We prepare relevant reference architectures and benchmarks.</p>
          <p>3. You receive an automated reminder 1 hour prior to the meeting.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.3)]"
          >
            Return to Homepage
          </Link>
          <Link
            href="/resources"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            Explore Free Whitepapers
          </Link>
        </div>
      </div>
    </div>
  );
}
