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
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Knowledge Assistant | Private Enterprise RAG | Logic Intelligence Technologies",
  description:
    "A private RAG assistant that answers strictly from your approved documents, prices, and policies — never from the open internet.",
};

const steps = [
  { icon: FileText, title: "01 · Ingest", body: "Approved web pages, PDFs, schemas, rate cards, and operational policies." },
  { icon: Search, title: "02 · Retrieve", body: "Hybrid vector + BM25 keyword search queries your private index first." },
  { icon: MessageSquare, title: "03 · Synthesize", body: "Deterministic prompting with strictly bounded schema outputs. Zero hallucination." },
  { icon: UserPlus, title: "04 · Handoff", body: "Captures lead credentials and dispatches direct WhatsApp/CRM alerts." },
];

const included = [
  "Embeddable widget or dedicated /ai knowledge portal on your domain",
  "Isolated vector index (your organization's documents only)",
  "Real-time lead capture + automated email/WhatsApp dispatch",
  "Golden-set evaluation: 20 edge-case questions verified before launch",
  "30-day post-launch warranty and model tuning",
];

const fromYou = [
  "Brand guidelines, tone instructions, and 20–50 verified Q&As",
  "Product manuals, pricing matrices, and policy documentation",
  "WhatsApp alert number + designated team inbox",
  "“Strict Negative Constraints” list (topics to never discuss)",
  "One designated internal knowledge owner",
];

export default function AiAssistantPage() {
  return (
    <PageShell className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 lg:px-8 max-w-5xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
          <Bot className="w-3.5 h-3.5" />
          <span>LIT Knowledge Assistant Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-tight mb-6 text-white">
          Answers From{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Your Documents
          </span>
          <br /> Not the Open Internet.
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light mb-8">
          Generic chatbots hallucinate prices and invent promises. Our private RAG architecture is strictly bounded to your verified documents and price sheets. Free working prototype on your real questions before any payment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/ai"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-[#07090D] bg-cyan-500 hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
          >
            <span>Try the Live Demo</span> <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/free-demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white border border-white/10 bg-[#10131A] hover:bg-white/[0.06] transition-all"
          >
            <span>Request Scoped Build</span>
          </Link>
        </div>

        {/* Visual Architecture Banner */}
        <div className="max-w-4xl mx-auto aspect-[21/9] relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#10131A]">
          <SafeImage
            src="/assets/jobs/ai-lab.jpg"
            alt="LIT Knowledge Assistant Architecture"
            fill
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent" />
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-white/10 bg-[#10131A] p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-base text-white uppercase tracking-wider mb-2">{s.title}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-mono text-zinc-500 mt-6 uppercase tracking-wider">
          Engineered Directive: If query context is absent from approved documents, the assistant strictly declines to answer.
        </p>
      </section>

      {/* Built For vs Not For */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mb-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">Optimal For</h2>
          </div>
          <ul className="space-y-4 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <Hotel className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Hotels & Resorts</strong>
                <span className="text-xs text-zinc-400">Room tiers, seasonal tariffs, check-in policies, and amenity schedules.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Travel & Tour Agencies</strong>
                <span className="text-xs text-zinc-400">Custom itinerary packages, inclusions/exclusions, and booking prerequisites.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Store className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Clinics & Service Firms</strong>
                <span className="text-xs text-zinc-400">Appointment prep, practitioner credentials, and standard service rates.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Ban className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">Explicitly Excluded</h2>
          </div>
          <ul className="space-y-4 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Autonomous Legal or Medical Diagnosis</strong>
                <span className="text-xs text-zinc-400">High-liability decisioning requires licensed human practitioner sign-off.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Unsupervised High-Stakes Actions</strong>
                <span className="text-xs text-zinc-400">Zero-review financial transactions without human verification gateways.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Rip-and-Replace Overhauls</strong>
                <span className="text-xs text-zinc-400">We augment existing stacks through clean APIs, not reckless total replacements.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Included vs You Provide */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mb-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-cyan-500/25 bg-[#10131A] p-8 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Scope Deliverables</span>
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
            {included.map((i) => (
              <li key={i} className="flex gap-3 items-start">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            <span>Prerequisites From You</span>
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
            {fromYou.map((i) => (
              <li key={i} className="flex gap-3 items-start">
                <FileText className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[#10131A] to-blue-500/10 p-8 sm:p-12 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mb-4">
            Send Us Ten Real Questions
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-light mb-8">
            Send the exact questions your customers ask every day, plus the PDF or URL containing the ground truth. If our demo answers all ten accurately without hallucinating, we scope the deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free-demo"
              className="px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-[#07090D] bg-cyan-500 hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)]"
            >
              Start Free Demo
            </Link>
            <a
              href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — I want a Knowledge Assistant demo. I have 10 questions ready.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white border border-white/10 bg-[#07090D] hover:bg-white/[0.06] transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
