import { Metadata } from "next";
import Link from "next/link";
import { industriesData } from "@/data/industriesData";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Industry Solutions & Vertical Architecture | Logic Intelligence Technologies",
  description: "Specialized software architecture across Healthcare, Education, Retail, Manufacturing, FinTech, and High-Growth Startups.",
};

export default function IndustriesPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Building2 className="w-3.5 h-3.5" />
            <span>Domain-Specific Engineering</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            SOFTWARE TAILORED TO <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">YOUR INDUSTRY</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Every vertical faces distinct compliance, operational, and architectural requirements. We design and deploy high-reliability systems customized for your market.
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industriesData.map((ind) => (
            <div
              key={ind.slug}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {ind.title}
                </h3>
                <p className="text-xs text-primary font-semibold mb-4 tracking-wide uppercase">
                  {ind.subtitle}
                </p>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {ind.summary}
                </p>

                <div className="space-y-2 mb-8">
                  {ind.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/industries/${ind.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-colors"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                  {ind.compliance[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center rounded-3xl border border-white/10 bg-white/[0.02] p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Operating in a Specialized Vertical?
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-8">
            Our engineers have built solutions across logistics, hospitality, government, and aerospace. Contact our solutions desk for a confidential briefing.
          </p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
          >
            <span>Consult Industry Architect</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
