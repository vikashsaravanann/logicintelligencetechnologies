import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { productsData } from "@/data/productsData";
import { ArrowRight, Box, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Terminal, Activity, Layers, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Products & Platforms | Logic Intelligence Technologies",
  description:
    "Explore proprietary AI products and enterprise platforms developed by Logic Intelligence Technologies, including Logic Voice (personal AI assistant) and LIT Healthcare (smart hospital management).",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  const flagshipProducts = productsData.filter(
    (p) => p.slug === "logic-voice" || p.slug === "lit-healthcare"
  );
  const internalSystems = productsData.filter(
    (p) => p.slug !== "logic-voice" && p.slug !== "lit-healthcare"
  );

  return (
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 pt-32 pb-24 overflow-hidden selection:bg-primary selection:text-slate-950">
      <BackToHome href="/" label="Back to Home" />

      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.12),_transparent_70%)] blur-[120px]" />
      <div className="pointer-events-none absolute top-[50%] right-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(21,101,192,0.08),_transparent_70%)] blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Box className="w-3.5 h-3.5" />
            <span>Proprietary Platforms</span>
          </div>
          
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight text-white uppercase leading-[1.05]">
            Engineered <span className="bg-gradient-to-r from-primary via-[#6DE6E0] to-[#1565C0] bg-clip-text text-transparent">AI Systems</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Logic Intelligence Technologies engineers purpose-built software architectures and autonomous intelligence engines.
            Each flagship platform operates with strict safety gates, verifiable audit trails, and modular multi-tenant capability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/products/facts"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10131A] border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
            >
              <span>View Authoritative Product Register</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </div>

        {/* Flagship Products Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-slate-300">
              Flagship Platforms
            </h2>
          </div>

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
                  className="group relative rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-[#151922] border border-white/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/40 transition-all">
                        {isLogicVoice ? <Sparkles className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7 text-primary" />}
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {prod.status}
                      </span>
                    </div>

                    <p className="text-xs text-primary font-mono font-bold tracking-widest uppercase mb-2">
                      {prod.category}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-primary transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-slate-300 mb-6 font-medium leading-relaxed">
                      {prod.tagline}
                    </p>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed font-light">
                      {prod.description}
                    </p>

                    {/* Verified Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#151922] border border-white/5 mb-8 text-center">
                      {prod.metrics.map((m, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="text-sm font-bold text-white font-mono">{m.value}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-3 mb-10">
                      {prod.features.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
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
                        className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-all"
                      >
                        <span>Live Platform</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {gitHubUrl && (
                        <a
                          href={gitHubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#151922] hover:bg-white/10 text-slate-200 font-mono text-xs uppercase tracking-wider transition-colors"
                          title="Verified Repository"
                        >
                          <Terminal className="w-3.5 h-3.5 text-primary" aria-hidden />
                          <span>Code</span>
                        </a>
                      )}
                    </div>

                    <Link
                      href={internalPage}
                      className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors py-2"
                    >
                      <span>Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialized Operational Engines */}
        {internalSystems.length > 0 && (
          <div className="space-y-8 pt-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-slate-300">
                  Operational &amp; Distribution Engines
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">Deterministic Pipeline Architectures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internalSystems.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-3xl border border-white/10 bg-[#10131A] p-8 flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#151922] text-slate-400 border border-white/10">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed font-light">{item.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {item.features.slice(0, 3).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-primary hover:text-[#6DE6E0] font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Platform Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.techStack.slice(0, 3).join(" · ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Conversion Architecture Strip */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10131A] via-[#151922] to-[#10131A] p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            Need Custom Platform Engineering or Architecture Licensing?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Our principal engineering practice licenses proven platform scaffolds and builds custom autonomous workflows for enterprises requiring deterministic execution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/book-consultation"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-all"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Contact Enterprise Sales</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
