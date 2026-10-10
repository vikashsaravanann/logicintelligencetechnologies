"use client";

import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, ChevronRight, ChevronLeft, Download, Compass, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/page-shell";

export default function DiscoveryPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // 31 questions
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
    "Is there anything else important we should know?"
  ];

  const sections = [
    { title: "Business Goals & Identity", start: 0, end: 5 },
    { title: "Target Audience", start: 5, end: 10 },
    { title: "Features & Functionality", start: 10, end: 18 },
    { title: "Design & Branding", start: 18, end: 23 },
    { title: "Technical & Logistics", start: 23, end: 28 },
    { title: "Budget & Timeline", start: 28, end: 31 }
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
    "w-full px-4 py-3.5 bg-[#07090D] border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors";
  
  return (
    <PageShell className="pt-32 pb-24">
      {/* Hero Header */}
      <section className="px-6 lg:px-8 mb-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
          <Compass className="w-3.5 h-3.5" />
          <span>Engineering Discovery · Scope Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight uppercase mb-4 leading-tight">
          Project Discovery <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Questionnaire
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          Provide your specifications below across six key architectural dimensions. The more comprehensive your answers, the faster we scope an exact architecture and prototype.
        </p>
      </section>

      {/* Main Content */}
      <section className="px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 bg-[#10131A] rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <CheckCircle2 className="h-10 w-10 text-cyan-400" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
                Answers Logged
              </span>
              <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight mb-4">
                Discovery Submitted Successfully
              </h2>
              <p className="text-base text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Thank you for the detailed brief. Our lead systems architect will review your technical answers and reach out with an engineering roadmap.
              </p>
              <a
                href="https://wa.me/917550067712"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(37,211,102,0.3)]"
              >
                <MessageSquare className="w-4 h-4" /> Message Lead Architect on WhatsApp
              </a>
            </motion.div>
          ) : (
            <div className="bg-[#10131A] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Progress Indicator */}
              <div className="px-6 py-5 md:px-10 md:py-6 border-b border-white/5 bg-[#07090D]/50">
                <div className="flex justify-between text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  <span>Step {currentStep + 1} of {sections.length + 1}</span>
                  <span className="text-cyan-400">{Math.round((currentStep / sections.length) * 100)}% Completed</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / sections.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="p-6 md:p-10 min-h-[420px] relative">
                <AnimatePresence mode="wait">
                  {currentStep < sections.length ? (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-cyan-500/20">
                          0{currentStep + 1}
                        </span> 
                        <span>{sections[currentStep].title}</span>
                      </h2>
                      
                      <div className="space-y-6">
                        {questions.slice(sections[currentStep].start, sections[currentStep].end).map((q, idx) => {
                          const globalIdx = sections[currentStep].start + idx;
                          return (
                            <div key={globalIdx} className="space-y-2">
                              <label className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-zinc-200">
                                <span className="w-5 h-5 rounded-md bg-white/5 text-cyan-400 flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5 border border-white/10">
                                  {globalIdx + 1}
                                </span>
                                <span className="leading-snug">{q}</span>
                              </label>
                              <div className="pl-8">
                                <textarea 
                                  rows={3} 
                                  placeholder="Type your response..." 
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
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center justify-center text-center py-6 md:py-10"
                    >
                      <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 shadow-xl">
                        <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight mb-3">
                        Almost Ready to Scope
                      </h2>
                      <p className="text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
                        Enter your work email address below to receive an instant copy of your discovery answers and submit them to our engineering team.
                      </p>
                      
                      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                        <div className="text-left">
                          <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                            Work Email to Receive Copy *
                          </label>
                          <input 
                            type="email" 
                            required 
                            placeholder="marcus@vance.io" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={inputClass} 
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-[#07090D] hover:bg-white/[0.06] transition-all border border-white/10"
                          >
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>Download File</span>
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-[#07090D] bg-cyan-500 hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)] disabled:opacity-50"
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
                        {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                        <p className="text-center text-xs text-zinc-500 font-mono">
                          Instant file download available. Submission sends a copy to our solutions team.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Navigation Footer */}
              <div className="px-6 py-5 md:px-10 md:py-6 border-t border-white/5 bg-[#07090D]/50 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    currentStep === 0 
                      ? "text-zinc-600 cursor-not-allowed" 
                      : "text-zinc-300 hover:text-white hover:bg-white/5 bg-[#07090D] border border-white/10"
                  }`}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                {currentStep < sections.length && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-[#07090D] transition-all shadow-[0_0_20px_rgba(69,217,210,0.2)]"
                  >
                    <span>Next Section</span> <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {currentStep === sections.length && (
                  <div className="px-6 py-2.5 opacity-0 pointer-events-none">Placeholder</div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
