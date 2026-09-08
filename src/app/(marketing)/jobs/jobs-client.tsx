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
  extra: string;
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
    extra: "This seat is not open.",
    days: ["Ship Logic AI quality", "Scope every paid project", "Capital allocation"],
  },
  {
    id: "ceo",
    t: "Chief Executive Officer",
    open: true,
    cover: "/assets/jobs/ceo-desk.jpg",
    salary: "Modest salary after first revenue",
    equity: "Six-month trial. Title is not for sale.",
    d: "Run the company so Vikash can stay on product. You own operations, sales cadence, legal hygiene, the hiring loop, and weekly cash. You are measured on signed work and a clean pipeline — not slide decks.",
    who: "Operator who has already closed revenue or run a small P&L. Not a first-job CEO.",
    extra: "First 90 days in Coimbatore. You sit next to the founder. Hybrid only after you have shipped in the room.",
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
    extra: "You review every production deploy. Vercel, Supabase, and GitHub are already live — you raise the bar, you do not rebuild the stack for sport.",
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
    extra: "Digital Launch from ₹8,999. Business Pro from ₹18,999. You protect the floor. Commission follows signed work, not meetings booked.",
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
    extra: "xAI / Groq in production. You own eval, not demos. If the model invents a rupee, that is your incident.",
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
  { n: "01", t: "The form", d: "Name the seat. Proof of work. Ninety-day plan. Start date. We store it in our CRM and email you a confirmation." },
  { n: "02", t: "45-minute call", d: "With Vikash. No slide theatre. Bring one artefact of work you are proud of." },
  { n: "03", t: "Six-month trial", d: "Letter of intent until incorporation. Then four-year vest, one-year cliff." },
];

const why = [
  { icon: Rocket, t: "Live product, not a deck", d: "Logic AI, packages from ₹8,999, and a public 31-point scoping framework. You join a studio that already ships." },
  { icon: ShieldCheck, t: "Honest economics", d: "Cash is modest until revenue. Equity vests. The title is not for sale. You will know the deal before you say yes." },
  { icon: MapPin, t: "Coimbatore HQ", d: "Work next to the founder. Hybrid after the first 90 days if you have already shipped in the room." },
  { icon: Clock, t: "Ninety-day ownership", d: "Each seat has three outcomes on the card. Miss them and the trial ends. Hit them and you write the next quarter." },
];

const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

const field =
  "w-full h-12 rounded-xl bg-white/[0.06] border border-white/15 px-4 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400/60";
const label = "block text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1.5";

export default function JobsClient() {
  const [seat, setSeat] = useState("ceo");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [years, setYears] = useState("");
  const [start, setStart] = useState("");
  const [shipped, setShipped] = useState("");
  const [ninety, setNinety] = useState("");
  const [whySeat, setWhySeat] = useState("");
  const [cash, setCash] = useState("");
  const [heard, setHeard] = useState("");
  const [cv, setCv] = useState<{ name: string; data: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const founder = seats.find((s) => s.id === "founder")!;
  const featured = seats.find((s) => s.id === "ceo")!;
  const directors = seats.filter((s) => s.id !== "founder" && s.id !== "ceo");

  function goApply(id: string) {
    setSeat(id);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
          phone,
          city,
          seat: seats.find((s) => s.id === seat)?.t || seat,
          linkedin,
          currentRole,
          years,
          start,
          shipped,
          ninety,
          why: whySeat,
          cash,
          heard,
          cvName: cv?.name,
          cvBase64: cv?.data,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setOk(true);
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
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fade}
        transition={{ duration: 0.45 }}
        className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-16 sm:py-20"
      >
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_1.2fr] gap-8 lg:gap-12 items-start">
          <div className="relative aspect-[3/4] max-h-[560px] rounded-[28px] overflow-hidden border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COMPANY.founder.photoPath}
              alt={`${COMPANY.founder.name}, Founder of ${COMPANY.displayName}`}
              className="absolute inset-0 w-full h-full object-cover object-[center_18%]"
            />
          </div>
          <div className="lg:pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">The founder — filled</p>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 uppercase">{COMPANY.founder.name}</h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 mb-5">{COMPANY.founder.title} · {COMPANY.address}</p>
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
            <w.icon className="w-4 h-4 text-cyan-300 mb-3" />
            <h3 className="text-[13px] font-black uppercase tracking-[0.12em] mb-2">{w.t}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{w.d}</p>
          </motion.article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Open seats</p>
        <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">Four chairs. One founder.<br className="hidden sm:block" /> No purchased titles.</h2>
        <p className="text-base sm:text-lg text-zinc-300 max-w-3xl leading-relaxed">
          Each seat owns a function. You apply for one. We email you a confirmation the moment the form lands in our CRM. Cash is modest until revenue. Equity vests. If you want a visiting card for a cheque, stop here.
        </p>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-10">
        <article className="rounded-[28px] overflow-hidden border border-cyan-400/25 bg-white/[0.04] backdrop-blur-xl grid lg:grid-cols-2">
          <div className="relative min-h-[220px] lg:min-h-full aspect-[16/10] lg:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.16em] rounded-full border border-cyan-300/40 bg-black/55 px-3 py-1 text-cyan-200">Hiring · Featured</span>
          </div>
          <div className="p-6 sm:p-10 flex flex-col bg-[#0A0F1E]/92">
            <h3 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">{featured.t}</h3>
            <p className="text-base text-zinc-200 leading-relaxed mb-4">{featured.d}</p>
            <p className="text-sm text-zinc-400 mb-3">{featured.who}</p>
            <p className="text-sm text-zinc-400 mb-5">{featured.extra}</p>
            <p className="text-sm text-cyan-200/90 mb-5">{featured.salary} · {featured.equity}</p>
            <ul className="grid gap-2 text-sm text-zinc-200 mb-8">
              {featured.days.map((d) => (
                <li key={d} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">90 days · {d}</li>
              ))}
            </ul>
            <button type="button" onClick={() => goApply("ceo")} className="mt-auto h-12 px-6 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-[0.12em]">Apply for CEO</button>
          </div>
        </article>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid md:grid-cols-3 gap-5 pb-14">
        {directors.map((s) => (
          <article key={s.id} className="rounded-[24px] overflow-hidden border border-white/12 bg-white/[0.04] backdrop-blur-xl flex flex-col">
            <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.16em] rounded-full bg-black/55 border border-white/15 px-2.5 py-1 text-cyan-200">Hiring</span>
            </div>
            <div className="relative z-10 p-6 flex flex-col gap-3 flex-1 bg-[#0A0F1E]/95">
              <h3 className="text-lg font-black tracking-tight">{s.t}</h3>
              <p className="text-sm text-zinc-200 leading-relaxed">{s.d}</p>
              <p className="text-sm text-zinc-400">{s.who}</p>
              <p className="text-sm text-zinc-400">{s.extra}</p>
              <p className="text-sm text-cyan-200/80">{s.salary} · {s.equity}</p>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                {s.days.map((d) => <li key={d}>▸ {d}</li>)}
              </ul>
              <button type="button" onClick={() => goApply(s.id)} className="mt-auto h-12 rounded-xl border border-white/15 font-bold text-sm uppercase tracking-[0.12em] hover:bg-white/5">Apply</button>
            </div>
          </article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-5">Compensation — indicative</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {seats.map((s) => (
            <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
              <p className="text-[12px] font-black uppercase tracking-[0.1em] text-cyan-200 mb-4 leading-snug">{s.t}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Cash now</p>
              <p className="text-sm text-zinc-200 mb-3">{s.id === "founder" ? "—" : s.id === "sales" ? "Commission" : "None until revenue"}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">After revenue</p>
              <p className="text-sm text-zinc-200 mb-3">{s.salary}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Equity</p>
              <p className="text-sm text-zinc-200">{s.equity}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid sm:grid-cols-3 gap-3 pb-10">
        {steps.map((s) => (
          <article key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6">
            <p className="text-[11px] font-black tracking-[0.2em] text-primary mb-2">{s.n}</p>
            <h3 className="text-lg font-black mb-2">{s.t}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
          </article>
        ))}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-4">We will not offer</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
            {red.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" /> {r}
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500 mt-5">Equity vests over four years with a one-year cliff after the registered entity exists. Letters of intent until incorporation.</p>
        </div>
      </section>

      <section id="apply" className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-28 scroll-mt-28">
        <div className="rounded-[28px] border border-white/15 bg-white/[0.07] backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-5 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Confidential application</p>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Apply for a seat</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Stored in our CRM. You get a confirmation email. We get the application. Reply within 24 hours.
          </p>

          {ok ? (
            <p className="text-cyan-200 text-base py-10 text-center">Application received. Check your inbox — we reply within 24 hours.</p>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div>
                <label className={label} htmlFor="seat">Seat</label>
                <select id="seat" value={seat} onChange={(e) => setSeat(e.target.value)} className={field}>
                  {seats.filter((s) => s.open).map((s) => <option key={s.id} value={s.id} className="bg-[#0A0F1E]">{s.t}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="name">Full name</label>
                  <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="As on your ID" />
                </div>
                <div>
                  <label className={label} htmlFor="email">Email</label>
                  <input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@company.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="phone">Phone (WhatsApp)</label>
                  <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="+91" />
                </div>
                <div>
                  <label className={label} htmlFor="city">City</label>
                  <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={field} placeholder="Coimbatore / willing to relocate" />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="linkedin">LinkedIn URL</label>
                <input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={field} placeholder="https://linkedin.com/in/…" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="role">Current role & company</label>
                  <input id="role" required value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={field} placeholder="Head of Ops, Studio X" />
                </div>
                <div>
                  <label className={label} htmlFor="years">Years in this function</label>
                  <input id="years" required value={years} onChange={(e) => setYears(e.target.value)} className={field} placeholder="8" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label} htmlFor="start">When you can start</label>
                  <input id="start" required value={start} onChange={(e) => setStart(e.target.value)} className={field} placeholder="Immediate / 30 days" />
                </div>
                <div>
                  <label className={label} htmlFor="cash">Cash expectation (optional)</label>
                  <input id="cash" value={cash} onChange={(e) => setCash(e.target.value)} className={field} placeholder="After first revenue" />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="shipped">What you shipped (proof)</label>
                <textarea id="shipped" required minLength={20} rows={4} value={shipped} onChange={(e) => setShipped(e.target.value)} className={`${field} h-auto py-3`} placeholder="One or two products or P&Ls you personally owned. Numbers, not slogans." />
              </div>
              <div>
                <label className={label} htmlFor="ninety">What you will own in 90 days</label>
                <textarea id="ninety" required minLength={20} rows={4} value={ninety} onChange={(e) => setNinety(e.target.value)} className={`${field} h-auto py-3`} placeholder="Three outcomes. Be specific to this seat." />
              </div>
              <div>
                <label className={label} htmlFor="why">Why this seat — not another</label>
                <textarea id="why" required minLength={20} rows={3} value={whySeat} onChange={(e) => setWhySeat(e.target.value)} className={`${field} h-auto py-3`} placeholder="Why Logic Intelligence Technologies. Why now." />
              </div>
              <div>
                <label className={label} htmlFor="heard">How you found this page</label>
                <input id="heard" value={heard} onChange={(e) => setHeard(e.target.value)} className={field} placeholder="LinkedIn / referral / /ai" />
              </div>
              <label className="flex items-center justify-center h-12 rounded-xl border border-dashed border-white/25 text-sm text-zinc-400 cursor-pointer hover:bg-white/5">
                {cv ? cv.name : "CV — PDF, optional, 2 MB"}
                <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => onCv(e.target.files?.[0])} />
              </label>
              {err && <p className="text-sm text-red-300">{err}</p>}
              <button type="submit" disabled={busy} className="h-12 rounded-xl bg-primary text-black font-bold uppercase tracking-[0.14em]">{busy ? "Sending…" : "Submit application"}</button>
            </form>
          )}
        </div>
      </section>

      <div className="jobs-sticky-apply">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button type="button" onClick={() => goApply(seat)} className="col-span-2 sm:col-span-1 h-12 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-[0.12em]">Apply</button>
          <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Leadership application — name the seat")}`} className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold uppercase tracking-[0.12em]">Email</a>
          <a href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — applying for a leadership seat.")}`} className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold uppercase tracking-[0.12em]"><span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> WhatsApp</span></a>
          <a href="/docs/jobs-leadership.pdf" download className="h-12 rounded-xl border border-white/15 grid place-items-center text-sm font-bold uppercase tracking-[0.12em]"><span className="inline-flex items-center gap-1"><Download className="w-4 h-4" /> Brief PDF</span></a>
        </div>
      </div>
    </>
  );
}
