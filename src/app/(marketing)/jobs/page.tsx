import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Jobs \u2014 CEO / Directors | LOGIC INTELLIGENCE TECHNOLOGIES",
  description:
    "Employment offers and letters of intent. Not a partnership program. Not a cheque-for-title.",
};

const seats = [
  { t: "Founder", d: "Vikash Saravanan keeps product, AI, capital allocation, and final scoping." },
  { t: "CEO \u2014 open job", d: "Ops, sales, legal, hiring. Modest salary after first revenue. Six-month trial. You do not buy this title." },
  { t: "Dir. Engineering", d: "Architecture, Git, uptime, delivery. Salary + 0.5\u20132% after the entity exists." },
  { t: "Dir. Sales & Growth", d: "Pipeline, demos, conversion. Commission + small option." },
  { t: "Dir. AI / Product", d: "RAG quality, /ai, client SOWs. Equity-heavier than cash at this stage." },
];

const red = [
  "Unpaid CEO",
  "Unvested co-founder with no cliff",
  "Director-for-cheque",
  "Partnership program",
  "A priced round on this page",
];

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32">
      <BackToHome />
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          Leadership
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Jobs \u2014 CEO / Directors.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          LOGIC INTELLIGENCE TECHNOLOGIES. Coimbatore 2026 startup.
          Employment offers and letters of intent. Not a cheque-for-title.
        </p>
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-4 pb-8">
        {seats.map((s) => (
          <div key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <h2 className="font-bold mb-1">{s.t}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto pb-10">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
          <h2 className="font-bold mb-3">We will not offer</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
            {red.map((r) => (
              <li key={r}>\u2014 {r}</li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 mt-4">
            Vest 4 years / 1-year cliff after the registered entity exists. LOI until incorporation.
          </p>
        </div>
      </section>
      <section className="px-6 lg:px-8 max-w-3xl mx-auto text-center pb-20">
        <p className="text-zinc-400 mb-6 text-sm">
          Name the seat in the subject. Ten lines: what you shipped, start date, what you own in 90 days.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Job \u2014 name the seat")}`}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-black bg-primary"
          >
            Email {COMPANY.email}
          </a>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT \u2014 applying for a leadership seat.")}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
          <Link href="/about" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold border border-white/15 hover:bg-white/5">
            About the founder
          </Link>
        </div>
      </section>
    </main>
  );
}
