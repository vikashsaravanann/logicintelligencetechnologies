import { Metadata } from "next";
import Link from "next/link";
import { XCircle, ArrowRight, Calendar as CalendarIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Booking Cancelled | Logic Intelligence Technologies",
  description: "Your scheduled session has been cancelled or deferred.",
};

export default function BookingCancelledPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 w-full text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
          Consultation Cancelled
        </h1>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          Your reservation has been released. If your schedule changes or you need to discuss a project at a later date, you can rebook anytime.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book-consultation"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Pick a New Time</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
