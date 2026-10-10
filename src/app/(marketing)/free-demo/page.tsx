"use client";

import Link from "next/link";
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
  Sparkles,
  ArrowRight,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/page-shell";

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
  { id: "website", label: "Website Chat Widget", desc: "Embedded on your site, RAG-aware answers" },
  { id: "telegram", label: "Telegram Bot", desc: "BotFather bot for channels, groups, or direct messages" },
  { id: "discord", label: "Discord Bot", desc: "Server slash commands, support channels" },
  { id: "whatsapp", label: "WhatsApp Flow", desc: "Business API / notification & intake flows" },
  { id: "none", label: "No Chatbot Needed", desc: "Website or custom software architecture only" },
];

const DEMO_INCLUDES = [
  {
    icon: FileText,
    title: "Scoped Technical Plan",
    body: "Concrete deliverables, stack topology, and delivery roadmap — not generic sales fluff.",
  },
  {
    icon: Layers,
    title: "Working Prototype",
    body: "When the scope fits, a live prototype or interactive interface direction before any payment.",
  },
  {
    icon: Bot,
    title: "Multi-Channel Setup",
    body: "Website widget, Telegram, Discord, WhatsApp, or synchronized omnichannel agents.",
  },
  {
    icon: Clock,
    title: "48–72h Turnaround",
    body: "We review every submission and respond with architectural next steps within 2–3 business days.",
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        setError(
          data?.message ||
            "Submission failed. Please try again or reach out on WhatsApp directly."
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#07090D] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors text-sm font-sans";
  const labelClass =
    "block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2";
  const sectionTitleClass =
    "text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3 mb-2";
  const sectionNumClass =
    "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold shrink-0 border border-cyan-500/20";

  if (sent) {
    return (
      <PageShell className="pt-32 pb-24">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#10131A] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <CheckCircle2 className="w-10 h-10 text-cyan-400" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            Brief Ingested
          </span>
          <h1 className="uppercase text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
            Free Demo Request Received
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed text-sm sm:text-base">
            Thank you. Our engineering team will review your specifications and reply within 48–72 hours with a scoped architectural proposal and, where fitting, a live interactive prototype direction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest transition-all"
            >
              Back to Home
            </Link>
            <Link
              href="/packages"
              className="px-8 py-3.5 rounded-xl border border-white/10 bg-[#10131A] hover:bg-white/[0.06] text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              Explore Packages
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="pt-32 pb-24">
      {/* Hero Header */}
      <section className="px-6 lg:px-8 mb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Prototype · Zero Upfront Cost</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight uppercase mb-6 leading-[1.1]">
          Experience Your Product Direction <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Before You Pay Anything
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Share your business goals, target channels (website, Telegram, Discord, WhatsApp), and core functionality. We construct a concrete engineering proposal and a working demo direction.
        </p>

        {/* Quick Channels Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          {[
            { icon: Globe, t: "Websites & Web Apps" },
            { icon: Bot, t: "AI Chatbots & RAG" },
            { icon: MessageSquare, t: "Telegram & Discord" },
            { icon: Smartphone, t: "WhatsApp Flows" },
          ].map((item) => (
            <div
              key={item.t}
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-white/10 bg-[#10131A]"
            >
              <item.icon className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-zinc-200">{item.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Inclusions Pillars */}
      <section className="px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_INCLUDES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#10131A] p-5 hover:border-cyan-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form Container */}
      <section className="px-6 lg:px-8">
        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-12 shadow-2xl relative">
          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* 1. Contact Details */}
            <div>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>01</span> Contact Details
              </h2>
              <p className="text-xs text-zinc-400 mb-6 font-mono">
                Used solely to transmit your scoped demo and architecture outline.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Business / Organization</label>
                  <input
                    type="text"
                    placeholder="Vance Logistics"
                    value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@vance.io"
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
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 2. Business Context */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>02</span> Business Context
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Industry Sector</label>
                  <input
                    type="text"
                    placeholder="Healthcare, SaaS, Logistics, Retail"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Existing Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={form.existing_url}
                    onChange={(e) => setForm({ ...form, existing_url: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Primary Target Audience</label>
                <input
                  type="text"
                  placeholder="Enterprise procurement teams, B2B buyers, local patients"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Core Business Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize your service, value proposition, and current operational workflow..."
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 3. Scope & Channels */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>03</span> Project Type & Channels
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className={labelClass}>Primary Service *</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    className={inputClass}
                  >
                    {SERVICE_TYPES.map((o) => (
                      <option key={o} value={o} className="bg-[#10131A]">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>North-Star Goal *</label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className={inputClass}
                  >
                    {PROJECT_GOALS.map((o) => (
                      <option key={o} value={o} className="bg-[#10131A]">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className={labelClass}>Messaging & Bot Channels</label>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {CHANNEL_OPTIONS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    aria-pressed={form.channels.includes(ch.id)}
                    onClick={() => toggleList("channels", ch.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      form.channels.includes(ch.id)
                        ? "border-cyan-400 bg-cyan-500/10 text-white"
                        : "border-white/10 bg-[#07090D] text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-sm font-bold text-white mb-1">{ch.label}</span>
                    <span className="block text-xs text-zinc-400 leading-snug">{ch.desc}</span>
                  </button>
                ))}
              </div>

              <label className={labelClass}>Required Capabilities</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {FEATURE_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={form.features.includes(f)}
                    onClick={() => toggleList("features", f)}
                    className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      form.features.includes(f)
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-300"
                        : "border-white/10 bg-[#07090D] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Timeline & Budget */}
            <div className="pt-10 border-t border-white/10">
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>04</span> Timeline & Budget
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Budget Range</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className={inputClass}
                  >
                    {["Prefer a custom quote", "Under ₹25,000", "₹25,000 – ₹75,000", "₹75,000 – ₹2,00,000", "₹2,00,000+"].map((o) => (
                      <option key={o} value={o} className="bg-[#10131A]">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Target Launch Horizon</label>
                  <select
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className={inputClass}
                  >
                    {["As soon as possible", "Within 2–4 weeks", "1–2 months", "Flexible"].map((o) => (
                      <option key={o} value={o} className="bg-[#10131A]">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Technical Constraints / Specific Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Specific API integrations, existing databases, compliance standards, or reference sites..."
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit & Consent */}
            <div className="pt-8 border-t border-white/10 space-y-4">
              <label className="flex items-start gap-3 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.consent_general}
                  onChange={(e) => setForm({ ...form, consent_general: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 bg-[#07090D] text-cyan-500 focus:ring-cyan-500"
                />
                <span className="leading-relaxed">
                  I agree to receive a technical scoping proposal and demo link for this request. *
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
              >
                {isSubmitting ? (
                  "Submitting Brief…"
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Free Demo Request</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Zero payment required. Scoped turnaround inside 48–72 hours.</span>
              </div>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
