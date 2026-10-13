import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { BackButton } from "@/components/navigation/back-button";
import {
  CheckCircle2,
  AlertCircle,
  BellOff,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email Preferences | Logic Intelligence Technologies",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string; error?: string }>;
}) {
  const params = await searchParams;
  const done = params.done === "1";
  const error = params.error === "1";
  const token = params.token || "";

  return (
    <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] flex flex-col justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <BackButton fallbackHref="/" label="Home" inline />
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--lit-text-muted,#52677C)] bg-white px-3 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Privacy Preference</span>
          </div>
        </div>

        <section className="w-full rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <span className="relative block w-9 h-9 rounded-xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0 shadow-2xs">
              <Image
                src={COMPANY.logoIconPath}
                alt={`${COMPANY.displayName} Logo`}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-mono">
                {COMPANY.displayName}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                Communications Preference Center
              </p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                Preferences Updated
              </h1>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                You have been successfully unsubscribed from marketing and promotional communications.
              </p>
              <div className="rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] p-4 text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                <strong className="text-[var(--lit-navy,#0B2545)] block mb-1">Transactional Continuity:</strong>
                Important transactional messages regarding active projects, security notices, and requested document deliverables will still be delivered when necessary.
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all"
                >
                  <span>Return to Homepage</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                Link Invalid or Expired
              </h1>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                This verification link is invalid, expired, or has already been used. If you still wish to update your preferences, our support team is happy to assist.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${COMPANY.emails.support}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Support Desk</span>
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
                >
                  <span>Return Home</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                <BellOff className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                Email Preferences
              </h1>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                Please confirm that you want to stop receiving marketing emails, tech digests, and product announcements from Logic Intelligence Technologies.
              </p>
              <form method="post" action="/api/unsubscribe" className="mt-8 space-y-4">
                <input type="hidden" name="token" value={token} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  >
                    <BellOff className="h-4 w-4" />
                    <span>Unsubscribe Me</span>
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
                  >
                    <span>Keep Subscribed</span>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
