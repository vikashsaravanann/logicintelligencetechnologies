import { Metadata } from "next";
import Link from "next/link";
import { servicesData } from "@/data/servicesData";
import { ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Engineering & AI Services | Logic Intelligence Technologies",
  description: "Comprehensive software engineering services: Full-Stack Web Development, AI Integration, Cloud Systems, Custom ERP, and Mobile Applications.",
};

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full-Stack & Intelligent Systems</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            ENGINEERING EXCELLENCE FOR <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ENTERPRISE GROWTH</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            From bespoke full-stack applications and AI-driven workflows to high-throughput cloud infrastructure—we architect software that scales without limits.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((svc) => (
            <div
              key={svc.slug}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {svc.title}
                </h3>
                <p className="text-xs text-primary font-semibold mb-4 tracking-wide uppercase">
                  {svc.subtitle}
                </p>
                <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                  {svc.description}
                </p>

                {svc.whatWeBuild && svc.whatWeBuild.length > 0 && (
                  <div className="space-y-2 mb-8">
                    {svc.whatWeBuild.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-colors"
                >
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Book Call
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA Banner */}
        <div className="mt-24 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-white/[0.02] to-accent/10 p-10 lg:p-16 text-center relative overflow-hidden">
          <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mb-4">
            Need a Custom Architecture or Scalable System?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Book a dedicated technical discovery session with our software architects. We analyze your requirements and deliver a structured technical roadmap within 48 hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book-consultation"
              className="px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Submit Project Inquiry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
