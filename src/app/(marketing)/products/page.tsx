import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import Link from "next/link";
import { productsData } from "@/data/productsData";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Terminal,
  Layers,
  Cpu,
  Lock,
} from "lucide-react";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Products & Platforms | Logic Intelligence Technologies",
  description:
    "Explore proprietary AI products and enterprise platforms developed by Logic Intelligence Technologies, including Logic Voice, LIT Healthcare, and Voice Shield.",
  alternates: {
    canonical: "/products",
  },
};

const STATUS_BADGES: Record<string, string> = {
  "Enterprise Ready": "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  "Live": "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
  "Active Development": "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
  "Beta": "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
};

export default function ProductsPage() {
  const flagshipProducts = productsData.filter(
    (p) => p.slug === "logic-voice" || p.slug === "lit-healthcare" || p.slug === "voice-shield"
  );
  const internalSystems = productsData.filter(
    (p) => p.slug !== "logic-voice" && p.slug !== "lit-healthcare" && p.slug !== "voice-shield"
  );

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />
      <BackToHome href="/" label="Back to Home" />

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.16em] bg-[#1FA9A2]/10 text-[#0E7A74] border border-[#1FA9A2]/25 mb-4 shadow-2xs">
            <Box className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>Proprietary Software Systems</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--lit-navy,#0B2545)] mb-6 leading-[1.12] tracking-tight">
            Engineered{" "}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              AI Systems &amp; Platforms
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
            Logic Intelligence Technologies engineers purpose-built software architectures and autonomous intelligence engines. Each platform operates with strict safety gates, verifiable audit trails, and modular multi-tenant capability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products/facts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DFE7EF] text-xs font-mono font-semibold text-[var(--lit-navy,#0B2545)] hover:border-[#1FA9A2]/40 hover:text-[var(--lit-blue,#1565C0)] transition-all shadow-2xs"
            >
              <span>View Authoritative Product Register</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1FA9A2]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reassurance Metrics Strip */}
      <section className="py-8 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Flagship Platforms", value: "3 Systems", note: "Voice, Health, Defense" },
            { label: "Execution Standard", value: "100% Deterministic", note: "Type-Safe Boundaries" },
            { label: "Voice Defense", value: "<15ms Latency", note: "Zero-Retention Biometrics" },
            { label: "Healthcare OS", value: "Multi-Tenant", note: "FHIR-Ready Architecture" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-[#DFE7EF] bg-white p-5 sm:p-6 text-center shadow-xs hover:shadow-md hover:border-[#1FA9A2]/40 transition-all duration-200"
            >
              <p className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                {metric.value}
              </p>
              <p className="text-[11px] sm:text-xs font-mono text-[var(--lit-blue,#1565C0)] uppercase tracking-wider mt-1 font-semibold">
                {metric.label}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1 hidden sm:block">
                {metric.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Flagship Platforms Section */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto py-10 space-y-12">
        <div className="flex items-center gap-3 pb-4 border-b border-[#DFE7EF]">
          <Sparkles className="w-4 h-4 text-[#1FA9A2]" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-navy,#0B2545)]">
            Flagship Platforms
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {flagshipProducts.map((prod) => {
            const isLogicVoice = prod.slug === "logic-voice";
            const isHealthcare = prod.slug === "lit-healthcare";
            const isVoiceShield = prod.slug === "voice-shield";

            const liveUrl = isLogicVoice
              ? "https://logicvoice.logicintelligencetechnologies.in/"
              : isHealthcare
              ? "https://healthcare.logicintelligencetechnologies.in/"
              : null;

            const gitHubUrl = isHealthcare
              ? "https://github.com/vikashsaravanann/lit-smart-hospital-platform"
              : isLogicVoice
              ? "https://github.com/vikashsaravanann/logic-voice"
              : null;

            const internalPage = isLogicVoice
              ? "/products/logic-voice"
              : isHealthcare
              ? "/healthcare"
              : "/voice-shield";

            const statusClass =
              STATUS_BADGES[prod.status] ??
              "bg-[#F7F9FC] text-[var(--lit-navy)] border-[#DFE7EF]";

            return (
              <div
                key={prod.slug}
                className="group relative rounded-3xl border border-[#DFE7EF] bg-white p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#1FA9A2]/40 hover:shadow-md shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] flex items-center justify-center text-[var(--lit-navy,#0B2545)] group-hover:text-[#1FA9A2] group-hover:scale-105 transition-all">
                      {isLogicVoice ? (
                        <Sparkles className="w-6 h-6" />
                      ) : isHealthcare ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusClass}`}
                    >
                      {prod.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#1FA9A2] font-mono font-bold tracking-widest uppercase mb-2">
                    {prod.category}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-navy,#0B2545)] mb-2 group-hover:text-[var(--lit-blue,#1565C0)] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--lit-ink,#121826)] mb-4 font-semibold leading-relaxed">
                    {prod.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Verified Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] mb-6 text-center">
                    {prod.metrics.map((m, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                          {m.value}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider font-semibold">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2.5 mb-8">
                    {prod.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--lit-ink,#121826)]">
                        <CheckCircle2 className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#DFE7EF] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[38px] items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-xs hover:bg-[#133966] transition-all shadow-xs"
                      >
                        <span>Live Platform</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#45D9D2]" />
                      </a>
                    )}
                    {gitHubUrl && (
                      <a
                        href={gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[38px] items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] font-mono text-xs transition-colors"
                        title="Verified Repository"
                      >
                        <Terminal className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
                        <span>Code</span>
                      </a>
                    )}
                  </div>

                  <Link
                    href={internalPage}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-blue,#1565C0)] uppercase tracking-wider transition-colors py-2"
                  >
                    <span>Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1FA9A2]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialized Operational Engines */}
        {internalSystems.length > 0 && (
          <div className="space-y-8 pt-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#DFE7EF]">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#1FA9A2]" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-navy,#0B2545)]">
                  Operational &amp; Distribution Engines
                </h2>
              </div>
              <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] hidden sm:inline-block">
                Deterministic Pipeline Architectures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internalSystems.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-3xl border border-[#DFE7EF] bg-white p-7 sm:p-8 flex flex-col justify-between hover:border-[#1FA9A2]/40 hover:shadow-md transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1FA9A2]">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] border border-[#DFE7EF]">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-display text-[var(--lit-navy,#0B2545)] mb-2">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {item.features.slice(0, 3).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[var(--lit-ink,#121826)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1FA9A2] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#DFE7EF] text-xs">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-blue,#1565C0)] font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Platform Specs</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1FA9A2]" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[var(--lit-text-muted,#52677C)]" />
                      <span className="font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        {item.techStack.slice(0, 3).join(" · ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Conversion Architecture Strip */}
        <div className="rounded-3xl border border-[#DFE7EF] bg-white p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold tracking-wider uppercase mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Licensing &amp; Engineering</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
            Need Custom Platform Engineering or Architecture Licensing?
          </h2>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto leading-relaxed">
            Our principal engineering practice licenses proven platform scaffolds and builds custom autonomous workflows for enterprises requiring deterministic execution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/book-consultation"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-sm hover:bg-[#133966] transition-all shadow-xs"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-3 rounded-xl border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] font-semibold text-sm transition-colors shadow-2xs"
            >
              <span>Contact Enterprise Sales</span>
            </Link>
          </div>
        </div>

        <CTASection
          title="Ready to Build or License a Platform?"
          subtitle="Connect directly with our engineering team for a technical walkthrough or custom platform scoping."
          primaryCta={{ label: "Schedule Architecture Review", href: "/book-consultation" }}
          secondaryCta={{ label: "Explore Services", href: "/services" }}
        />
      </section>
    </div>
  );
}
