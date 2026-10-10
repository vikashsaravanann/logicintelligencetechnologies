import { Metadata } from 'next';
import PageShell from '@/components/layout/page-shell';
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: 'Privacy Policy | Logic Intelligence Technologies',
  description: 'Enterprise privacy and data governance framework for Logic Intelligence Technologies platforms and services.',
  alternates: {
    canonical: '/privacy',
  },
};

const SECTIONS = [
  {
    number: "01",
    title: "Information We Collect",
    icon: Database,
    description: "We collect direct inquiry information (name, business email, contact details, organization scope) and anonymized operational telemetry (response times, device engines, Core Web Vitals) to optimize delivery quality and security verification.",
  },
  {
    number: "02",
    title: "Use of Information",
    icon: FileText,
    description: "Telemetry and customer inputs are used exclusively to deliver contracted software engineering services, evaluate architectural feasibility, provide customer support, and fulfill statutory obligations in India.",
  },
  {
    number: "03",
    title: "Real-Time Data Processing & Privacy",
    icon: Lock,
    description: "Our real-time AI architectures (including Logic Voice and autonomous website agents) enforce zero-persistence principles. Data is streamed in-memory with strict memory isolation and zero disk caching for transient audio payloads.",
  },
  {
    number: "04",
    title: "Data Sharing & Sovereignty",
    icon: Eye,
    description: "We do not monetize, rent, or sell enterprise data. Data sharing is limited to vetted cloud infrastructure providers under strict Data Processing Agreements (DPAs) and confidentiality terms.",
  },
  {
    number: "05",
    title: "User Rights & Data Access",
    icon: UserCheck,
    description: "You may request inspection, correction, export, or deletion of your organizational information at any time by contacting our engineering compliance desk.",
  },
  {
    number: "06",
    title: "Compliance Contact",
    icon: Mail,
    description: `For formal compliance inquiries or legal requests regarding ${companyConfig.legalName}, reach our team at ${companyConfig.email} or call ${companyConfig.phone}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Privacy Framework
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              PRIVACY POLICY
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Official corporate policy for {companyConfig.legalName}
            </p>
          </div>

          {/* Introduction Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              At <span className="text-white font-medium">{companyConfig.displayName}</span>, we design all digital platforms with privacy-by-design principles. This policy governs how information is processed across our website and enterprise applications.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] transition-colors hover:border-cyan-500/30"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-zinc-500 font-semibold px-2 py-1 rounded bg-white/5">
                      {sec.number}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mt-4 pt-4 border-t border-white/5">
                    {sec.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions about your data?" />
    </PageShell>
  );
}
