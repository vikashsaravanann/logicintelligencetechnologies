import { Metadata } from "next";
import Link from "next/link";
import { XCircle, Calendar as CalendarIcon, ArrowRight, ShieldCheck, Home } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Booking Cancelled | Logic Intelligence Technologies",
  description: "Your scheduled session has been cancelled or deferred.",
};

export default function BookingCancelledPage() {
  return (
    <PageShell className="pt-32 pb-24 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 w-full text-center">
        {/* Status Icon */}
        <div className="relative mx-auto w-20 h-20 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#10131A] border border-white/10 flex items-center justify-center text-cyan-400 shadow-2xl">
            <XCircle className="w-10 h-10 text-cyan-400" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-widest mb-6">
          <span>Session Released</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Consultation Cancelled
        </h1>
        <p className="text-base text-zinc-400 mb-10 leading-relaxed max-w-md mx-auto">
          Your reservation slot has been released. If your schedule changes or you wish to discuss an engineering engagement at a later time, you are welcome to pick another date.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book-consultation"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Select New Slot</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-[#10131A] hover:bg-white/[0.06] text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Reassurance */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>No charges or obligations incurred</span>
        </div>
      </div>
    </PageShell>
  );
}
