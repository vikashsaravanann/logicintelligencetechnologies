import type { Metadata } from "next";
import { COMPANY } from "@/config/company";
import VoiceShieldAccessRequest from "@/components/voice-shield/access-request";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "Request VoiceShield Access | Logic Intelligence Technologies",
  description:
    "Request beta or enterprise demo access to VoiceShield — real-time AI voice deepfake detection for Indian telecoms and BFSI by Logic Intelligence Technologies.",
  alternates: { canonical: `${SITE_URL}/voice-shield/request` },
  openGraph: {
    type: "website",
    siteName: COMPANY.legalName,
    title: "Request VoiceShield Access",
    description: "Request gated access to the VoiceShield console. Admin-reviewed enterprise AI voice security platform.",
    url: `${SITE_URL}/voice-shield/request`,
    images: [
      {
        url: `${SITE_URL}/voice-shield/banner.png`,
        width: 1200,
        height: 630,
        alt: "VoiceShield Gate Access Request",
      },
    ],
  },
};

import BackToHome from "@/components/ui/back-to-home";

export default function VoiceShieldRequestPage() {
  return (
    <>
      <BackToHome />
      <VoiceShieldAccessRequest />
    </>
  );
}
