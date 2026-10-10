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
  Lock,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";

const SERVICE_TYPES = [
  "Full-stack website / web application",
  "AI chatbot — website widget",
  "AI Voice agent / call center automation",
  "AI chatbot — Telegram bot",
  "AI chatbot — Discord bot",
  "AI chatbot — WhatsApp Business flow",
  "Multi-channel bot (web + voice + messaging)",
  "Healthcare / clinical portal",
  "Hotel & hospitality website",
  "Travel & tourism platform",
  "E-commerce / online marketplace",
  "Business automation / RPA workflow",
  "Custom software / internal enterprise tool",
  "Other (describe in technical requirements)",
];

const PROJECT_GOALS = [
  "Generate qualified leads and enterprise inquiries",
  "Automate customer support with conversational AI",
  "Deploy high-accuracy voice agent for phone operations",
  "Sell products or digital subscriptions online",
  "Handle bookings, reservations, and appointments",
  "Showcase company portfolio and authority",
  "Publish synchronized content across multi-channels",
  "Streamline internal operations and team productivity",
  "Other specific operational goal",
];

const FEATURE_OPTIONS = [
  "Responsive web app (mobile + desktop)",
  "Online payments & checkout (Stripe / Razorpay)",
  "Real-time booking & calendar integration",
  "Admin / CMS role-based dashboard",
  "Website AI chat widget with RAG",
  "AI voice calling & inbound IVR",
  "Telegram bot integration",
  "Discord bot community workflow",
  "WhatsApp Business messaging flow",
  "Lead capture + CRM automated handoff",
  "Multi-language localization",
  "High-performance SEO & analytics",
  "Custom backend API & database modeling",
  "HIPAA / SOC2 compliance readiness",
];

const CHANNEL_OPTIONS = [
  {
    id: "website",
    label: "Website Chat Widget",
    desc: "Embedded on your site with document RAG knowledge retrieval",
  },
  {
    id: "voice",
    label: "AI Voice Agent",
    desc: "Real-time telephony bot with sub-400ms conversational latency",
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    desc: "BotFather bot for private communities, alerts, or customer support",
  },
  {
    id: "discord",
    label: "Discord Bot",
    desc: "Community bot with slash commands, ticketing, and support channels",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Flow",
    desc: "Official Business API for intake, notifications, and customer journeys",
  },
  {
    id: "none",
    label: "No Chatbot Needed",
    desc: "Web application or custom backend system architecture only",
  },
];

const DEMO_INCLUDES = [
  {
    icon: FileText,
    title: "Scoped Technical Blueprint",
    body: "Concrete deliverables, system architecture topology, and delivery roadmap — not generic marketing fluff.",
  },
  {
    icon: Layers,
    title: "Working Prototype Direction",
    body: "When the scope fits, a live interactive interface or workflow direction before any monetary commitment.",
  },
  {
    icon: Bot,
    title: "Multi-Channel Architecture",
    body: "Website widget, AI voice, Telegram, Discord, WhatsApp, or synchronized omnichannel agents.",
  },
  {
    icon: Clock,
    title: "48–72h Turnaround",
    body: "Our senior engineering team reviews every submission and responds with architectural next steps within 2–3 business days.",
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
    goal: "Generate qualified leads and enterprise inquiries",
    features: [] as string[],
    channels: [] as string[],
    budget: "Prefer a custom quote",
    timeline: "As soon as possible",
    details: "",
    consent_general: false,
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
      const descriptionText = [
        `Goal: ${form.goal}`,
        `Industry: ${form.industry || "N/A"}`,
        `Existing URL: ${form.existing_url || "N/A"}`,
        `Target Audience: ${form.audience || "N/A"}`,
        `Business Context: ${form.about || "N/A"}`,
        `Channels: ${form.channels.join(", ") || "None specified"}`,
        `Selected Features: ${form.features.join(", ") || "None selected"}`,
        `Technical Details & Requirements: ${form.details || "N/A"}`,
      ].join("\n");

      const res = await fetch("/api/free-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          companyName: form.business.trim() || undefined,
          projectType: `Free Demo: ${form.service_type}`,
          budgetRange: form.budget || undefined,
          timeline: form.timeline || undefined,
          description: descriptionText,
          pageUrl: typeof window !== "undefined" ? window.location.href : "/free-demo",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        setError(
          data?.message ||
            "Submission could not be completed. Please try again or reach out directly at contact@logicintelligencetechnologies.com"
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Network timeout. Please check your connection or contact us directly via email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 transition-all text-sm font-sans";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";
  const sectionTitleClass =
    "text-lg sm:text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-3 mb-1.5";
  const sectionNumClass =
    "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#E7F3FF] text-[#1565C0] text-xs font-bold shrink-0 border border-[#B9DCFE]";

  if (sent) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold uppercase tracking-wider mb-4">
            Brief Ingested & Scheduled
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight mb-4">
            Free Demo Request Received
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-base">
            Thank you, <strong>{form.name}</strong>. Our engineering leads will review your specifications ({form.service_type}) and respond within 48–72 hours with a scoped architectural proposal and, where fitting, a working prototype direction.
          </p>

          <div className="p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-left text-xs text-slate-600 mb-8 shadow-2xs space-y-2">
            <div className="font-bold text-slate-900 text-sm mb-1">Request Summary:</div>
            <div><span className="text-slate-400">Target Goal:</span> {form.goal}</div>
            <div><span className="text-slate-400">Confirmation Sent To:</span> {form.email}</div>
            {form.phone && <div><span className="text-slate-400">Contact Number:</span> {form.phone}</div>}
            {form.channels.length > 0 && <div><span className="text-slate-400">Selected Channels:</span> {form.channels.join(", ")}</div>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="lit-btn lit-btn-secondary justify-center text-xs"
            >
              Back to Home
            </Link>
            <Link
              href="/packages"
              className="lit-btn lit-btn-primary justify-center text-xs"
            >
              <span>Explore Packages</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Header */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Prototype · Zero Upfront Cost</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.12] mb-5">
            Experience Your Product Direction <br />
            <span className="text-[#1565C0]">Before You Pay Anything</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Share your business goals, target channels (website, AI voice, Telegram, Discord, WhatsApp), and core functionality. We construct a concrete engineering proposal and a working demo direction.
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
                className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">{item.t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Inclusions Pillars */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_INCLUDES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Container */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-12 shadow-sm relative">
            {error && (
              <div className="mb-8 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* 01. Contact Details */}
              <div>
                <h2 className={sectionTitleClass}>
                  <span className={sectionNumClass}>01</span> Contact Details
                </h2>
                <p className="text-xs text-slate-500 mb-5">
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

              {/* 02. Business Context */}
              <div className="pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
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

              {/* 03. Project Type & Channels */}
              <div className="pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <h2 className={sectionTitleClass}>
                  <span className={sectionNumClass}>03</span> Project Type & Channels
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={labelClass}>Primary Service *</label>
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                      className={inputClass}
                    >
                      {SERVICE_TYPES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Primary Goal *</label>
                    <select
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      className={inputClass}
                    >
                      {PROJECT_GOALS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className={labelClass}>Messaging & Bot Channels</label>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {CHANNEL_OPTIONS.map((ch) => {
                    const isSelected = form.channels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleList("channels", ch.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-[#1565C0] bg-[#E7F3FF]/60 text-[var(--lit-navy,#0B2545)] shadow-2xs"
                            : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          {ch.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 leading-snug">
                          {ch.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <label className={labelClass}>Key Capabilities Required</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {FEATURE_OPTIONS.map((f) => {
                    const isSelected = form.features.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleList("features", f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? "border-[#1565C0] bg-[#1565C0] text-white shadow-2xs"
                            : "border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 04. Timeline & Budget */}
              <div className="pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
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
                      {[
                        "Prefer a custom quote",
                        "Under ₹25,000 / $300",
                        "₹25,000 – ₹75,000 / $300 - $900",
                        "₹75,000 – ₹2,00,000 / $900 - $2,500",
                        "₹2,00,000+ / $2,500+",
                      ].map((o) => (
                        <option key={o} value={o}>
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
                      {[
                        "As soon as possible",
                        "Within 2–4 weeks",
                        "1–2 months",
                        "Flexible / exploratory",
                      ].map((o) => (
                        <option key={o} value={o}>
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
              <div className="pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] space-y-4">
                <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent_general}
                    onChange={(e) => setForm({ ...form, consent_general: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-[#1565C0] focus:ring-[#1565C0]"
                  />
                  <span className="leading-relaxed">
                    I agree to receive a technical scoping proposal and demo link for this request. *
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Submitting Brief…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      <span>Submit Free Demo Request</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#1FA9A2]" />
                  <span>Zero payment required. Scoped turnaround inside 48–72 business hours.</span>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Canonical Deep Navy CTA */}
        <CTASection
          title="Prefer a Direct Technical Consultation First?"
          subtitle="Book a 30-minute architecture session with our engineering directors to talk through your systems topology before submitting a brief."
          primaryCta={{
            label: "Schedule Strategy Call",
            href: "/book-consultation",
          }}
          secondaryCta={{
            label: "Explore ROI Calculator",
            href: "/roi-calculator",
          }}
        />
      </div>
    </main>
  );
}
