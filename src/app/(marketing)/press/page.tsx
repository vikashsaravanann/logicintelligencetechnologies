import React from "react";
import Link from "next/link";
import { Metadata } from "next";
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
  CheckCircle2,
  Building2,
  FileText,
  UserCheck,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Media Kit & Brand Standards | Logic Intelligence Technologies",
  description:
    "The authoritative press and media resource for Logic Intelligence Technologies — verified corporate positioning, clinical design system standards, leadership bios, and downloadable press assets.",
  openGraph: {
    title: "Media Kit & Brand Standards | Logic Intelligence Technologies",
    description:
      "The authoritative press and media resource for Logic Intelligence Technologies — verified corporate positioning, clinical design system standards, leadership bios, and downloadable press assets.",
    type: "website",
    url: "https://www.logicintelligencetechnologies.in/press",
  },
};

const PILLARS = [
  {
    title: "Full-Stack Architecture",
    body: "Next.js App Router · React 19 · TypeScript · PostgreSQL · FastAPI",
    icon: Layers,
    color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    title: "Speech AI & Voice Intelligence",
    body: "Logic Voice OS voice-first speech understanding, sub-150ms latency & streaming audio",
    icon: Cpu,
    color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
  },
  {
    title: "Connected Smart Healthcare",
    body: "LIT Healthcare modular clinical workflows, EHR governance, and hospital automation",
    icon: Building2,
    color: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    title: "Autonomous Process Automation",
    body: "Deterministic headless automation bots executing web workflows at computational speed",
    icon: Cpu,
    color: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
  },
  {
    title: "Deterministic AI Scaffolding",
    body: "Strictly typed schema validation boundaries surrounding probabilistic LLM inference",
    icon: ShieldCheck,
    color: "bg-[#E0F2F1] text-[#00796B] border-[#80CBC4]",
  },
  {
    title: "Engineering-First Leadership",
    body: "Founder writes and reviews production code personally on every client implementation",
    icon: UserCheck,
    color: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
];

const STATS = [
  { k: "Coimbatore, TN", label: "Global Engineering Headquarters", sub: "Tamil Nadu, India" },
  { k: "3 Flagships", label: "Enterprise Platforms", sub: "Healthcare, Logic Voice, Voice Shield" },
  { k: "16 Credentials", label: "Verified Technical Standards", sub: "Cloud, AI & Systems Security" },
  { k: "100%", label: "Deterministic Scaffolding", sub: "Zero Fabricated Claims" },
];

const BRAND_RULES = [
  {
    icon: Palette,
    title: "Clinical Light Surface System",
    body: "Soft Cloud Canvas (#F7F9FC) paired with crisp White (#FFFFFF) surfaces and delicate Slate borders (#DFE7EF). Clean, calm, high-contrast readability without dark slabs.",
  },
  {
    icon: Palette,
    title: "Corporate Brand Accents",
    body: "Deep Navy (#0B2545) for foundational typography, paired with Electric Cyan (#45D9D2) and Clinical Teal (#1FA9A2) for active badges, focus rings, and high-visibility CTAs.",
  },
  {
    icon: Type,
    title: "Typography System",
    body: "Poppins for high-clarity headings and UI elements. Lora italic for editorial slogans and refined quotes. JetBrains Mono for system metrics, terminals, and code snippets.",
  },
  {
    icon: ImageIcon,
    title: "Official Wordmark & Clearspace",
    body: "Render the full name in uppercase: LOGIC INTELLIGENCE TECHNOLOGIES. Maintain proportional clearspace equal to the height of the logomark symbol. Never distort or split.",
  },
];

const COLOR_SWATCHES = [
  { name: "Navy Canvas", hex: "#0B2545", role: "Primary Headings & Text", textColor: "text-white" },
  { name: "Clinical Teal", hex: "#1FA9A2", role: "Brand Accent & Active State", textColor: "text-white" },
  { name: "Electric Cyan", hex: "#45D9D2", role: "High-Contrast Highlight", textColor: "text-slate-900" },
  { name: "Clinical Blue", hex: "#1565C0", role: "Technical & Links", textColor: "text-white" },
  { name: "Soft Lilac", hex: "#EDE7F6", role: "AI Security Badge Surface", textColor: "text-[#5E35B1]" },
  { name: "Cloud White", hex: "#F7F9FC", role: "Canvas Background", textColor: "text-slate-900" },
];

const ASSETS = [
  {
    title: "Brand Book & Visual Standards",
    href: "/resources/brand-book",
    desc: "Official color tokens, typography scales, logo spacing, and accessible contrast standards.",
    format: "PDF Document",
  },
  {
    title: "Company Profile & Executive Brief",
    href: "/resources/company-profile",
    desc: "Corporate background, engineering architecture, and leadership overview.",
    format: "Executive PDF",
  },
  {
    title: "Services & Architecture Brochure",
    href: "/resources/services-brochure",
    desc: "End-to-end engineering, AI systems scaffolding, and automation lifecycle specifications.",
    format: "Technical PDF",
  },
  {
    title: "Website Development QA Checklist",
    href: "/checklist",
    desc: "Five-phase production testing, security gates, and deployment verification framework.",
    format: "Interactive Tool",
  },
];

export default function PressPage() {
  const breadcrumbs = breadcrumb([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Press & Media Kit", path: "/press" },
  ]);

  return (
    <PageShell>
      <JsonLd data={breadcrumbs} />

      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="About Us" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-5 mb-14 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <Newspaper className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Media Kit & Brand Standards</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Press Kit & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Brand Guidelines
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              The authoritative press resource for Logic Intelligence Technologies — verified corporate positioning, clinical design system standards, leadership bios, and downloadable media assets.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${COMPANY.contactEmail}?subject=Media%20Inquiry%20-%20Logic%20Intelligence%20Technologies`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <Mail className="w-4 h-4 text-[#45D9D2]" />
                <span>Contact Press Desk</span>
              </a>
              <Link
                href="/about/founder"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <span>Executive Bio</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {STATS.map((s) => (
              <div
                key={s.k}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
              >
                <div className="text-lg sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                  {s.k}
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{s.label}</div>
                <div className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Boilerplate Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] mb-16 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <Building2 className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                About Logic Intelligence Technologies
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
              <p>
                <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">
                  Logic Intelligence Technologies
                </strong>{" "}
                is a Coimbatore-headquartered technology company engineering production AI architectures, autonomous automation, and secure enterprise web systems. The company architects systems end-to-end — from PostgreSQL relational schemas and FastAPI backends to Next.js App Router frontends — with deterministic scaffolding surrounding every probabilistic LLM inference call.
              </p>
              <p>
                Founder Vikash Saravanan leads product architecture, systems engineering, and client scoping personally. The company delivers flagship platforms — including LIT Healthcare, Logic Voice, and Voice Shield — alongside bespoke enterprise software engineering and published transparent pricing tiers.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                  Official Entity Name
                </span>
                <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                  {COMPANY.legalName}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                  Headquarters
                </span>
                <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                  {COMPANY.address}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                  Official Press Desk
                </span>
                <span className="text-xs font-mono font-medium text-[var(--lit-teal,#1FA9A2)]">
                  {COMPANY.contactEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Core Engineering Pillars */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                  Core Engineering Pillars
                </h2>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                  Key technological principles powering our client engagements and enterprise platforms.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${p.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                      {p.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Identity & Design Tokens */}
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Visual Identity Standards & Design System
              </h2>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                Clinical light tokens, typography rules, and logo clearspace standards.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {BRAND_RULES.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.title}
                    className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mb-4 text-[var(--lit-teal,#1FA9A2)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] mb-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                      {r.body}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Color Swatches Grid */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <span>Primary Color Token Swatches</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {COLOR_SWATCHES.map((swatch) => (
                  <div
                    key={swatch.hex}
                    className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] p-3 text-center overflow-hidden"
                  >
                    <div
                      className={`h-12 w-full rounded-lg mb-2 flex items-center justify-center font-mono text-[11px] font-bold border border-black/5 ${swatch.textColor}`}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {swatch.hex}
                    </div>
                    <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] block">
                      {swatch.name}
                    </span>
                    <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] block mt-0.5">
                      {swatch.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Downloadable Assets */}
          <div id="assets" className="mb-16">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Downloadable Assets & Specifications
              </h2>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                Official documents, brand guidelines, and verification checklists.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {ASSETS.map((a) => (
                <Link key={a.href} href={a.href} className="block group">
                  <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] group-hover:border-[var(--lit-teal,#1FA9A2)]/50 group-hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E7F3FF] text-[#1565C0] border border-[#BBDEFB]">
                          {a.format}
                        </span>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors mb-1.5">
                        {a.title}
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                        {a.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]/60 flex items-center gap-1.5 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)]">
                      <span>View Asset</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Media Desk Direct Inquiries (Clinical Navy Banner) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--lit-navy,#0B2545)] text-white shadow-lg relative overflow-hidden mb-16">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#45D9D2]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#45D9D2]">
                  <Sparkles className="w-4 h-4" />
                  <span>Media Desk & Executive Briefings</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-poppins font-bold text-white">
                  Need High-Resolution Brand Assets or Executive Commentary?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light leading-relaxed">
                  Accredited journalists, research analysts, and conference organizers: our press desk responds within 24 business hours. Direct briefings with Founder Vikash Saravanan can be scheduled upon request.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href={`mailto:${COMPANY.contactEmail}?subject=Press%20Inquiry%20-%20Logic%20Intelligence%20Technologies`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#198f89] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Press Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Connect with Our Corporate Team"
            subtitle="Explore the products we engineer or schedule an executive consultation with our leadership desk."
            primaryCta={{ label: "Contact Us", href: "/contact" }}
            secondaryCta={{ label: "Explore Products", href: "/products" }}
          />
        </div>
      </main>
    </PageShell>
  );
}
