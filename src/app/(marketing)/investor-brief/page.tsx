import React from "react";
import { TrendingUp, BarChart3, Download, LineChart, Target, Rocket, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { COMPANY } from "@/config/company";
import BackToHome from "@/components/ui/back-to-home";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Executive Investor Brief | Logic Intelligence Technologies",
  description: "Operating performance, architectural positioning, and product roadmaps for Logic Intelligence Technologies.",
};

export default function InvestorBriefPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 selection:bg-cyan-500 selection:text-black pt-28 pb-20">
      <BackToHome />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-14 space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#45D9D2] uppercase">
              Operating Briefing
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            Architectural Vision & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">Performance</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {COMPANY.displayName} is expanding its footprint in enterprise intelligent systems through three core production architectures: LIT Healthcare, Logic Voice OS, and Voice Shield real-time acoustic threat firewall.
          </p>
        </div>

        {/* Real Engineering Metrics Grid (No Fabricated ARR/Deployments) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
            <ShieldCheck className="w-5 h-5 text-[#45D9D2] mb-3" />
            <div className="text-3xl font-bold text-white mb-1">16</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Credentials</div>
            <p className="text-[11px] text-slate-400 mt-2">Executive accreditations in ML, cloud, & architecture</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
            <Target className="w-5 h-5 text-[#45D9D2] mb-3" />
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Deterministic Scaffolding</div>
            <p className="text-[11px] text-slate-400 mt-2">Strictly typed guards around probabilistic inference</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
            <Rocket className="w-5 h-5 text-[#45D9D2] mb-3" />
            <div className="text-3xl font-bold text-white mb-1">3</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flagship Platforms</div>
            <p className="text-[11px] text-slate-400 mt-2">LIT Healthcare, Logic Voice, and Voice Shield</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
            <LineChart className="w-5 h-5 text-[#45D9D2] mb-3" />
            <div className="text-3xl font-bold text-white mb-1">&lt;150ms</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Target Edge Latency</div>
            <p className="text-[11px] text-slate-400 mt-2">Speech recognition & streaming synthesis pipeline</p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Main Text Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-8 shadow-xl">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-6 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-[#45D9D2]" />
                Market Positioning & Product Strategy
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  The rapid evolution of generative AI presents both unprecedented enterprise opportunities and severe security challenges. Voice-based attack vectors and synthetic media make legacy biometric systems vulnerable.
                </p>
                <p>
                  In response, our <strong className="text-white">Voice Shield</strong> architecture provides sub-15ms real-time acoustic threat firewalling, synthetic voice detection, and telephony biometrics with zero persistent voice retention.
                </p>
                <p>
                  Simultaneously, the <strong className="text-white">LIT Healthcare</strong> platform provides hospital networks with an enterprise-grade smart clinical operating system. By combining multi-tenant data governance with modular clinical workflows, we provide healthcare systems with mathematically reliable, auditable automation.
                </p>
                <p>
                  Finally, <strong className="text-white">Logic Voice</strong> is advancing towards a personal AI operating system capable of deterministic multi-step planning, multimodal context awareness, and verified tool execution.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3">Capital & Governance Stance</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Logic Intelligence Technologies remains an independent, bootstrapped engineering entity. We do not engage in speculative valuation inflation. Prospective enterprise partners and strategic investors are invited to inspect our production codebases, architecture RFCs, and test suites directly.
              </p>
            </div>
          </div>

          {/* Sidebar / Downloads */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-6 shadow-xl">
              <h3 className="text-sm font-bold tracking-wider text-[#45D9D2] uppercase mb-4">
                Verified Documents
              </h3>
              
              <div className="space-y-3">
                <Link
                  href="/resources/company-profile"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#151922] border border-white/5 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs font-bold text-white uppercase mb-0.5 group-hover:text-[#45D9D2] transition-colors">Company Profile</div>
                    <div className="text-[10px] text-slate-400">PDF Document • Public</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-[#45D9D2] transition-colors" />
                </Link>
                
                <Link
                  href="/resources/services-brochure"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#151922] border border-white/5 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs font-bold text-white uppercase mb-0.5 group-hover:text-[#45D9D2] transition-colors">Services Brochure</div>
                    <div className="text-[10px] text-slate-400">PDF Document • Public</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-[#45D9D2] transition-colors" />
                </Link>

                <Link
                  href="/resources/brand-book"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#151922] border border-white/5 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs font-bold text-white uppercase mb-0.5 group-hover:text-[#45D9D2] transition-colors">Brand Standards</div>
                    <div className="text-[10px] text-slate-400">PDF Document • Public</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-[#45D9D2] transition-colors" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-6 text-center shadow-xl">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                For strategic briefings, partnership inquiries, or to schedule a direct working session with the founder:
              </p>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-xs uppercase tracking-wider hover:bg-[#45D9D2]/90 transition-colors shadow-lg"
              >
                <span>Contact Executive Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        <CTASection
          title="Inspect the Live Platforms"
          subtitle="Explore the live deployments of LIT Healthcare, Logic Voice, and Voice Shield."
          primaryCta={{ label: "View Products", href: "/products" }}
          secondaryCta={{ label: "Technical Architecture", href: "/architecture" }}
        />
      </div>
    </div>
  );
}
