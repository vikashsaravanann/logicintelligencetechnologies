import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { ArrowRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Investor Briefing",
  description:
    "LOGIC INTELLIGENCE TECHNOLOGIES operating update. Coimbatore technology startup. Not a priced round. Walk the live stack.",
};

const points = [
  { t: "Not raising", d: "This page is an operating update. There is no priced round and no partnership program." },
  { t: "What is live", d: "Company site, Logic AI (/ai), Knowledge Assistant, and the client portal. Demo first. Source on full payment." },
  { t: "Commercial floors", d: "Digital Launch from ₹8,999. Business Pro from ₹18,999. Custom and RAG from ₹50,000. Scoped — never invented on a call." },
  { t: "Operating path", d: "Project cash now. Retainers after a live launch. A monthly Knowledge Assistant seat only after ten golden questions pass." },
  { t: "Traction", d: "Live site: yes. Paying invoices, demos, and retainers stay blank until the number is real." },
  { t: "Jobs are not cheques", d: "CEO and Directors are employment offers. Investors receive equity and information rights — not a title." },
];

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-24 sm:pt-28">
      <BackToHome />
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          LOGIC INTELLIGENCE TECHNOLOGIES
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Investor Briefing
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Q3/Q4 2026. Coimbatore technology startup. Founder Vikash Saravanan.
          Where Logic Meets Innovation. Twenty minutes on production — then numbers.
        </p>
        <p className="mt-6 inline-block rounded-full bg-red-500/15 border border-red-400/30 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-300">
          Not raising
        </p>
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-4 pb-14">
        {points.map((p) => (
          <article key={p.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left min-h-[148px] flex flex-col">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-2">{p.t}</h2>
            <p className="text-sm text-zinc-300 leading-relaxed flex-1">{p.d}</p>
          </article>
        ))}
      </section>
      <section className="px-6 lg:px-8 max-w-3xl mx-auto text-center pb-24">
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/ai" className="inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-black bg-primary">
            Open Logic AI <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/ai-assistant" className="inline-flex items-center justify-center h-12 rounded-xl font-bold border border-white/15 hover:bg-white/5">
            Knowledge Assistant
          </Link>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — I read the investor briefing.")}`}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold border border-white/15 hover:bg-white/5"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
