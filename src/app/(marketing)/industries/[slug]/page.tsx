import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import { notFound } from "next/navigation";
import Link from "next/link";
import { industriesData, getIndustryVisual } from "@/data/industriesData";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Building2, Layers, Sparkles } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
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
    <div className="relative min-h-screen bg-[#07090D] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/industries" label="Back to Industries" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Visual Architecture Hero */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-[#10131A]">
          <SafeImage
            src={visualSrc}
            alt={`${ind.title} Architecture Visual`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent opacity-80" />
        </div>

        {/* Hero Content */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>{ind.subtitle}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.08]">
            {ind.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-4xl leading-relaxed mb-8">
            {ind.summary}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all flex items-center gap-2 group shadow-lg"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="px-7 py-4 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Request RFP Review
            </Link>
          </div>
        </div>

        {/* Challenges vs Solutions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Industry Bottlenecks */}
          <div className="rounded-2xl border border-amber-500/20 bg-[#10131A] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-amber-300 mb-6 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Common Industry Bottlenecks</span>
            </h2>
            <div className="space-y-3.5">
              {ind.challenges.map((c, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#151922] border border-white/5 text-xs sm:text-sm text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="leading-snug">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Architectural Solutions */}
          <div className="rounded-2xl border border-cyan-500/20 bg-[#10131A] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-[#45D9D2] mb-6 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#45D9D2]" />
              <span>Our Architectural Solutions</span>
            </h2>
            <div className="space-y-3.5">
              {ind.solutions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#151922] border border-white/5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                  <span className="leading-snug">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Domain Features */}
        <div className="rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-10 mb-16 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mb-8">
            Core Vertical Modules &amp; Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ind.features.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-white/5 bg-[#151922] p-5">
                <div className="text-[#45D9D2] font-mono text-xs mb-2">MOD_0{idx + 1}</div>
                <div className="text-white font-bold text-sm leading-snug">{f}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#45D9D2]" />
              <span>Regulatory Frameworks We Engineer For</span>
            </h3>
            <p className="text-xs text-slate-400">We design and audit our software systems to satisfy these standards directly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ind.compliance.map((c, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#151922] border border-cyan-500/30 text-[#45D9D2] text-xs font-mono font-semibold">
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
    </div>
  );
}
