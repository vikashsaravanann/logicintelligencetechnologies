import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { stateForToken } from "@/lib/onboarding/sessions";
import { isWellFormedToken } from "@/lib/onboarding/token-core";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { COMPANY } from "@/config/company";
import { BackButton } from "@/components/navigation/back-button";
import { ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Onboarding | Logic Intelligence Technologies",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

function InvalidNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
        This onboarding link is not valid
      </h1>
      <p className="mt-3 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        The onboarding invitation may have expired, already been completed, or been revoked for security purposes.
        If you represent an onboarding client organization, please contact your account manager or technical team for a fresh activation link.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/contact"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all"
        >
          <span>Contact Support</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

export default async function OnboardPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // Rate limit validation to stop link probing (fails closed in production).
  const h = await headers();
  const ip = clientIp({ headers: h } as unknown as Request);
  const allowed = await rateLimit(`onboard-view:${ip}`, 30, 60_000);

  let valid = false;
  if (allowed && token && isWellFormedToken(token)) {
    valid = (await stateForToken(token)) === "valid";
  }

  return (
    <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-3xl">
        {/* Top Header / Bar */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton fallbackHref="/" label="Home" inline />
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--lit-text-muted,#52677C)] bg-white px-3 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>256-bit Encrypted Intake</span>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-3 px-3.5 py-1.5 rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
            <span className="relative block w-5 h-5 rounded-md overflow-hidden shrink-0">
              <Image
                src={COMPANY.logoIconPath}
                alt={`${COMPANY.displayName} Logo`}
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-mono">
              {COMPANY.displayName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-poppins">
            Client Project Onboarding
          </h1>
          <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)] max-w-xl mx-auto leading-relaxed">
            Please complete this intake form with your organization&apos;s legal details, primary project contacts, and technical scope to initiate your project environment.
          </p>
        </div>

        {valid && token ? <OnboardingForm token={token} /> : <InvalidNotice />}
      </div>
    </main>
  );
}
