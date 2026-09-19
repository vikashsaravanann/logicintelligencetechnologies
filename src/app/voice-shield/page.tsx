import type { Metadata } from "next";
import { COMPANY } from "@/config/company";
import VoiceShieldHero from "@/components/voice-shield/hero";
import VoiceShieldProblem from "@/components/voice-shield/problem";
import VoiceShieldHow from "@/components/voice-shield/how-it-works";
import VoiceShieldCapabilities from "@/components/voice-shield/capabilities";
import VoiceShieldArchitecture from "@/components/voice-shield/architecture";
import VoiceShieldUseCases from "@/components/voice-shield/use-cases";
import VoiceShieldTechnology from "@/components/voice-shield/technology";
import VoiceShieldSecurity from "@/components/voice-shield/security";
import VoiceShieldFAQ from "@/components/voice-shield/faq";
import VoiceShieldCTA from "@/components/voice-shield/cta";
import LiquidBackground from "@/components/voice-shield/liquid-background";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "VoiceShield — AI Voice Security | Logic Intelligence Technologies",
  description:
    "VoiceShield by Logic Intelligence Technologies. Real-time AI voice anti-spoofing and voice fraud intelligence. Benefits, use cases, and architecture for telephony and enterprise security.",
  keywords: [
    "VoiceShield",
    "voice security",
    "AI anti-spoofing",
    "voice fraud detection",
    "deepfake voice detection",
    "Logic Intelligence Technologies",
  ],
  alternates: { canonical: `${SITE_URL}/voice-shield` },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: COMPANY.legalName,
    title: "VoiceShield — AI Voice Security by Logic Intelligence Technologies",
    description:
      "Real-time voice anti-spoofing and voice fraud intelligence. Detect AI-generated voice clones and protect telephony infrastructure.",
    url: `${SITE_URL}/voice-shield`,
  },
};

/**
 * VoiceShield product overview on the company domain.
 * Full product story: problem, why, how, benefits, use cases, security.
 * Request access → /voice-shield/request
 * Live console (after approval) → /voice-shield/console (proxied) or dedicated host
 */
export default function VoiceShieldProductPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-slate-100 overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <VoiceShieldHero />
        <VoiceShieldProblem />
        <VoiceShieldHow />
        <VoiceShieldCapabilities />
        <VoiceShieldArchitecture />
        <VoiceShieldUseCases />
        <VoiceShieldTechnology />
        <VoiceShieldSecurity />
        <VoiceShieldFAQ />
        <VoiceShieldCTA />
      </div>
    </main>
  );
}
