import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import { COMPANY } from "@/config/company";
import {
  FileText,
  Search,
  MessageSquare,
  UserPlus,
  ShieldCheck,
  Hotel,
  Plane,
  Store,
  Ban,
  ArrowRight,
  Phone,
  Sparkles,
  Bot,
  Lock,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import AiAssistantInteractiveDemo from "./components/AiAssistantInteractiveDemo";

export const metadata: Metadata = {
  title: "Knowledge Assistant | Private Enterprise RAG | Logic Intelligence Technologies",
  description:
    "A private RAG assistant that answers strictly from your approved documents, prices, and policies — never from the open internet.",
  alternates: {
    canonical: "/ai-assistant",
  },
  openGraph: {
    title: "Knowledge Assistant | Private Enterprise RAG | Logic Intelligence Technologies",
    description:
      "A private RAG assistant that answers strictly from your approved documents, prices, and policies — never from the open internet.",
    images: [
      {
        url: "/api/og?title=Private+Enterprise+RAG&category=AI+Knowledge+Assistant",
        width: 1200,
        height: 630,
        alt: "LIT Private Enterprise RAG",
      },
    ],
  },
};

const STEPS = [
  {
    icon: FileText,
    step: "01",
    title: "Ingest",
    body: "Approved web pages, PDFs, schemas, rate cards, and operational policies are parsed and indexed.",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    icon: Search,
    step: "02",
    title: "Retrieve",
    body: "Hybrid vector + BM25 keyword search queries your private index with strict tenant isolation.",
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Synthesize",
    body: "Deterministic prompting with strictly bounded schema outputs and citations. Zero hallucination.",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    icon: UserPlus,
    step: "04",
    title: "Handoff",
    body: "Captures verified customer credentials and dispatches immediate WhatsApp or CRM alerts.",
    accent: "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]",
  },
];

const INCLUDED = [
  "Embeddable widget or dedicated /ai knowledge portal on your domain",
  "Isolated vector index (your organization's documents only)",
  "Real-time lead capture + automated email/WhatsApp dispatch",
  "Golden-set evaluation: 20 edge-case questions verified before launch",
  "30-day post-launch warranty and continuous model tuning",
];

const FROM_YOU = [
  "Brand guidelines, tone instructions, and 20–50 verified Q&As",
  "Product manuals, pricing matrices, and policy documentation",
  "WhatsApp alert number + designated team inbox",
  "“Strict Negative Constraints” list (topics to never discuss)",
  "One designated internal knowledge owner",
];

export default function AiAssistantPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "AI Assistant", path: "/ai-assistant" },
        ])}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* Back Navigation */}
          <div>
            <BackButton fallbackHref="/" label="Home" inline className="mb-6" />
          </div>

          {/* Hero Section */}
          <section className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Bot className="w-3.5 h-3.5" />
              <span>LIT Knowledge Assistant Engine • Private Enterprise RAG</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Answers From Your Documents,{" "}
              <span className="font-serif italic text-[var(--lit-teal,#1FA9A2)] font-normal">
                Not the Open Internet
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto leading-relaxed">
              Generic chatbots hallucinate prices and invent promises. Our private RAG architecture is strictly bounded to your verified documents, service rates, and policy sheets. Free working prototype on your real questions before any payment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/ai"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#153e75] transition-all shadow-sm"
              >
                <span>Try the Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/free-demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all shadow-xs"
              >
                <span>Request Scoped Build</span>
              </Link>
            </div>

            {/* Visual Architecture Banner */}
            <div className="max-w-4xl mx-auto aspect-[21/9] relative rounded-3xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] shadow-md bg-white mt-8">
              <SafeImage
                src="/assets/jobs/ai-lab.jpg"
                alt="LIT Knowledge Assistant Architecture"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--lit-navy,#0B2545)]/60 via-transparent to-transparent" />
            </div>
          </section>

          {/* Interactive RAG Simulator Component */}
          <AiAssistantInteractiveDemo />

          {/* 4 Steps Section */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">
                Pipeline Mechanics
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)]">
                How Private RAG Works
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.accent}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-[var(--lit-text-muted,#52677C)]">
                          STEP {s.step}
                        </span>
                      </div>
                      <h3 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                        {s.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs font-mono text-[var(--lit-text-muted,#52677C)] mt-6 uppercase tracking-wider">
              Engineered Directive: If query context is absent from approved documents, the assistant strictly declines to answer.
            </p>
          </section>

          {/* Built For vs Not For */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#E0F2F1] text-[#00796B]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-poppins text-xl font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-tight">
                  Optimal For
                </h3>
              </div>
              <ul className="space-y-5 text-sm text-[var(--lit-text-muted,#52677C)]">
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#E7F3FF] text-[#1565C0] shrink-0 mt-0.5">
                    <Hotel className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Hotels &amp; Resorts
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      Room tiers, seasonal tariffs, check-in policies, and amenity schedules.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#EDE7F6] text-[#5E35B1] shrink-0 mt-0.5">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Travel &amp; Tour Agencies
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      Custom itinerary packages, inclusions/exclusions, and booking prerequisites.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#FFF8E1] text-[#B78103] shrink-0 mt-0.5">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Clinics &amp; Service Firms
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      Appointment prep, practitioner credentials, and standard service rates.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFEBEE] text-[#C62828]">
                  <Ban className="w-5 h-5" />
                </div>
                <h3 className="font-poppins text-xl font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-tight">
                  Explicitly Excluded
                </h3>
              </div>
              <ul className="space-y-5 text-sm text-[var(--lit-text-muted,#52677C)]">
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#FFEBEE] text-[#C62828] shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Autonomous Legal or Medical Diagnosis
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      High-liability decisioning requires licensed human practitioner sign-off.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#FFEBEE] text-[#C62828] shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Unsupervised High-Stakes Actions
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      Zero-review financial transactions without human verification gateways.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#FFEBEE] text-[#C62828] shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[var(--lit-navy,#0B2545)] block mb-0.5 font-semibold">
                      Rip-and-Replace Overhauls
                    </strong>
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      We augment existing stacks through clean APIs, not reckless total replacements.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Included vs You Provide */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-xs space-y-6">
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
                <span>Scope Deliverables</span>
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                {INCLUDED.map((i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-xs space-y-6">
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
                <span>Prerequisites From You</span>
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                {FROM_YOU.map((i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <FileText className="w-4 h-4 text-[var(--lit-text-muted,#52677C)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Send Us Ten Real Questions Banner */}
          <section className="rounded-3xl border border-[#0B2545] bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-12 text-center shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#45D9D2]/30 bg-[#45D9D2]/10 text-[#45D9D2] text-xs font-mono font-semibold tracking-widest uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Hallucination Evaluation Protocol</span>
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Send Us Ten Real Questions
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-light">
              Send the exact questions your customers ask every day, plus the PDF or URL containing the ground truth. If our prototype answers all ten accurately without hallucinating, we scope the deployment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/free-demo"
                className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#188a84] transition-all shadow-sm"
              >
                Start Free Demo
              </Link>
              <a
                href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(
                  "Hi LIT — I want a Knowledge Assistant demo. I have 10 questions ready."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
              >
                <Phone className="w-4 h-4 text-[#45D9D2]" />
                <span>WhatsApp Direct</span>
              </a>
            </div>
          </section>

          {/* Canonical CTA */}
          <CTASection
            title="Evaluate on Your Organization's Documents"
            subtitle="Send us 10 real questions and your source PDF or URL. If our prototype answers all 10 accurately without hallucinating, we scope the deployment."
            primaryCta={{
              label: "Request Free Prototype",
              href: "/free-demo",
            }}
            secondaryCta={{
              label: "Explore Systems Architecture",
              href: "/architecture",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
