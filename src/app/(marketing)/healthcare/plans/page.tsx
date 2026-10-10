import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import { SITE, healthcarePlatformNode, breadcrumb } from '@/lib/seo/schema';
import BackButton from '@/components/navigation/back-button';
import PlansHero from './sections/hero';
import PlansGrid from './sections/grid';
import PlansFeatures from './sections/features';
import PlansFAQ from './sections/faq';
import HealthcareCTA from '../sections/cta';

export const metadata: Metadata = {
  title: 'Healthcare Plans & Pricing | LIT Healthcare',
  description:
    'Subscription plans and pricing for LIT Healthcare by Logic Intelligence Technologies. From Clinic Essential to Hospital Advanced tiers.',
  alternates: { canonical: `${SITE}/healthcare/plans` },
  openGraph: {
    title: 'LIT Healthcare Plans',
    description: 'Subscription plans and pricing for LIT Healthcare platform.',
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: 'LIT Healthcare Plans' }],
  },
  keywords: [
    'LIT Healthcare pricing',
    'hospital management system cost',
    'clinic software pricing',
    'healthcare platform plans',
  ],
};

export default function HealthcarePlansPage() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': [
      healthcarePlatformNode(),
      breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'LIT Healthcare', path: '/healthcare' },
        { name: 'Plans', path: '/healthcare/plans' },
      ]),
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <BackButton fallbackHref="/healthcare" label="Back to LIT Healthcare" inline />
      </div>
      <PlansHero />
      <PlansGrid />
      <PlansFeatures />
      <PlansFAQ />
      <HealthcareCTA />
    </main>
  );
}
