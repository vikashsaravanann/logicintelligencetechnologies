import { Metadata } from "next";
import Link from "next/link";
import {
  CalendarX2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Home,
  MessageSquare,
  Clock,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";

export const metadata: Metadata = {
  title: "Booking Cancelled | Logic Intelligence Technologies",
  description:
    "Your scheduled technical consultation session has been cancelled or released. Reschedule anytime or contact our engineering team.",
};

export default function BookingCancelledPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-6">
          <BackButton fallbackHref="/book-consultation" label="Back to booking" inline />
        </div>

        <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 sm:p-12 shadow-sm text-center">
          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 mb-6 shadow-sm">
            <CalendarX2 className="w-8 h-8 text-amber-600" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50/80 border border-amber-200 text-amber-800 text-xs font-mono uppercase tracking-wider mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Reservation Slot Released</span>
          </div>

          <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
            Consultation Cancelled
          </h1>
          <p className="font-serif italic text-base text-[var(--lit-teal,#1FA9A2)] mb-4">
            No worries — your calendar slot has been returned to the pool.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-lg mx-auto mb-8">
            If your schedule shifted, priorities changed, or you need to invite additional stakeholders before speaking with our engineering directors, you can choose another time whenever you are ready.
          </p>

          {/* Reassurance panel */}
          <div className="bg-[var(--lit-cloud,#F7F9FC)] rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 text-left mb-8 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero obligations or cancellation fees incurred.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] font-medium">
              <Calendar className="w-4 h-4 text-[var(--lit-blue,#1565C0)] shrink-0" />
              <span>All 30-minute and 45-minute architectural slots remain open on our live calendar.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] font-medium">
              <MessageSquare className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0" />
              <span>Need an asynchronous answer instead? Email our engineering leads directly.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/book-consultation"
              className="px-6 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Select New Time Slot</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
              <span>Send Asynchronous Inquiry</span>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center">
            <Link
              href="/"
              className="text-xs text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Logic Intelligence Technologies Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
