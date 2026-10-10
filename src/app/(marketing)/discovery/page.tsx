"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Download,
  Compass,
  Sparkles,
  Calendar,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";
import { COMPANY } from "@/config/company";

export default function DiscoveryPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 31 questions across 6 sections
  const [answers, setAnswers] = useState<string[]>(Array(31).fill(""));
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = [
    // Section 1: Business Goals & Identity
    "What is the primary purpose of this website? (e.g., sell products, generate leads, provide information)",
    "What are the top 3 goals you want to achieve with this website in the next 12 months?",
    "How will you measure the success of this website? (e.g., number of inquiries, sales volume, traffic)",
    "What is your unique value proposition? Why should customers choose you over competitors?",
    "Who are your top 3 main competitors? (please provide URLs if possible)",

    // Section 2: Target Audience
    "Who is your ideal customer or user?",
    "What industry or sector are you in?",
    "Do you have an existing brand name and tagline?",
    "Do you currently have a website? (share the URL if yes)",
    "What do you want to keep from your current site, if anything?",

    // Section 3: Features & Functionality
    "Roughly how many pages will you need?",
    "Do you need an online store / payment processing?",
    "Do you need a booking or appointment system?",
    "Do you need a blog or news section?",
    "Do you need multi-language support?",
    "Do you need user accounts / a login area?",
    "Do you need admin tools to update content yourself?",
    "Do you need integrations with other tools (CRM, email, etc.)?",

    // Section 4: Design & Branding
    "Do you have a logo ready?",
    "Do you have brand colors / fonts defined?",
    "Do you have photos or videos ready to use?",
    "Are there websites whose design you admire?",
    "Are there any design styles you want to avoid?",

    // Section 5: Technical & Logistics
    "Do you already own a domain name?",
    "Do you already have hosting set up?",
    "Do you need help with SEO?",
    "Do you need ongoing maintenance after launch?",
    "Any specific technical requirements or existing systems to integrate with?",

    // Section 6: Budget & Timeline
    "What scale of project are you planning?",
    "What is your ideal launch date?",
    "Is there anything else important we should know?",
  ];

  const sections = [
    { title: "Business Goals & Identity", start: 0, end: 5 },
    { title: "Target Audience & Sector", start: 5, end: 10 },
    { title: "Features & Architecture Scope", start: 10, end: 18 },
    { title: "Design System & Brand Assets", start: 18, end: 23 },
    { title: "Technical Infrastructure & Logistics", start: 23, end: 28 },
    { title: "Budget Scale & Delivery Timeline", start: 28, end: 31 },
  ];

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const nextStep = () => {
    if (currentStep < sections.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Logic Intelligence Technologies — Project Discovery Responses\n`,
        `Generated: ${new Date().toISOString()}\n`,
        `Email: ${email || "not provided"}\n\n`,
        answers.map((a, i) => `Q${i + 1} (${questions[i]}):\n${a || "—"}\n`).join("\n"),
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lit-discovery-responses.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSubmitError("Please provide a valid work email address to receive your copy.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({ answers, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || "Submission failed. Please try again or reach out directly on WhatsApp."
        );
      }
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:bg-white focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[#1565C0]/15 transition-all";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs font-mono font-medium tracking-wider uppercase mb-5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            Engineering Discovery · Architectural Blueprint
          </div>
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight leading-tight mb-3">
            Project Discovery{" "}
            <span className="text-[var(--lit-blue,#1565C0)]">Questionnaire</span>
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[var(--lit-teal,#1FA9A2)] mb-3">
            Define your technical requirements across 6 core enterprise dimensions.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto leading-relaxed">
            Provide your specifications below. The more detailed your answers, the faster our solutions architects can deliver an exact technology specification, team plan, and working prototype.
          </p>
        </div>

        {/* Main Content Card */}
        <div>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-6 sm:px-12 bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono uppercase tracking-wider mb-4">
                Specifications Logged
              </div>
              <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
                Discovery Submitted Successfully
              </h2>
              <p className="font-serif italic text-base text-[var(--lit-teal,#1FA9A2)] mb-4">
                Thank you for the detailed brief.
              </p>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mb-8 max-w-lg mx-auto leading-relaxed">
                Our lead systems architects will review your architectural answers, map tech stack options, and contact you with a scope breakdown within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <a
                  href={`https://wa.me/${COMPANY.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Lead Architect</span>
                </a>
                <Link
                  href="/book-consultation"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                  <span>Schedule Strategy Call</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-sm relative overflow-hidden">
              {/* Progress Indicator Header */}
              <div className="px-6 py-5 sm:px-8 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2.5">
                  <span>
                    Step {currentStep + 1} of {sections.length + 1}
                  </span>
                  <span className="text-[var(--lit-blue,#1565C0)]">
                    {Math.round((currentStep / sections.length) * 100)}% Completed
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--lit-border-light,#DFE7EF)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--lit-blue,#1565C0)] to-[var(--lit-teal,#1FA9A2)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / sections.length) * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6 sm:p-10 min-h-[420px] relative">
                <AnimatePresence mode="wait">
                  {currentStep < sections.length ? (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
                        <span className="w-8 h-8 rounded-xl bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-[#B9DCFF]">
                          0{currentStep + 1}
                        </span>
                        <h2 className="font-poppins text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                          {sections[currentStep].title}
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {questions
                          .slice(sections[currentStep].start, sections[currentStep].end)
                          .map((q, idx) => {
                            const globalIdx = sections[currentStep].start + idx;
                            return (
                              <div key={globalIdx} className="space-y-2">
                                <label className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                                  <span className="w-5 h-5 rounded-md bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5 border border-[var(--lit-border-light,#DFE7EF)]">
                                    {globalIdx + 1}
                                  </span>
                                  <span className="leading-snug">{q}</span>
                                </label>
                                <div className="pl-7">
                                  <textarea
                                    rows={3}
                                    placeholder="Type your response here..."
                                    value={answers[globalIdx]}
                                    onChange={(e) => handleAnswerChange(globalIdx, e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  ) : (
                    // Final Submit Step
                    <motion.div
                      key="submit-step"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22 }}
                      className="flex flex-col items-center justify-center text-center py-6 sm:py-8"
                    >
                      <div className="w-16 h-16 bg-[#E7F3FF] rounded-2xl flex items-center justify-center mb-5 border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)] shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-[var(--lit-blue,#1565C0)]" />
                      </div>
                      <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-2">
                        Almost Ready to Scope
                      </h2>
                      <p className="font-serif italic text-base text-[var(--lit-teal,#1FA9A2)] mb-3">
                        Review and transmit your discovery blueprint.
                      </p>
                      <p className="text-[var(--lit-text-muted,#52677C)] mb-8 max-w-md text-sm leading-relaxed">
                        Enter your work email address below to receive an instant copy of your discovery answers and submit them to our engineering team.
                      </p>

                      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
                        <div className="text-left">
                          <label className="block text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">
                            Work Email to Receive Copy *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="name@organization.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[var(--lit-navy,#0B2545)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
                          >
                            <Download className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                            <span>Download File</span>
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] transition-all shadow-sm disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              "Submitting…"
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Send Answers</span>
                              </>
                            )}
                          </button>
                        </div>
                        {submitError && (
                          <p className="text-xs text-rose-600 font-medium">{submitError}</p>
                        )}
                        <p className="text-center text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                          Instant file download available. Submission sends a copy to our solutions team.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 sm:px-8 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
                    currentStep === 0
                      ? "text-slate-400 cursor-not-allowed opacity-50"
                      : "text-[var(--lit-navy,#0B2545)] hover:bg-white bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
                  }`}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentStep < sections.length && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white transition-colors shadow-sm"
                  >
                    <span>Next Section</span> <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {currentStep === sections.length && (
                  <div className="px-5 py-2.5 opacity-0 pointer-events-none">Placeholder</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise CTA */}
      <CTASection
        title="Ready to Build Your Engineering Advantage?"
        subtitle="Schedule a technical architecture review with our engineering leads or request a working prototype before payment."
        primaryCta={{
          label: "Schedule Strategy Call",
          href: "/book-consultation",
        }}
        secondaryCta={{
          label: "Request Free Demo",
          href: "/free-demo",
        }}
      />
    </main>
  );
}
