"use client";

import { useState } from "react";
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
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";

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
    if (!form[field]) {
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
        err instanceof Error ? err.message : "Something went wrong. Please try again or reach us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3.5 bg-[#10131A] border rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-[#151922] focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner";
  const inputClass = (field: keyof FormData) =>
    `${inputBase} ${fieldErrors[field] ? "border-rose-500/50" : "border-white/10"}`;
  const labelClass = "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2";

  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Header Hero */}
        <div className="mt-8 mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            Project Intake & Consultation
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Engineering Project</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Tell us about your requirements. Our solutions architects review every inquiry and respond with a technical scope and clear estimation within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contacts & Commitments */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-white uppercase font-heading tracking-wide">
                Direct Contact Desk
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Email Inquiries</span>
                    <a href={`mailto:${COMPANY.email}`} className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors">
                      {COMPANY.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">WhatsApp Direct</span>
                    <a
                      href={`https://wa.me/${COMPANY.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      +{COMPANY.whatsappNumber} (Fast Response)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Headquarters</span>
                    <span className="text-sm text-slate-300 leading-relaxed block">
                      {COMPANY.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Response Commitment</span>
                    <span className="text-sm text-slate-300 font-medium">
                      Guaranteed within 24 hours (Monday – Saturday)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assurance Box */}
            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                NDA & Privacy Protection
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                All submitted technical project details, intellectual property, and requirements are treated under strict confidentiality. We never sell or share client data.
              </p>
            </div>
          </div>

          {/* Right Column: Multi-Step Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#151922] p-8 sm:p-10 shadow-2xl relative">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-white uppercase tracking-wide mb-3">
                    Inquiry Received
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto mb-8 leading-relaxed font-sans">
                    Thank you for sharing your project specifications. Our engineering lead will analyze your requirements and email you an architectural plan within 24 hours.
                  </p>
                  <a
                    href={`https://wa.me/${COMPANY.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    Message on WhatsApp for Immediate Priority
                  </a>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Step Progress Meter */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                        Step {step} of 3
                      </span>
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {step === 1 && "Business Context"}
                        {step === 2 && "Technical Scope"}
                        {step === 3 && "Scale & Timeline"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {serverError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className={labelClass}>Business / Organization Name <span className="text-cyan-400">*</span></label>
                          <input
                            type="text"
                            value={form.businessName}
                            onChange={(e) => update("businessName", e.target.value)}
                            className={inputClass("businessName")}
                            placeholder="e.g. Apex Health Systems"
                          />
                          {fieldErrors.businessName && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.businessName}</p>}
                        </div>

                        <div>
                          <label className={labelClass}>Industry / Sector <span className="text-cyan-400">*</span></label>
                          <input
                            type="text"
                            value={form.industry}
                            onChange={(e) => update("industry", e.target.value)}
                            className={inputClass("industry")}
                            placeholder="e.g. Healthcare, Fintech, Hospitality, Enterprise SaaS"
                          />
                          {fieldErrors.industry && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.industry}</p>}
                        </div>

                        <div>
                          <label className={labelClass}>Existing Website / App URL (Optional)</label>
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
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className={labelClass}>Primary Engineering Solution Needed <span className="text-cyan-400">*</span></label>
                          <select
                            value={form.serviceType}
                            onChange={(e) => update("serviceType", e.target.value)}
                            className={inputClass("serviceType")}
                          >
                            <option value="" disabled className="bg-[#10131A]">Select Solution Category</option>
                            <option value="Enterprise Web Application" className="bg-[#10131A]">Enterprise Web Application (Next.js / React / TypeScript)</option>
                            <option value="Voice AI / Speech Pipeline" className="bg-[#10131A]">Voice AI / Speech Pipeline (Logic Voice)</option>
                            <option value="Healthcare Platform Intelligence" className="bg-[#10131A]">Healthcare Platform Intelligence (LIT Clinical)</option>
                            <option value="Autonomous AI Agents" className="bg-[#10131A]">Autonomous AI Agents & RAG Integration</option>
                            <option value="Cloud Modernization & APIs" className="bg-[#10131A]">Cloud Modernization, Microservices & Custom APIs</option>
                            <option value="Other Custom Solution" className="bg-[#10131A]">Other Custom Engineering Solution</option>
                          </select>
                          {fieldErrors.serviceType && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.serviceType}</p>}
                        </div>

                        <div>
                          <label className={labelClass}>Key Capabilities & Technical Requirements</label>
                          <textarea
                            rows={3}
                            value={form.keyFeatures}
                            onChange={(e) => update("keyFeatures", e.target.value)}
                            className={inputClass("keyFeatures")}
                            placeholder="e.g. Sub-200ms latency, multi-tenant RBAC, FHIR clinical schema, CRM integration…"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Design References / Benchmark Systems (Optional)</label>
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
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Target Budget Scale <span className="text-cyan-400">*</span></label>
                            <select
                              value={form.budget}
                              onChange={(e) => update("budget", e.target.value)}
                              className={inputClass("budget")}
                            >
                              <option value="" disabled className="bg-[#10131A]">Select Scope</option>
                              <option value="Starter Pack (< ₹15,000 / $250)" className="bg-[#10131A]">Starter Launch Scope</option>
                              <option value="Growth Scale (₹15,000 - ₹50,000 / $250 - $750)" className="bg-[#10131A]">Growth System Scope</option>
                              <option value="Enterprise Architecture (> ₹50,000 / > $1,000)" className="bg-[#10131A]">Enterprise Architecture</option>
                              <option value="Custom Engineering Quote" className="bg-[#10131A]">Custom Engineering Quote</option>
                            </select>
                            {fieldErrors.budget && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.budget}</p>}
                          </div>

                          <div>
                            <label className={labelClass}>Deployment Timeline <span className="text-cyan-400">*</span></label>
                            <select
                              value={form.timeline}
                              onChange={(e) => update("timeline", e.target.value)}
                              className={inputClass("timeline")}
                            >
                              <option value="" disabled className="bg-[#10131A]">Select Timeline</option>
                              <option value="Immediate / Urgent (< 2 Weeks)" className="bg-[#10131A]">Immediate (&lt; 2 Weeks)</option>
                              <option value="Standard Sprint (2 - 4 Weeks)" className="bg-[#10131A]">Standard Sprint (2 - 4 Weeks)</option>
                              <option value="Multi-Phase Enterprise (1 - 3 Months)" className="bg-[#10131A]">Multi-Phase (1 - 3 Months)</option>
                              <option value="Flexible Roadmapping" className="bg-[#10131A]">Flexible Roadmapping</option>
                            </select>
                            {fieldErrors.timeline && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.timeline}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Work Email <span className="text-cyan-400">*</span></label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              className={inputClass("email")}
                              placeholder="alex@organization.com"
                            />
                            {fieldErrors.email && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.email}</p>}
                          </div>

                          <div>
                            <label className={labelClass}>Phone / WhatsApp <span className="text-cyan-400">*</span></label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => update("phone", e.target.value)}
                              className={inputClass("phone")}
                              placeholder="+91 98765 43210"
                            />
                            {fieldErrors.phone && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.phone}</p>}
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Additional Architectural Notes (Optional)</label>
                          <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            className={inputClass("notes")}
                            placeholder="Any infrastructure constraints, compliance considerations, or specific questions…"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Step Buttons */}
                  <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/5">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => { setStep(step - 1); setFieldErrors({}); }}
                        className="px-5 py-3 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous Step
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(69,217,210,0.35)] flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                          Transmitting…
                        </>
                      ) : step === 3 ? (
                        <>
                          <Send className="w-4 h-4" /> Transmit Inquiry
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
    </PageShell>
  );
}
