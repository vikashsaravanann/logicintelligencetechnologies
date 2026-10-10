import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import {
  Building2,
  User,
  MapPin,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Company Facts | Logic Intelligence Technologies",
  description:
    "Authoritative public fact sheet for Logic Intelligence Technologies — corporate identity, leadership, products, and contact details.",
};

export default function CompanyFactsPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--lit-ink)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <div className="max-w-5xl mx-auto space-y-12">
        <BackToHome />

        {/* Header */}
        <div className="space-y-4 border-b border-[#DFE7EF] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>Authoritative Public Record</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[var(--lit-ink)] tracking-tight">
            Company Fact Sheet
          </h1>
          <p className="text-[var(--lit-text-muted)] text-base sm:text-lg max-w-3xl leading-relaxed">
            Verified reference information for Logic Intelligence Technologies — legal identity, executive leadership, flagship AI architectures, and official communication channels.
          </p>
        </div>

        {/* Corporate Identity */}
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold text-[var(--lit-ink)] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[var(--lit-blue)]">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Corporate Identity</span>
          </h2>
          <div className="bg-[#F7F9FC] border border-[#DFE7EF] rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xs">
            <div className="bg-white p-4 rounded-xl border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">
                Legal / Display Name
              </p>
              <p className="text-base text-[var(--lit-ink)] font-bold mt-1">{COMPANY.legalName}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">
                Company Classification
              </p>
              <p className="text-base text-[var(--lit-ink)] font-bold mt-1">{COMPANY.entityLabel}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">
                Engineering Headquarters
              </p>
              <p className="text-base text-[var(--lit-ink)] font-bold mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#1FA9A2]" />
                {COMPANY.location.city}, {COMPANY.location.state}, {COMPANY.location.country}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">
                Canonical Corporate URL
              </p>
              <a
                href={COMPANY.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-[var(--lit-blue)] hover:text-[#1FA9A2] font-semibold mt-1 flex items-center gap-1.5 hover:underline"
              >
                <Globe className="w-4 h-4" /> {COMPANY.websiteUrl}
              </a>
            </div>
            <div className="sm:col-span-2 p-5 bg-white rounded-xl border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">
                Mission &amp; Core Focus
              </p>
              <p className="text-sm sm:text-base text-slate-700 mt-1.5 leading-relaxed">
                Logic Intelligence Technologies is a deep-tech engineering and AI systems company developing production artificial intelligence architectures, enterprise automation, and secure speech intelligence solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold text-[var(--lit-ink)] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F1ECFF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
              <User className="w-4 h-4" />
            </span>
            <span>Leadership</span>
          </h2>
          <div className="bg-[#F7F9FC] border border-[#DFE7EF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--lit-blue)] uppercase tracking-wider font-mono font-bold">
                  Founder &amp; Chief Executive Officer
                </p>
                <p className="text-2xl text-[var(--lit-ink)] font-display font-extrabold mt-1">{FOUNDER.name}</p>
                <p className="text-sm text-[var(--lit-text-muted)] mt-0.5">{FOUNDER.title}, Logic Intelligence Technologies</p>
              </div>
              <Link
                href="/about/founder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#E7F3FF] border border-[#DFE7EF] text-sm font-semibold text-[var(--lit-ink)] transition-all shadow-2xs w-fit"
              >
                <span>Full Executive Profile</span>
                <ArrowRight className="w-4 h-4 text-[var(--lit-blue)]" />
              </Link>
            </div>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted)] leading-relaxed bg-white p-5 rounded-xl border border-[#DFE7EF]">
              {FOUNDER.shortBio}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-white border border-[#DFE7EF] text-xs font-mono font-semibold text-slate-700">
                16 Verified Credentials
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white border border-[#DFE7EF] text-xs font-mono font-semibold text-slate-700">
                Full-Stack Architecture
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white border border-[#DFE7EF] text-xs font-mono font-semibold text-slate-700">
                Autonomous AI Systems
              </span>
            </div>
          </div>
        </section>

        {/* Launched Flagship Products (3 Products) */}
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold text-[var(--lit-ink)] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <Cpu className="w-4 h-4" />
            </span>
            <span>Flagship Launched Products</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LIT Healthcare */}
            <div className="bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xs hover:shadow-lg">
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] inline-block">
                  Flagship Healthcare Platform
                </span>
                <h3 className="text-xl font-display font-bold text-[var(--lit-ink)] group-hover:text-[#1FA9A2] transition-colors">
                  LIT Healthcare
                </h3>
                <p className="text-xs text-[#059669] font-mono font-bold uppercase tracking-wider">
                  Connected Healthcare. Intelligent Decisions.
                </p>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted)] leading-relaxed">
                  Enterprise smart hospital operating system and clinical intelligence platform delivering modular clinical workflows, multi-tenant governance, and automated patient telemetry.
                </p>
              </div>
              <div className="pt-4 border-t border-[#DFE7EF] flex items-center justify-between">
                <Link href="/healthcare" className="text-xs text-[var(--lit-blue)] font-bold hover:underline flex items-center gap-1">
                  Platform Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://healthcare.logicintelligencetechnologies.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-500 hover:text-[var(--lit-blue)] flex items-center gap-1 font-mono"
                >
                  Live Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Logic Voice */}
            <div className="bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xs hover:shadow-lg">
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#E7F3FF] text-[#1565C0] border border-[#BFDBFE] inline-block">
                  Autonomous Speech AI
                </span>
                <h3 className="text-xl font-display font-bold text-[var(--lit-ink)] group-hover:text-[var(--lit-blue)] transition-colors">
                  Logic Voice
                </h3>
                <p className="text-xs text-[var(--lit-blue)] font-mono font-bold uppercase tracking-wider">
                  Voice-First Personal AI Operating System
                </p>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted)] leading-relaxed">
                  Next-generation voice-first personal AI assistant engineered with real-time speech recognition, autonomous planning, deterministic reasoning, and tool execution.
                </p>
              </div>
              <div className="pt-4 border-t border-[#DFE7EF] flex items-center justify-between">
                <Link href="/products/logic-voice" className="text-xs text-[var(--lit-blue)] font-bold hover:underline flex items-center gap-1">
                  Architecture Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://logicvoice.logicintelligencetechnologies.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-500 hover:text-[var(--lit-blue)] flex items-center gap-1 font-mono"
                >
                  Launch App <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Voice Shield */}
            <div className="bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xs hover:shadow-lg">
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#F1ECFF] text-[#7C3AED] border border-[#DDD6FE] inline-block">
                  AI Biometrics &amp; Security
                </span>
                <h3 className="text-xl font-display font-bold text-[var(--lit-ink)] group-hover:text-[#7C3AED] transition-colors">
                  Voice Shield
                </h3>
                <p className="text-xs text-[#7C3AED] font-mono font-bold uppercase tracking-wider">
                  Real-Time Audio Defense &amp; Deepfake Intercept
                </p>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted)] leading-relaxed">
                  Enterprise real-time audio security firewall and voice biometric verification engine engineered to defend contact centers, SIP trunking, and telephony workflows from synthetic voice clones.
                </p>
              </div>
              <div className="pt-4 border-t border-[#DFE7EF] flex items-center justify-between">
                <Link href="/voice-shield" className="text-xs text-[var(--lit-blue)] font-bold hover:underline flex items-center gap-1">
                  Product Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/voice-shield" className="text-[11px] text-slate-500 hover:text-[var(--lit-blue)] flex items-center gap-1 font-mono">
                  Security Specs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Official Contact Channels */}
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold text-[var(--lit-ink)] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#FFF4D9] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
              <Mail className="w-4 h-4" />
            </span>
            <span>Official Communications Channels</span>
          </h2>
          <div className="bg-[#F7F9FC] border border-[#DFE7EF] rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xs">
            <div className="p-4 rounded-xl bg-white border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">General Enquiries</p>
              <a href={`mailto:${COMPANY.email}`} className="text-sm text-[var(--lit-blue)] font-mono font-bold hover:underline mt-1 block">
                {COMPANY.email}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">Enterprise &amp; Commercial Engagements</p>
              <a href={`mailto:${COMPANY.contactEmail}`} className="text-sm text-[var(--lit-blue)] font-mono font-bold hover:underline mt-1 block">
                {COMPANY.contactEmail}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">Client Systems &amp; Support</p>
              <a href={`mailto:${COMPANY.supportEmail}`} className="text-sm text-[var(--lit-blue)] font-mono font-bold hover:underline mt-1 block">
                {COMPANY.supportEmail}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE7EF]">
              <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">Executive &amp; Corporate Administration</p>
              <a href={`mailto:${COMPANY.adminEmail}`} className="text-sm text-[var(--lit-blue)] font-mono font-bold hover:underline mt-1 block">
                {COMPANY.adminEmail}
              </a>
            </div>
            <div className="sm:col-span-2 p-5 bg-white rounded-xl border border-[#DFE7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--lit-text-muted)] uppercase tracking-wider font-mono font-semibold">Direct Telephone &amp; WhatsApp</p>
                <a href={`tel:${COMPANY.phone}`} className="text-base text-[var(--lit-ink)] font-bold hover:text-[var(--lit-blue)] flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-[#1FA9A2]" /> {COMPANY.phone}
                </a>
              </div>
              <Link
                href="/contact"
                className="lit-btn lit-btn-primary lit-btn-md inline-flex items-center gap-2"
              >
                <span>Initiate Direct Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16">
        <CTASection
          title="Work with Logic Intelligence Technologies"
          subtitle="Talk to us about an enterprise architecture, or explore the production platforms we build."
          primaryCta={{ label: "Contact us", href: "/contact" }}
          secondaryCta={{ label: "Explore products", href: "/products" }}
        />
      </div>
    </div>
  );
}
