"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { Download, Phone, X } from "lucide-react";

type Seat = {
  id: string;
  t: string;
  open: boolean;
  photo?: string;
  salary: string;
  equity: string;
  d: string;
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
    d: "Vikash Saravanan keeps product, AI, capital allocation, and final scoping.",
    days: ["Ship Logic AI quality", "Scope every paid project", "Capital allocation"],
  },
  {
    id: "ceo",
    t: "Chief Executive Officer",
    open: true,
    salary: "Modest salary after first revenue",
    equity: "Six-month trial. Title is not for sale.",
    d: "Open role. Operations, sales, legal, hiring.",
    days: ["Own weekly cash and pipeline", "Close two paid demos to signed work", "Stand up a hiring loop"],
  },
  {
    id: "eng",
    t: "Director of Engineering",
    open: true,
    salary: "Salary after first revenue",
    equity: "0.5–2% after the registered entity exists",
    d: "Architecture, Git, uptime, and delivery.",
    days: ["Uptime and Git hygiene", "Ship without scope creep", "Review every production deploy"],
  },
  {
    id: "sales",
    t: "Director of Sales & Growth",
    open: true,
    salary: "Commission-first",
    equity: "Small option after entity",
    d: "Pipeline, demos, conversion.",
    days: ["Build a 30-lead pipeline", "Run demos that do not invent prices", "Convert two Discovery calls"],
  },
  {
    id: "ai",
    t: "Director of AI & Product",
    open: true,
    salary: "Cash-light at this stage",
    equity: "Equity-heavier than cash",
    d: "RAG quality, Logic AI, and client statements of work.",
    days: ["Golden-set eval every week", "No invented prices in chat", "Own one client SOW"],
  },
];

const red = [
  "Unpaid CEO",
  "Unvested co-founder with no cliff",
  "Director in exchange for a cheque",
  "Partnership program",
  "A priced round on this page",
];

const steps = [
  { n: "01", t: "Ten lines", d: "Email or this form. Name the seat. What you shipped. When you start." },
  { n: "02", t: "45-minute call", d: "Vikash. No slide theatre. What you will own in ninety days." },
  { n: "03", t: "Six-month trial", d: "Letter of intent until incorporation. Then four-year vest, one-year cliff." },
];

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

  const featured = seats.find((s) => s.id === "ceo")!;
  const rest = seats.filter((s) => s.id !== "ceo");

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

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-8">
        <article className="rounded-3xl border border-cyan-400/30 bg-white/[0.04] p-5 sm:p-8 grid sm:grid-cols-[auto_1fr] gap-5 items-start">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-cyan-400/50 grid place-items-center text-[10px] font-black uppercase tracking-wider text-cyan-200">Open</div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-1">Featured seat</p>
            <h2 className="text-2xl font-black mb-2">{featured.t}</h2>
            <p className="text-sm text-zinc-300 mb-3">{featured.d}</p>
            <p className="text-xs text-zinc-400 mb-3">{featured.salary} · {featured.equity}</p>
            <ul className="grid sm:grid-cols-3 gap-2 text-[12px] text-zinc-200 mb-4">
              {featured.days.map((d) => <li key={d} className="rounded-xl border border-white/10 px-3 py-2">{d}</li>)}
            </ul>
            <button type="button" onClick={() => { setSeat("ceo"); setOpen(true); }} className="h-11 px-5 rounded-xl bg-primary text-black font-bold text-sm">Apply for CEO</button>
          </div>
        </article>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-2 gap-4 pb-10">
        {rest.map((s) => (
          <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left flex flex-col min-h-[200px]">
            <div className="flex items-center gap-3 mb-3">
              {s.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photo} alt="" className="h-12 w-12 rounded-full object-cover object-top outline outline-1 -outline-offset-1 outline-white/15" />
              ) : (
                <div className={`h-12 w-12 rounded-full grid place-items-center text-[9px] font-black uppercase tracking-wider ${s.open ? "border-2 border-dashed border-white/30 text-zinc-400" : "bg-white/10 text-white"}`}>{s.open ? "Open" : "Filled"}</div>
              )}
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{s.t}</h2>
                <p className="text-[11px] text-zinc-500">{s.open ? "Hiring" : "Filled"}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed flex-1 mb-3">{s.d}</p>
            <p className="text-[11px] text-zinc-400 mb-2">{s.salary} · {s.equity}</p>
            <ul className="space-y-1 text-[12px] text-zinc-300 mb-4">
              {s.days.map((d) => <li key={d}>· {d}</li>)}
            </ul>
            {s.open && (
              <button type="button" onClick={() => { setSeat(s.id); setOpen(true); }} className="h-11 rounded-xl border border-white/15 font-bold text-sm hover:bg-white/5">Apply</button>
            )}
          </article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-10 overflow-x-auto">
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

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid sm:grid-cols-3 gap-3 pb-10">
        {steps.map((s) => (
          <article key={s.n} className="rounded-2xl border border-white/10 p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-primary mb-2">{s.n}</p>
            <h3 className="font-bold mb-1">{s.t}</h3>
            <p className="text-sm text-zinc-400">{s.d}</p>
          </article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-10">
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
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
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
