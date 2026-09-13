"use client";
import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LeadForm() {
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
    <section id="demo" className="py-24 px-6 lg:px-8 relative bg-black overflow-hidden border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] opacity-[0.1] blur-[100px] bg-gradient-to-r from-primary to-accent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-4 h-4" /> Start Your Project
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Ready to see your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">vision come alive?</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Request a free, no-obligation demo prototype. We'll run your ideas through our scoping framework and build you a personalized demo before you pay a single rupee.
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {sent ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[#12172b] rounded-3xl border border-white/10 shadow-2xl p-6 md:p-12">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-4xl font-black text-white mb-4">Request Received!</h3>
              <p className="text-lg text-zinc-400 mb-8">Thanks — we've received your request and will follow up on the channel(s) you selected.</p>
              <a href="https://wa.me/919342877474" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm border border-[#25D366]/20 hover:bg-[#25D366] hover:text-black transition-all">
                <MessageSquare className="w-4 h-4" /> Message on WhatsApp
              </a>
            </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="bg-[#12172b] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
              
              {/* 1. Contact details */}
              <div className="mb-12">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>1</span> Your Details</h2>
                <p className={sectionDescClass}>So we know who we're talking to and how to reach you.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Full name *</label>
                    <input type="text" required placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Business / org name</label>
                    <input type="text" placeholder="If applicable" value={form.business} onChange={e => setForm({...form, business: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Email address *</label>
                    <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone / WhatsApp *</label>
                    <input type="tel" required placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* 2. About the business */}
              <div className="mb-12 pt-12 border-t border-white/10">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>2</span> About Your Business</h2>
                <p className={sectionDescClass}>Context that shapes how we design and structure your site.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Industry / sector</label>
                    <input type="text" placeholder="e.g. Hospitality, Retail, SaaS" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Existing website</label>
                    <input type="url" placeholder="https://" value={form.existing_url} onChange={e => setForm({...form, existing_url: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="mb-6">
                  <label className={labelClass}>Who is your target audience?</label>
                  <input type="text" placeholder="e.g. Local customers, B2B buyers" value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Briefly describe your business</label>
                  <textarea rows={3} placeholder="What you do, and what makes you different." value={form.about} onChange={e => setForm({...form, about: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* 3. Project scope */}
              <div className="mb-12 pt-12 border-t border-white/10">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>3</span> Project Scope</h2>
                <p className={sectionDescClass}>What are we actually building?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Which service fits best?</label>
                    <select value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})} className={inputClass + " appearance-none"}>
                      <option>Full Stack Web Development</option>
                      <option>Hotel & Hospitality Website</option>
                      <option>Travel Agency Website</option>
                      <option>E-Commerce Website</option>
                      <option>Custom Software / CRM / ERP</option>
                      <option>Mobile App Development</option>
                      <option>Game Development</option>
                      <option>UI/UX Design</option>
                      <option>SEO Optimization</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Main goal of this project?</label>
                    <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} className={inputClass + " appearance-none"}>
                      <option>Generate leads / inquiries</option>
                      <option>Sell products online</option>
                      <option>Accept bookings / reservations</option>
                      <option>Showcase our brand / portfolio</option>
                      <option>Provide information / support</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>Features needed <span className="text-zinc-500 font-normal lowercase">(Select all that apply)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      "Booking / appointment system",
                      "Online payments",
                      "Admin panel / content management",
                      "Blog / news section",
                      "Multi-language support",
                      "Customer / member login",
                      "WhatsApp / live chat integration",
                      "SEO setup"
                    ].map(feature => (
                      <label key={feature} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.features.includes(feature) ? 'bg-primary border-primary' : 'border-zinc-600'}`}>
                          {form.features.includes(feature) && <CheckCircle2 className="w-3 h-3 text-black" />}
                        </div>
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Design & content */}
              <div className="mb-12 pt-12 border-t border-white/10">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>4</span> Design & Content Readiness</h2>
                
                <div className="space-y-6 mt-6">
                  <div>
                    <label className={labelClass}>Do you have a logo and brand colors ready?</label>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {['Yes, fully ready', 'Partially', 'No, need help'].map(opt => (
                        <label key={opt} className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${form.brand_ready === opt ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}>
                          <input type="radio" name="brand" value={opt} className="hidden" checked={form.brand_ready === opt} onChange={() => setForm({...form, brand_ready: opt})} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Do you have content & photos ready?</label>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {['Yes, fully ready', 'Partially', 'No, need help'].map(opt => (
                        <label key={opt} className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${form.content_ready === opt ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}>
                          <input type="radio" name="content" value={opt} className="hidden" checked={form.content_ready === opt} onChange={() => setForm({...form, content_ready: opt})} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Inspiration websites</label>
                    <input type="text" placeholder="e.g. competitor sites, style you admire (paste links)" value={form.inspiration} onChange={e => setForm({...form, inspiration: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* 5. Budget & timeline */}
              <div className="mb-12 pt-12 border-t border-white/10">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>5</span> Budget & Timeline</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
                  <div>
                    <label className={labelClass}>Expected budget range</label>
                    <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className={inputClass + " appearance-none"}>
                      <option>Digital Launch Pack (from ₹8,999)</option>
                      <option>Business Pro Pack (from ₹18,999)</option>
                      <option>Enterprise Pack (₹50,000+)</option>
                      <option>Not sure — please advise</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ideal launch timeline</label>
                    <select value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} className={inputClass + " appearance-none"}>
                      <option>As soon as possible</option>
                      <option>Within 1 month</option>
                      <option>1-3 months</option>
                      <option>Just exploring options</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Anything else we should know?</label>
                  <textarea rows={3} placeholder="Domain/hosting status, specific integrations, etc." value={form.details} onChange={e => setForm({...form, details: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* 6. Consent */}
              <div className="pt-12 border-t border-white/10">
                <h2 className={sectionTitleClass}><span className={sectionNumClass}>6</span> How Should We Reach You?</h2>
                
                <div className="space-y-4 mt-6 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${form.consent_general ? 'bg-primary border-primary' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                      {form.consent_general && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                    <input type="checkbox" required className="hidden" checked={form.consent_general} onChange={e => setForm({...form, consent_general: e.target.checked})} />
                    <div>
                      <span className="text-sm text-white block"><span className="text-red-400 font-bold">Required —</span> Yes, contact me about my inquiry.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${form.consent_whatsapp ? 'bg-primary border-primary' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                      {form.consent_whatsapp && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.consent_whatsapp} onChange={e => setForm({...form, consent_whatsapp: e.target.checked})} />
                    <div>
                      <span className="text-sm text-white block">Send me updates on WhatsApp.</span>
                      <span className="text-xs text-zinc-500">Leave unchecked and we'll only use phone/email.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-12">
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black bg-white hover:bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,191,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <><Send className="w-5 h-5" /> Request My Free Demo</>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-6 flex justify-center items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" /> Your data is secure and never shared. You can opt out anytime.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
