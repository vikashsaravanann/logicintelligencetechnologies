import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { industriesData, getIndustryVisual } from "@/data/industriesData";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles, Cpu } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Industry Solutions & Vertical Architecture | Logic Intelligence Technologies",
  description: "Specialized software architecture across Healthcare, Education, Retail, Manufacturing, FinTech, and High-Growth Startups.",
};

export default function IndustriesPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/" label="Back to Home" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-6">
            <Building2 className="w-3.5 h-3.5" />
            <span>Domain-Specific Vertical Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            SOFTWARE TAILORED TO <span className="bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white bg-clip-text text-transparent">YOUR INDUSTRY</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Every vertical faces distinct compliance, operational, and architectural requirements. We design and deploy high-reliability systems customized for your market.
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {industriesData.map((ind) => (
            <div
              key={ind.slug}
              className="group rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-all duration-300 hover:border-cyan-500/40 p-6 sm:p-7 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 bg-[#151922]">
                  <SafeImage
                    src={getIndustryVisual(ind.slug)}
                    alt={`${ind.title} — professional industry visual`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10131A] via-transparent to-transparent opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-[#45D9D2] transition-colors leading-snug">
                  {ind.title}
                </h3>
                <p className="text-[11px] font-mono text-[#45D9D2] font-semibold mb-3 tracking-wider uppercase">
                  {ind.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                  {ind.summary}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                  {ind.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#45D9D2] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/industries/${ind.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#45D9D2] transition-colors"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#151922] text-[#45D9D2] border border-white/10">
                  {ind.compliance[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Industry Consultation Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#10131A] p-8 sm:p-12 text-center shadow-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Specialized Vertical Engineering
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Operating in a Specialized or Regulated Vertical?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Our engineers build solutions across healthcare, manufacturing, fintech, and education. Contact our systems team for a confidential architectural review.
          </p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shadow-lg"
          >
            <span>Consult Vertical Architect</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CTASection
          title="Ready to Build for Your Domain?"
          subtitle="Explore the live products we have engineered or book a dedicated technical roadmap session."
          primaryCta={{ label: "Schedule Consultation", href: "/book-consultation" }}
          secondaryCta={{ label: "Explore Products", href: "/products" }}
        />
      </div>
    </div>
  );
}
