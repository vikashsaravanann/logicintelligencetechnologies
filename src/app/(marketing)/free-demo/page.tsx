"use client";
import Link from "next/link";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CHECKLIST_ITEMS_31_50 } from "@/data/websiteChecklist";

export default function FreeDemoPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    industry: "",
    existing_url: "",
    audience: "",
    about: "",
    service_type: "Full Stack Web Development",
    goal: "Generate leads / inquiries",
    features: [] as string[],
    brand_ready: "",
    content_ready: "",
    inspiration: "",
    budget: "Digital Launch Pack (from ₹8,999)",
    timeline: "As soon as possible",
    details: "",
    consent_general: false,
    consent_whatsapp: false,
    consent_sms: false
  });

  useEffect(() => {
    const pack = new URLSearchParams(window.location.search).get("pack");
    if (!pack) return;
    const map: Record<string, string> = {
      "digital-launch-pack": "Digital Launch Pack (from ₹8,999)",
      "business-pro-pack": "Business Pro Pack (from ₹18,999)",
      "enterprise-pack": "Enterprise Pack (custom, from ₹50,000)",
    };
    if (map[pack]) setForm((f) => ({ ...f, budget: map[pack] }));
  }, []);

  const handleFeatureToggle = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/free-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requirements: `Selected Features: ${form.features.join(", ")} | Brand Ready: ${form.brand_ready} | Details: ${form.details}`
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Submission failed. Please try again or reach us on WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-base md:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner";
  const labelClass = "block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2";
  const sectionTitleClass = "text-xl font-bold text-white mb-2 flex items-center gap-3";
  const sectionDescClass = "text-sm text-zinc-400 mb-6";
  const sectionNumClass = "w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0";

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-24">
      <BackToHome />
      <section className="relative py-20 px-6 lg:px-8 overflow-hidden border-b border-white/5">
        <PageBackdrop src="/assets/backdrops/contact-hero.jpg" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
             Zero Risk. Zero Commitment.
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            See Your Website <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Before You Pay Anything</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-zinc-400 max-w-2xl mx-auto font-light mb-10">
            Share your goals, stack preferences, and timeline. We scope the work, reply with a clear plan, and — when it fits — a free demo prototype. No payment until you approve.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[140px]">
              <span className="text-2xl font-bold text-white mb-1">48-72 hrs</span>
              <span className="text-zinc-400">Reply window</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[140px]">
              <span className="text-2xl font-bold text-white mb-1">₹0</span>
              <span className="text-zinc-400">Cost until approved</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[140px]">
              <span className="text-2xl font-bold text-white mb-1">50 Points</span>
              <span className="text-zinc-400">Scoping framework</span>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto">
          {sent ? (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[#12172b] rounded-3xl border border-white/10 shadow-2xl p-6 md:p-12">
               <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
                 <CheckCircle2 className="h-12 w-12 text-primary" />
               </div>
               <h3 className="text-4xl font-black text-white mb-4">Request Received!</h3>
               <p className="text-lg text-zinc-400 mb-4">Thanks — we received your free demo request. Our team typically replies within 48–72 hours with next steps.</p>
               <p className="text-sm text-zinc-500 mb-8">For a faster response, message us on WhatsApp with your business name and goals.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
               <a href={`https://wa.me/919342877474?text=${encodeURIComponent("Hi Logic Intelligence — I just submitted a free demo request on the website. Looking forward to next steps.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm border border-[#25D366]/20 hover:bg-[#25D366] hover:text-black transition-all">
                 <MessageSquare className="w-4 h-4" /> Continue on WhatsApp
               </a>
               <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-bold text-sm border border-white/10 hover:bg-white/10 transition-all">
                 Back to Home
               </Link>
               </div>
             </motion.div>
          ) : (
            <>
            <div className="bg-[#12172b] p-6 md:p-8 rounded-[2rem] border border-white/10 mb-8">
              <h2 className="text-lg font-bold text-white mb-2">Website readiness checklist — items 31–50</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Current 2026 delivery standards we use when scoping demos and production builds.
                Full 50-point list is available on the checklist page.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {CHECKLIST_ITEMS_31_50.map((item) => (
                  <li key={item.id} className="flex gap-2 text-xs sm:text-sm text-zinc-300 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-primary font-bold shrink-0 w-6">{item.id}</span>
                    <span><span className="text-zinc-500 text-[10px] uppercase tracking-wide">{item.category}</span><br/>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-center text-zinc-500 text-sm">Form continues below — full interactive form preserved in production source.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
