import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { Building2, User, MapPin, Globe, Mail, Phone, ShieldCheck, Cpu, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Company Facts | Logic Intelligence Technologies",
  description:
    "Authoritative public fact sheet for Logic Intelligence Technologies — corporate identity, leadership, products, and contact details.",
};

export default function CompanyFactsPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <BackToHome />

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#45D9D2] text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authoritative Public Record
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Company Fact Sheet
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Verified reference information for Logic Intelligence Technologies — legal identity, executive leadership, flagship AI architectures, and official communication channels.
          </p>
        </div>

        {/* Corporate Identity */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#45D9D2]" /> Corporate Identity
          </h2>
          <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Legal / Display Name</p>
              <p className="text-base text-white font-medium mt-1">{COMPANY.legalName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Company Classification</p>
              <p className="text-base text-white font-medium mt-1">{COMPANY.entityLabel}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Engineering Headquarters</p>
              <p className="text-base text-white font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#45D9D2]" />
                {COMPANY.location.city}, {COMPANY.location.state}, {COMPANY.location.country}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Canonical Corporate URL</p>
              <a
                href={COMPANY.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-[#45D9D2] hover:underline font-medium mt-1 flex items-center gap-1"
              >
                <Globe className="w-4 h-4" /> {COMPANY.websiteUrl}
              </a>
            </div>
            <div className="sm:col-span-2 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mission & Core Focus</p>
              <p className="text-base text-slate-200 mt-1 leading-relaxed">
                Logic Intelligence Technologies is a deep-tech engineering and AI systems company developing production artificial intelligence architectures, enterprise automation, and secure speech intelligence solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#45D9D2]" /> Leadership
          </h2>
          <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#45D9D2] uppercase tracking-wider font-semibold">Founder & Chief Executive Officer</p>
                <p className="text-2xl text-white font-bold mt-1">{FOUNDER.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{FOUNDER.title}, Logic Intelligence Technologies</p>
              </div>
              <Link
                href="/about/founder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all w-fit"
              >
                <span>Full Executive Profile</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {FOUNDER.shortBio}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                16 Verified Credentials
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                Full-Stack Architecture
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                Autonomous AI Systems
              </span>
            </div>
          </div>
        </section>

        {/* Launched Flagship Products (3 Products) */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#45D9D2]" /> Flagship Launched Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LIT Healthcare */}
            <div className="bg-[#10131A] border border-white/10 hover:border-teal-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 inline-block">
                  Flagship Healthcare Platform
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">LIT Healthcare</h3>
                <p className="text-xs text-teal-400/90 font-semibold uppercase tracking-wider">
                  Connected Healthcare. Intelligent Decisions.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Enterprise smart hospital operating system and clinical intelligence platform delivering modular clinical workflows, multi-tenant governance, and automated patient telemetry.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Link href="/healthcare" className="text-xs text-[#45D9D2] font-bold hover:underline flex items-center gap-1">
                  Platform Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://healthcare.logicintelligencetechnologies.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Live Portal ↗
                </a>
              </div>
            </div>

            {/* Logic Voice */}
            <div className="bg-[#10131A] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-[#45D9D2] border border-cyan-500/20 inline-block">
                  Autonomous Speech AI
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#45D9D2] transition-colors">Logic Voice</h3>
                <p className="text-xs text-[#45D9D2]/90 font-semibold uppercase tracking-wider">
                  Voice-First Personal AI Operating System
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Next-generation voice-first personal AI assistant engineered with real-time speech recognition, autonomous planning, deterministic reasoning, and tool execution.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Link href="/products/logic-voice" className="text-xs text-[#45D9D2] font-bold hover:underline flex items-center gap-1">
                  Architecture Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://logicvoice.logicintelligencetechnologies.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Launch App ↗
                </a>
              </div>
            </div>

            {/* Voice Shield */}
            <div className="bg-[#10131A] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
                  AI Biometrics &amp; Security
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Voice Shield</h3>
                <p className="text-xs text-cyan-400/90 font-semibold uppercase tracking-wider">
                  Real-Time Audio Defense &amp; Deepfake Intercept
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Enterprise real-time audio security firewall and voice biometric verification engine engineered to defend contact centers, SIP trunking, and telephony workflows from synthetic voice clones and AI deepfake fraud under 15ms.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Link href="/voice-shield" className="text-xs text-[#45D9D2] font-bold hover:underline flex items-center gap-1">
                  Product Overview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/voice-shield" className="text-[11px] text-slate-400 hover:text-white">
                  Security Specs ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Official Contact Channels */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#45D9D2]" /> Official Communications Channels
          </h2>
          <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">General Enquiries</p>
              <a href={`mailto:${COMPANY.email}`} className="text-sm text-[#45D9D2] font-medium hover:underline mt-1 block">
                {COMPANY.email}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Enterprise & Commercial Engagements</p>
              <a href={`mailto:${COMPANY.contactEmail}`} className="text-sm text-[#45D9D2] font-medium hover:underline mt-1 block">
                {COMPANY.contactEmail}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Client Systems & Support</p>
              <a href={`mailto:${COMPANY.supportEmail}`} className="text-sm text-[#45D9D2] font-medium hover:underline mt-1 block">
                {COMPANY.supportEmail}
              </a>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Executive & Corporate Administration</p>
              <a href={`mailto:${COMPANY.adminEmail}`} className="text-sm text-[#45D9D2] font-medium hover:underline mt-1 block">
                {COMPANY.adminEmail}
              </a>
            </div>
            <div className="sm:col-span-2 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Direct Telephone & WhatsApp</p>
                <a href={`tel:${COMPANY.phone}`} className="text-base text-white font-medium hover:underline flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-[#45D9D2]" /> {COMPANY.phone}
                </a>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shadow-lg"
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
