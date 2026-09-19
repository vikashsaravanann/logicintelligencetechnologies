import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import VoiceShieldHero from '@/components/voice-shield/hero';
import VoiceShieldProblem from '@/components/voice-shield/problem';
import VoiceShieldHow from '@/components/voice-shield/how-it-works';
import VoiceShieldCapabilities from '@/components/voice-shield/capabilities';
import VoiceShieldArchitecture from '@/components/voice-shield/architecture';
import VoiceShieldUseCases from '@/components/voice-shield/use-cases';
import VoiceShieldTechnology from '@/components/voice-shield/technology';
import VoiceShieldSecurity from '@/components/voice-shield/security';
import VoiceShieldFAQ from '@/components/voice-shield/faq';
import VoiceShieldCTA from '@/components/voice-shield/cta';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.logicintelligencetechnologies.in';

export const metadata: Metadata = {
  title: 'VoiceShield — AI Voice Security | Logic Intelligence Technologies',
  description:
    'VoiceShield by Logic Intelligence Technologies. Real-time AI-powered voice anti-spoofing and voice fraud intelligence. Detect cloned voices and protect telephony infrastructure.',
  keywords: [
    'VoiceShield',
    'voice security',
    'AI anti-spoofing',
    'voice fraud detection',
    'deepfake voice detection',
    'voice clone detection',
    'AASIST',
    'telephony security',
    'Logic Intelligence Technologies',
    'voice intelligence',
    'real-time detection',
  ],
  alternates: {
    canonical: `${SITE_URL}/voice-shield`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: COMPANY.legalName,
    title: 'VoiceShield — AI Voice Security by Logic Intelligence Technologies',
    description:
      'Real-time voice anti-spoofing and voice fraud intelligence. Detect AI-generated voice clones and protect your telephony infrastructure.',
    url: `${SITE_URL}/voice-shield`,
    images: [
      {
        url: `${SITE_URL}/assets/voiceshield/og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: 'VoiceShield by Logic Intelligence Technologies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceShield — AI Voice Security by Logic Intelligence Technologies',
    description:
      'Real-time voice anti-spoofing and voice fraud intelligence. Detect AI-generated voice clones.',
    images: [`${SITE_URL}/assets/voiceshield/og-banner.jpg`],
  },
};

export default function VoiceShieldPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white antialiased overflow-x-hidden">
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
    </main>
  );
}
