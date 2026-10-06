import type { Metadata } from "next";
import { headers } from "next/headers";
import { stateForToken } from "@/lib/onboarding/sessions";
import { isWellFormedToken } from "@/lib/onboarding/token-core";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
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
    <div className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
      <h1 className="text-xl font-bold text-white">This onboarding link is not valid</h1>
      <p className="mt-2 text-sm text-neutral-400">
        The link may have expired, already been used, or been revoked. Please contact Logic Intelligence
        Technologies for a new onboarding link.
      </p>
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
    <div className="relative min-h-screen bg-[#0A1530] px-6 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Logic Intelligence Technologies
          </span>
          <h2 className="mt-1 text-2xl font-bold">Client Onboarding</h2>
        </div>
        {valid && token ? <OnboardingForm token={token} /> : <InvalidNotice />}
      </div>
    </div>
  );
}
