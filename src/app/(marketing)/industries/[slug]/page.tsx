import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { industriesData } from "@/data/industriesData";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Building2, Layers, Sparkles } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import CTASection from "@/components/ui/cta-section";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industriesData.find((i) => i.slug === slug);

  if (!ind) {
    return { title: "Industry Not Found | Logic Intelligence Technologies" };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(ind.title)}&category=${encodeURIComponent("Industry Solution")}&tagline=${encodeURIComponent(ind.subtitle)}`;

  return {
    title: `${ind.title} | Industry Architecture | Logic Intelligence Technologies`,
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

  const visualSrc = `/images/industries/${slug}.svg`;

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-28 pb-20 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { name: "Industries", url: "/industries" },
              { name: ind.title, url: `/industries/${ind.slug}` },
            ]}
          />
        </div>

        {/* Visual Architecture Hero */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black/50">
          <SafeImage
            src={visualSrc}
            alt={`${ind.title} Architecture Visual`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            {ind.subtitle}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-6">
            {ind.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-4xl leading-relaxed mb-8">
            {ind.summary}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-7 py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2 group"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
            >
              Request RFP Review
            </Link>
          </div>
        </div>

        {/* Challenges vs Solutions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Industry Bottlenecks */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] p-8">
            <h2 className="text-xl font-bold text-rose-400 mb-6 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Common Industry Bottlenecks</span>
            </h2>
            <div className="space-y-4">
              {ind.challenges.map((c, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Architectural Solutions */}
          <div className="rounded-3xl border border-primary/20 bg-primary/[0.02] p-8">
            <h2 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Our Architectural Solutions</span>
            </h2>
            <div className="space-y-4">
              {ind.solutions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Domain Features */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 lg:p-12 mb-16">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">
            Core Vertical Modules &amp; Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ind.features.map((f, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="text-primary font-mono text-xs mb-2">MOD_0{idx + 1}</div>
                <div className="text-white font-bold text-sm">{f}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 mb-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Regulatory &amp; Compliance Standards</span>
            </h3>
            <p className="text-xs text-zinc-400">Strict data privacy, encryption, and auditability protocols built-in.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ind.compliance.map((c, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <CTASection
          title={`Ready to Modernize Your ${ind.title.split("&")[0]} System?`}
          subtitle="Speak with our solutions architect to map requirements and timeline."
          primaryCta={{ label: "Consult Industry Architect", href: "/book-consultation" }}
          secondaryCta={{ label: "View Portfolio", href: "/work" }}
        />
      </div>
    </div>
  );
}
