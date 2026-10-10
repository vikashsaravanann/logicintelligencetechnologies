import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import { SITE, healthcarePlatformNode, breadcrumb } from '@/lib/seo/schema';
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
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <PlansHero />
      <PlansGrid />
      <PlansFeatures />
      <PlansFAQ />
      <HealthcareCTA />
    </main>
  );
}
