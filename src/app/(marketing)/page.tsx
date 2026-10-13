import { Metadata } from 'next';
import HeroSection from '@/features/home/components/hero-section';
import CredentialsStripSection from '@/features/home/components/credentials-strip-section';
import ServicesSection from '@/features/home/components/services-section';
import BriefingButtonsSection from '@/features/home/components/briefing-buttons-section';
import WhyUsSection from '@/features/home/components/why-us-section';
import HowItWorksSection from '@/features/home/components/how-it-works-section';
import AboutSection from '@/features/home/components/about-section';
import TechStackMarqueeSection from '@/features/home/components/tech-stack-marquee-section';
import PackagesSection from '@/features/home/components/packages-section';
import TrustBadgesSection from '@/features/home/components/trust-badges-section';
import ConnectSection from '@/features/home/components/connect-section';
import InstagramFeedSection from '@/features/home/components/instagram-feed-section';
import TestimonialsSection from '@/features/home/components/testimonials-section';
import FreeDemoCTA from '@/features/leads/components/free-demo-cta';
import { COMPANY } from '@/config/company';

export const metadata: Metadata = {
  title: 'Logic Intelligence Technologies | AI',
  description:
    'Enterprise AI products, smart hospital systems, and autonomous voice engines.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.logicintelligencetechnologies.in',
    siteName: COMPANY.legalName,
    title: 'Logic Intelligence Technologies | AI',
    description:
      'Enterprise AI products, smart hospital systems, and autonomous voice engines.',
    images: [
      {
        url: 'https://www.logicintelligencetechnologies.in/assets/og-banner.jpg',
        secureUrl: 'https://www.logicintelligencetechnologies.in/assets/og-banner.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Logic Intelligence Technologies — Where Logic Meets Innovation',
      },
      {
        url: 'https://www.logicintelligencetechnologies.in/assets/og-banner.png',
        secureUrl: 'https://www.logicintelligencetechnologies.in/assets/og-banner.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Logic Intelligence Technologies — Where Logic Meets Innovation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logic Intelligence Technologies | AI',
    description:
      'Enterprise AI products, smart hospital systems, and autonomous voice engines.',
    images: ['https://www.logicintelligencetechnologies.in/assets/og-banner.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CredentialsStripSection />
      <ServicesSection />
      <BriefingButtonsSection />
      <WhyUsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <AboutSection />
      <TechStackMarqueeSection />
      <PackagesSection />
      <TrustBadgesSection />
      <ConnectSection />
      <InstagramFeedSection />
      <FreeDemoCTA />
    </>
  );
}
