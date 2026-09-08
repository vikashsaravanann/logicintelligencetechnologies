"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { COMPANY } from "@/config/company";
import { Download, Phone, X, MapPin, Clock, ShieldCheck, Rocket } from "lucide-react";

type Seat = {
  id: string;
  t: string;
  open: boolean;
  photo?: string;
  cover?: string;
  salary: string;
  equity: string;
  d: string;
  who: string;
  days: string[];
};

const seats: Seat[] = [
  {
    id: "founder",
    t: "Founder",
    open: false,
    photo: COMPANY.founder.photoPath,
    salary: "Not a hire",
    equity: "Control stays with Vikash",
    d: "Vikash Saravanan keeps product, AI architecture, capital allocation, and final scoping. Directors report into the function they own — they do not replace the founder.",
    who: "Filled. You work with him, not instead of him.",
    days: ["Ship Logic AI quality", "Scope every paid project", "Capital allocation"],
  },
  {
    id: "ceo",
    t: "Chief Executive Officer",
    open: true,
    cover: "/assets/jobs/ceo-desk.jpg",
    salary: "Modest salary after first revenue",
    equity: "Six-month trial. Title is not for sale.",
    d: "Run the company so Vikash can stay on product. Operations, sales cadence, legal hygiene, hiring loop, and weekly cash. You are measured on signed work and a clean pipeline — not slide decks.",
    who: "Operator who has already closed revenue or run a small P&L. Not a first-job CEO.",
    days: ["Own weekly cash and pipeline", "Close two paid demos to signed work", "Stand up a hiring loop"],
  },
  {
    id: "eng",
    t: "Director of Engineering",
    open: true,
    cover: "/assets/jobs/eng-desk.jpg",
    salary: "Salary after first revenue",
    equity: "0.5–2% after the registered entity exists",
    d: "Architecture, Git, uptime, and delivery against the 31-point scoping framework. You stop scope creep in production, not in a retrospective.",
    who: "Staff-level engineer who has shipped Next.js / Python systems and reviewed other people's deploys.",
    days: ["Uptime and Git hygiene", "Ship without scope creep", "Review every production deploy"],
  },
  {
    id: "sales",
    t: "Director of Sales & Growth",
    open: true,
    cover: "/assets/jobs/sales-room.jpg",
    salary: "Commission-first",
    equity: "Small option after entity",
    d: "Pipeline, Discovery, and conversion. Prices stay on the site. You never invent a pack on a call. WhatsApp and Logic AI already warm the lead — you close it.",
    who: "Closer who can run a 45-minute Discovery without discounting the floor.",
    days: ["Build a 30-lead pipeline", "Run demos that do not invent prices", "Convert two Discovery calls"],
  },
  {
    id: "ai",
    t: "Director of AI & Product",
    open: true,
    cover: "/assets/jobs/ai-lab.jpg",
    salary: "Cash-light at this stage",
    equity: "Equity-heavier than cash",
    d: "RAG quality, Logic AI, golden-set eval, and client statements of work. You keep prices as constrained facts and make the assistant useful for Coimbatore businesses.",
    who: "Builder who has shipped retrieval or LLM features, not a prompt-only résumé.",
    days: ["Golden-set eval every week", "No invented prices in chat", "Own one client SOW"],
  },
];

const red = [
  "Unpaid CEO with no trial and no cash path",
  "Unvested co-founder with no cliff",
  "Director in exchange for a cheque",
  "Partnership programme or visiting-card title",
  "A priced funding round on this page",
];

const steps = [
  { n: "01", t: "Ten lines", d: "Name the seat. What you shipped. What you will own in ninety days. When you can start." },
  { n: "02", t: "45-minute call", d: "With Vikash. No slide theatre. Bring one artefact of work you are proud of." },
  { n: "03", t: "Six-month trial", d: "Letter of intent until incorporation. Then four-year vest, one-year cliff." },
];

const why = [
  { icon: Rocket, t: "Live product, not a deck", d: "Logic AI, packages from ₹8,999, and a public 31-point scoping framework. You join a studio that already ships." },
  { icon: ShieldCheck, t: "Honest economics", d: "Cash is modest until revenue. Equity vests. The title is not for sale. You will know the deal before you say yes." },
  { icon: MapPin, t: "Coimbatore HQ", d: "Work next to the founder. Hybrid after the first 90 days if you have already shipped in the room." },
  { icon: Clock, t: "Ninety-day ownership", d: "Each seat has three outcomes on the card. Miss them and the trial ends. Hit them and you write the next quarter." },
];

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function JobsClient() {
  const [open, setOpen] = useState(false);
  const [seat, setSeat] = useState("ceo");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pitch, setPitch] = useState("");
  const [start, setStart] = useState("");
  const [cv, setCv] = useState<{ name: string; data: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const founder = seats.find((s) => s.id === "founder")!;
  const featured = seats.find((s) => s.id === "ceo")!;
  const directors = seats.filter((s) => s.id !== "founder" && s.id !== "ceo");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          seat: seats.find((s) => s.id === seat)?.t || seat,
          pitch,
          start,
          cvName: cv?.name,
          cvBase64: cv?.data,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setOk(true);
      setOpen(false);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onCv(f: File | undefined) {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setErr("CV must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setCv({ name: f.name, data: String(reader.result || "") });
    reader.readAsDataURL(f);
  }

  function apply(id: string) {
    setSeat(id);
    setOpen(true);
  }

  return (
    <>
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fade}
        className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-16 sm:py-20"
      >
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_1.15fr] gap-8 lg:gap-12 items-center">
          <div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COMPANY.founder.photoPath}
              alt={`${COMPANY.founder.name}, Founder of ${COMPANY.displayName}`}
              className="w-full h-auto max-h-[640px] object-contain object-center bg-black"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">The founder — filled</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{COMPANY.founder.name}</h2>
            <p className="text-sm text-zinc-400 mb-5">{COMPANY.founder.title} · {COMPANY.address}</p>
            <p className="text-zinc-200 leading-relaxed mb-4">{COMPANY.founder.bio}</p>
            <p className="text-zinc-300 leading-relaxed mb-6">{founder.d}</p>
            <ul className="space-y-2 text-sm text-zinc-300 mb-6">
              {founder.days.map((d) => (
                <li key={d} className="flex gap-2"><span className="text-primary">▸</span>{d}</li>
              ))}
            </ul>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Not hiring this seat. Apply for CEO or a Director role below.</p>
          </div>
        </div>
      </motion.section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {why.map((w) => (
          <motion.article
            key={w.t}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <w.icon className="w-5 h-5 text-cyan-300 mb-3" />
            <h3 className="font-bold mb-2">{w.t}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{w.d}</p>
          </motion.article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-2">Open seats</p>
        <h2 className="text-2xl sm:text-3xl font-black mb-8">Four chairs. One founder. No purchased titles.</h2>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-10">
        <article className="rounded-[28px] overflow-hidden border border-cyan-400/30 bg-white/[0.03] grid lg:grid-cols-2">
          <div className="relative min-h-[240px] lg:min-h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] to-transparent lg:bg-gradient-to-r" />
            <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.16em] rounded-full border border-cyan-300/40 bg-black/50 px-3 py-1 text-cyan-200">Hiring · Featured</span>
          </div>
          <div className="p-6 sm:p-8 flex flex-col">
            <h3 className="text-2xl font-black mb-2">{featured.t}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">{featured.d}</p>
            <p className="text-xs text-zinc-400 mb-4">{featured.who}</p>
            <p className="text-xs text-zinc-400 mb-4">{featured.salary} · {featured.equity}</p>
            <ul className="grid sm:grid-cols-1 gap-2 text-[13px] text-zinc-200 mb-6">
              {featured.days.map((d) => (
                <li key={d} className="rounded-xl border border-white/10 px-3 py-2">90 days · {d}</li>
              ))}
            </ul>
            <button type="button" onClick={() => apply("ceo")} className="mt-auto h-12 px-6 rounded-xl bg-primary text-black font-bold">Apply for CEO</button>
          </div>
        </article>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid md:grid-cols-3 gap-5 pb-14">
        {directors.map((s) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.35 }}
            className="rounded-[24px] overflow-hidden border border-white/10 bg-white/[0.03] flex flex-col"
          >
            <div className="relative h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider text-cyan-200">Hiring</span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-black mb-2">{s.t}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-3 flex-1">{s.d}</p>
              <p className="text-[12px] text-zinc-500 mb-3">{s.who}</p>
              <p className="text-[11px] text-zinc-400 mb-3">{s.salary} · {s.equity}</p>
              <ul className="space-y-1 text-[12px] text-zinc-300 mb-4">
                {s.days.map((d) => <li key={d}>▸ {d}</li>)}
              </ul>
              <button type="button" onClick={() => apply(s.id)} className="h-11 rounded-xl border border-white/15 font-bold text-sm hover:bg-white/5">Apply</button>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12 overflow-x-auto">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-3">Compensation (indicative)</h2>
        <table className="w-full text-left text-sm min-w-[520px] border border-white/10 rounded-2xl overflow-hidden">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr><th className="p-3">Seat</th><th className="p-3">Cash now</th><th className="p-3">After revenue</th><th className="p-3">Equity</th></tr>
          </thead>
          <tbody>
            {seats.map((s) => (
              <tr key={s.id} className="border-t border-white/10">
                <td className="p-3 font-semibold">{s.t}</td>
                <td className="p-3 text-zinc-400">{s.id === "founder" ? "—" : s.id === "sales" ? "Commission" : "None until revenue"}</td>
                <td className="p-3 text-zinc-300">{s.salary}</td>
                <td className="p-3 text-zinc-300">{s.equity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid sm:grid-cols-3 gap-3 pb-12">
        {steps.map((s) => (
          <article key={s.n} className="rounded-2xl border border-white/10 p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-primary mb-2">{s.n}</p>
            <h3 className="font-bold mb-1">{s.t}</h3>
            <p className="text-sm text-zinc-400">{s.d}</p>
          </article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-300 mb-4">We will not offer</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
            {red.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-300 shrink-0 mt-0.5" /> {r}
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 mt-5">Equity vests over four years with a one-year cliff after the registered entity exists. Letters of intent until incorporation.</p>
        </div>
      </section>

      {ok && <p className="text-center text-sm text-cyan-200 pb-6">Application received. We reply within 24 hours.</p>}

      <div className="jobs-sticky-apply">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button type="button" onClick={() => setOpen(true)} className="col-span-2 sm:col-span-1 h-12 rounded-xl bg-primary text-black font-bold text-sm">Apply</button>
          <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Leadership application — name the seat")}`} className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold">Email</a>
          <a href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — applying for a leadership seat.")}`} className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold gap-1"><span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> WhatsApp</span></a>
          <a href="/docs/jobs-leadership.pdf" download className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold"><span className="inline-flex items-center gap-1"><Download className="w-4 h-4" /> Brief PDF</span></a>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0A0F1E] p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase tracking-wider text-sm">Apply</h3>
              <button type="button" onClick={() => setOpen(false)} className="h-11 w-11 grid place-items-center" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Seat</label>
            <select value={seat} onChange={(e) => setSeat(e.target.value)} className="w-full h-11 mb-3 rounded-xl bg-white/5 border border-white/15 px-3 text-sm">
              {seats.filter((s) => s.open).map((s) => <option key={s.id} value={s.id}>{s.t}</option>)}
            </select>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full h-11 mb-3 rounded-xl bg-white/5 border border-white/15 px-3 text-base sm:text-sm" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-11 mb-3 rounded-xl bg-white/5 border border-white/15 px-3 text-base sm:text-sm" />
            <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="When you can start" className="w-full h-11 mb-3 rounded-xl bg-white/5 border border-white/15 px-3 text-base sm:text-sm" />
            <textarea required minLength={10} value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="Ten lines: what you shipped, what you will own in 90 days." rows={6} className="w-full mb-3 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-base sm:text-sm" />
            <label className="block h-11 mb-3 rounded-xl border border-dashed border-white/20 grid place-items-center text-xs text-zinc-400 cursor-pointer">
              {cv ? cv.name : "CV (optional, PDF, 2 MB)"}
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => onCv(e.target.files?.[0])} />
            </label>
            {err && <p className="text-sm text-red-300 mb-2">{err}</p>}
            <button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-primary text-black font-bold">{busy ? "Sending…" : "Submit application"}</button>
          </form>
        </div>
      )}
    </>
  );
}
