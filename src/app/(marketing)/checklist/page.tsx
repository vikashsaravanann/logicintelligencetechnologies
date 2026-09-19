"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle2, ArrowRight } from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import FloatingElements from "@/components/motion/floating-elements";
import SafeImage from "@/components/ui/safe-image";

export default function ChecklistLeadMagnet() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "lead_magnet" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
        setEmailSent(data.emailSent !== false);
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectDownload = async () => {
    try {
      const res = await fetch("/api/resources/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Checklist Requester",
          email: email,
          companyName: "",
          resourceId: "pdf-website-checklist",
        }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        window.location.href = `/api/resources/download?token=${data.token}`;
      } else {
        alert("Could not start download.");
      }
    } catch (err) {
      alert("Could not start download.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24">
      <BackToHome />
      <section className="relative py-20 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/jobs/studio-hero.jpg" />
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
             Free Resource
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="uppercase text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            The Ultimate 2026 <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Website Launch Checklist</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Don't launch your next project blind. Get the exact 50-point checklist we use to ensure our clients' websites are fast, secure, and ready to convert on day one.
          </motion.p>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {isSubmitted ? (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#12172b] rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12 text-center">
               <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
                 <CheckCircle2 className="h-10 w-10 text-primary" />
               </div>
               <h3 className="text-2xl font-black text-white mb-3">Request Verified!</h3>
               <p className="text-zinc-400 mb-8">
                 {emailSent ? (
                   <>Check your inbox. We've sent the PDF to <strong>{email}</strong>.</>
                 ) : (
                   <>We received your request, but email delivery is delayed. You can download it directly below.</>
                 )}
               </p>
               <button onClick={handleDirectDownload} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-primary transition-all">
                 <Download className="w-4 h-4" /> Download Instantly
               </button>
             </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#12172b] rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12">
              <div className="mb-8">
                <div className="w-full aspect-[16/9] relative rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-xl bg-black/40">
                  <SafeImage
                    src="/images/checklist/checklist-business-readiness.jpg"
                    alt="Website Development Checklist Preview"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">What's inside:</h3>
                <ul className="space-y-3">
                  {["Performance & SEO optimization checks", "Security & data privacy requirements", "Mobile responsiveness standards", "Analytics & tracking setup steps"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Where should we send it?</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter your email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-xl text-base md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black bg-white hover:bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,191,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : <>Get the Free Checklist <ArrowRight className="w-5 h-5" /></>}
                </button>
                {error && <p className="text-center text-sm text-red-400">{error}</p>}
                <p className="text-center text-xs text-zinc-500 mt-4">
                  100% free. No spam, ever.
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </section>
      <FloatingElements />
    </main>
  );
}
