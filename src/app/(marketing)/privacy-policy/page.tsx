import { Metadata } from 'next';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import BackToHome from "@/components/ui/back-to-home";

import PageHelpBar from "@/components/ui/page-help-bar";
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Logic Intelligence Technologies',
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
            At Logic Intelligence Technologies, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your information when you use our website, platforms, and services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you request a demo, fill out a contact form, or use our digital services. We also collect operational telemetry to improve reliability and performance.
          </p>

          <h2>2. Use of Information</h2>
          <p>
            We use your information to provide, maintain, and improve our services. Our platforms are designed to uphold modern data protection and compliance standards.
          </p>

          <h2>3. Real-Time Data Processing & Privacy</h2>
          <p>
            Our intelligent AI systems and platform services adhere strictly to zero-persistence principles where applicable. In-memory processing and strict boundary isolation are employed to ensure enterprise privacy and regulatory compliance.
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
      <PageHelpBar title="Questions about your data?" />
    </PageShell>
  );
}
