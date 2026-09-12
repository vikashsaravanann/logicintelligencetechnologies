import { Metadata } from "next";
import Link from "next/link";
import { productsData } from "@/data/productsData";
import { ArrowRight, Box, CheckCircle2, Cpu, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Proprietary Software Products | Logic Intelligence Technologies",
  description: "Explore our enterprise AI and automation platforms: OmniPublisher AI, Nexus CRM, and VoiceShield deepfake defense.",
};

export default function ProductsPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-12 left-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Box className="w-3.5 h-3.5" />
            <span>Proprietary Platforms</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            SOFTWARE ENGINEERED FOR <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MAXIMUM ADVANTAGE</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            In addition to custom client engineering, we build and license specialized enterprise software platforms to accelerate business velocity.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {productsData.map((prod) => (
            <div
              key={prod.slug}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Box className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {prod.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {prod.name}
                </h3>
                <p className="text-xs text-primary font-semibold mb-4 tracking-wide uppercase">
                  {prod.tagline}
                </p>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {prod.description}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/5 border border-white/5 mb-6 text-center">
                  {prod.metrics.map((m, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-black text-white">{m.value}</div>
                      <div className="text-[9px] text-zinc-400 uppercase tracking-wider">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-8">
                  {prod.features.slice(0, 3).map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/products/${prod.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-colors"
                >
                  <span>Product Specs</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Book Demo
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
