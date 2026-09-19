import { Metadata } from 'next';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Logic Intelligence Technologies Pvt. Ltd.',
};

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <div className="container py-24 max-w-4xl mx-auto">
        <SectionHeader
          title="Terms of Service"
          subtitle="Last updated: September 2026"
          align="left"
        />

        <div className="prose prose-invert prose-emerald mt-12">
          <p>
            Welcome to Logic Intelligence Technologies Pvt. Ltd. These Terms of Service govern your use of our website and products, including VoiceShield, an AI security product by Logic Intelligence Technologies Pvt. Ltd.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you may not use our services.
          </p>

          <h2>2. Use of Services</h2>
          <p>
            You agree to use our services only for lawful purposes. VoiceShield is provided to assist with voice security and verification.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            All content, software, and intellectual property on this site are owned by Logic Intelligence Technologies Pvt. Ltd.
          </p>

          <h2>4. Limitation of Liability</h2>
          <p>
            Our services, including VoiceShield, are provided "as is". Logic Intelligence Technologies Pvt. Ltd. is not liable for any damages arising from your use of the services.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of our services constitutes acceptance of the updated terms.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
