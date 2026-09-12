import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Heart, Sparkles, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers & Life at Logic Intelligence Technologies",
  description: "Explore engineering careers, leadership opportunities, and culture at Logic Intelligence Technologies. Build high-impact AI and enterprise systems.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Users className="w-3.5 h-3.5" />
            <span>Join Our Engineering & Leadership Team</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            BUILD THE FUTURE OF <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">INTELLIGENT SYSTEMS</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            We are a team of relentless full-stack architects, machine learning engineers, and product builders based in Coimbatore. We prioritize ownership, production excellence, and tangible business impact over corporate bureaucracy.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
            >
              <span>View Open Leadership & Engineering Roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Culture & Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Extreme Ownership</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every engineer and leader owns their domain from initial requirements through deployment, observability, and performance optimization.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Modern Tech First</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We build with Next.js, React 19, TypeScript, Supabase, Tailwind CSS, PostgreSQL, and cutting-edge GenAI models. Zero legacy baggage.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real Equity & Impact</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              High-impact contributors earn real equity and direct revenue-share. We reward results, craftsmanship, and long-term vision.
            </p>
          </div>
        </div>

        {/* Perks & Benefits */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 lg:p-16 mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center uppercase tracking-tight">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Competitive Compensation + Equity Pool",
              "Cutting-Edge Hardware & Dev Tooling",
              "Flexible Hybrid Work Environment",
              "Direct Mentorship with Company Founder",
              "Paid Conference & Skill Certifications",
              "Rapid Career & Leadership Progression",
            ].map((perk, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-zinc-200">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Make an Impact?</h3>
          <p className="text-zinc-400 text-sm mb-8">Review current openings and submit your portfolio directly.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
          >
            <span>Explore Open Positions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
