import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { Building2, User, MapPin, Globe, Mail, Phone, ShieldCheck, Cpu } from "lucide-react";

import CTASection from "@/components/ui/cta-section";
export const metadata: Metadata = {
  title: "Company Facts | Logic Intelligence Technologies",
  description:
    "Authoritative public fact sheet for Logic Intelligence Technologies — corporate identity, leadership, products, and contact details.",
};

export default function CompanyFactsPage() {
  return (
    <div className="min-h-screen bg-[#0A1530] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <BackToHome />

        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Authoritative Record
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Company Fact Sheet
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Authoritative public reference information for Logic Intelligence Technologies
          </p>
        </div>

        {/* Corporate Identity */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" /> Corporate Identity
          </h2>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Legal / Display Name</p>
              <p className="text-base text-white font-medium mt-1">{COMPANY.legalName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Company Type</p>
              <p className="text-base text-white font-medium mt-1">{COMPANY.entityLabel}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Headquarters</p>
              <p className="text-base text-white font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {COMPANY.location.city}, {COMPANY.location.state}, {COMPANY.location.country}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Canonical Corporate Website</p>
              <a
                href={COMPANY.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-cyan-400 hover:underline font-medium mt-1 flex items-center gap-1"
              >
                <Globe className="w-4 h-4" /> {COMPANY.websiteUrl}
              </a>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Primary Positioning</p>
              <p className="text-base text-slate-200 mt-1">
                Logic Intelligence Technologies is an AI technology company developing intelligent AI products and automation solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Leadership
          </h2>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Founder & CEO</p>
              <p className="text-lg text-white font-semibold mt-1">{FOUNDER.name}</p>
              <p className="text-sm text-slate-400 mt-0.5">{FOUNDER.title}, Logic Intelligence Technologies</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {FOUNDER.shortBio}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-sm text-cyan-400">
              <Link href="/about/founder" className="hover:underline">
                View Full Executive Profile →
              </Link>
            </div>
          </div>
        </section>

        {/* Launched Products */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> Flagship Launched Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Product of Logic Intelligence Technologies
              </span>
              <h3 className="text-lg font-bold text-white">Logic Voice</h3>
              <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                Voice-First Personal AI Assistant
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Voice-first personal AI assistant engineered for speech recognition, reasoning, planning, and approved tool execution. Long-term positioning toward a personal AI operating system.
              </p>
              <div className="pt-2">
                <Link href="/products/logic-voice" className="text-xs text-cyan-400 font-bold hover:underline">
                  Logic Voice Overview →
                </Link>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Product of Logic Intelligence Technologies
              </span>
              <h3 className="text-lg font-bold text-white">LIT Healthcare</h3>
              <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                Connected Healthcare. Intelligent Decisions.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Enterprise smart hospital management and clinical intelligence platform delivering modular clinical workflows, multi-tenant hospital operations, and healthcare automation.
              </p>
              <div className="pt-2">
                <Link href="/healthcare" className="text-xs text-cyan-400 font-bold hover:underline">
                  Healthcare Platform Overview →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Official Contact Channels */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" /> Official Communications
          </h2>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">General Enquiries</p>
              <a href={`mailto:${COMPANY.email}`} className="text-sm text-cyan-400 hover:underline">
                {COMPANY.email}
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Business / Sales</p>
              <a href={`mailto:${COMPANY.contactEmail}`} className="text-sm text-cyan-400 hover:underline">
                {COMPANY.contactEmail}
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Customer Support</p>
              <a href={`mailto:${COMPANY.supportEmail}`} className="text-sm text-cyan-400 hover:underline">
                {COMPANY.supportEmail}
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Administration</p>
              <a href={`mailto:${COMPANY.adminEmail}`} className="text-sm text-cyan-400 hover:underline">
                {COMPANY.adminEmail}
              </a>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Direct Telephone / WhatsApp</p>
              <a href={`tel:${COMPANY.phone}`} className="text-sm text-white font-medium hover:underline flex items-center gap-1.5 mt-1">
                <Phone className="w-4 h-4 text-cyan-400" /> {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>
      </div>
      <CTASection title="Work with Logic Intelligence Technologies" subtitle="Talk to us about a project, or explore the products we build." primaryCta={{ label: "Contact us", href: "/contact" }} secondaryCta={{ label: "Explore products", href: "/products" }} />
    </div>
  );
}
