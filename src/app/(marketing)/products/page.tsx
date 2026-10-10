import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { productsData } from "@/data/productsData";
import { ArrowRight, Box, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Products | Logic Intelligence Technologies",
  description:
    "Explore intelligent AI products and platforms by Logic Intelligence Technologies, including Logic Voice (personal AI assistant) and LIT Healthcare (smart hospital & clinical intelligence platform).",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  const flagshipProducts = productsData.filter(
    (p) => p.slug === "logic-voice" || p.slug === "lit-healthcare"
  );
  const otherSystems = productsData.filter(
    (p) => p.slug !== "logic-voice" && p.slug !== "lit-healthcare"
  );

  return (
    <div className="relative min-h-screen bg-[#0A1530] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/" label="Back to Home" />

      {/* Glow Effect */}
      <div className="absolute top-12 left-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Box className="w-3.5 h-3.5" />
            <span>Products by Logic Intelligence Technologies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 uppercase">
            FLAGSHIP <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI PRODUCTS</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Logic Intelligence Technologies develops intelligent AI products and automation solutions.
            Our flagship platforms operate with dedicated architectures and specialized missions.
          </p>
        </div>

        {/* Flagship Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {flagshipProducts.map((prod) => {
            const isLogicVoice = prod.slug === "logic-voice";
            const liveUrl = isLogicVoice
              ? "https://logicvoice.logicintelligencetechnologies.in/"
              : "https://healthcare.logicintelligencetechnologies.in/";
            const gitHubUrl = isLogicVoice ? null : "https://github.com/vikashsaravanann/lit-smart-hospital-platform";
            const internalPage = isLogicVoice ? "/products/logic-voice" : "/healthcare";

            return (
              <div
                key={prod.slug}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {isLogicVoice ? <Sparkles className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {prod.status}
                    </span>
                  </div>

                  <p className="text-xs text-primary font-bold tracking-widest uppercase mb-2">
                    {prod.category}
                  </p>
                  <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {prod.name}
                  </h2>
                  <p className="text-sm text-zinc-300 mb-6 font-medium leading-relaxed">
                    {prod.tagline}
                  </p>
                  <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5 mb-8 text-center">
                    {prod.metrics.map((m, idx) => (
                      <div key={idx}>
                        <div className="text-sm font-bold text-white">{m.value}</div>
                        <div className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {prod.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
                    >
                      <span>Live Product</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {gitHubUrl && (
                      <a
                        href={gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 font-mono text-xs uppercase tracking-wider transition-colors"
                        title="GitHub Repository"
                      >
                        <Terminal className="w-3.5 h-3.5 text-primary" aria-hidden />
                        <span>Code</span>
                      </a>
                    )}
                  </div>

                  <Link
                    href={internalPage}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    <span>Product Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other Platform Systems */}
        {otherSystems.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/10">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                Internal Automation Systems &amp; Infrastructure
              </h2>
              <p className="text-xs text-zinc-400 mt-2">
                Operational engines developed by Logic Intelligence Technologies for automated workflows and operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherSystems.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {item.category}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Specifications</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {item.techStack.slice(0, 2).join(" · ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
