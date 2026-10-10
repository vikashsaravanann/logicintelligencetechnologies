import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Logic Intelligence Technologies",
  description:
    "How Logic Intelligence Technologies collects, uses, and safeguards enterprise data and personal information. Read our full privacy policy.",
  alternates: {
    canonical: "/privacy",
  },
};

const SECTIONS = [
  {
    id: "collection",
    number: "01",
    title: "Information We Collect",
    icon: Database,
    content: (
      <>
        <p className="text-zinc-300 leading-relaxed mb-4">
          We collect information you voluntarily provide when you submit project inquiries, schedule technical consultations, request enterprise demos, or communicate with our engineering team. This includes your name, corporate email address, phone number, organization name, and technical project requirements.
        </p>
        <p className="text-zinc-400 leading-relaxed text-sm">
          We also collect anonymized technical telemetry (browser engine, IP geolocation, referrers, and Core Web Vitals) through performance observability tooling to evaluate site responsiveness and platform reliability.
        </p>
      </>
    ),
  },
  {
    id: "usage",
    number: "02",
    title: "How We Use Your Information",
    icon: FileText,
    content: (
      <>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Data collected is strictly utilized to fulfill our contractual and technical commitments to our clients:
        </p>
        <ul className="space-y-2 text-sm text-zinc-300">
          {[
            "Evaluating architectural feasibility and delivering requested engineering proposals",
            "Executing development milestones and platform onboarding procedures",
            "Transmitting mission-critical operational alerts, security updates, and progress reports",
            "Optimizing platform infrastructure, API throughput, and security baselines",
            "Complying with statutory corporate obligations and regulatory filings in India",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    number: "03",
    title: "Data Sharing & Third Parties",
    icon: Eye,
    content: (
      <p className="text-zinc-300 leading-relaxed">
        We do not sell, rent, or trade your corporate or personal information. Data is disclosed only to verified technical infrastructure providers (such as hosting and encrypted database platforms) strictly necessary for delivering services, bound by rigorous non-disclosure and SOC2-compliant data processing agreements.
      </p>
    ),
  },
  {
    id: "cookies",
    number: "04",
    title: "Cookies & Persistent Storage",
    icon: Lock,
    content: (
      <p className="text-zinc-300 leading-relaxed">
        {companyConfig.displayName} uses essential session cookies and performance telemetry to maintain security state and analyze UI response times. You can inspect or restrict cookies via your browser settings; refer to our dedicated <a href="/cookie-policy" className="text-cyan-400 hover:underline">Cookie Policy</a> for complete token configurations.
      </p>
    ),
  },
  {
    id: "security",
    number: "05",
    title: "Data Security Architecture",
    icon: ShieldCheck,
    content: (
      <p className="text-zinc-300 leading-relaxed">
        We enforce defense-in-depth principles across all systems, including TLS 1.3 encryption in transit, AES-256 encryption at rest, role-based access control (RBAC), and automated vulnerability scans. In accordance with Indian IT legislation and international data privacy norms, we maintain zero-disk persistence for transient AI voice streaming.
      </p>
    ),
  },
  {
    id: "rights",
    number: "06",
    title: "Your Rights & Data Subject Requests",
    icon: UserCheck,
    content: (
      <p className="text-zinc-300 leading-relaxed">
        You retain the right to inspect, update, export, or request the permanent erasure of any personal telemetry or account data under our custody. To exercise these rights, submit a formal request to our Data Protection Officer at{" "}
        <a href={`mailto:${companyConfig.email}`} className="text-cyan-400 hover:underline font-mono">
          {companyConfig.email}
        </a>.
      </p>
    ),
  },
  {
    id: "contact",
    number: "07",
    title: "Legal & Compliance Contact",
    icon: Mail,
    content: (
      <div className="p-6 rounded-xl border border-white/10 bg-[#151922]">
        <h4 className="text-base font-semibold text-white mb-2">Corporate Compliance Officer</h4>
        <p className="text-sm text-zinc-400 mb-4">
          For legal inquiries, data protection agreements (DPAs), or regulatory audits regarding {companyConfig.legalName}:
        </p>
        <div className="space-y-1.5 text-sm text-zinc-300">
          <div><strong className="text-white">Email:</strong> <a href={`mailto:${companyConfig.email}`} className="text-cyan-400 hover:underline">{companyConfig.email}</a></div>
          <div><strong className="text-white">Phone:</strong> <a href={`tel:${companyConfig.phone}`} className="text-zinc-300 hover:text-white">{companyConfig.phone}</a></div>
          <div><strong className="text-white">Jurisdiction:</strong> Coimbatore, Tamil Nadu, India</div>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Compliance & Security
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              PRIVACY POLICY
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Governed under the Information Technology Act, 2000 (India)
            </p>
          </div>

          {/* Introduction Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              At <span className="text-white font-medium">{companyConfig.legalName}</span>, protecting the confidentiality, integrity, and sovereignty of client datasets and user information is foundational to our engineering operations. This Privacy Policy specifies our data governance practices across our corporate website and digital interfaces.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
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
        </div>
      </div>
      <PageHelpBar title="Questions regarding our privacy framework?" />
    </PageShell>
  );
}
