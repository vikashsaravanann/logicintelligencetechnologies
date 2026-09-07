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
  title: 'Home',
  description:
    'Coimbatore-based web & AI development studio. Custom websites, e-commerce, and software with transparent pricing and a free demo before payment.',
  openGraph: {
    title: `${COMPANY.legalName} — ${COMPANY.tagline}`,
    description: 'AI-integrated development for Coimbatore businesses. Free demo before payment.',
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: 'Logic Intelligence Technologies' }],
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
