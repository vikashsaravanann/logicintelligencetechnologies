import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, CheckCircle2, Cpu, FileText, AlertCircle } from "lucide-react";
import PageBackdrop from "@/components/ui/page-backdrop";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Investor Operating Briefing | Logic Intelligence Technologies",
  description:
    "Authoritative operating update for Logic Intelligence Technologies. Bootstrapped, production-first engineering studio in Coimbatore.",
};

const points = [
  {
    t: "Capital Posture: Not Raising",
    d: "This briefing is an authentic operating status update. There is no priced funding round open, no broker syndicate, and no speculative partnership programme."
  },
  {
    t: "What is Live in Production",
    d: "LIT Healthcare platform, Logic Voice AI OS, Voice Shield acoustic defense firewall, the corporate portal, and client delivery pipelines. Working prototypes first; source code on complete delivery."
  },
  {
    t: "Transparent Commercial Floors",
    d: "Digital Launch from ₹8,999. Business Pro Pack from ₹18,999. Custom enterprise software and RAG architectures from ₹50,000. Scope and pricing are published and never invented on calls."
  },
  {
    t: "Operating Model & Unit Economics",
    d: "Project cash flows today, transitioning into production SLAs and recurring platform retainers post-launch. Zero speculative burn rate."
  },
  {
    t: "Authentic Verification Policy",
    d: "We do not publish fabricated traction metrics or unverified logos. Invoices, live telemetry, and customer testimonials are published only with complete client verification."
  },
  {
    t: "Governance & Leadership Seats",
    d: "CEO and Director openings are operational leadership appointments with 6-month letters of intent and four-year vesting. Investment is separate from executive employment."
  },
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-white pt-28 sm:pt-32 pb-20">
      <section className="relative px-4 sm:px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/investors_bg.jpg" />
        <div className="relative z-10 max-w-4xl mx-auto text-center pb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Corporate Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
            INVESTOR OPERATING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">BRIEFING</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Logic Intelligence Technologies. Coimbatore technology company. Founder Vikash Saravanan. Production architecture, verifiable engineering, and disciplined unit economics.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Current Status: Bootstrapped · Not Actively Raising
          </div>
        </div>
      </section>

      {/* Operating Points Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-6 pb-16">
        {points.map((p) => (
          <article key={p.t} className="rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-colors p-6 sm:p-7 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#45D9D2] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#45D9D2]" />
                {p.t}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">{p.d}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Production Systems Actions */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center pb-20">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Inspect Production Architecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/healthcare"
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-xs uppercase tracking-wider text-[#07090D] bg-[#45D9D2] hover:bg-[#45D9D2]/90 transition-all shadow-lg"
          >
            LIT Healthcare <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products/logic-voice"
            className="inline-flex items-center justify-center h-12 rounded-xl font-bold text-xs uppercase tracking-wider text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
          >
            Logic Voice OS
          </Link>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — I read the investor operating briefing.")}`}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-xs uppercase tracking-wider text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4 text-[#45D9D2]" /> WhatsApp
          </a>
        </div>
      </section>

      <CTASection
        title="Explore our Enterprise Architecture"
        subtitle="Review our published system designs, security documentation, and leadership structure."
        primaryCta={{ label: "View Architecture", href: "/architecture" }}
        secondaryCta={{ label: "Company Fact Sheet", href: "/company/facts" }}
      />
    </div>
  );
}
