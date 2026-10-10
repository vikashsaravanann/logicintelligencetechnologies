"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ChevronDown,
  Wrench,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  PhoneCall,
  HelpCircle,
} from "lucide-react";

export interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: string;
  tagColor?: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: "rotate-api-keys",
    q: "How do I cycle and rotate my production API keys without service interruption?",
    a: "Navigate to your Client Portal under Settings > API & Security. Click 'Generate Staged Key'. The platform generates a secondary production credential while keeping the previous key active for a 2-hour dual-active grace window. Once your environment variables in Kubernetes, AWS ECS, or Vercel are refreshed and the new key is validated, click 'Retire Previous Key' or let it automatically expire.",
    category: "Security & Keys",
  },
  {
    id: "enterprise-slas",
    q: "What are the contractual SLAs for enterprise production clusters?",
    a: "Our enterprise master service agreements guarantee 99.99% monthly availability for high-availability inference clusters. Production-halting (Severity 1) incidents trigger direct PagerDuty escalations with a 15-minute engineering response SLA and an active bridge with our senior distributed systems engineers.",
    category: "SLA & Uptime",
  },
  {
    id: "private-vpc-deployment",
    q: "Can we deploy Logic Intelligence AI models and RAG pipelines in private VPCs or on-premise?",
    a: "Yes. For organizations with strict data residency, IT governance, or sub-50ms latency requirements, we provide hermetic Docker images and Helm charts for AWS EKS, GCP Cloud Run / GKE, Azure Kubernetes Service, and air-gapped bare-metal environments. Zero outbound telemetry leaves your network perimeter.",
    category: "Deployment & VPC",
  },
  {
    id: "emergency-escalation",
    q: "How do we escalate critical production outages or severe latency degradation 24/7?",
    a: "Enterprise clients receive a dedicated high-priority channel via Slack Enterprise Grid or Microsoft Teams directly hooked into our SRE on-call rotation. In addition, an automated webhook alert from your APM (e.g. Datadog, New Relic) can trigger automated failover to our secondary multi-region standby cluster.",
    category: "Incident & Support",
  },
  {
    id: "data-privacy-training",
    q: "Does Logic Intelligence store, log, or train on client proprietary data?",
    a: "Never. All customer payloads, audio buffers, vector embeddings, and retrieval indices are processed strictly in RAM and stored in single-tenant isolated database schemas. We maintain zero-logging policies on model prompts and explicitly bind all upstream model providers to commercial zero-retention agreements.",
    category: "Data Privacy",
  },
  {
    id: "agent-deployment-timeline",
    q: "What is the typical deployment timeline for a custom enterprise AI agent workflow?",
    a: "Scattered architectural prototypes and proof-of-concepts are delivered within 48 to 72 hours. Hardened production systems—incorporating multi-agent orchestration, deterministic tool calling, fallback safety nets, and integration testing—typically achieve staging validation in 2 to 4 weeks.",
    category: "AI & RAG",
  },
  {
    id: "webhook-signatures",
    q: "How do we configure Webhook delivery signatures and replay attack prevention?",
    a: "Every outbound webhook payload contains an `X-LIT-Signature` header computed as an HMAC-SHA256 signature using your webhook secret. The signature includes a millisecond timestamp (`t=...`) to defend against replay attacks. We recommend rejecting requests with timestamp drifts exceeding 300 seconds.",
    category: "Security & Keys",
  },
  {
    id: "portal-authentication",
    q: "What authentication standards are supported for the Client Portal and Admin Dashboard?",
    a: "We support SAML 2.0 and OIDC enterprise SSO integrations (Okta, Azure AD, Google Workspace), as well as hardware-backed WebAuthn/FIDO2 MFA, time-based OTP (TOTP), and scoped service account tokens with granular role-based access control (RBAC).",
    category: "Security & Keys",
  },
  {
    id: "zero-persistence-audio",
    q: "How does the zero-persistence audio pipeline comply with HIPAA and GDPR regulations?",
    a: "Logic Voice streams conversational audio through volatile ephemeral ring buffers. Once speech-to-text transcription and response audio synthesis are completed, buffers are immediately overwritten with zeros. No raw acoustic waveforms ever touch persistent storage or unencrypted disks.",
    category: "Data Privacy",
  },
  {
    id: "api-rate-limits",
    q: "What are the rate limits on REST and WebSocket endpoints, and can they be raised?",
    a: "Standard tiers include 600 requests/minute and 50 concurrent WebRTC/WebSocket voice sessions. Enterprise tiers support custom throughput agreements scaling to 50,000+ requests/minute with reserved compute capacity and dedicated edge routers.",
    category: "SLA & Uptime",
  },
  {
    id: "telemetry-export",
    q: "Can we export telemetry, audit logs, and performance metrics to Datadog or Prometheus?",
    a: "Yes. All enterprise instances expose standard OpenTelemetry (OTel) metrics collectors, Prometheus `/metrics` endpoints, and structured JSON audit logs streaming to AWS CloudWatch, Datadog, Splunk, or Google Cloud Logging in real time.",
    category: "Deployment & VPC",
  },
  {
    id: "billing-and-usage",
    q: "How does billing work for multi-tenant deployments and custom voice workloads?",
    a: "We offer transparent, deterministic billing: either fixed monthly infrastructure retainers with predictable compute allocation or blended consumption models based on active agent hours and synthetic voice minutes. No hidden surge charges or token markups.",
    category: "Billing & License",
  },
];

const CATEGORIES = [
  "All",
  "Security & Keys",
  "SLA & Uptime",
  "Deployment & VPC",
  "Incident & Support",
  "Data Privacy",
  "AI & RAG",
  "Billing & License",
];

export default function HelpCenterInteractive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaqId, setOpenFaqId] = useState<string | null>("rotate-api-keys");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "yes" | "no">>({});

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const qLower = searchQuery.toLowerCase();
      return (
        faq.q.toLowerCase().includes(qLower) ||
        faq.a.toLowerCase().includes(qLower) ||
        faq.category.toLowerCase().includes(qLower)
      );
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const copyFaqLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/help-center#${id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleFeedback = (id: string, val: "yes" | "no", e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-12">
      {/* Search Bar & Category Navigation */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--lit-text-muted,#52677C)]">
            <Search className="w-5 h-5 text-[#1565C0]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enterprise FAQs, security protocols, SLAs, or VPC specs..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] text-base font-normal shadow-sm focus:outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-sm font-semibold"
                    : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] hover:text-[#1565C0]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1565C0]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Frequently Answered Questions ({filteredFaqs.length})
              </h2>
            </div>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-xs text-[#1565C0] hover:underline font-medium"
              >
                Reset filter
              </button>
            )}
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const userFeedback = feedback[faq.id];

                return (
                  <div
                    key={faq.id}
                    id={faq.id}
                    className={`rounded-2xl border transition-all duration-200 bg-white ${
                      isOpen
                        ? "border-[#1565C0]/40 shadow-md ring-1 ring-[#1565C0]/10"
                        : "border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1565C0] rounded-2xl"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#E7F3FF] text-[#1565C0] border border-[#BBDEFB]">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--lit-navy,#0B2545)] leading-snug">
                          {faq.q}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => copyFaqLink(faq.id, e)}
                          title="Copy direct link"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1565C0] hover:bg-[#E7F3FF] transition-colors"
                        >
                          {copiedId === faq.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                            isOpen
                              ? "bg-[var(--lit-navy,#0B2545)] text-white rotate-180"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 pt-1 border-t border-[var(--lit-border-light,#DFE7EF)]/70">
                        <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light mt-3">
                          {faq.a}
                        </p>

                        {/* Interactive Helpfulness Feedback */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="font-medium">Was this explanation helpful?</span>
                          <div className="flex items-center gap-2">
                            {userFeedback ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Thank you for your feedback!
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleFeedback(faq.id, "yes", e)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Yes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleFeedback(faq.id, "no", e)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>No</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#E7F3FF] text-[#1565C0] flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-[var(--lit-navy,#0B2545)]">
                  No matching technical guides found
                </h4>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
                  We couldn&apos;t find any FAQs matching &ldquo;{searchQuery}&rdquo;. Submit a direct support ticket to receive an architectural response from our engineering leads.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear Search Filter
                </button>
                <Link
                  href="/support/new"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  <span>Submit Engineering Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Support Channels & Developer Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Open Ticket Card */}
          <div className="rounded-3xl border border-[#BBDEFB] bg-[#E7F3FF]/70 p-6 sm:p-7 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#90CAF9] flex items-center justify-center text-[#1565C0] shadow-2xs">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white text-[#1565C0] border border-[#BBDEFB]">
                <Clock className="w-3 h-3" />
                Avg 12m Response
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2">
              Submit an Engineering Ticket
            </h3>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6 font-light">
              Facing deployment regressions, unexpected API errors, or latency bottlenecks? Open a ticket directly with our senior full-stack systems team.
            </p>
            <Link
              href="/support/new"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              <span>Open Support Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. Developer Documentation Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EDE7F6] border border-[#D1C4E9] flex items-center justify-center text-[#5E35B1] mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2">
              Developer Documentation
            </h3>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6 font-light">
              Inspect complete REST APIs, WebSocket streaming specifications, HMAC verification algorithms, and typed client SDKs.
            </p>
            <Link
              href="/docs/api"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wider uppercase transition-all"
            >
              <span>Explore API Reference</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* 3. Live System Status Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-medium">
                Infrastructure Health
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                All Systems Operational
              </span>
            </div>
            <Link
              href="/status"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#1565C0] hover:underline"
            >
              <span>View Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Enterprise Direct Channels Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[var(--lit-navy,#0B2545)]">
              <PhoneCall className="w-4 h-4 text-[#1FA9A2]" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                Direct Channels & Escalations
              </h4>
            </div>
            <ul className="space-y-3 text-xs text-[var(--lit-text-muted,#52677C)]">
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-700">Dedicated Slack Bridge</span>
                <span className="font-mono text-[11px] text-[#1565C0] font-semibold">Enterprise SLA</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-700">WhatsApp Hotline</span>
                <a
                  href="https://wa.me/919940556350"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>+91 99405 56350</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-700">Engineering Desk</span>
                <a
                  href="mailto:support@logicintelligencetechnologies.in"
                  className="font-mono text-[11px] text-slate-800 hover:text-[#1565C0]"
                >
                  support@logic...
                </a>
              </li>
              <li className="flex items-center justify-between py-1.5">
                <span className="font-medium text-slate-700">PagerDuty On-Call</span>
                <span className="font-mono text-[11px] text-purple-700 font-semibold">24/7/365</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
