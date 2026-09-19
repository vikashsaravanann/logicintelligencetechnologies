import type { Metadata } from "next";
import { COMPANY } from "@/config/company";
import VoiceShieldAccessRequest from "@/components/voice-shield/access-request";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "VoiceShield — Request Access | Logic Intelligence Technologies",
  description:
    "Request beta or demo access to VoiceShield by Logic Intelligence Technologies. Real-time AI voice anti-spoofing and voice fraud intelligence.",
  alternates: { canonical: `${SITE_URL}/voice-shield` },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: COMPANY.legalName,
    title: "VoiceShield — Request Access | Logic Intelligence Technologies",
    description:
      "A Logic Intelligence Technologies product. Request beta or demo access to real-time voice-clone detection.",
    url: `${SITE_URL}/voice-shield`,
  },
};

export default function VoiceShieldPage() {
  return <VoiceShieldAccessRequest />;
}
