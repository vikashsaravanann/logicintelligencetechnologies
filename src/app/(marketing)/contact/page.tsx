"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Calendar,
  Building2,
  FileCode2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

type FormData = {
  businessName: string;
  industry: string;
  existingUrl: string;
  serviceType: string;
  keyFeatures: string;
  designRefs: string;
  contentReady: string;
  budget: string;
  timeline: string;
  email: string;
  phone: string;
  notes: string;
};

const initialForm: FormData = {
  businessName: "",
  industry: "",
  existingUrl: "",
  serviceType: "",
  keyFeatures: "",
  designRefs: "",
  contentReady: "No",
  budget: "",
  timeline: "",
  email: "",
  phone: "",
  notes: "",
};

const stepRequirements: Record<number, (keyof FormData)[]> = {
  1: ["businessName", "industry"],
  2: ["serviceType"],
  3: ["budget", "timeline", "email", "phone"],
};

function validateStep(step: number, form: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};
  const required = stepRequirements[step] || [];
  for (const field of required) {
    if (!form[field] || !form[field].trim()) {
      errors[field] = "This field is required.";
    }
  }
  if (step === 3) {
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (form.phone && !/^\+?[\d\s\-().]{7,}$/.test(form.phone)) {
      errors.phone = "Enter a valid phone number.";
    }
  }
  return errors;
}

export default function ContactPage() {
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [form, setForm] = useState<FormData>(initialForm);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStep(step, form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      setFieldErrors({});
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.businessName,
          email: form.email,
          phone: form.phone,
          companyName: form.businessName,
          projectType: form.serviceType,
          budgetRange: form.budget,
          timeline: form.timeline,
          description: `Industry: ${form.industry}\nExisting URL: ${form.existingUrl}\nFeatures: ${form.keyFeatures}\nDesign Refs: ${form.designRefs}\nContent Ready: ${form.contentReady}\nNotes: ${form.notes}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Submission failed. Please try again.");
      }
      const data = await res.json().catch(() => ({}));
      if (data?.success === false) {
        throw new Error(data?.message || "Submission failed. Please try again.");
      }
      setSent(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again or reach us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border rounded-xl text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:bg-white focus:ring-2 focus:ring-[#1565C0]/15 transition-all";
  const inputClass = (field: keyof FormData) =>
    `${inputBase} ${fieldErrors[field] ? "border-rose-400 bg-rose-50/20" : "border-[var(--lit-border-light,#DFE7EF)]"}`;
  const labelClass =
    "block text-xs font-semibold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Header Hero */}
        <div className="mt-4 mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs font-mono font-medium tracking-wider uppercase mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            Project Intake & Direct Consultation Desk
          </div>
          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight mb-4">
            Start Your{" "}
            <span className="text-[var(--lit-blue,#1565C0)]">
              Engineering Project
            </span>
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[var(--lit-teal,#1FA9A2)] mb-3">
            Direct access to solutions architects — no generic sales intermediaries.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto">
            Share your technical requirements. Our senior systems architects review every submission and deliver a preliminary architectural scope, stack recommendations, and timeline estimate within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Contacts & Commitments */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-7 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
                <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  Direct Contact Desk
                </h2>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-blue,#1565C0)] transition-colors"
                    >
                      {COMPANY.email}
                    </a>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] block mt-0.5">
                      Direct engineering queue
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                      WhatsApp Direct
                    </span>
                    <a
                      href={`https://wa.me/${COMPANY.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      +{COMPANY.whatsappNumber} (Fast Response)
                    </a>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] block mt-0.5">
                      Urgent inquiries & sprint calls
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] border border-[#D7C9FF] text-[#6E44FF] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                      Telephone
                    </span>
                    <a
                      href={`tel:${COMPANY.phone}`}
                      className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-blue,#1565C0)] transition-colors"
                    >
                      {COMPANY.phone}
                    </a>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] block mt-0.5">
                      Mon–Sat • 9:00 AM – 7:00 PM IST
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F7F6] border border-[#A7ECE8] text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                      Headquarters
                    </span>
                    <span className="text-sm text-[var(--lit-navy,#0B2545)] font-medium leading-relaxed block">
                      {COMPANY.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4D9] border border-[#FFE399] text-[#B45309] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
                      SLA Response Commitment
                    </span>
                    <span className="text-sm text-[var(--lit-navy,#0B2545)] font-semibold">
                      Guaranteed within 24 hours
                    </span>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] block mt-0.5">
                      Monday through Saturday
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Booking Banner */}
            <div className="rounded-3xl border border-[#B9DCFF] bg-[#E7F3FF]/70 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--lit-blue,#1565C0)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4" />
                Prefer a Real-Time Meeting?
              </div>
              <p className="text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] leading-relaxed mb-4">
                Skip the asynchronous intake form and schedule a direct 30-minute video architecture consultation with our engineering directors.
              </p>
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Book Live Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Assurance Box */}
            <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-6 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Enterprise NDA & Privacy Protection
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                All submitted technical project details, intellectual property, architecture sketches, and requirements are treated under strict confidentiality. Client data is never shared, distributed, or utilized for AI model training.
              </p>
            </div>
          </div>

          {/* Right Column: Multi-Step Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-7 sm:p-10 shadow-sm relative">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono uppercase tracking-wider mb-4">
                    Inquiry Transmitted Successfully
                  </div>
                  <h3 className="font-poppins text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
                    Project Scope Received
                  </h3>
                  <p className="font-serif italic text-base text-[var(--lit-teal,#1FA9A2)] mb-4">
                    Thank you for reaching out to Logic Intelligence Technologies.
                  </p>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto mb-8 leading-relaxed">
                    Our lead solutions architects have received your requirements. We are preparing a preliminary architectural review, tech stack recommendations, and timeline estimate for your review within 24 hours.
                  </p>

                  <div className="bg-[var(--lit-cloud,#F7F9FC)] rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 text-left mb-8 space-y-2 max-w-md mx-auto text-xs text-[var(--lit-text-muted,#52677C)]">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      What happens next?
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0">
                        1
                      </span>
                      <span>Requirements analyzed by systems architects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0">
                        2
                      </span>
                      <span>Formal estimation & scope breakdown emailed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0">
                        3
                      </span>
                      <span>Interactive technical kickoff & codebase review</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${COMPANY.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message on WhatsApp for Priority</span>
                    </a>
                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
                    >
                      Return to Home
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Step Progress Meter */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-blue,#1565C0)]">
                        Step {step} of 3
                      </span>
                      <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase">
                        {step === 1 && "1. Business Context"}
                        {step === 2 && "2. Technical Scope"}
                        {step === 3 && "3. Scale & Delivery"}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--lit-blue,#1565C0)] to-[var(--lit-teal,#1FA9A2)] transition-all duration-300 rounded-full"
                        style={{ width: `${(step / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {serverError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className={labelClass}>
                            Business / Organization Name <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.businessName}
                            onChange={(e) => update("businessName", e.target.value)}
                            className={inputClass("businessName")}
                            placeholder="e.g. Apex Health Systems or Vertex Logistics"
                          />
                          {fieldErrors.businessName && (
                            <p className="mt-1.5 text-xs text-rose-600 font-medium">
                              {fieldErrors.businessName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Industry / Sector <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.industry}
                            onChange={(e) => update("industry", e.target.value)}
                            className={inputClass("industry")}
                            placeholder="e.g. Healthcare, Fintech, Logistics, Enterprise SaaS, Manufacturing"
                          />
                          {fieldErrors.industry && (
                            <p className="mt-1.5 text-xs text-rose-600 font-medium">
                              {fieldErrors.industry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Existing Website / Product URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={form.existingUrl}
                            onChange={(e) => update("existingUrl", e.target.value)}
                            className={inputClass("existingUrl")}
                            placeholder="https://example.com"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className={labelClass}>
                            Primary Engineering Solution Needed <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                          </label>
                          <select
                            value={form.serviceType}
                            onChange={(e) => update("serviceType", e.target.value)}
                            className={inputClass("serviceType")}
                          >
                            <option value="" disabled>
                              Select Solution Category
                            </option>
                            <option value="Enterprise Web Application">
                              Enterprise Web Application (Next.js / React / TypeScript)
                            </option>
                            <option value="Voice AI / Speech Pipeline">
                              Voice AI / Speech Pipeline (Logic Voice)
                            </option>
                            <option value="Healthcare Platform Intelligence">
                              Healthcare Platform Intelligence (LIT Clinical)
                            </option>
                            <option value="Autonomous AI Agents">
                              Autonomous AI Agents & RAG Integration
                            </option>
                            <option value="Cloud Modernization & APIs">
                              Cloud Modernization, Microservices & Custom APIs
                            </option>
                            <option value="Other Custom Solution">
                              Other Custom Engineering Solution
                            </option>
                          </select>
                          {fieldErrors.serviceType && (
                            <p className="mt-1.5 text-xs text-rose-600 font-medium">
                              {fieldErrors.serviceType}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClass}>
                            Key Capabilities & Technical Requirements
                          </label>
                          <textarea
                            rows={3}
                            value={form.keyFeatures}
                            onChange={(e) => update("keyFeatures", e.target.value)}
                            className={inputClass("keyFeatures")}
                            placeholder="e.g. Sub-200ms latency, multi-tenant RBAC, FHIR clinical schema, CRM integration, HIPAA/GDPR compliance…"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Design References / Benchmark Systems (Optional)
                          </label>
                          <input
                            type="text"
                            value={form.designRefs}
                            onChange={(e) => update("designRefs", e.target.value)}
                            className={inputClass("designRefs")}
                            placeholder="URLs or systems whose architecture or UX you admire"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>
                              Target Budget Scale <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                            </label>
                            <select
                              value={form.budget}
                              onChange={(e) => update("budget", e.target.value)}
                              className={inputClass("budget")}
                            >
                              <option value="" disabled>
                                Select Budget Tier
                              </option>
                              <option value="Starter Pack (< ₹15,000 / $250)">
                                Starter Launch Scope (&lt; ₹15,000 / $250)
                              </option>
                              <option value="Growth Scale (₹15,000 - ₹50,000 / $250 - $750)">
                                Growth Scale (₹15,000 - ₹50,000 / $250 - $750)
                              </option>
                              <option value="Enterprise Architecture (> ₹50,000 / > $1,000)">
                                Enterprise Architecture (&gt; ₹50,000 / &gt; $1,000)
                              </option>
                              <option value="Custom Engineering Quote">
                                Custom Enterprise Scope
                              </option>
                            </select>
                            {fieldErrors.budget && (
                              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                {fieldErrors.budget}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className={labelClass}>
                              Deployment Timeline <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                            </label>
                            <select
                              value={form.timeline}
                              onChange={(e) => update("timeline", e.target.value)}
                              className={inputClass("timeline")}
                            >
                              <option value="" disabled>
                                Select Timeline
                              </option>
                              <option value="Immediate / Urgent (< 2 Weeks)">
                                Immediate (&lt; 2 Weeks)
                              </option>
                              <option value="Standard Sprint (2 - 4 Weeks)">
                                Standard Sprint (2 - 4 Weeks)
                              </option>
                              <option value="Multi-Phase Enterprise (1 - 3 Months)">
                                Multi-Phase (1 - 3 Months)
                              </option>
                              <option value="Flexible Roadmapping">
                                Flexible Roadmapping
                              </option>
                            </select>
                            {fieldErrors.timeline && (
                              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                {fieldErrors.timeline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>
                              Work Email <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                            </label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              className={inputClass("email")}
                              placeholder="alex@organization.com"
                            />
                            {fieldErrors.email && (
                              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                {fieldErrors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className={labelClass}>
                              Phone / WhatsApp <span className="text-[var(--lit-blue,#1565C0)]">*</span>
                            </label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => update("phone", e.target.value)}
                              className={inputClass("phone")}
                              placeholder="+91 98765 43210"
                            />
                            {fieldErrors.phone && (
                              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                {fieldErrors.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>
                            Additional Architectural Notes (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            className={inputClass("notes")}
                            placeholder="Any infrastructure constraints, compliance considerations, or specific architectural questions…"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Step Buttons */}
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setStep(step - 1);
                          setFieldErrors({});
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous Step
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Transmitting…
                        </>
                      ) : step === 3 ? (
                        <>
                          <Send className="w-4 h-4" /> Transmit Project Scope
                        </>
                      ) : (
                        <>
                          Next Step <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Enterprise CTA */}
      <CTASection
        title="Ready to Transform Your Digital Infrastructure?"
        subtitle="Whether you need autonomous AI agents, enterprise healthcare architectures, or high-performance cloud platforms, our engineering directors are ready to co-design your roadmap."
        primaryCta={{
          label: "Book Video Consultation",
          href: "/book-consultation",
        }}
        secondaryCta={{
          label: "Schedule Interactive Demo",
          href: "/free-demo",
        }}
      />
    </main>
  );
}
