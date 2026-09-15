import { Metadata } from "next";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig } from "@/config/company";
import { LEGAL_LAST_UPDATED } from "@/config/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Logic Intelligence Technologies collects, uses, and protects your personal information. Read our full privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      <BackToHome />
      <section className="py-20 px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <h1 className="uppercase text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">PRIVACY POLICY</h1>
        <p className="text-zinc-400 mb-12">Last updated: {LEGAL_LAST_UPDATED}</p>
        
        <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80">
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            At {companyConfig.legalName}, accessible from our website and related digital channels, one of our main priorities is the privacy of our visitors and clients. This Privacy Policy describes the types of information we collect and how we use it.
          </p>
          
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We collect information you voluntarily provide when you contact us, request a free demo, or submit a project inquiry — including name, email address, phone number, and business details.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                We also collect standard technical data (browser type, IP address, pages visited) through analytics tools to understand how our website is used and to improve performance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>To respond to your inquiries and project requests</li>
                <li>To deliver the services you have requested from us</li>
                <li>To send project updates and relevant communications</li>
                <li>To improve our website and service quality</li>
                <li>To comply with legal obligations as a registered company</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
              <p className="text-zinc-400 leading-relaxed">
                We do not sell, trade, or transfer your personal information to third parties. We may share information with trusted service providers (such as hosting platforms) only as necessary to operate our business, and only under confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
              <p className="text-zinc-400 leading-relaxed">
                {companyConfig.displayName} uses cookies to store visitor preferences and improve your browsing experience. You may configure your browser to decline cookies, though some site features may be affected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-zinc-400 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or disclosure. As a registered company, we adhere to applicable Indian data protection guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-zinc-400 leading-relaxed">
                You may request access to, correction of, or deletion of any personal data we hold about you. To do so, contact us at{" "}
                <a href={`mailto:${companyConfig.email}`} className="text-primary hover:underline">{companyConfig.email}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href={`mailto:${companyConfig.email}`} className="text-primary hover:underline">{companyConfig.email}</a>{" "}
                or call <a href={`tel:${companyConfig.phone}`} className="text-primary hover:underline">{companyConfig.phone}</a>.
              </p>
            </section>
          </div>
        </div>
      </section>
      <FloatingElements />
    </main>
  );
}
