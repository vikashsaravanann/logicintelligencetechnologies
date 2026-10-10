import { Metadata } from "next";
import Link from "next/link";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import {
  ExternalLink,
  Mail,
  Phone,
  Coins,
  PlayCircle,
  Sparkles,
  Handshake,
  ShieldCheck,
  MapPin,
  Rocket,
  Code2,
  Target,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Logic Intelligence Technologies",
  description:
    "Logic Intelligence Technologies is an AI technology company based in Coimbatore, Tamil Nadu, India, developing intelligent AI products and automation solutions including Logic Voice, LIT Healthcare, and Voice Shield.",
};

const values = [
  {
    title: "Transparent Pricing",
    desc: "Clear scope, fixed deliverables, and upfront cost before engineering begins — zero hidden invoices mid-project.",
    icon: Coins,
    accent: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
  },
  {
    title: "Free Prototype Demo First",
    desc: "Review a functioning prototype demonstration of your product architecture before committing budget.",
    icon: PlayCircle,
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
  },
  {
    title: "Applied AI Systems",
    desc: "Founded by an AI & Data Science engineer — we engineer AI models and agents only when they solve genuine operational friction.",
    icon: Sparkles,
    accent: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
  },
  {
    title: "Direct Engineering Partnership",
    desc: "You collaborate directly with the systems architects who write the code — from discovery through production deployment.",
    icon: Handshake,
    accent: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  },
  {
    title: "Hardened Production Quality",
    desc: "Strict schema validation, row-level database security, zero-trust secrets handling, and automated test coverage.",
    icon: ShieldCheck,
    accent: "bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]",
  },
  {
    title: "Startup Velocity, Enterprise Rigor",
    desc: "Rapid deployment cycles without sacrificing accessibility, performance, or long-term maintainability.",
    icon: Rocket,
    accent: "bg-[#E7F3FF] text-[#0284C7] border-[#BAE6FD]",
  },
];

const focusAreas = [
  {
    icon: Code2,
    title: "Full-Stack Web Architecture",
    body: "Next.js App Router, React 19, TypeScript, and hardened backends — high-performance platforms built to scale reliably.",
    tag: "Core Engineering",
  },
  {
    icon: Sparkles,
    title: "Practical AI & Voice Systems",
    body: "Constrained retrieval pipelines, voice-first intelligent interfaces, and synthetic voice defense systems engineered for business reliability.",
    tag: "Applied AI",
  },
  {
    icon: Target,
    title: "Deterministic Milestone Delivery",
    body: "Fixed-scope packages and custom Statements of Work with explicit deliverables, ensuring transparency on every release.",
    tag: "Delivery Model",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--lit-ink)] selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <BackToHome />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.16em] bg-[#E7F3FF] text-[#1565C0] border border-[#BFDBFE] mb-6 shadow-2xs">
            <Rocket className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>Logic Intelligence Technologies</span>
            <span className="text-[#93C5FD]">•</span>
            <span className="normal-case font-medium text-slate-600">Where logic meets innovation.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-[var(--lit-ink)] mb-6 leading-[1.12] tracking-tight">
            An AI Technology Company Built To Ship{" "}
            <span className="block font-serif italic font-normal text-[var(--lit-blue)] mt-2">
              Deterministic Systems For Modern Enterprise.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted)] max-w-3xl mx-auto leading-relaxed">
            {FOUNDER.companyOverview}
          </p>
        </div>
      </section>

      {/* Facts Strip */}
      <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Established", value: "2026", note: "Founded in Tamil Nadu" },
            { label: "Enterprise Entity", value: COMPANY.entityLabel, note: "Registered Technology Firm" },
            { label: "Headquarters", value: "Coimbatore, TN", note: "Innovation Hub, India" },
            { label: "Core Competency", value: "AI · Web · Products", note: "Full-Stack & Voice AI" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#DFE7EF] bg-white p-5 sm:p-6 text-center shadow-xs hover:shadow-md hover:border-[#1FA9A2]/40 transition-all duration-200"
            >
              <p className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-ink)] tracking-tight">
                {item.value}
              </p>
              <p className="text-[11px] sm:text-xs font-mono text-[var(--lit-blue)] uppercase tracking-wider mt-1 font-semibold">
                {item.label}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted)] mt-1 hidden sm:block">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Spotlight Card */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-[#DFE7EF] bg-[#F7F9FC] p-6 sm:p-10 md:p-12 shadow-sm">
          <div className="grid lg:grid-cols-[minmax(240px,340px)_1fr] gap-10 lg:gap-14 items-center">
            {/* Founder Visual & Vitals */}
            <div className="flex flex-col items-center lg:items-stretch gap-5">
              <div className="w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-[#DFE7EF] bg-white shadow-md relative group">
                <img
                  src="/images/founder/founder-about-card.jpg"
                  alt={`${COMPANY.founder.name} — ${COMPANY.founder.title}`}
                  className="w-full h-full min-h-[360px] object-cover object-[center_18%] block transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--lit-ink)]">
                  {FOUNDER.name}
                </h2>
                <p className="text-[var(--lit-blue)] font-mono font-bold text-xs uppercase tracking-widest mt-1">
                  {FOUNDER.title}
                </p>
                <p className="text-[var(--lit-text-muted)] text-xs mt-2 flex items-center justify-center lg:justify-start gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#1FA9A2]" />
                  {COMPANY.address}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <a
                  href={FOUNDER.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-4 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono font-semibold text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] transition-all shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1FA9A2]" /> LinkedIn
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-4 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono font-semibold text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] transition-all shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#1FA9A2]" /> Email
                </a>
              </div>
            </div>

            {/* Founder Bio & Credentials */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#7C3AED] bg-[#F1ECFF] border border-[#DDD6FE]">
                <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Founder Profile &amp; Leadership
              </span>

              <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted)] leading-relaxed">
                <p>{FOUNDER.shortBio}</p>
                <p className="text-slate-700 font-medium">
                  At Logic Intelligence Technologies, every system is designed around deterministic principles: strict schema validation, robust microservices, test automation, and measurable operational ROI.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#DFE7EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--lit-ink)] uppercase font-mono">B.Tech AI &amp; Data Science</h4>
                    <p className="text-xs text-[var(--lit-text-muted)]">Rathinam Technical Campus, Coimbatore</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#DFE7EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--lit-ink)] uppercase font-mono">Product Architect</h4>
                    <p className="text-xs text-[var(--lit-text-muted)]">Creator of Logic Voice &amp; LIT Healthcare</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about/founder"
                  className="lit-btn lit-btn-primary lit-btn-md inline-flex items-center gap-2"
                >
                  <span>View Full Executive Biography &amp; Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-16 sm:py-20 px-6 lg:px-8 bg-white border-y border-[#DFE7EF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1565C0] bg-[#E7F3FF] border border-[#BFDBFE] mb-3">
              Specialized Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[var(--lit-ink)] tracking-tight">
              What We Build
            </h2>
            <p className="text-[var(--lit-text-muted)] max-w-2xl mx-auto text-sm sm:text-base mt-2">
              Product-minded systems engineering across cloud architecture, intelligent voice platforms, and enterprise automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {focusAreas.map((item) => (
              <div
                key={item.title}
                className="p-7 rounded-2xl border border-[#DFE7EF] bg-white hover:border-[#1FA9A2]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[var(--lit-blue)]">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F7F9FC] border border-[#DFE7EF] text-slate-600">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-[var(--lit-ink)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--lit-text-muted)] leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="py-16 sm:py-20 px-6 lg:px-8 bg-[#F7F9FC] border-b border-[#DFE7EF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] mb-3">
              Engineering Code
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[var(--lit-ink)] tracking-tight">
              What We Stand For
            </h2>
            <p className="text-[var(--lit-text-muted)] max-w-2xl mx-auto text-sm sm:text-base mt-2">
              Our core engineering principles govern every client collaboration, sprint cycle, and architectural decision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 border border-[#DFE7EF] bg-white rounded-2xl hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-300 flex gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${v.accent}`}
                >
                  <v.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-[var(--lit-ink)] mb-1">
                    {v.title}
                  </h3>
                  <p className="text-[var(--lit-text-muted)] text-xs sm:text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner (Canonical Navy Canvas) */}
      <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 border border-[#0B2545] bg-[var(--lit-navy)] text-white shadow-xl text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,169,162,0.18),transparent_55%)] pointer-events-none" />

          <span className="relative inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/25 mb-4">
            Zero-Risk Evaluation
          </span>

          <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight">
            Ready to Engineer Your Platform?
          </h2>

          <p className="relative text-slate-300 mb-8 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Request a free prototype demonstration and review a tangible direction for your platform before financial commitment.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/free-demo"
              className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center"
            >
              Request Free Demo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <a
              href={`tel:${COMPANY.phone}`}
              className="lit-btn bg-white/10 hover:bg-white/20 text-white border border-white/20 lit-btn-lg w-full sm:w-auto justify-center"
            >
              <Phone className="w-4 h-4 mr-2" /> {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>

      <FloatingElements />
    </div>
  );
}

