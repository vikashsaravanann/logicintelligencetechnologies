import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import FloatingElements from "@/components/motion/floating-elements";
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
} from "lucide-react";

export const metadata: Metadata = {
  title: "Knowledge Assistant | RAG for your business",
  description:
    "A private RAG assistant that answers from your documents, prices, and policies — not the open internet. Demo on your 10 real questions before you pay.",
};

const steps = [
  { icon: FileText, title: "Ingest", body: "Pages, PDFs, tariffs, and policies you approve as true." },
  { icon: Search, title: "Retrieve", body: "Search your knowledge first — keyword plus vectors." },
  { icon: MessageSquare, title: "Answer", body: "Grok (xAI) with Groq fallback. Prices only from your files." },
  { icon: UserPlus, title: "Act", body: "Capture name, email, interest — then WhatsApp handoff." },
];

const included = [
  "Widget or /ai-style page on your domain",
  "Private knowledge base (your data only)",
  "Lead capture + email/WhatsApp notify",
  "Golden-set eval: 20 questions you sign off",
  "30-day support after go-live",
];

const fromYou = [
  "Logo, tone, 20–50 true Q&As",
  "PDFs / site URLs / price sheet",
  "WhatsApp number + inbox owner",
  "“Never say X” list",
  "One content owner",
];

export default function AiAssistantPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32">
      <BackToHome />

      <section className="relative px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/backdrops/work-hero.jpg" />
        <div className="relative z-10 max-w-5xl mx-auto text-center pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          LIT Knowledge Assistant
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Answers from{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            your documents
          </span>
          — not the open internet.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Most business chatbots guess. Ours is not allowed to invent a price.
          We load your packages, FAQs, and policies. Customers get an answer in
          your tone; you get the lead. Free demo on ten of your real questions
          before you pay.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/ai"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-black bg-primary hover:brightness-110"
          >
            Try the live demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/free-demo"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15 hover:bg-white/5"
          >
            Book a scoped demo
          </Link>
        </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 max-w-6xl mx-auto py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <s.icon className="w-6 h-6 text-primary mb-3" />
              <h2 className="font-bold mb-1">{s.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Written rule: if the retrieved docs do not contain the price, the assistant must not invent one.
        </p>
      </section>

      <section className="px-6 lg:px-8 max-w-6xl mx-auto py-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4">Built for</h2>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-2"><Hotel className="w-4 h-4 text-primary mt-0.5" /> Hotels — rooms, tariffs, amenities</li>
            <li className="flex gap-2"><Plane className="w-4 h-4 text-primary mt-0.5" /> Travel — packages and exclusions</li>
            <li className="flex gap-2"><Store className="w-4 h-4 text-primary mt-0.5" /> Clinics, educators, service firms</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4">Not for</h2>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-2"><Ban className="w-4 h-4 text-red-400 mt-0.5" /> Legal advice or medical diagnosis</li>
            <li className="flex gap-2"><Ban className="w-4 h-4 text-red-400 mt-0.5" /> Anything that must be 100% correct with no human</li>
            <li className="flex gap-2"><Ban className="w-4 h-4 text-red-400 mt-0.5" /> “Replace our whole CRM” in week one</li>
          </ul>
        </div>
      </section>

      <section className="px-6 lg:px-8 max-w-6xl mx-auto py-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="text-xl font-bold mb-4">Included</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {included.map((i) => (
              <li key={i} className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />{i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4">You provide</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {fromYou.map((i) => (
              <li key={i} className="flex gap-2"><FileText className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />{i}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 lg:px-8 max-w-6xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">How we sell it</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Add-on", d: "RAG widget on a site we already built — scoped onto Pro / Enterprise." },
            { t: "Starter seat", d: "One widget, one knowledge base, lead capture. Quoted after demo — typically custom / from ₹50,000 if it is a full build." },
            { t: "Monthly", d: "Hosting, re-ingest, eval reruns, support. Set only after the first live month." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-white/10 p-6">
              <h3 className="font-black text-lg mb-2">{p.t}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-500 mt-4 uppercase tracking-widest">
          Never: unlimited documents, zero hallucinations, or invented retainers
        </p>
      </section>

      <section className="px-6 lg:px-8 max-w-3xl mx-auto py-12 text-center mb-16">
        <h2 className="text-2xl font-bold mb-3">Send ten questions</h2>
        <p className="text-zinc-400 mb-8 text-sm sm:text-base leading-relaxed">
          The questions customers actually ask, plus the PDF or page with the true
          answer. If the demo answers those ten without inventing prices, we scope
          a widget on your site.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/free-demo" className="inline-flex px-8 py-4 rounded-xl font-bold text-black bg-primary">
            Start with a free demo
          </Link>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — I want a Knowledge Assistant demo. I have 10 questions ready.")}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold border border-white/15"
          >
            <Phone className="w-4 h-4" /> WhatsApp {COMPANY.phone}
          </a>
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
