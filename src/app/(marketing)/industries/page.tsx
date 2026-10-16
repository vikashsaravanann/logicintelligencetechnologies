import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { industriesData, getIndustryVisual } from "@/data/industriesData";
import { ArrowRight, Building2, CheckCircle2, Cpu } from "lucide-react";
import IndustryCardAnimation from "@/components/industries/industry-card-animation";

export const metadata: Metadata = {
  title: "Industry Solutions & Vertical Architecture | Logic Intelligence Technologies",
  description:
    "Specialized software architecture across Healthcare, Education, Retail, Manufacturing, FinTech, and High-Growth Startups.",
  alternates: {
    canonical: "/industries",
  },
};

export default function IndustriesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden">
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold tracking-wider uppercase mb-6 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
            <span>Domain-Specific Vertical Architecture</span>
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,4.25rem)] font-bold tracking-tight text-[var(--lit-navy,#0B2545)] mb-6 leading-[1.08] uppercase">
            Software Tailored to{' '}
            <span className="block text-[var(--lit-blue,#1565C0)] font-serif italic font-normal normal-case">
              Your Industry
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-3xl mx-auto font-normal">
            Every vertical faces distinct compliance, operational, and architectural requirements. We design and deploy high-reliability systems customized for your market.
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {industriesData.map((ind) => (
            <div
              key={ind.slug}
              className="group rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[#1565C0] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <IndustryCardAnimation
                  slug={ind.slug}
                  title={ind.title}
                  subtitle={ind.subtitle}
                />
                <h2 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] mb-1.5 group-hover:text-[#1565C0] transition-colors leading-snug">
                  {ind.title}
                </h2>
                <p className="text-[11px] font-mono text-[#0E7A74] font-semibold mb-3 tracking-wider uppercase">
                  {ind.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed font-normal">
                  {ind.summary}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                  {ind.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[var(--lit-ink,#121826)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                <Link
                  href={`/industries/${ind.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#E7F3FF] text-[#1565C0] border border-[#1565C0]/20 font-semibold">
                  {ind.compliance[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Industry Consultation Banner */}
        <div className="rounded-2xl border border-[#1565C0]/30 bg-white p-8 sm:p-12 text-center shadow-xs mb-16 ring-4 ring-[#1565C0]/5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-mono font-semibold tracking-wider uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Specialized Vertical Engineering</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] mb-3">
            Operating in a Specialized or Regulated Vertical?
          </h2>
          <p className="text-[var(--lit-text-muted,#52677C)] text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Our engineers build solutions across healthcare, manufacturing, fintech, and education. Contact our systems team for a confidential architectural review.
          </p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white font-semibold text-sm transition-all shadow-xs"
          >
            <span>Consult Vertical Architect</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Closing Canonical CTA */}
        <section className="relative rounded-3xl overflow-hidden bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-14 text-center shadow-xl border border-white/10">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(69,217,210,0.18), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to Build for Your Domain?
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Explore the live products we have engineered or book a dedicated technical roadmap session with our systems engineers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/book-consultation"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1FA9A2] to-[#45D9D2] text-[var(--lit-navy,#0B2545)] font-bold text-sm hover:brightness-105 shadow-md transition-all"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <span>Explore Products</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
