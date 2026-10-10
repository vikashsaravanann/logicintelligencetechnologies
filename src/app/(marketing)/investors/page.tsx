import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  FileText,
  AlertCircle,
  Building2,
  TrendingUp,
  Layers,
  Lock,
  DollarSign,
  Scale,
  Sparkles,
  ExternalLink,
  Phone,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Investor Operating Briefing | Logic Intelligence Technologies",
  description:
    "Authoritative operating update for Logic Intelligence Technologies. Bootstrapped, production-first engineering studio in Coimbatore with disciplined unit economics.",
  openGraph: {
    title: "Investor Operating Briefing | Logic Intelligence Technologies",
    description:
      "Authoritative operating update for Logic Intelligence Technologies. Bootstrapped, production-first engineering studio in Coimbatore with disciplined unit economics.",
    type: "website",
    url: "https://www.logicintelligencetechnologies.in/investors",
  },
};

const OPERATING_POINTS = [
  {
    title: "Capital Posture: Not Raising",
    desc: "This briefing is an authentic operating disclosure. There is no priced funding round open, no broker syndicate, and no speculative equity distribution. We fund development through customer cash flows.",
    icon: Scale,
    color: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
    tag: "Capital Discipline",
  },
  {
    title: "Live Production Platforms",
    desc: "LIT Healthcare modular clinical platform, Logic Voice AI OS, Voice Shield acoustic defense firewall, and enterprise client portals. Working prototypes first; verified source code delivered to production.",
    icon: Cpu,
    color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
    tag: "Proprietary IP",
  },
  {
    title: "Transparent Commercial Floors",
    desc: "Digital Launch from ₹8,999. Business Pro Pack from ₹18,999. Custom enterprise software and RAG architectures from ₹50,000. Scope, timeline, and pricing are published and never invented on calls.",
    icon: DollarSign,
    color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    tag: "Published Pricing",
  },
  {
    title: "Operating Model & Unit Economics",
    desc: "Project cash flows today, transitioning into production SLAs and recurring platform retainers post-launch. Coimbatore engineering headquarters provides a structurally disciplined cost advantage with zero speculative burn.",
    icon: TrendingUp,
    color: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
    tag: "Cash-Flow Positive",
  },
  {
    title: "Authentic Verification Policy",
    desc: "We do not publish fabricated traction metrics or unverified logos. Invoices, live telemetry, and customer testimonials are published only with complete client verification and explicit consent.",
    icon: ShieldCheck,
    color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
    tag: "Zero Fabrication",
  },
  {
    title: "Governance & Leadership Equity",
    desc: "CEO and Director openings are operational leadership appointments with 6-month letters of intent and four-year vesting. Investment is separate from executive employment, ensuring alignment of long-term value.",
    icon: Building2,
    color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    tag: "4-Year Vesting",
  },
];

const METRICS = [
  {
    metric: "Bootstrapped",
    label: "Self-Sustaining Operations",
    sub: "Funded by commercial project cash flows",
  },
  {
    metric: "3 Flagships",
    label: "Proprietary Software Assets",
    sub: "Healthcare, Logic Voice, Voice Shield",
  },
  {
    metric: "₹8,999 - ₹50k+",
    label: "Published Commercial Floors",
    sub: "Fixed-price transparent delivery",
  },
  {
    metric: "Coimbatore HQ",
    label: "Cost-Advantaged Engineering",
    sub: "Structural cost efficiency & zero burn",
  },
];

const DEFENSIVE_MOATS = [
  {
    title: "Deterministic AI Scaffolding",
    desc: "We wrap probabilistic LLM calls in compile-time schema validation and relational foreign-key gates, eliminating hallucination in healthcare, billing, and transactional operations.",
  },
  {
    title: "Sub-150ms Edge Voice Telephony",
    desc: "Proprietary Opus packetization, SIP trunk firewalls, and jitter buffer optimization tailored for South Asian and global telephony edge nodes.",
  },
  {
    title: "Multi-Tenant EMR Governance",
    desc: "LIT Healthcare partitions clinical record stores with cryptographic tenant isolation and immutable audit trails, meeting strict ABDM and HIPAA standards.",
  },
  {
    title: "Engineering-First Execution",
    desc: "Founder personally architects systems and writes production code, eliminating bureaucratic management overhead and accelerating time-to-market.",
  },
];

export default function InvestorsPage() {
  const breadcrumbs = breadcrumb([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Investor Operating Briefing", path: "/investors" },
  ]);

  return (
    <PageShell>
      <JsonLd data={breadcrumbs} />

      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="About Us" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-5 mb-14 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#80CBC4] text-[#00796B] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Corporate Transparency & Unit Economics</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Investor Operating <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Briefing
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              Authoritative operating disclosure for Logic Intelligence Technologies — production architectures, verified unit economics, capital discipline, and engineering-led execution from Coimbatore.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Current Status: Bootstrapped & Self-Sustaining · Not Actively Raising</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/investor-brief"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Review Investor Brief</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/company/facts"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <span>Company Fact Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {METRICS.map((m) => (
              <div
                key={m.metric}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
              >
                <div className="text-lg sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                  {m.metric}
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{m.label}</div>
                <div className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Operating Principles Grid */}
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Operating Principles & Capital Allocation
              </h2>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                Our authentic posture on capital, commercial pricing, software assets, and governance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {OPERATING_POINTS.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.title}
                    className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${p.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--lit-cloud,#F7F9FC)] border border-slate-200 text-slate-600">
                          {p.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] mb-2">
                        {p.title}
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                        {p.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]/60 flex items-center gap-1.5 text-xs text-[var(--lit-teal,#1FA9A2)] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Operating Policy</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Architectural Defensibility & Moats */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] mb-16 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <Layers className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Technological Moats & Systems Defensibility
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6">
              Why our architectures deliver higher client retention and lower operational friction than generic web wrappers.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {DEFENSIVE_MOATS.map((moat, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]"
                >
                  <h3 className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-700">
                      0{i + 1}
                    </span>
                    <span>{moat.title}</span>
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                    {moat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Inspect Production Platforms Grid */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--lit-navy,#0B2545)] text-white shadow-lg relative overflow-hidden mb-16">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#45D9D2]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#45D9D2]">
                <Sparkles className="w-4 h-4" />
                <span>Verified Working Prototypes</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-poppins font-bold text-white">
                Inspect Production Architecture In Action
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                We believe in proof over pitch decks. Review our live platforms, test latency benchmarks, or connect with our Coimbatore engineering desk.
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  href="/healthcare"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#45D9D2] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[#45D9D2]/90 transition-all shadow-md"
                >
                  <span>LIT Healthcare</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products/logic-voice"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  <span>Logic Voice OS</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </Link>
                <a
                  href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — I read the investor operating briefing.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  <Phone className="w-4 h-4 text-[#45D9D2]" />
                  <span>WhatsApp Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Explore our Enterprise Architecture"
            subtitle="Review our published system designs, security documentation, and leadership structure."
            primaryCta={{ label: "View Architecture", href: "/architecture" }}
            secondaryCta={{ label: "Read Investor Brief", href: "/investor-brief" }}
          />
        </div>
      </main>
    </PageShell>
  );
}
