/**
 * VoiceShield Demo page.
 *
 * The live demo runs on the separate VoiceShield FastAPI backend
 * (FASTAPI_INFERENCE_URL). This page clearly communicates the backend
 * dependency status and provides a launch point when it is configured.
 *
 * Architecture decision: The live WebSocket audio pipeline cannot run
 * inside Vercel serverless functions (long-lived persistent connections,
 * PyTorch/TorchScript inference). It requires a dedicated persistent
 * backend service.
 */
import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import VoiceShieldDemoGate from '@/components/voice-shield/demo-gate';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.logicintelligencetechnologies.in';

export const metadata: Metadata = {
  title: 'VoiceShield Live Demo — Logic Intelligence Technologies',
  description:
    'Experience VoiceShield real-time voice anti-spoofing technology. Powered by AASIST deep learning inference.',
  alternates: { canonical: `${SITE_URL}/voice-shield/demo` },
  openGraph: {
    title: 'VoiceShield Live Demo — Logic Intelligence Technologies',
    description: 'Real-time AI voice clone detection. Experience VoiceShield in your browser.',
    url: `${SITE_URL}/voice-shield/demo`,
    images: [{ url: `${SITE_URL}/assets/voiceshield/og-banner.jpg`, width: 1200, height: 630 }],
  },
};

export default function VoiceShieldDemoPage() {
  /** Read whether the FastAPI backend URL is configured server-side. */
  const apiUrl = process.env.FASTAPI_INFERENCE_URL ?? '';
  const backendConfigured = Boolean(
    apiUrl && !apiUrl.includes('localhost') && !apiUrl.includes('placeholder')
  );

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white antialiased">
      <VoiceShieldDemoGate
        backendConfigured={backendConfigured}
        apiUrl={backendConfigured ? apiUrl : null}
        companyEmail={COMPANY.email}
      />
    </main>
  );
}
