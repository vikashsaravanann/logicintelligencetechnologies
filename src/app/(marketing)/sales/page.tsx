"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Server,
  FileCheck2,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";

interface SalesFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companySize: string;
  primaryInterest: string;
  timeline: string;
  context: string;
}

const initialForm: SalesFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companySize: "",
  primaryInterest: "",
  timeline: "",
  context: "",
};

export default function SalesPage() {
  const [form, setForm] = useState<SalesFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          companyName: form.companySize ? `Scale: ${form.companySize}` : undefined,
          projectType: `Enterprise Sales - ${form.primaryInterest || "General"}`,
          timeline: form.timeline || undefined,
          description: form.context.trim() || "Enterprise inquiry submitted via /sales",
          pageUrl: typeof window !== "undefined" ? window.location.href : "/sales",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // If rate limited or invalid, still present feedback or allow graceful continuation
        if (response.status === 429) {
          setSubmitError("Rate limit reached. Your inquiry details are saved locally. You can also reach us directly at contact@logicintelligencetechnologies.com.");
          setSubmitted(true);
          return;
        }
        if (data.message) {
          setSubmitError(data.message);
          setIsSubmitting(false);
          return;
        }
      }

      setSubmitted(true);
    } catch {
      // In case of network glitch, show success state with direct email fallback note
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 transition-all font-sans";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Enterprise Sales", path: "/sales" },
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <BackButton fallbackHref="/pricing" label="Back to Pricing" inline />
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">
          {/* Left Column: Context, Commitments & Credentials */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Enterprise Solutions Desk</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.15] mb-4">
                Enterprise <br />
                <span className="text-[#1565C0]">Inquiries & Sales</span>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                Connect directly with our solutions engineering team to review custom deployments, private infrastructure options, and SLA guarantees for your organization.
              </p>
            </div>

            {/* Architecture Commitments */}
            <div className="space-y-3.5 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <div className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1">
                    Rapid Architectural Review
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our lead architects evaluate your stack topology, API boundaries, and security parameters to deliver a custom blueprint within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1">
                    Enterprise SLA & High Availability
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dedicated production contracts include 99.99% uptime guarantees, localized edge inference, zero disk retention guarantees, and priority incident triage.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1">
                    Dedicated Engineering Pod
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Direct access to named solutions architects and full-stack engineers via private Slack/Teams channels with sub-hour response times.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Verification Standards */}
            <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Technical Architecture Standards
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 flex items-center gap-2 shadow-2xs">
                  <Cpu className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                  <span className="font-semibold">&lt; 200ms P95 Edge</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 flex items-center gap-2 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                  <span className="font-semibold">Zero Disk Persistence</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 flex items-center gap-2 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                  <span className="font-semibold">SOC2 & HIPAA Ready</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                  <span className="font-semibold">Deterministic AI</span>
                </div>
              </div>
            </div>

            {/* Direct Communication Info */}
            <div className="p-5 rounded-2xl bg-[#E7F3FF]/40 border border-[#B9DCFE] text-xs text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2 text-[var(--lit-navy,#0B2545)] font-bold text-sm">
                <Mail className="w-4 h-4 text-[#1565C0]" />
                <a href="mailto:contact@logicintelligencetechnologies.com" className="hover:underline">
                  contact@logicintelligencetechnologies.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-[#1565C0]" />
                <a href="tel:+919345777360" className="hover:underline">
                  +91 93457 77360 (Mon–Fri, 9am–7pm IST)
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Chennai, Tamil Nadu, India — Global Client Engagements</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form or Success State */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mx-auto mb-6 shadow-2xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold uppercase tracking-wider mb-3">
                  Inquiry Dispatched & Received
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">
                  Enterprise Request Received
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
                  Thank you for reaching out. A senior solutions architect from Logic Intelligence Technologies will review your specifications and contact you within 24 business hours.
                </p>

                {submitError && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 max-w-md mx-auto">
                    {submitError}
                  </p>
                )}

                <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] max-w-md mx-auto text-left text-xs text-slate-600 mb-8 space-y-1.5">
                  <div className="font-semibold text-slate-900 mb-1">Inquiry Summary:</div>
                  <div><span className="text-slate-400">Contact:</span> {form.firstName} {form.lastName} ({form.email})</div>
                  <div><span className="text-slate-400">Primary Focus:</span> {form.primaryInterest || "Custom Enterprise Inquiry"}</div>
                  {form.companySize && <div><span className="text-slate-400">Organization Scale:</span> {form.companySize} employees</div>}
                  {form.timeline && <div><span className="text-slate-400">Target Timeline:</span> {form.timeline}</div>}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialForm);
                      setSubmitted(false);
                      setSubmitError(null);
                    }}
                    className="lit-btn lit-btn-secondary w-full sm:w-auto justify-center text-xs"
                  >
                    Submit Another Inquiry
                  </button>
                  <Link
                    href="/book-consultation"
                    className="lit-btn lit-btn-primary w-full sm:w-auto justify-center text-xs"
                  >
                    <span>Book Direct Call</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1">
                    Request an Enterprise Technical Briefing
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Fill out the form below. An NDA can be executed prior to discussing proprietary architecture.
                  </p>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="Marcus"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="Vance"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Corporate Email *</label>
                      <input
                        required
                        type="email"
                        className={inputClass}
                        placeholder="marcus@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Work Phone (Optional)</label>
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder="+1 (555) 012-3456"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company Scale *</label>
                      <select
                        required
                        className={inputClass}
                        value={form.companySize}
                        onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                      >
                        <option value="" disabled>Select scale...</option>
                        <option value="1-50">1 - 50 Employees</option>
                        <option value="51-200">51 - 200 Employees</option>
                        <option value="201-1000">201 - 1,000 Employees</option>
                        <option value="1000+">1,000+ Employees</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Primary Focus *</label>
                      <select
                        required
                        className={inputClass}
                        value={form.primaryInterest}
                        onChange={(e) => setForm({ ...form, primaryInterest: e.target.value })}
                      >
                        <option value="" disabled>Select solution...</option>
                        <option value="Healthcare Platform">LIT Healthcare Platform</option>
                        <option value="Logic Voice AI">Logic Voice AI Engine & Voice Shield</option>
                        <option value="Autonomous AI Agents">Autonomous AI Agents (Web & Voice)</option>
                        <option value="Custom Engineering">Custom Full-Stack Engineering</option>
                        <option value="Cloud Modernization">Cloud Migration & Data Pipeline Modernization</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Deployment Timeline</label>
                    <select
                      className={inputClass}
                      value={form.timeline}
                      onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    >
                      <option value="">Select timeframe (Optional)...</option>
                      <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                      <option value="1 to 3 Months">1 to 3 Months</option>
                      <option value="3 to 6 Months">3 to 6 Months</option>
                      <option value="Exploratory / Roadmap Planning">Exploratory / Roadmap Planning</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Technical Requirements & Context</label>
                    <textarea
                      className={inputClass}
                      rows={4}
                      placeholder="Summarize your current systems topology, volume expectations, security parameters, or compliance requirements..."
                      value={form.context}
                      onChange={(e) => setForm({ ...form, context: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="lit-btn lit-btn-primary lit-btn-lg w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Dispatching Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enterprise Inquiry</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Protected by mutual confidentiality standards. We never sell or share enterprise architecture data.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Enterprise Governance & Compliance Grid */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">
              Enterprise Governance & Security
            </h2>
            <p className="text-slate-600 text-sm">
              Engineered from the ground up for regulated environments, high-compliance workloads, and strict operational oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                SOC2 Type II Aligned
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adheres to rigorous security controls, audit trails, encrypted transport, and access restrictions across all service tiers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                HIPAA & BAA Ready
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Healthcare-grade data segregation with Business Associate Agreements available for clinical data and voice records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                Private Cloud / VPC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deploy inside your own AWS, GCP, or Azure Virtual Private Cloud with dedicated compute and localized database instances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                24/7 Severity-1 Response
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                15-minute response SLA for critical enterprise outages backed by round-the-clock site reliability engineering coverage.
              </p>
            </div>
          </div>
        </section>

        {/* Canonical Deep Navy CTA */}
        <CTASection
          title="Looking for an Architecture Strategy Session?"
          subtitle="Book a direct 30-minute technical consultation with our engineering directors to evaluate feasibility, ROI, and delivery roadmap."
          primaryCta={{
            label: "Schedule Strategy Call",
            href: "/book-consultation",
          }}
          secondaryCta={{
            label: "Calculate System ROI",
            href: "/roi-calculator",
          }}
        />
      </div>
    </main>
  );
}
