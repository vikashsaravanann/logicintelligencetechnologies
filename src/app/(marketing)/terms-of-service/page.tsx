import { Metadata } from 'next';
import PageShell from '@/components/layout/page-shell';
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { Scale, FileCheck2, Code2, ShieldAlert, Gavel, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: 'Terms of Service | Logic Intelligence Technologies',
  description: 'Enterprise terms of service governing software engineering contracts, platforms, and API access.',
  alternates: {
    canonical: '/terms',
  },
};

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    icon: FileCheck2,
    description: `By accessing or using the digital products and platforms provided by ${companyConfig.legalName}, you agree to be bound by these Terms of Service and all incorporated statements of work.`,
  },
  {
    number: "02",
    title: "Engineering Services & Platform Access",
    icon: Code2,
    description: `Our services, including custom software development, Logic Voice agents, and enterprise AI architectures, are provided in strict adherence to agreed project scopes, technical milestones, and service level agreements (SLAs).`,
  },
  {
    number: "03",
    title: "Intellectual Property Ownership",
    icon: Scale,
    description: `Platform core engines and trademarks remain the property of ${companyConfig.legalName}. Bespoke client implementations and domain-specific schemas transfer fully upon settlement of final milestone invoices.`,
  },
  {
    number: "04",
    title: "Limitation of Liability",
    icon: ShieldAlert,
    description: `Services and software packages are provided on an enterprise-grade standard. Maximum aggregate liability is limited to fees collected under the prevailing milestone or services contract.`,
  },
  {
    number: "05",
    title: "Governing Law & Jurisdiction",
    icon: Gavel,
    description: `These Terms are governed by and construed in accordance with the laws of India, subject to the jurisdiction of the competent courts in Coimbatore, Tamil Nadu.`,
  },
  {
    number: "06",
    title: "Legal Inquiries",
    icon: Mail,
    description: `For formal notices, master services agreements, or customized contracts, contact our legal department at ${companyConfig.email}.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <Scale className="w-3.5 h-3.5" />
              Service Terms & Governance
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              TERMS OF SERVICE
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Governing terms for {companyConfig.legalName}
            </p>
          </div>

          {/* Overview Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              Welcome to <span className="text-white font-medium">{companyConfig.legalName}</span>. These terms govern enterprise engagement with our engineering platforms, APIs, and custom software systems.
            </p>
          </div>

          {/* Sections */}
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
      <PageHelpBar title="Questions about these terms?" />
    </PageShell>
  );
}
