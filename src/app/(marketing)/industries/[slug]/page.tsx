import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { industriesData } from "@/data/industriesData";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Building2, Layers } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industriesData.find((i) => i.slug === slug);

  if (!ind) {
    return { title: "Industry Not Found | Logic Intelligence Technologies" };
  }

  return {
    title: `${ind.title} | Industry Architecture | Logic Intelligence Technologies`,
    description: ind.summary,
    alternates: {
      canonical: `/industries/${slug}`,
    },
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const ind = industriesData.find((i) => i.slug === slug);

  if (!ind) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/industries"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Industries</span>
        </Link>

        {/* Hero Banner */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            {ind.subtitle}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase mb-6">
            {ind.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-4xl leading-relaxed mb-8">
            {ind.summary}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Request RFP Review
            </Link>
          </div>
        </div>

        {/* Challenges vs Solutions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Industry Bottlenecks */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-8">
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
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-8">
            <h2 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Architectural Solutions</span>
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

        {/* Feature Modules & Regulatory Standards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              <span>Core Operational Modules</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ind.features.map((feat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="font-bold text-sm text-white">{feat}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Compliance & Trust</span>
              </h3>
              <div className="space-y-3">
                {ind.compliance.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Full security audits, data encryption at rest/transit, and regional jurisdiction compliance guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-10 border-t border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Architecting for {ind.title}?</h3>
          <p className="text-zinc-400 text-sm mb-6">Schedule a dedicated scoping session with our lead architects.</p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
          >
            <span>Book Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
