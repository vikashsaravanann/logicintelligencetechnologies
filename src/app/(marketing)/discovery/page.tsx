"use client";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, ChevronRight, ChevronLeft, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoveryPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Create an array of 31 empty strings for the answers
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
    "What is your expected budget range?",
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
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob(
      [
        `Logic Intelligence Technologies — Discovery Responses\n`,
        `Email: ${email || "not provided"}\n\n`,
        answers.map((a, i) => `Q${i + 1}: ${a || "—"}`).join("\n"),
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
      setSubmitError("Please provide an email address to receive a copy.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email }),
      });
      
      if (res.ok) {
        setSent(true);
      } else {
        console.error("Submission failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-base md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner";
  
  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24 overflow-x-hidden">
      <BackToHome />
      {/* Hero Section */}
      <section className="relative py-12 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/backdrops/about-hero.jpg" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
             Enterprise Onboarding
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            Project Discovery <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Questionnaire</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-400 max-w-2xl mx-auto font-light mb-8">
            Tell us about your project in detail below. The more information you provide, the better we can scope your requirements and prepare a tailored demo.
          </motion.p>
        </div>
      </section>

      {/* Main Form Content */}
      <section className="pb-20 px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {sent ? (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[#12172b] rounded-3xl border border-white/10 shadow-2xl p-6 md:p-12">
               <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
                 <CheckCircle2 className="h-12 w-12 text-primary" />
               </div>
               <h3 className="text-4xl font-black text-white mb-4">Discovery Form Submitted!</h3>
               <p className="text-lg text-zinc-400 mb-8">Thanks for the details. Our team will review your requirements and reach out to you shortly.</p>
               <a href="https://wa.me/919342877474" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm border border-[#25D366]/20 hover:bg-[#25D366] hover:text-black transition-all">
                 <MessageSquare className="w-4 h-4" /> Message on WhatsApp
               </a>
             </motion.div>
          ) : (
            <div className="bg-[#12172b] rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
              
              {/* Progress Indicator */}
              <div className="px-6 py-5 md:px-10 md:py-6 border-b border-white/5 bg-white/[0.01]">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  <span>Step {currentStep + 1} of {sections.length + 1}</span>
                  <span>{Math.round((currentStep / sections.length) * 100)}% Completed</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / sections.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="p-6 md:p-10 min-h-[400px] relative">
                <AnimatePresence mode="wait">
                  {currentStep < sections.length ? (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                        <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0 border border-primary/20 shadow-[0_0_15px_rgba(0,191,255,0.15)]">
                          {currentStep + 1}
                        </span> 
                        {sections[currentStep].title}
                      </h2>
                      
                      <div className="space-y-8">
                        {questions.slice(sections[currentStep].start, sections[currentStep].end).map((q, idx) => {
                          const globalIdx = sections[currentStep].start + idx;
                          return (
                            <div key={globalIdx} className="group">
                              <label className="flex items-start gap-3 text-sm font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">
                                <span className="w-6 h-6 rounded bg-white/5 text-primary flex items-center justify-center shrink-0 text-xs mt-0.5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                                  {globalIdx + 1}
                                </span>
                                <span className="pt-1 leading-snug">{q}</span>
                              </label>
                              <div className="pl-9">
                                <textarea 
                                  rows={3} 
                                  placeholder="Your answer..." 
                                  value={answers[globalIdx]} 
                                  onChange={e => handleAnswerChange(globalIdx, e.target.value)} 
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center text-center py-6 md:py-10"
                    >
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,191,255,0.2)] border border-primary/20">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Almost Done!</h2>
                      <p className="text-zinc-400 mb-10 max-w-md text-lg">
                        Please provide your email address to receive a copy of your requirements and submit the form.
                      </p>
                      
                      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Email to receive your copy *</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="you@company.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className={inputClass} 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button type="button" onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-all border border-white/10">
                            <Download className="w-5 h-5" /> Download Copy
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black bg-white hover:bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,191,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Submitting...' : <><Send className="w-5 h-5" /> Send Answers</>}
                          </button>
                        </div>
                        {submitError && <p className="text-sm text-red-400">{submitError}</p>}
                        <p className="text-center text-xs text-zinc-500 flex justify-center items-center">
                          Downloading is instant. Sending shares a copy with our team.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Navigation Footer */}
              <div className="px-6 py-5 md:px-10 md:py-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    currentStep === 0 
                      ? "text-zinc-600 cursor-not-allowed" 
                      : "text-zinc-300 hover:text-white hover:bg-white/5 bg-white/5 border border-white/10"
                  }`}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                {currentStep < sections.length && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all border border-primary/20 hover:shadow-[0_0_20px_rgba(0,191,255,0.3)]"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {currentStep === sections.length && (
                   <div className="px-8 py-3 opacity-0 pointer-events-none">Placeholder</div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
