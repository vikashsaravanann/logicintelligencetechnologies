import React from "react";
import {
  Users2,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  ExternalLink,
  BookOpen,
  Code2,
  CheckCircle2,
  Layers,
  Activity,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import { CommunityTopics } from "./community-topics";

export const metadata: Metadata = {
  title: "Developer & Architect Community | Logic Intelligence Technologies",
  description:
    "Peer-to-peer technical discussions, systems architecture RFCs, reproducible edge benchmarks, and developer community for Logic Intelligence Technologies.",
  openGraph: {
    title: "Developer & Architect Community | Logic Intelligence Technologies",
    description:
      "Peer-to-peer technical discussions, systems architecture RFCs, reproducible edge benchmarks, and developer community for Logic Intelligence Technologies.",
    type: "website",
    url: "https://www.logicintelligencetechnologies.in/community",
  },
};

export default function CommunityPage() {
  const breadcrumbs = breadcrumb([
    { name: "Home", path: "/" },
    { name: "Careers & Culture", path: "/careers" },
    { name: "Developer Community", path: "/community" },
  ]);

  const contributors = [
    {
      initials: "VS",
      name: "Vikash Saravanan",
      role: "Founder & Chief Architect",
      badge: "Core",
      color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
      badgeColor: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
    },
    {
      initials: "AM",
      name: "Alex M.",
      role: "Systems & Edge Engineer",
      points: "2.4k pts",
      color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    },
    {
      initials: "DR",
      name: "Dr. Reynolds",
      role: "Security & Voice Architect",
      points: "1.8k pts",
      color: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
    },
    {
      initials: "PK",
      name: "Priya K.",
      role: "Clinical Informatics Fellow",
      points: "1.2k pts",
      color: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
    },
  ];

  const charterRules = [
    {
      title: "Deterministic Benchmarks",
      desc: "All architecture proposals must provide profiling traces, latency distributions, or reproducible test beds.",
    },
    {
      title: "Zero Ambient Telemetry",
      desc: "No proprietary weights, client PII, or unanonymized hospital records may ever be posted to community threads.",
    },
    {
      title: "Peer-to-Peer Rigor",
      desc: "Discussions prioritize engineering proofs, memory safety, and failover mechanics over marketing speculation.",
    },
  ];

  return (
    <PageShell>
      <JsonLd data={breadcrumbs} />

      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="mb-8">
            <BackButton fallbackHref="/careers" label="Careers & Engineering" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-5 mb-14 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#80CBC4] text-[#00796B] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <Users2 className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Engineering Knowledge Exchange</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Architect & Developer <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Community
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              Connect directly with our core engineering team in Coimbatore. Review open architecture RFCs, examine real-time voice latency telemetry, and collaborate on production AI systems.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact?subject=Community+Membership"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Join Developer Network</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <span>System Architecture</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Clinical Architecture Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                  Latency Standard
                </span>
                <Activity className="w-4 h-4 text-[#1FA9A2]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                &lt; 150ms
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
                Edge voice streaming roundtrip
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                  Open RFCs
                </span>
                <Layers className="w-4 h-4 text-[#1565C0]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                6 Active
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
                Public peer-reviewed designs
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                  Privacy Isolation
                </span>
                <Lock className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                Zero Spill
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
                No telemetry data used in training
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                  Engineering Desk
                </span>
                <Cpu className="w-4 h-4 text-[#B45309]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                Coimbatore
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
                Direct architect access
              </p>
            </div>
          </div>

          {/* Main Forum & Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Left 2 Cols: Interactive Forum & RFC Directory */}
            <div className="lg:col-span-2">
              <CommunityTopics />
            </div>

            {/* Right 1 Col: Sidebar Info & Resources */}
            <div className="lg:col-span-1 space-y-6">
              {/* Join CTA Card (Clinical Deep Navy) */}
              <div className="rounded-2xl bg-[var(--lit-navy,#0B2545)] p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#45D9D2]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#45D9D2]" />
                  <h3 className="text-xs font-bold tracking-wider text-[#45D9D2] uppercase">
                    Join the Network
                  </h3>
                </div>
                <h4 className="text-lg font-poppins font-bold text-white mb-2 leading-snug">
                  Build Directly With Core Engineers
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 font-light">
                  Collaborate directly with the engineers building Logic Voice, Voice Shield, and the LIT Healthcare platform. Review internal RFCs before public release.
                </p>
                <Link
                  href="/contact?subject=Community+Access+Request"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#198f89] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  <span>Request Community Access</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>

              {/* Top Contributors Card */}
              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-wider text-[var(--lit-navy,#0B2545)] uppercase flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Top Contributors
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                    All-Time
                  </span>
                </div>

                <div className="space-y-3">
                  {contributors.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono text-xs font-bold ${c.color}`}
                        >
                          {c.initials}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] block">
                            {c.role}
                          </span>
                        </div>
                      </div>

                      {c.badge ? (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]">
                          {c.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {c.points}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Charter & RFC Standards */}
              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs">
                <h3 className="text-xs font-bold tracking-wider text-[var(--lit-navy,#0B2545)] uppercase mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  Community Charter
                </h3>
                <div className="space-y-3">
                  {charterRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                          {rule.title}
                        </h4>
                        <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Architecture Links */}
              <div className="rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs">
                <h3 className="text-xs font-bold tracking-wider text-[var(--lit-navy,#0B2545)] uppercase mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1565C0]" />
                  Engineering Resources
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/architecture"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-navy,#0B2545)] font-medium transition-colors"
                  >
                    <span>System Architecture Overview</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/knowledge-base"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-navy,#0B2545)] font-medium transition-colors"
                  >
                    <span>Developer Knowledge Base</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/security"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-navy,#0B2545)] font-medium transition-colors"
                  >
                    <span>Security & Trust Center</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/careers"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-navy,#0B2545)] font-medium transition-colors"
                  >
                    <span>Careers & Leadership Cohort</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Explore the Code & Architecture"
            subtitle="Discover our technical documentation, public APIs, and foundational engineering principles."
            primaryCta={{ label: "View Architecture", href: "/architecture" }}
            secondaryCta={{ label: "Read Knowledge Base", href: "/knowledge-base" }}
          />
        </div>
      </main>
    </PageShell>
  );
}
