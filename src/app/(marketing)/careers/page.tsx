import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Heart,
  Sparkles,
  Target,
  Users,
  ShieldCheck,
  Cpu,
  MapPin,
  Code2,
  Rocket,
  Award,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Careers & Engineering Culture | Logic Intelligence Technologies",
  description:
    "Explore engineering careers, executive leadership opportunities, and culture at Logic Intelligence Technologies in Coimbatore. Build production AI and enterprise systems.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers & Engineering Culture | Logic Intelligence Technologies",
    description:
      "Join a Coimbatore-based engineering team building production AI, speech synthesis, and enterprise systems. Direct founder mentorship and real equity.",
    images: [
      {
        url: "/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Careers at Logic Intelligence Technologies",
      },
    ],
  },
};

const CORE_PRINCIPLES = [
  {
    icon: Target,
    title: "Extreme Ownership",
    tag: "Autonomy & Execution",
    description:
      "Every engineer and functional lead owns their domain end-to-end: from initial technical RFC through automated testing, continuous deployment, and runtime observability.",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    icon: Cpu,
    title: "Production-Grade Stack",
    tag: "Zero Tech Debt",
    description:
      "We engineer with Next.js App Router, React 19, TypeScript, Supabase/PostgreSQL, Python FastAPI, Playwright automation, and real-time speech AI. Zero legacy boilerplate.",
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
  },
  {
    icon: ShieldCheck,
    title: "Real Equity & Value",
    tag: "Long-Term Alignment",
    description:
      "High-impact contributors earn verifiable equity after corporate registration and direct project revenue-share. We reward craftsmanship, rigorous discipline, and genuine technical vision.",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
];

const PERKS = [
  "Competitive Base Compensation + Executive Equity Allocation Pool",
  "Top-Tier Development Hardware & Dedicated Cloud GPU Compute",
  "High-Autonomy Hybrid Work Environment in Coimbatore",
  "Direct Architecture Collaboration & Founder Mentorship",
  "Sponsored Cloud, Security, and AI Engineering Certifications",
  "Transparent Career Growth & Rapid Functional Leadership Tracks",
];

const HUB_METRICS = [
  { metric: "Coimbatore", label: "Tamil Nadu Tech Hub", sub: "Regional Headquarters" },
  { metric: "100%", label: "In-House Craftsmanship", sub: "Zero Outsourcing" },
  { metric: "4 Seats", label: "Executive Leadership", sub: "CEO + 3 Functional Directors" },
  { metric: "< 200ms", label: "Global Edge Latency", sub: "Production Voice Standard" },
];

export default function CareersPage() {
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ];

  return (
    <PageShell>
      <JsonLd data={breadcrumb(breadcrumbItems)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs / Back button */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Join Our Engineering & Leadership Cohort</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Engineering Culture & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Leadership Opportunities
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-3xl mx-auto font-light">
              We are a team of full-stack architects, machine learning engineers, and systems builders based in Coimbatore. We prioritize extreme ownership, deterministic code execution, and tangible production outcomes over bureaucracy.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>View Open Leadership & Engineering Roles</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/company/facts"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <span>Company Fact Sheet</span>
              </Link>
            </div>

            {/* Careers Visual Banner */}
            <div className="pt-6 max-w-4xl mx-auto">
              <div className="aspect-[21/9] relative rounded-3xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] shadow-sm bg-white p-2">
                <SafeImage
                  src="/images/careers/tech-culture.svg"
                  alt="LIT Engineering Culture & Careers"
                  fill
                  priority
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Culture & Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {CORE_PRINCIPLES.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 shadow-sm hover:border-slate-300 transition-all duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${principle.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${principle.accent}`}
                    >
                      {principle.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                    {principle.title}
                  </h3>

                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Perks & Benefits Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 mb-16 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE7F6] text-[#5E35B1] text-xs font-mono uppercase tracking-wider font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Working at Logic Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                The Engineering Environment
              </h2>
              <p className="text-[var(--lit-text-muted,#52677C)] text-sm font-light">
                Engineered to support deep work, relentless focus, and world-class product execution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PERKS.map((perk, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00796B] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-[var(--lit-ink,#121826)] leading-snug">
                    {perk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coimbatore Engineering Hub Spotlight */}
          <div className="rounded-3xl border border-[#BBDEFB] bg-[#E7F3FF]/60 p-8 sm:p-12 mb-16 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0]">
                  <MapPin className="w-4 h-4" />
                  <span>Coimbatore Engineering Studio</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                  Building High-Impact Systems From Tamil Nadu
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                  Based in Tamil Nadu&apos;s premier educational and industrial corridor, our Coimbatore studio combines Silicon Valley-level architectural ambitions with calm, high-focus regional quality of life.
                </p>
                <div className="pt-2">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0] hover:underline"
                  >
                    <span>Inspect Open Leadership Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {HUB_METRICS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#BBDEFB] shadow-2xs space-y-1"
                  >
                    <p className="text-base sm:text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                      {item.metric}
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canonical CTA Section */}
        <div className="mt-20">
          <CTASection
            title="Ready to Build Production AI Systems?"
            subtitle="Review our current executive and engineering openings and submit your application directly to our leadership desk."
            primaryCta={{
              label: "Explore Open Positions",
              href: "/jobs",
            }}
            secondaryCta={{
              label: "Explore Architecture",
              href: "/architecture",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
