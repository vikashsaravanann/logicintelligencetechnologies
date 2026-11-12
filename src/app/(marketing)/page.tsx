import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import ReferenceHero from '@/features/home/components/reference-hero';
import CredentialsStripSection from '@/features/home/components/credentials-strip-section';
import ServicesSection from '@/features/home/components/services-section';
import WhyUsSection from '@/features/home/components/why-us-section';
import HowItWorksSection from '@/features/home/components/how-it-works-section';
import TestimonialsSection from '@/features/home/components/testimonials-section';
import AboutSection from '@/features/home/components/about-section';
import TechStackMarqueeSection from '@/features/home/components/tech-stack-marquee-section';
import PackagesSection from '@/features/home/components/packages-section';
import TrustBadgesSection from '@/features/home/components/trust-badges-section';
import ConnectSection from '@/features/home/components/connect-section';
import InstagramFeedSection from '@/features/home/components/instagram-feed-section';
import FreeDemoCTA from '@/features/leads/components/free-demo-cta';

export const metadata: Metadata = {
  title: 'Logic Intelligence Technologies | Thoughtful Technology, Built to Work',
  description:
    'We design and build thoughtful digital products, AI systems, and healthcare technology that help people do their best work.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.logicintelligencetechnologies.in',
    siteName: COMPANY.legalName,
    title: 'Logic Intelligence Technologies | Thoughtful Technology, Built to Work',
    description:
      'Digital products, AI systems, and healthcare technology, designed around the people who use them.',
    images: ['https://www.logicintelligencetechnologies.in/assets/og-banner.jpg'],
  },
};

export default function HomePage() {
  return (
    <div className="reference-home">
      <ReferenceHero />
      <CredentialsStripSection />
      <ServicesSection />
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
    </div>
  );
}
