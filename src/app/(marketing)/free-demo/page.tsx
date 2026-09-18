"use client";

import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Bot,
  Globe,
  Smartphone,
  Layers,
  Clock,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const SERVICE_TYPES = [
  "Full-stack website / web application",
  "AI chatbot — website widget",
  "AI chatbot — Telegram bot",
  "AI chatbot — Discord bot",
  "AI chatbot — WhatsApp Business flow",
  "Multi-channel bot (web + Telegram / Discord / WhatsApp)",
  "Hotel & hospitality website",
  "Travel & tourism website",
  "E-commerce / online store",
  "Business automation / RPA workflow",
  "Custom software / internal tool",
  "Other (describe below)",
];

const PROJECT_GOALS = [
  "Generate leads and inquiries",
  "Automate customer support with a chatbot",
  "Sell products or services online",
  "Take bookings / reservations",
  "Showcase brand and portfolio",
  "Publish content to multiple channels",
  "Internal ops / staff productivity",
  "Other",
];

const FEATURE_OPTIONS = [
  "Responsive website (mobile + desktop)",
  "Online payments / checkout",
  "Booking or appointment system",
  "Admin / CMS dashboard",
  "Website AI chat widget",
  "Telegram bot",
  "Discord bot",
  "WhatsApp messaging flow",
  "Lead capture + CRM handoff",
  "Multi-language support",
  "SEO & analytics setup",
  "Automation / RPA scripts",
];

const CHANNEL_OPTIONS = [
  { id: "website", label: "Website chat widget", desc: "Embedded on your site, RAG-aware answers" },
  { id: "telegram", label: "Telegram bot", desc: "BotFather bot for channels, groups, or DMs" },
  { id: "discord", label: "Discord bot", desc: "Server slash commands, support channels" },
  { id: "whatsapp", label: "WhatsApp", desc: "Business API / notification-style flows" },
  { id: "none", label: "No chatbot needed", desc: "Website or software only" },
];

const DEMO_INCLUDES = [
  {
    icon: FileText,
    title: "Scoped written plan",
    body: "Clear deliverables, stack recommendation, and timeline — not a vague sales pitch.",
  },
  {
    icon: Layers,
    title: "Working direction",
    body: "When the brief fits, a free prototype or interactive direction before any payment.",
  },
  {
    icon: Bot,
    title: "Bot channel options",
    body: "Website widget, Telegram, Discord, WhatsApp, or a multi-channel setup — you choose.",
  },
  {
    icon: Clock,
    title: "48–72 hour reply",
    body: "We review every submission and respond with next steps inside two to three business days.",
  },
];

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
    service_type: "Full-stack website / web application",
    goal: "Generate leads and inquiries",
    features: [] as string[],
    channels: [] as string[],
    brand_ready: "",
    content_ready: "",
    inspiration: "",
    budget: "Prefer a custom quote",
    timeline: "As soon as possible",
    details: "",
    consent_general: false,
    consent_whatsapp: false,
    consent_sms: false,
  });

  useEffect(() => {
    const pack = new URLSearchParams(window.location.search).get("pack");
    if (!pack) return;
    const map: Record<string, string> = {
      "digital-launch-pack": "Starter website project",
      "business-pro-pack": "Growth / multi-page project",
      "enterprise-pack": "Enterprise / multi-system build",
    };
    if (map[pack]) setForm((f) => ({ ...f, budget: map[pack] }));
  }, []);

  const toggleList = (key: "features" | "channels", value: string) => {
    setForm((prev) => {
      const list = prev[key];
      const next = list.includes(value)
        ? list.filter((x) => x !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/free-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          ...form,
          requirements: [
            `Service: ${form.service_type}`,
            `Goal: ${form.goal}`,
            `Channels: ${form.channels.join(", ") || "not specified"}`,
            `Features: ${form.features.join(", ") || "none selected"}`,
            `Brand ready: ${form.brand_ready || "n/a"}`,
            `Content ready: ${form.content_ready || "n/a"}`,
            `Inspiration: ${form.inspiration || "n/a"}`,
            `Details: ${form.details || "n/a"}`,
          ].join(" | "),
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.message ||
            "Submission failed. Please try again or contact us on WhatsApp."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors text-sm";
  const labelClass =
    "block text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2";
  const sectionTitleClass =
    "text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2";
  const sectionNumClass =
    "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary text-sm font-black shrink-0";

  if (sent) {
    return (
      <main className="min-h-screen bg-transparent text-white relative">
        <PageBackdrop src="/assets/backdrops/home-hero.jpg" />
        <BackToHome />
        <div className="relative z-10 max-w-lg mx-auto px-6 py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="uppercase text-3xl font-black tracking-tight mb-3">
            Request received
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Thank you. We will review your brief and reply within 48–72 hours with a clear plan —
            and, when it fits, a free demo direction. No payment is required until you approve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wide"
            >
              Back to home
            </Link>
            <Link
              href="/packages"
              className="px-6 py-3 rounded-xl border border-white/15 font-bold text-sm uppercase tracking-wide hover:bg-white/5"
            >
              View packages
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-white relative">
      <PageBackdrop src="/assets/backdrops/home-hero.jpg" />
      <BackToHome />

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-20 right-0 w-[480px] h-[320px] bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-[0.18em] mb-6"
          >
            Free demo · No payment upfront
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="uppercase text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight leading-[1.08]"
          >
            See your product direction
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              before you pay anything
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Tell us about your business, the channels you need (website,{" "}
            <strong className="text-zinc-200 font-semibold">Telegram</strong>,{" "}
            <strong className="text-zinc-200 font-semibold">Discord</strong>, WhatsApp, or all of
            them), and your timeline. We reply with a structured plan — and when the brief fits, a
            free working prototype or interactive direction. Payment only after you approve.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            {[
              { icon: Globe, t: "Websites & apps" },
              { icon: Bot, t: "AI chatbots" },
              { icon: MessageSquare, t: "Telegram · Discord" },
              { icon: Smartphone, t: "WhatsApp flows" },
            ].map((item) => (
              <div
                key={item.t}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <item.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-zinc-300">{item.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative z-10 px-6 lg:px-8 pb-10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_INCLUDES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <item.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="relative z-10 px-6 lg:px-8 pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-[#0c1224]/90 backdrop-blur-md p-6 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* 1. Contact */}
            <div>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>1</span> Your details
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                We use this only to reply about your project — never sold or shared.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Business / brand</label>
                  <input
                    type="text"
                    placeholder="If applicable"
                    value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Work email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 2. Business */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>2</span> About your business
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Context helps us recommend the right stack and channels.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Hospitality, retail, SaaS, education"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Existing website (if any)</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={form.existing_url}
                    onChange={(e) => setForm({ ...form, existing_url: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Primary audience</label>
                <input
                  type="text"
                  placeholder="e.g. Local customers, B2B buyers, students"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>What do you do?</label>
                <textarea
                  rows={3}
                  placeholder="Short description of the business and what makes it different."
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 3. Project type + channels */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>3</span> Project type & channels
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                We build full websites and software — and production chatbots for{" "}
                <span className="text-zinc-300">Telegram</span>,{" "}
                <span className="text-zinc-300">Discord</span>, website widgets, and WhatsApp-style
                flows. Select everything that applies.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className={labelClass}>Primary service *</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    className={inputClass + " appearance-none"}
                  >
                    {SERVICE_TYPES.map((o) => (
                      <option key={o} value={o} className="bg-transparent">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Main goal *</label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className={inputClass + " appearance-none"}
                  >
                    {PROJECT_GOALS.map((o) => (
                      <option key={o} value={o} className="bg-transparent">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className={labelClass}>Chatbot / messaging channels</label>
              <p className="text-xs text-zinc-500 mb-3">
                Choose one or more. Leave “No chatbot needed” if you only want a website or app.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {CHANNEL_OPTIONS.map((ch) => {
                  const on = form.channels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleList("channels", ch.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        on
                          ? "border-primary/50 bg-primary/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            on ? "bg-primary border-primary" : "border-zinc-600"
                          }`}
                        >
                          {on && <CheckCircle2 className="w-3 h-3 text-black" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ch.label}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{ch.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className={labelClass}>Capabilities needed</label>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {FEATURE_OPTIONS.map((feature) => {
                  const on = form.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleList("features", feature)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                        on
                          ? "border-primary/40 bg-primary/10 text-white"
                          : "border-white/10 text-zinc-400 hover:border-white/25"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          on ? "bg-primary border-primary" : "border-zinc-600"
                        }`}
                      >
                        {on && <CheckCircle2 className="w-2.5 h-2.5 text-black" />}
                      </div>
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Readiness */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>4</span> Design & content readiness
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Honest answers help us estimate effort — unfinished brand kits are fine.
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Brand assets (logo, colours)</label>
                  <div className="flex flex-wrap gap-2">
                    {["Ready to share", "Partially ready", "Need help creating"].map((opt) => (
                      <label
                        key={opt}
                        className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${
                          form.brand_ready === opt
                            ? "bg-primary/20 border-primary text-primary"
                            : "border-white/10 text-zinc-400 hover:border-white/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="brand"
                          value={opt}
                          className="hidden"
                          checked={form.brand_ready === opt}
                          onChange={() => setForm({ ...form, brand_ready: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Copy & media content</label>
                  <div className="flex flex-wrap gap-2">
                    {["Ready to share", "Partially ready", "Need help writing"].map((opt) => (
                      <label
                        key={opt}
                        className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${
                          form.content_ready === opt
                            ? "bg-primary/20 border-primary text-primary"
                            : "border-white/10 text-zinc-400 hover:border-white/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="content"
                          value={opt}
                          className="hidden"
                          checked={form.content_ready === opt}
                          onChange={() => setForm({ ...form, content_ready: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Inspiration links (optional)</label>
                  <input
                    type="text"
                    placeholder="Competitor sites, bot examples, styles you like"
                    value={form.inspiration}
                    onChange={(e) => setForm({ ...form, inspiration: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 5. Budget */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>5</span> Budget & timeline
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                We scope every project after the free brief. No prices are shown here — you receive a clear quote before any commitment.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Project scale</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className={inputClass + " appearance-none"}
                  >
                    <option className="bg-transparent">Starter website project</option>
                    <option className="bg-transparent">Growth / multi-page project</option>
                    <option className="bg-transparent">Enterprise / multi-system build</option>
                    <option className="bg-transparent">Chatbot / automation only</option>
                    <option className="bg-transparent">Prefer a custom quote</option>
                    <option className="bg-transparent">Not sure — please advise</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ideal launch timeline</label>
                  <select
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className={inputClass + " appearance-none"}
                  >
                    <option className="bg-transparent">As soon as possible</option>
                    <option className="bg-transparent">Within 1 month</option>
                    <option className="bg-transparent">1–3 months</option>
                    <option className="bg-transparent">Just exploring options</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Anything else we should know?</label>
                <textarea
                  rows={3}
                  placeholder="Domain/hosting, bot tokens you already have, must-have integrations, compliance needs…"
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 6. Consent */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>6</span> How should we reach you?
              </h2>
              <div className="space-y-4 mt-6 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      form.consent_general
                        ? "bg-primary border-primary"
                        : "border-zinc-600 group-hover:border-zinc-400"
                    }`}
                  >
                    {form.consent_general && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    required
                    className="hidden"
                    checked={form.consent_general}
                    onChange={(e) =>
                      setForm({ ...form, consent_general: e.target.checked })
                    }
                  />
                  <div>
                    <p className="text-sm text-white font-medium">
                      I agree to be contacted about this free-demo request *
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Email and phone only for this project conversation.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      form.consent_whatsapp
                        ? "bg-primary border-primary"
                        : "border-zinc-600 group-hover:border-zinc-400"
                    }`}
                  >
                    {form.consent_whatsapp && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.consent_whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, consent_whatsapp: e.target.checked })
                    }
                  />
                  <p className="text-sm text-zinc-300">WhatsApp is OK for updates on this request</p>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      form.consent_sms
                        ? "bg-primary border-primary"
                        : "border-zinc-600 group-hover:border-zinc-400"
                    }`}
                  >
                    {form.consent_sms && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.consent_sms}
                    onChange={(e) => setForm({ ...form, consent_sms: e.target.checked })}
                  />
                  <p className="text-sm text-zinc-300">SMS is OK if WhatsApp is unavailable</p>
                </label>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !form.consent_general}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wide hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    "Sending…"
                  ) : (
                    <>
                      Submit free demo request <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  No payment required. Reply in 48–72 hours.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
