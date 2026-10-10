import React from "react";
import {
  TrendingUp,
  BarChart3,
  Download,
  LineChart,
  Target,
  Rocket,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
  Layers,
  Heart,
  FileText,
  Lock,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Executive Investor Brief | Logic Intelligence Technologies",
  description:
    "Operating performance, architectural positioning, capital discipline, and product roadmaps for Logic Intelligence Technologies.",
  openGraph: {
    title: "Executive Investor Brief | Logic Intelligence Technologies",
    description:
      "Operating performance, architectural positioning, capital discipline, and product roadmaps for Logic Intelligence Technologies.",
    type: "website",
    url: "https://www.logicintelligencetechnologies.in/investor-brief",
  },
};

const METRICS = [
  {
    val: "16",
    label: "Verified Credentials",
    desc: "Executive accreditations in ML, cloud, and security architecture",
    icon: ShieldCheck,
    color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
  },
  {
    val: "100%",
    label: "Deterministic Scaffolding",
    desc: "Strictly typed validation guards around probabilistic LLM inference",
    icon: Target,
    color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    val: "3",
    label: "Flagship Platforms",
    desc: "LIT Healthcare, Logic Voice OS, and Voice Shield defense",
    icon: Rocket,
    color: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    val: "< 150ms",
    label: "Target Edge Latency",
    desc: "Streaming speech recognition and low-latency audio synthesis",
    icon: LineChart,
    color: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
  },
];

const FLAGSHIPS = [
  {
    name: "LIT Healthcare",
    tagline: "Enterprise Smart Clinical Operating System",
    desc: "Modular clinical workflows, cryptographic tenant isolation, and deterministic EHR automation. Eliminates administrative documentation overhead while ensuring strict ABDM and HIPAA compliance.",
    badge: "Clinical Automation",
    badgeColor: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    icon: Heart,
    href: "/healthcare",
  },
  {
    name: "Voice Shield",
    tagline: "Real-Time Telephony Acoustic Defense",
    desc: "Sub-15ms real-time acoustic threat firewalling, synthetic voice detection, and telephony biometrics with zero persistent voice retention, protecting enterprise call centers from deepfakes.",
    badge: "AI Security",
    badgeColor: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
    icon: Lock,
    href: "/voice-shield",
  },
  {
    name: "Logic Voice OS",
    tagline: "Voice-First Multimodal Intelligence",
    desc: "Advancing towards a personal AI operating system capable of deterministic multi-step planning, sub-150ms edge streaming, and verified external tool execution.",
    badge: "Speech AI",
    badgeColor: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
    icon: Cpu,
    href: "/products/logic-voice",
  },
];

const DOCUMENTS = [
  {
    title: "Company Profile",
    desc: "Official corporate background & executive overview",
    href: "/resources/company-profile",
    format: "PDF Document",
  },
  {
    title: "Services Brochure",
    desc: "End-to-end engineering & AI systems lifecycle",
    href: "/resources/services-brochure",
    format: "PDF Document",
  },
  {
    title: "Brand Standards",
    desc: "Design tokens, color swatches & logo guidelines",
    href: "/resources/brand-book",
    format: "PDF Document",
  },
  {
    title: "QA Verification Checklist",
    desc: "Five-phase production testing & deployment framework",
    href: "/checklist",
    format: "Interactive Tool",
  },
];

export default function InvestorBriefPage() {
  const breadcrumbs = breadcrumb([
    { name: "Home", path: "/" },
    { name: "Investors", path: "/investors" },
    { name: "Executive Investor Brief", path: "/investor-brief" },
  ]);

  return (
    <PageShell>
      <JsonLd data={breadcrumbs} />

      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <BackButton fallbackHref="/investors" label="Investor Overview" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-5 mb-14 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Executive Operating Briefing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Architectural Vision & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Operating Performance
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-3xl mx-auto font-light">
              {COMPANY.displayName} is expanding its footprint in enterprise intelligent systems through three core production architectures: LIT Healthcare, Logic Voice OS, and Voice Shield real-time acoustic threat firewall.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Schedule Executive Briefing</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <span>Inspect Architecture</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Engineering Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${m.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--lit-navy,#0B2545)] mb-1">
                    {m.val}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    {m.label}
                  </div>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1.5 font-light leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Flagship Production Platforms Deep Dive */}
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Proprietary Production Architectures
              </h2>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                High-barrier-to-entry software platforms built with deterministic type safety.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {FLAGSHIPS.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.name}
                    className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs flex flex-col justify-between hover:border-[var(--lit-teal,#1FA9A2)]/50 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${f.badgeColor}`}
                        >
                          {f.badge}
                        </span>
                        <div className="w-9 h-9 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center text-[var(--lit-navy,#0B2545)]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="text-base font-poppins font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                        {f.name}
                      </h3>
                      <h4 className="text-xs font-medium text-[var(--lit-teal,#1FA9A2)] mb-3">
                        {f.tagline}
                      </h4>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                        {f.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/70">
                      <Link
                        href={f.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors"
                      >
                        <span>Explore System</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Strategic Overview & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Left 2 Cols: Strategic Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <BarChart3 className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
                  <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                    Market Positioning & Product Strategy
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                  <p>
                    The rapid proliferation of generative AI creates massive enterprise demand for intelligent automation, but simultaneously introduces severe security vulnerabilities. Voice-based attack vectors, synthetic deepfakes, and prompt injection threaten enterprise telephony and customer identity systems.
                  </p>
                  <p>
                    In response, our <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">Voice Shield</strong> architecture provides sub-15ms real-time acoustic threat firewalling, detecting vocoder synthesis artifacts and phase anomalies before synthetic audio can compromise call center agents.
                  </p>
                  <p>
                    Simultaneously, the <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">LIT Healthcare</strong> platform equips clinical institutions with an enterprise smart hospital operating system. By marrying multi-tenant data isolation with deterministic clinical workflows, we provide healthcare networks with auditable, zero-hallucination records automation.
                  </p>
                  <p>
                    Finally, <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">Logic Voice OS</strong> continues engineering towards a voice-first intelligent operating system that replaces unconstrained LLM chat interfaces with structured, deterministic execution graphs.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <Building2 className="w-5 h-5 text-[#1565C0]" />
                  <h3 className="text-base sm:text-lg font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                    Capital & Governance Posture
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                  Logic Intelligence Technologies remains an independent, bootstrapped engineering entity headquartered in Coimbatore. We do not engage in speculative valuation inflation, secondary equity brokering, or fabricated ARR metrics. Prospective enterprise partners and strategic collaborators are invited to inspect our production repositories, architecture RFCs, and test suites directly.
                </p>
              </div>
            </div>

            {/* Right 1 Col: Verified Documents & Contact */}
            <div className="lg:col-span-1 space-y-6">
              {/* Verified Documents */}
              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  <span>Verified Documents</span>
                </h3>

                <div className="space-y-3">
                  {DOCUMENTS.map((doc) => (
                    <Link
                      key={doc.title}
                      href={doc.href}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)]/50 transition-all group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5 font-light">
                          {doc.desc}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Executive Briefing Contact Card */}
              <div className="rounded-2xl bg-[var(--lit-navy,#0B2545)] text-white p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#45D9D2]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#45D9D2]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#45D9D2]">
                    Direct Briefing
                  </span>
                </div>
                <h4 className="text-base font-poppins font-bold text-white mb-2">
                  Connect With Founder Desk
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light mb-5">
                  Schedule a private working session with Founder & Chief Architect Vikash Saravanan to examine architecture, telemetry, or partnership terms.
                </p>
                <Link
                  href="/book-consultation"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#198f89] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Request Working Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Inspect the Live Platforms"
            subtitle="Explore the live deployments of LIT Healthcare, Logic Voice OS, and Voice Shield."
            primaryCta={{ label: "View Products", href: "/products" }}
            secondaryCta={{ label: "Technical Architecture", href: "/architecture" }}
          />
        </div>
      </main>
    </PageShell>
  );
}
