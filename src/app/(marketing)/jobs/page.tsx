import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors",
  description:
    "LOGIC INTELLIGENCE TECHNOLOGIES employment offers and letters of intent. Not a partnership program. Not a cheque-for-title.",
};

const seats = [
  { t: "Founder", d: "Vikash Saravanan keeps product, AI, capital allocation, and final scoping." },
  { t: "Chief Executive Officer", d: "Open role. Operations, sales, legal, hiring. Modest salary after first revenue. Six-month trial. This title is not for sale." },
  { t: "Director of Engineering", d: "Architecture, Git, uptime, and delivery. Salary plus 0.5–2% after the registered entity exists." },
  { t: "Director of Sales & Growth", d: "Pipeline, demos, conversion. Commission plus a small option." },
  { t: "Director of AI & Product", d: "RAG quality, Logic AI, and client statements of work. Equity-heavier than cash at this stage." },
];

const red = [
  "Unpaid CEO",
  "Unvested co-founder with no cliff",
  "Director in exchange for a cheque",
  "Partnership program",
  "A priced round on this page",
];

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-24 sm:pt-28">
      <BackToHome />
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          LOGIC INTELLIGENCE TECHNOLOGIES
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Leadership Roles
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Coimbatore, 2026. Employment offers and letters of intent.
          Own an outcome — or do not take the seat.
        </p>
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-4 pb-8">
        {seats.map((s) => (
          <article key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left min-h-[148px] flex flex-col">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-2">{s.t}</h2>
            <p className="text-sm text-zinc-300 leading-relaxed flex-1">{s.d}</p>
          </article>
        ))}
      </section>
      <section className="px-6 lg:px-8 max-w-5xl mx-auto pb-12">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6 sm:p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-300 mb-4">We will not offer</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
            {red.map((r) => (
              <li key={r} className="border-l-2 border-red-400/40 pl-3">{r}</li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 mt-5">
            Equity vests over four years with a one-year cliff after the registered entity exists. Letters of intent until incorporation.
          </p>
        </div>
      </section>
      <section className="px-6 lg:px-8 max-w-3xl mx-auto text-center pb-24">
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
          Name the seat in the email subject. Ten lines: what you shipped, when you can start, and what you will own in ninety days.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Leadership application — name the seat")}`}
            className="inline-flex items-center justify-center h-12 rounded-xl font-bold text-black bg-primary px-3 text-sm"
          >
            Email applications
          </a>
          <a
            href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — applying for a leadership seat.")}`}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold border border-white/15 hover:bg-white/5"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
          <Link href="/about" className="inline-flex items-center justify-center h-12 rounded-xl font-bold border border-white/15 hover:bg-white/5">
            About the founder
          </Link>
        </div>
      </section>
    </main>
  );
}
