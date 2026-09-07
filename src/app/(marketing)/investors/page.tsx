import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { ArrowRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Investor briefing | LOGIC INTELLIGENCE TECHNOLOGIES",
  description:
    "Operating update for mentors and future investors. Coimbatore technology startup. Not a priced round.",
};

const points = [
  { t: "Not raising", d: "This page is an operating update. There is no priced round and no partnership program." },
  { t: "What is live", d: "Company site, /ai, /ai-assistant, client portal. Demo first. Source on full payment." },
  { t: "Floors", d: "Launch from \u20b98,999. Pro from \u20b918,999. Custom / RAG from \u20b950,000. Scoped \u2014 never invented on a call." },
  { t: "Path", d: "Cash now (packs). Retainers next. Monthly Knowledge Assistant seat later \u2014 after ten golden questions pass." },
  { t: "Traction", d: "Live site: yes. Paying invoices / demos / retainers stay blank until the number is real." },
  { t: "Jobs \u2260 cheques", d: "CEO and Directors are employment offers. Investors get equity and information rights \u2014 not a title." },
];

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32">
      <BackToHome />
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          LOGIC INTELLIGENCE TECHNOLOGIES
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Investor briefing.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Q3/Q4 2026. Coimbatore technology startup. Founder Vikash Saravanan.
          Where Logic Meets Innovation. Walk the live stack \u2014 then numbers.
        </p>
        <p className="mt-4 inline-block rounded-full bg-red-500/15 border border-red-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-300">
          Not raising
        </p>
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-4 pb-12">
        {points.map((p) => (
          <div key={p.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <h2 className="font-bold mb-1">{p.t}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{p.d}</p>
          </div>
        ))}
      </section>
      <section className="px-6 lg:px-8 max-w-3xl mx-auto text-center pb-20">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/ai" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-black bg-primary">
            Walk /ai <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/ai-assistant" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15 hover:bg-white/5">
            Knowledge Assistant
          </Link>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT \u2014 I read the investor briefing.")}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
