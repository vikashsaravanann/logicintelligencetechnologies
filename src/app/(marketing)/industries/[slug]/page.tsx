import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import { industriesData, getIndustryVisual } from "@/data/industriesData";
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Building2, Layers } from "lucide-react";
import IndustryHeroConsole from "@/components/industries/industry-hero-console";
import CTASection from "@/components/ui/cta-section";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return industriesData.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industriesData.find((i) => i.slug === slug);

  if (!ind) {
    return { title: "Industry Not Found | Logic Intelligence Technologies" };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(ind.title)}&category=${encodeURIComponent("Industry Solution")}&tagline=${encodeURIComponent(ind.subtitle)}`;

  return {
    title: `${ind.title} | Vertical Architecture | Logic Intelligence Technologies`,
    description: ind.summary,
    alternates: {
      canonical: `/industries/${slug}`,
    },
    openGraph: {
      title: ind.title,
      description: ind.summary,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: ind.title }],
    },
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const ind = industriesData.find((i) => i.slug === slug);

  if (!ind) {
    notFound();
  }

  const visualSrc = getIndustryVisual(slug);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackHref="/industries" label="Back to Industries" inline />
        </div>

        {/* Industry Architecture Hero Console */}
        <IndustryHeroConsole
          slug={slug}
          title={ind.title}
          subtitle={ind.subtitle}
        />

        {/* Hero Content */}
        <div className="mb-14 border-b border-[var(--lit-border-light,#DFE7EF)] pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{ind.subtitle}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight mb-6 leading-[1.08]">
            {ind.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-4xl leading-relaxed mb-8">
            {ind.summary}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-sm font-semibold hover:bg-[#123663] transition-all shadow-sm group"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[var(--lit-navy,#0B2545)] text-sm font-semibold border border-[var(--lit-border-light,#DFE7EF)] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
            >
              Request RFP Review
            </Link>
          </div>
        </div>

        {/* Challenges vs Solutions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Industry Bottlenecks */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold text-amber-900 mb-6 uppercase tracking-wider flex items-center gap-2 font-poppins">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Common Industry Bottlenecks</span>
            </h2>
            <div className="space-y-3.5">
              {ind.challenges.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-amber-200/60 text-xs sm:text-sm text-slate-700 shadow-2xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="leading-snug">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Architectural Solutions */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold text-teal-900 mb-6 uppercase tracking-wider flex items-center gap-2 font-poppins">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Our Architectural Solutions</span>
            </h2>
            <div className="space-y-3.5">
              {ind.solutions.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-teal-200/60 text-xs sm:text-sm text-slate-700 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Domain Features */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 mb-16 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <Layers className="w-5 h-5 text-[#1565C0]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Core Vertical Modules &amp; Capabilities
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-8">
            Domain-specific microservices and integrations engineered for production resilience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ind.features.map((f, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-5 hover:border-[#1565C0]/40 transition-colors shadow-2xs"
              >
                <div className="text-[#1565C0] font-mono text-xs font-semibold mb-2">MOD_0{idx + 1}</div>
                <div className="text-[var(--lit-navy,#0B2545)] font-bold text-sm leading-snug">{f}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2 font-poppins">
              <ShieldCheck className="w-5 h-5 text-[#1565C0]" />
              <span>Regulatory Frameworks We Engineer For</span>
            </h3>
            <p className="text-xs text-slate-600">
              We design, audit, and verify software architectures to satisfy these standards directly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ind.compliance.map((c, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#1565C0]/30 text-[#1565C0] text-xs font-mono font-semibold shadow-2xs"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Conversion CTA */}
        <CTASection
          title="Ready to Build for Your Domain?"
          subtitle="Consult our industry systems architect to analyze requirements and deliver a structured roadmap."
          primaryCta={{ label: "Schedule Consultation", href: "/book-consultation" }}
          secondaryCta={{ label: "Contact Engineering", href: "/contact" }}
        />
      </div>
    </main>
  );
}
