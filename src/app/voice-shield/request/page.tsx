import type { Metadata } from "next";
import { COMPANY } from "@/config/company";
import VoiceShieldAccessRequest from "@/components/voice-shield/access-request";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "Request VoiceShield Access | Logic Intelligence Technologies",
  description:
    "Request beta or demo access to VoiceShield by Logic Intelligence Technologies.",
  alternates: { canonical: `${SITE_URL}/voice-shield/request` },
  openGraph: {
    type: "website",
    siteName: COMPANY.legalName,
    title: "Request VoiceShield Access",
    url: `${SITE_URL}/voice-shield/request`,
  },
};

export default function VoiceShieldRequestPage() {
  return <VoiceShieldAccessRequest />;
}
