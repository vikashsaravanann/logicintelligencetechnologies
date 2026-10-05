"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { GlassSurface } from "@/components/ui/glass-surface";
import { COMPANY } from "@/config/company";

const PILLARS = [
  { title: "Full-Stack Engineering", body: "Next.js · React · TypeScript · FastAPI · PostgreSQL" },
  { title: "Autonomous AI Workflows", body: "LLM orchestration · RAG pipelines · MCP systems" },
  { title: "Robotic Process Automation", body: "Playwright headless bots at computational speed" },
  { title: "Transparent Pricing", body: "Published rates. Free working prototype before any payment commitment." },
  { title: "Engineering-First Culture", body: "The founder writes production code personally on every client project." },
  { title: "Deterministic AI", body: "Strictly typed scaffolding enforced around every probabilistic LLM call." },
];

const STATS = [
  { k: "8+", v: "Platforms — omni-channel publishing" },
  { k: "100%", v: "Custom-built — no template UI" },
  { k: "₹8,999+", v: "Digital Launch starting floor" },
];

const BRAND_RULES = [
  { icon: Palette, title: "Primary background", body: "Deep Navy #0D1B3E. Never flat white, pastel, or undefined gradients in LIT materials." },
  { icon: Palette, title: "Accent", body: "Electric Cyan #45D9D2 for CTAs, active links, and emphasis — max ~20% of any composition." },
  { icon: Type, title: "Typography", body: "Space Grotesk / Inter for headings and UI. JetBrains Mono or Fira Code for code and terminal." },
  { icon: ImageIcon, title: "Logo usage", body: "High-resolution SVG only. Clear space ≥ 50% of logo height. Never distort, recolour, or add effects." },
];

const ASSETS = [
  { title: "Press Kit PDF", href: "/resources/press-kit.pdf", desc: "Media biography & visual identity standards" },
  { title: "Brand Book", href: "/resources/brand-book.pdf", desc: "Extended brand reference" },
  { title: "Company Profile", href: "/resources/company-profile.pdf", desc: "Capability overview for partners and media" },
  { title: "Website Development Checklist", href: "/resources/website-development-checklist.pdf", desc: "Five-phase production QA framework" },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24">
      <BackToHome />
      <section className="relative py-16 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/jobs/studio-hero.jpg" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              Media Biography & Visual Identity
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
            >
              Press Kit &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Brand Guidelines
              </span>
            </motion.h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
              The definitive LIT media resource — positioning, visual standards, and downloadable assets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {PILLARS.map((p) => (
              <GlassSurface key={p.title} variant="card" className="p-5">
                <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.body}</p>
              </GlassSurface>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-14">
            {STATS.map((s) => (
              <GlassSurface key={s.k} variant="strong" className="p-5 text-center">
                <div className="text-2xl md:text-3xl font-black text-primary">{s.k}</div>
                <div className="text-xs text-zinc-400 mt-1">{s.v}</div>
              </GlassSurface>
            ))}
          </div>

          <GlassSurface variant="surface" className="p-6 md:p-8 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">About Logic Intelligence Technologies</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Logic Intelligence Technologies is a Coimbatore-based production studio for full-stack,
              AI-enabled applications and agentic automation. We architect systems end-to-end — from
              PostgreSQL and FastAPI backends to Next.js frontends — with deterministic scaffolding
              around every LLM call.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Founder Vikash Saravanan leads product, AI architecture, and final scoping. The company
              publishes transparent package floors, ships scoped software (not slogans), and operates
              an engineering-first culture on every client engagement.
            </p>
          </GlassSurface>

          <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Visual identity standards</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {BRAND_RULES.map((r) => (
              <GlassSurface key={r.title} variant="card" className="p-5">
                <r.icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">{r.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{r.body}</p>
              </GlassSurface>
            ))}
          </div>

          <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Downloadable assets</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {ASSETS.map((a) => (
              <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer" className="block group">
                <GlassSurface variant="panel" className="p-5 h-full transition group-hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-xs text-zinc-400">{a.desc}</p>
                    </div>
                    <Download className="w-4 h-4 text-zinc-500 group-hover:text-primary shrink-0" />
                  </div>
                </GlassSurface>
              </a>
            ))}
          </div>

          <GlassSurface variant="strong" className="p-6 md:p-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Media inquiries & interview requests</h3>
                <p className="text-xs text-zinc-400">
                  Accredited journalists — we aim to respond within 24 business hours.
                </p>
              </div>
              <a
                href={`mailto:${COMPANY.email}?subject=Media%20Inquiry%20-%20Logic%20Intelligence%20Technologies`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all shrink-0"
              >
                <Mail className="w-4 h-4 text-primary" />
                Contact Press Desk
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </GlassSurface>

          <p className="text-center text-xs text-zinc-500 mt-10 tracking-wide">
            Logic Intelligence Technologies · Vikash Saravanan · Coimbatore ·{" "}
            {(COMPANY.websiteUrl || "https://www.logicintelligencetechnologies.in").replace(/^https?:\/\//, "")}
          </p>
        </div>
      </section>
    </main>
  );
}
