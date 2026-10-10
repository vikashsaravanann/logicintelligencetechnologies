import type { Metadata } from 'next';
import { COMPANY } from '@/config/company';
import { SITE, healthcarePlatformNode, breadcrumb } from '@/lib/seo/schema';
import HealthcareHero from './sections/hero';
import HealthcareOverview from './sections/overview';
import HealthcareAudience from './sections/audience';
import HealthcareCapabilities from './sections/capabilities';
import HealthcareBenefits from './sections/benefits';
import HealthcareOnboarding from './sections/onboarding';
import HealthcareCTA from './sections/cta';

export const metadata: Metadata = {
  title: 'LIT Healthcare — Smart Hospital Management & Healthcare Intelligence',
  description:
    'LIT Healthcare by Logic Intelligence Technologies is a comprehensive hospital and clinic management platform. Multi-organization architecture, role-based workspaces, patient management, clinical records, pharmacy, billing and more.',
  alternates: { canonical: `${SITE}/healthcare` },
  openGraph: {
    title: 'LIT Healthcare — Smart Hospital Management',
    description:
      'A connected healthcare operations platform for clinics, hospitals, and healthcare groups. Role-based workspaces, facility-aware access, and structured clinical workflows.',
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: 'LIT Healthcare Platform' }],
  },
  keywords: [
    'LIT Healthcare',
    'hospital management system',
    'clinic management software',
    'healthcare platform India',
    'smart hospital',
    'role-based healthcare workspace',
    'patient management system',
    'hospital billing software',
    'Logic Intelligence Technologies healthcare',
  ],
};

export default function HealthcarePage() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': [
      healthcarePlatformNode(),
      breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'LIT Healthcare', path: '/healthcare' },
      ]),
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <HealthcareHero />
      <HealthcareOverview />
      <HealthcareAudience />
      <HealthcareCapabilities />
      <HealthcareBenefits />
      <HealthcareOnboarding />
      <HealthcareCTA />
    </main>
  );
}
