import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/navigation/back-button";
import { productsData } from "@/data/productsData";
import {
  CheckCircle2,
  Cpu,
  ArrowRight,
  ExternalLink,
  Terminal,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return productsData.map((prod) => ({
    slug: prod.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prod = productsData.find((p) => p.slug === slug);

  if (!prod) {
    return { title: "Product Not Found | Logic Intelligence Technologies" };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(prod.name)}&category=${encodeURIComponent(prod.category)}&tagline=${encodeURIComponent(prod.tagline)}`;

  return {
    title: `${prod.name} | Enterprise AI Platform | Logic Intelligence Technologies`,
    description: prod.description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: prod.name,
      description: prod.tagline,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: prod.name }],
    },
  };
}

const STATUS_BADGES: Record<string, string> = {
  "Enterprise Ready": "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  "Live": "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
  "Active Development": "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
  "Beta": "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const prod = productsData.find((p) => p.slug === slug);

  if (!prod) {
    notFound();
  }

  const visualSrc = `/images/products/${slug}.svg`;
  const isHealthcare = slug === "lit-healthcare";

  const statusClass =
    STATUS_BADGES[prod.status] ??
    "bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] border-[#DFE7EF]";

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton fallbackHref="/products" label="Back to Products" inline />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        {/* Product Visual Banner */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden border border-[#DFE7EF] shadow-xs bg-[#F7F9FC]">
          <SafeImage
            src={visualSrc}
            alt={`${prod.name} Architecture Diagram & Visual`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>

        {/* Hero Details */}
        <div className="border-b border-[#DFE7EF] pb-12 sm:pb-16 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
              {prod.category}
            </span>
            <span
              className={`px-3.5 py-1 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider ${statusClass}`}
            >
              {prod.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.12]">
            {prod.name}
          </h1>

          <p className="text-base sm:text-xl text-[#1FA9A2] font-mono font-bold tracking-wide uppercase">
            {prod.tagline}
          </p>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-4xl font-normal">
            {prod.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
            {prod.websiteUrl && (
              <a
                href={prod.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#133966] transition-all shadow-xs"
              >
                <span>Live Platform</span>
                <ExternalLink className="w-4 h-4 text-[#45D9D2]" />
              </a>
            )}

            {prod.repositoryUrl && (
              <a
                href={prod.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 px-5 py-3 rounded-xl border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] font-mono text-xs uppercase tracking-wider transition-colors shadow-2xs"
              >
                <Terminal className="w-4 h-4 text-[#1FA9A2]" />
                <span>GitHub Repository</span>
              </a>
            )}

            <Link
              href="/book-consultation"
              className="inline-flex min-h-[44px] items-center gap-2 px-6 py-3 rounded-xl border border-[#DFE7EF] bg-white text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider hover:bg-[#F7F9FC] transition-all shadow-2xs"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4 text-[#1FA9A2]" />
            </Link>

            {isHealthcare && (
              <Link
                href="/healthcare/plans"
                className="inline-flex min-h-[44px] items-center gap-2 px-5 py-3 rounded-xl border border-[#1FA9A2]/30 bg-[#1FA9A2]/10 text-[#0E7A74] font-semibold text-xs uppercase tracking-wider hover:bg-[#1FA9A2]/20 transition-all"
              >
                <span>View Healthcare Plans</span>
              </Link>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {prod.metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#DFE7EF] bg-white p-6 text-center space-y-1 shadow-xs hover:shadow-md hover:border-[#1FA9A2]/40 transition-all"
            >
              <div className="text-2xl sm:text-3xl font-display font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                {m.value}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[var(--lit-text-muted,#52677C)]">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features & Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="rounded-3xl border border-[#DFE7EF] bg-white p-7 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold font-display text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#1FA9A2]" />
              <span>Core Architectural Capabilities</span>
            </h2>
            <div className="space-y-3.5">
              {prod.features.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-sm text-[var(--lit-ink,#121826)] p-3 rounded-xl bg-[#F7F9FC] border border-[#DFE7EF]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#DFE7EF] bg-white p-7 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2.5 mb-3">
                <Cpu className="w-5 h-5 text-[#1565C0]" />
                <span>Engineered Technology Stack</span>
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
                Built using verified enterprise standards with deterministic backend validation, type-safe API boundaries, and low-latency execution pipelines.
              </p>
              <div className="flex flex-wrap gap-2">
                {prod.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#DFE7EF] text-xs font-mono font-medium text-[var(--lit-ink,#121826)] hover:border-[#1FA9A2]/40 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <CTASection
          title={`Interested in Licensing or Deploying ${prod.name}?`}
          subtitle="Speak with our engineering directors to evaluate technical architecture, security requirements, and production rollout schedules."
          primaryCta={{ label: "Request Deployment Consultation", href: "/book-consultation" }}
          secondaryCta={{ label: "Contact Enterprise Desk", href: "/contact" }}
        />
      </div>
    </div>
  );
}
