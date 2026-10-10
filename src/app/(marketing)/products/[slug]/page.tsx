import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import { productsData } from "@/data/productsData";
import { ArrowLeft, Box, CheckCircle2, Cpu, ArrowRight, Sparkles, ExternalLink, Terminal, ShieldCheck } from "lucide-react";
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const prod = productsData.find((p) => p.slug === slug);

  if (!prod) {
    notFound();
  }

  const visualSrc = `/images/products/${slug}.svg`;
  const isLogicVoice = slug === "logic-voice";
  const isHealthcare = slug === "lit-healthcare";

  return (
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 pt-32 pb-24 overflow-hidden selection:bg-primary selection:text-slate-950">
      <BackButton fallbackHref="/products" label="Back to Products" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.1),_transparent_70%)] blur-[120px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

        {/* Product Visual Banner */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#10131A]">
          <SafeImage
            src={visualSrc}
            alt={`${prod.name} Architecture Diagram & Visual`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent opacity-60" />
        </div>

        {/* Hero Details */}
        <div className="border-b border-white/10 pb-16 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
              {prod.category}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#151922] border border-white/10 text-slate-400 text-xs font-mono font-semibold uppercase tracking-wider">
              {prod.status}
            </span>
          </div>

          <h1 className="text-[clamp(2rem,4vw,3.75rem)] font-bold text-white tracking-tight uppercase leading-[1.1]">
            {prod.name}
          </h1>
          
          <p className="text-lg sm:text-xl text-primary font-medium">
            {prod.tagline}
          </p>
          
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-4xl font-light">
            {prod.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {prod.websiteUrl && (
              <a
                href={prod.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-all"
              >
                <span>Live Platform</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            {prod.repositoryUrl && (
              <a
                href={prod.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-[#151922] hover:bg-white/10 text-slate-200 font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <Terminal className="w-4 h-4 text-primary" />
                <span>GitHub Repository</span>
              </a>
            )}

            <Link
              href="/book-consultation"
              className="inline-flex min-h-[48px] items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isHealthcare && (
              <Link
                href="/healthcare/plans"
                className="inline-flex min-h-[48px] items-center gap-2 px-6 py-3.5 rounded-xl border border-primary/30 bg-primary/5 text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/10 transition-all"
              >
                <span>View Healthcare Plans</span>
              </Link>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {prod.metrics.map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-[#10131A] p-6 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-mono">{m.value}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Features & Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Core Architectural Capabilities</span>
            </h2>
            <div className="space-y-4">
              {prod.features.map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-light">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#6DE6E0]" />
              <span>Engineered Technology Stack</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Built using verified enterprise standards with deterministic backend validation, type-safe API boundaries, and low-latency execution pipelines.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {prod.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-[#151922] border border-white/10 text-xs font-mono font-medium text-slate-200"
                >
                  {tech}
                </span>
              ))}
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
