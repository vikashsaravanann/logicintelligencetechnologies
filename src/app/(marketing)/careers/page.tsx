import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Heart, Sparkles, Target, Users, ShieldCheck, Cpu } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";

export const metadata: Metadata = {
  title: "Careers & Engineering Culture | Logic Intelligence Technologies",
  description: "Explore engineering careers, leadership opportunities, and culture at Logic Intelligence Technologies. Build high-impact AI and enterprise systems in Coimbatore.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers at Logic Intelligence Technologies",
    description: "Join a Coimbatore-based engineering company building production AI, web, and enterprise software. Real equity, direct founder mentorship, and cutting-edge tech.",
    images: [{ url: "/assets/og-banner.png", width: 1200, height: 630, alt: "Careers at Logic Intelligence Technologies" }],
  },
};

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/" label="Back to Home" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-6">
            <Users className="w-3.5 h-3.5" />
            <span>Join Our Engineering & Leadership Cohort</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            BUILD THE FUTURE OF <span className="bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white bg-clip-text text-transparent">INTELLIGENT SYSTEMS</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
            We are a team of full-stack architects, machine learning engineers, and systems builders based in Coimbatore. We prioritize extreme ownership, deterministic code execution, and tangible production outcomes over bureaucracy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shadow-lg"
            >
              <span>View Open Leadership & Engineering Roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/company/facts"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
            >
              <span>Company Fact Sheet</span>
            </Link>
          </div>

          {/* Careers Visual Banner */}
          <div className="max-w-4xl mx-auto aspect-[21/9] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#10131A]">
            <SafeImage
              src="/images/careers/tech-culture.svg"
              alt="LIT Engineering Culture & Careers"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Culture & Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-colors p-8 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#45D9D2] mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Extreme Ownership</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every engineer and functional director owns their domain from architectural specification through continuous deployment, observability, and latency optimization.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-colors p-8 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Production-Grade Stack</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We engineer with Next.js App Router, React 19, TypeScript, PostgreSQL, Python FastAPI, Playwright automation, and real-time speech AI. Zero legacy technical debt.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-colors p-8 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real Equity & Impact</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High-impact contributors earn verifiable equity after corporate registration and direct project revenue-share. We reward technical craftsmanship, rigor, and long-term vision.
            </p>
          </div>
        </div>

        {/* Perks & Benefits */}
        <div className="rounded-2xl border border-white/10 bg-[#10131A] p-8 sm:p-12 mb-20 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              The Engineering Environment
            </h2>
            <p className="text-slate-400 text-sm">
              Engineered to support deep work, continuous learning, and world-class product execution.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Competitive Compensation + Equity Pool",
              "Cutting-Edge Hardware & Dev Tooling",
              "Flexible Hybrid Work in Coimbatore",
              "Direct Collaboration with Founder",
              "Sponsored Engineering Certifications",
              "Rapid Career & Leadership Progression",
            ].map((perk, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-[#151922] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#45D9D2] shrink-0" />
                <span className="text-sm font-medium text-slate-200">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-10 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Build Production AI Systems?</h3>
          <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">Review our current leadership and engineering openings and submit your application directly to the founder.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shadow-lg"
          >
            <span>Explore Open Positions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
