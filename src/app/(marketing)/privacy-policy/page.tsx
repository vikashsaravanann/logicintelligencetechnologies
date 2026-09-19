import { Metadata } from 'next';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Logic Intelligence Technologies Pvt. Ltd.',
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <BackToHome />
      <div className="container py-24 max-w-4xl mx-auto">
        <SectionHeader
          title="Privacy Policy"
          subtitle="Last updated: September 2026"
          align="left"
        />

        <div className="prose prose-invert prose-emerald mt-12">
          <p>
            At Logic Intelligence Technologies Pvt. Ltd., we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your information when you use our website and services, including VoiceShield, an AI security product by Logic Intelligence Technologies Pvt. Ltd.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you request a demo, fill out a form, or use our services. We also collect usage data to improve our offerings.
          </p>

          <h2>2. Use of Information</h2>
          <p>
            We use your information to provide, maintain, and improve our services. Our services, including VoiceShield, are designed to support data protection and compliance.
          </p>

          <h2>3. VoiceShield Data Processing</h2>
          <p>
            VoiceShield processes audio data in real-time. By default, raw audio is not stored or written to disk. Processing occurs in-memory and data is discarded after inference, designed to support GDPR and DPDP compliance.
          </p>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information to third parties. We may share data with trusted service providers necessary for operating our platform.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions about this policy, please contact us through our website.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
