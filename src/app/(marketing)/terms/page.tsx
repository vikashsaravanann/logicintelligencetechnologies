import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { Scale, FileCheck2, Code2, CreditCard, Users, ShieldAlert, Gavel, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Logic Intelligence Technologies",
  description:
    "The terms and conditions governing the use of Logic Intelligence Technologies' platforms, engineering deliverables, and digital services.",
  alternates: {
    canonical: "/terms",
  },
};

const TERMS_SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    icon: FileCheck2,
    content: (
      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
        By accessing this website, purchasing software packages, or executing a Statement of Work (SOW) with {companyConfig.legalName}, you explicitly agree to comply with and be bound by these Terms of Service. If you do not accept these provisions, you must immediately discontinue use of our platforms. Our engineering services are provided exclusively to commercial entities and individuals capable of executing legally binding contracts under applicable Indian law.
      </p>
    ),
  },
  {
    number: "02",
    title: "Description of Services",
    icon: Code2,
    content: (
      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
        {companyConfig.displayName} provides bespoke enterprise AI systems, real-time voice intelligence architectures, custom full-stack software development, cloud infrastructure automation, and technical advisory services. We reserve the right to upgrade, modify, or deprecate technical features, software dependencies, and hosting requirements to maintain security, compliance, and operational reliability.
      </p>
    ),
  },
  {
    number: "03",
    title: "Intellectual Property Rights",
    icon: Scale,
    content: (
      <div className="space-y-3 text-sm sm:text-base text-zinc-300">
        <p className="leading-relaxed">
          Unless explicitly negotiated otherwise, all proprietary platform core libraries, internal frameworks, brand trademarks, and documentation remain the intellectual property of {companyConfig.legalName}.
        </p>
        <p className="leading-relaxed text-zinc-400">
          For custom engineering engagements, intellectual property transfer of bespoke business logic, frontend interfaces, and database schemas is governed by the individual Statement of Work (SOW) or Master Services Agreement (MSA). Client ownership of custom deliverables vests fully upon settled payment of the final invoice.
        </p>
      </div>
    ),
  },
  {
    number: "04",
    title: "Payments, Billing & Milestone Invoicing",
    icon: CreditCard,
    content: (
      <div className="space-y-3 text-sm sm:text-base text-zinc-300">
        <p className="leading-relaxed">
          Payment schedules and deliverables are structured around defined engineering milestones. Commencement of development requires clearance of the initial mobilization deposit.
        </p>
        <p className="leading-relaxed text-zinc-400">
          Invoices are net-payable according to agreed proposal terms. Late disbursements beyond grace periods may pause sprint velocity until accounts are reconciled. Refer to our <a href="/refund-policy" className="text-cyan-400 hover:underline">Refund Policy</a> for milestone cancellation rules.
        </p>
      </div>
    ),
  },
  {
    number: "05",
    title: "Client Obligations & Collaboration",
    icon: Users,
    content: (
      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
        Timely delivery requires reciprocal responsiveness. Clients are responsible for providing requisite API access tokens, domain records, content assets, and sign-offs within sprint review cycles. Project delays caused by outstanding client prerequisites will result in commensurate timeline adjustments without penalty to {companyConfig.displayName}.
      </p>
    ),
  },
  {
    number: "06",
    title: "Limitation of Liability",
    icon: ShieldAlert,
    content: (
      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
        In no event shall {companyConfig.legalName}, its directors, or engineering personnel be held liable for indirect, consequential, punitive, or loss-of-profit damages arising out of third-party cloud outages, third-party model latency, upstream API deprecations, or unauthorized client infrastructure modifications. Maximum aggregate liability under any claim shall not exceed the total fees paid by the client under the specific SOW during the preceding 3-month period.
      </p>
    ),
  },
  {
    number: "07",
    title: "Governing Law & Dispute Resolution",
    icon: Gavel,
    content: (
      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
        These Terms shall be interpreted, enforced, and construed under the laws of the Republic of India. Any irreconcilable dispute arising from or related to these Terms or platform operations shall be subject to the exclusive jurisdiction of the competent courts of Coimbatore, Tamil Nadu, India.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <Scale className="w-3.5 h-3.5" />
              Legal & Service Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              TERMS OF SERVICE
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Applicable to all client engagements and digital services
            </p>
          </div>

          {/* Overview Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              Welcome to <span className="text-white font-medium">{companyConfig.legalName}</span>. These Terms of Service delineate the legal framework governing enterprise service procurement, intellectual property rights, and platform terms.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {TERMS_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.number}
                  className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] transition-colors hover:border-cyan-500/30"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-zinc-500 font-semibold px-2 py-1 rounded bg-white/5">
                      {sec.number}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {sec.content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Inquiries Box */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#151922] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Questions regarding our legal terms?
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl">
                Our legal counsel is available to review bespoke Master Services Agreements (MSAs), custom SLAs, or enterprise procurement agreements.
              </p>
            </div>
            <a
              href={`mailto:${companyConfig.email}?subject=Legal%20Terms%20Inquiry`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium border border-cyan-500/20 transition-colors whitespace-nowrap"
            >
              Contact Counsel
            </a>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions about these terms?" />
    </PageShell>
  );
}
