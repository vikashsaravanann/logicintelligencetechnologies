import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { productsData } from "@/data/productsData";
import { ArrowLeft, Box, CheckCircle2, Cpu, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prod = productsData.find((p) => p.slug === slug);

  if (!prod) {
    return { title: "Product Not Found | Logic Intelligence Technologies" };
  }

  return {
    title: `${prod.name} | Enterprise Platform | Logic Intelligence Technologies`,
    description: prod.description,
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const prod = productsData.find((p) => p.slug === slug);

  if (!prod) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Hero */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              {prod.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              {prod.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-4">
            {prod.name}
          </h1>
          <p className="text-lg text-primary font-semibold mb-6">
            {prod.tagline}
          </p>
          <p className="text-base text-zinc-300 leading-relaxed mb-8">
            {prod.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2"
            >
              <span>Schedule Live Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Request License Terms
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {prod.metrics.map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
              <div className="text-3xl font-black text-primary mb-1">{m.value}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Features & Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Core Features</span>
            </h2>
            <div className="space-y-4">
              {prod.features.map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" />
              <span>Technology Architecture</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {prod.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
