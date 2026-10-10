"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Newspaper,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { GlassSurface } from "@/components/ui/glass-surface";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

const PILLARS = [
  { title: "Full-Stack Architecture", body: "Next.js App Router · React 19 · TypeScript · PostgreSQL · FastAPI" },
  { title: "Speech AI & Voice Intelligence", body: "Logic Voice OS voice-first speech understanding & planning" },
  { title: "Connected Smart Healthcare", body: "LIT Healthcare modular clinical workflows and hospital automation" },
  { title: "Autonomous Process Automation", body: "Playwright headless bots executing at computational speed" },
  { title: "Deterministic AI Scaffolding", body: "Strictly typed boundaries around probabilistic LLM inference" },
  { title: "Engineering-First Leadership", body: "Founder writes production code personally on every client project" },
];

const STATS = [
  { k: "Flagship", v: "Enterprise Platforms (Healthcare, Logic Voice, Voice Shield)" },
  { k: "16", v: "Verified Engineering Credentials & Certifications" },
  { k: "100%", v: "Deterministic Scaffolding & Zero Fabricated Numbers" },
];

const BRAND_RULES = [
  { icon: Palette, title: "Primary Background", body: "Charcoal Dark Neutral #07090D with #10131A elevated surfaces and #151922 cards. Never saturated dark blue or flat templates." },
  { icon: Palette, title: "Brand Accent", body: "Electric Cyan #45D9D2 for CTAs, active badges, and focus rings — balanced with deep slate typography." },
  { icon: Type, title: "Typography System", body: "Space Grotesk / Inter for headlines and high-clarity UI. JetBrains Mono for system metrics, terminals, and code." },
  { icon: ImageIcon, title: "Official Logo & Wordmark", body: "Render full company name on one single line: LOGIC INTELLIGENCE TECHNOLOGIES. Never distort or split across lines." },
];

const ASSETS = [
  { title: "Brand Book & Visual Standards", href: "/resources/brand-book", desc: "Official typography, color tokens, and logo guidelines" },
  { title: "Company Profile & Executive Brief", href: "/resources/company-profile", desc: "Corporate background and engineering capabilities" },
  { title: "Services Brochure", href: "/resources/services-brochure", desc: "End-to-end engineering, AI systems, and automation lifecycle" },
  { title: "Website Development QA Checklist", href: "/checklist", desc: "Five-phase production testing and verification framework" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-white pt-24">
      <BackToHome />
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/jobs/studio-hero.jpg" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 text-[#45D9D2] text-xs font-bold uppercase tracking-widest mb-6"
            >
              Media Kit & Brand Standards
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
            >
              Press Kit &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">
                Brand Guidelines
              </span>
            </motion.h1>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              The authoritative media resource for Logic Intelligence Technologies — corporate positioning, design tokens, and verified press assets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {PILLARS.map((p) => (
              <div key={p.title} className="p-5 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
                <h3 className="text-sm font-bold text-white mb-1.5">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
            {STATS.map((s) => (
              <div key={s.k} className="p-6 rounded-2xl border border-white/10 bg-[#10131A] text-center shadow-xl">
                <div className="text-2xl md:text-3xl font-black text-[#45D9D2]">{s.k}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-[#45D9D2]" />
              <h2 className="text-xl font-bold text-white">About Logic Intelligence Technologies</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Logic Intelligence Technologies is a Coimbatore-headquartered technology company engineering production AI architectures, autonomous automation, and secure enterprise web systems. The company architects systems end-to-end — from PostgreSQL schemas and FastAPI backends to Next.js App Router frontends — with deterministic scaffolding around every LLM inference call.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Founder Vikash Saravanan leads product architecture, systems engineering, and client scoping personally. The company delivers flagship platforms — including LIT Healthcare, Logic Voice, and Voice Shield — alongside custom enterprise software and published pricing models.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Visual Identity Standards</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {BRAND_RULES.map((r) => (
              <div key={r.title} className="p-6 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl">
                <r.icon className="w-5 h-5 text-[#45D9D2] mb-3" />
                <h3 className="text-sm font-bold text-white mb-1.5">{r.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Downloadable Assets & Specifications</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {ASSETS.map((a) => (
              <Link key={a.href} href={a.href} className="block group">
                <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-all group-hover:border-cyan-500/30 h-full shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#45D9D2] transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-xs text-slate-400">{a.desc}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-[#45D9D2] shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-[#10131A] shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Media Inquiries & Direct Briefings</h3>
                <p className="text-xs text-slate-400">
                  Accredited press and industry analysts — we respond within 24 business hours.
                </p>
              </div>
              <a
                href={`mailto:${COMPANY.email}?subject=Media%20Inquiry%20-%20Logic%20Intelligence%20Technologies`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-xs uppercase tracking-wider hover:bg-[#45D9D2]/90 transition-all shrink-0 shadow-lg"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Press Desk</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12">
        <CTASection
          title="Connect with Our Corporate Team"
          subtitle="Explore the products we engineer or schedule an executive consultation."
          primaryCta={{ label: "Contact us", href: "/contact" }}
          secondaryCta={{ label: "Explore products", href: "/products" }}
        />
      </div>
    </div>
  );
}
