"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { COMPANY } from "@/config/company";
import { Download, Phone, X, MapPin, Clock, ShieldCheck, Rocket, Lock, Mail, Upload, CheckCircle2, Briefcase, FileText, Calendar, Scale } from "lucide-react";

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
    extra: "Published packages and transparent scoping. You protect the floor. Commission follows signed work, not meetings booked.",
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
  { t: "Unpaid CEO, no trial", d: "No six-month letter of intent and no cash path after first revenue is not a seat." },
  { t: "Equity without a cliff", d: "Four-year vest, one-year cliff. We do not gift titles." },
  { t: "Director for a cheque", d: "Investment is not employment. This page is for operators." },
  { t: "Partnership theatre", d: "No franchise, reseller badge, or co-branded slide. Apply for a function." },
];

const offer = [
  { t: "Letter of intent", d: "Written terms while you work. Nothing verbal." },
  { t: "Four-year vest, one-year cliff", d: "Monthly vest after the entity exists. Leave early, take no equity." },
  { t: "Cash after first revenue", d: "Modest salary once signed work lands. Sales is commission-first." },
];

const steps = [
  {
    n: "01",
    t: "The confidential form",
    time: "About 10 minutes",
    icon: FileText,
    d: "Name the seat. Full name, email, WhatsApp, city, current designation, years in the function, joining date. Then proof: what you shipped, what you will own in 90 days, and why this seat — not another.",
    extra: "The file lands in our CRM the same minute. You receive a confirmation email. Vikash reads every application within 24 hours. A CV is optional; a measurable outcome is not.",
  },
  {
    n: "02",
    t: "45-minute working call",
    time: "One conversation",
    icon: Calendar,
    d: "With Vikash, in Coimbatore or on a tight video. No slide theatre. Bring one artefact of work you are proud of — a ship, a P&L, a hiring loop, a retrieval eval. We will ask how you would run the first 90 days of the seat you named.",
    extra: "If the call is a pitch for a title, it ends. If it is a conversation about ownership, we send a letter of intent outline the same week.",
  },
  {
    n: "03",
    t: "Six-month trial",
    time: "Then vest",
    icon: Scale,
    d: "You sit next to the founder for the first 90 days. Hybrid only after you have shipped in the room. The trial is employment under a letter of intent until incorporation — not a co-founder handshake and not a purchased title.",
    extra: "Hit the three outcomes on the seat card and you write the next quarter. Miss them and the trial ends cleanly. After the entity exists: four-year vest, one-year cliff.",
  },
];

const why = [
  { icon: Rocket, t: "Live product, not a deck", d: "Logic AI, live packages, and a public 31-point scoping framework. You join a studio that already ships." },
  { icon: ShieldCheck, t: "Honest economics", d: "Cash is modest until revenue. Equity vests. The title is not for sale. You will know the deal before you say yes." },
  { icon: MapPin, t: "Coimbatore HQ", d: "Work next to the founder. Hybrid after the first 90 days if you have already shipped in the room." },
  { icon: Clock, t: "Ninety-day ownership", d: "Each seat has three outcomes on the card. Miss them and the trial ends. Hit them and you write the next quarter." },
];

const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

const field =
  "w-full h-12 rounded-2xl bg-white/[0.07] border border-white/12 px-4 text-[15px] text-white placeholder:text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 transition";
const area = `${field} h-auto min-h-[108px] py-3 leading-relaxed`;
const label = "block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300 mb-1.5";
const hint = "mt-1.5 text-[12px] text-zinc-500 leading-snug";

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
  const [cvNote, setCvNote] = useState<string | null>(null);
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
        signal: AbortSignal.timeout(25000),
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
    setCvNote(null);
    if (!f) return;
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setCv(null);
      setCvNote("Please attach a PDF CV only. Word, images, and ZIP files are not accepted.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setCv(null);
      setCvNote("This CV is over 2 MB. Compress the PDF and upload again.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      const raw = data.split(",")[1] || "";
      try {
        const head = atob(raw.slice(0, 16));
        if (!head.startsWith("%PDF")) {
          setCv(null);
          setCvNote("That file is not a valid PDF. Please export your CV as PDF and try again.");
          return;
        }
      } catch {
        setCv(null);
        setCvNote("The résumé could not be read. Try another PDF under 2 MB.");
        return;
      }
      setCv({ name: f.name, data });
      setCvNote(null);
    };
    reader.onerror = () => {
      setCv(null);
      setCvNote("The résumé could not be read. Try another PDF under 2 MB.");
    };
    reader.readAsDataURL(f);
  }

  return (
    <>
      {/* Founder Leadership Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fade}
        transition={{ duration: 0.45 }}
        className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-16 sm:py-24"
      >
        <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          
          <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-14 items-center">
            <div className="relative aspect-[3/4] w-full max-w-[340px] mx-auto rounded-[24px] overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
              <Image
                src={COMPANY.founder.photoPath}
                alt={`${COMPANY.founder.name}, Founder of ${COMPANY.displayName}`}
                fill
                sizes="(max-width: 1024px) 100vw, 340px"
                quality={75}
                className="object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1 text-zinc-300">
                  Seat Status: Filled
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Founder & Technical Architect
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  {COMPANY.address}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 uppercase text-white">
                {COMPANY.founder.name}
              </h2>

              <p className="text-zinc-200 text-base leading-relaxed mb-4 font-normal">
                {COMPANY.founder.bio}
              </p>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {founder.d}
              </p>

              <div className="bg-black/30 border border-white/8 rounded-2xl p-5 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
                  Core Mandates Maintained by the Founder
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {founder.days.map((d) => (
                    <div key={d} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
                      <span className="text-cyan-400 font-bold shrink-0">✓</span>
                      <span className="text-xs font-semibold text-zinc-200">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span>Not hiring for this seat. Directors report into their owned function.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Why LIT Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 mb-2">The Proposition</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Built for operators. Not spectators.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {why.map((w, idx) => (
            <motion.article
              key={w.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 hover:border-cyan-400/30 hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <w.icon className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white mb-2">{w.t}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">{w.d}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Open Seats Overview Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-950/30 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Cohort 2026</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-white">
              Open Leadership Seats
            </h2>
          </div>
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed">
            Each seat owns a critical functional pillar. You apply for one. We email you a confirmation the moment the application lands. Real trial, real vesting, no title games.
          </p>
        </div>
      </section>

      {/* Featured CEO Card */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-14">
        <article className="relative isolate overflow-hidden rounded-[32px] border border-cyan-400/30 bg-transparent shadow-[0_30px_90px_rgba(0,0,0,0.6)] min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">
          <Image
            src={featured.cover!}
            alt=""
            fill
            sizes="100vw"
            quality={72}
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/85 to-[#0A0F1E]/25 lg:bg-gradient-to-r lg:from-transparent lg:via-[#0A0F1E]/60 lg:to-[#0A0F1E]" />
          
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] rounded-full border border-cyan-300/50 bg-black/70 backdrop-blur-md px-3.5 py-1 text-cyan-200 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Priority Role · Open Seat
            </span>
          </div>

          <div className="relative z-10 flex min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] items-end lg:items-stretch">
            <div className="w-full lg:ml-auto lg:w-[56%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Executive Appointment</span>
                <span className="text-zinc-600">|</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">Coimbatore HQ</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight uppercase text-white">{featured.t}</h3>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-4">{featured.d}</p>
              
              <div className="space-y-2 mb-5">
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Ideal Profile: </span>
                  {featured.who}
                </p>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Location Requirement: </span>
                  {featured.extra}
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/25 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Terms:</span>
                <span className="text-xs font-semibold text-white uppercase tracking-wide">{featured.salary} · {featured.equity}</span>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">90-Day Ownership Goals:</p>
                <div className="grid gap-2">
                  {featured.days.map((d) => (
                    <div key={d} className="rounded-xl border border-white/10 bg-black/45 backdrop-blur-sm px-4 py-2.5 text-xs font-semibold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">→</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => goApply("ceo")}
                className="h-12 px-8 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-[0.16em] w-full sm:w-auto shadow-[0_10px_30px_rgba(0,191,255,0.3)] hover:brightness-110 transition-all"
              >
                Apply for CEO Seat
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* Director Seats (3 Cards) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid md:grid-cols-3 gap-6 pb-20">
        {directors.map((s) => (
          <article
            key={s.id}
            className="group rounded-[28px] overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl flex flex-col hover:border-cyan-400/30 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
            <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
              <Image
                src={s.cover!}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={70}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-80" />
              <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.18em] rounded-full bg-black/60 border border-white/15 px-3 py-1 text-cyan-200 backdrop-blur-md">
                Directorship Open
              </span>
            </div>

            <div className="relative z-10 p-6 sm:p-7 flex flex-col gap-3.5 flex-1 bg-transparent/95">
              <h3 className="text-xl font-black tracking-tight uppercase text-white">{s.t}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">{s.d}</p>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs space-y-1 text-zinc-300">
                <p><strong className="text-white">Profile:</strong> {s.who}</p>
                <p><strong className="text-white">Context:</strong> {s.extra}</p>
              </div>

              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                {s.salary} · {s.equity}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-zinc-300">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Deliverables:</p>
                {s.days.map((d) => (
                  <p key={d} className="flex items-center gap-1.5">
                    <span className="text-cyan-400 text-sm">▸</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goApply(s.id)}
                className="mt-auto h-11 rounded-xl border border-white/15 font-bold text-xs uppercase tracking-[0.14em] text-white hover:bg-white/10 hover:border-cyan-400/40 transition-colors"
              >
                Apply for {s.t}
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Indicative Compensation Table */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">Transparency</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Indicative Compensation Matrix
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Clear, honest financial framework. Every candidate knows the numbers before entering the room.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {seats.map((s) => (
            <article
              key={s.id}
              className={`rounded-2xl border p-5 backdrop-blur-md flex flex-col justify-between ${
                s.id === "ceo"
                  ? "border-cyan-400/40 bg-cyan-950/20"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-cyan-300 mb-4 pb-2 border-b border-white/10">
                  {s.t}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Pre-Revenue Trial</p>
                    <p className="text-xs font-semibold text-zinc-200 mt-0.5">
                      {s.id === "founder" ? "Equity Holder" : s.id === "sales" ? "Commission" : "None until revenue"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Post-Revenue</p>
                    <p className="text-xs font-semibold text-zinc-200 mt-0.5">{s.salary}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Equity Vesting</p>
                    <p className="text-xs font-semibold text-cyan-200 mt-0.5">{s.equity}</p>
                  </div>
                </div>
              </div>

              {s.id !== "founder" && (
                <button
                  type="button"
                  onClick={() => goApply(s.id)}
                  className="mt-6 w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.14em] border border-white/10 hover:border-cyan-400/40 hover:bg-white/5 transition text-zinc-300 hover:text-white"
                >
                  Select Role
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 3 Gates / Hiring Process Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16 overflow-hidden">
        <div className="relative rounded-[32px] border border-white/12 overflow-hidden bg-transparent shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
          <Image
            src="/assets/careers_bg.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={50}
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-transparent/85" />
          
          <div className="relative z-10 p-8 sm:p-12 lg:p-14">
            <div className="max-w-2xl mb-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 mb-2">Selection Framework</p>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-white">
                Three Gates. Then You Own a Function.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                We do not collect résumés for a pile. Every candidate names a seat, proves work, and sits a 45-minute working call with the founder. Those who pass enter a six-month trial next to the desk.
              </p>
            </div>

            <div className="relative space-y-0">
              <div className="hidden sm:block absolute left-[28px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-400 via-cyan-400/40 to-transparent" />
              {steps.map((s, i) => (
                <motion.article
                  key={s.n}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="relative sm:pl-20 pb-12 last:pb-0"
                >
                  <span className="hidden sm:grid absolute left-0 top-0 h-14 w-14 place-items-center rounded-2xl border border-cyan-400/40 bg-transparent text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
                    <s.icon className="w-5 h-5" />
                  </span>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/30 text-[10px] font-black tracking-[0.16em] text-cyan-300 mb-2">
                    <span>GATE {s.n}</span>
                    <span>·</span>
                    <span>{s.time.toUpperCase()}</span>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">{s.t}</h3>
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-2 max-w-3xl font-normal">{s.d}</p>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl font-normal">{s.extra}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance & Boundaries */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border border-cyan-400/25 bg-gradient-to-b from-cyan-950/30 to-black/40 p-6 sm:p-10 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Contractual Commitment</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6 text-white">We Will Offer</h2>
            <ul className="space-y-6">
              {offer.map((o) => (
                <li key={o.t} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white mb-1">{o.t}</p>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">{o.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.04] to-black/40 p-6 sm:p-10 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Strict Boundaries</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6 text-white">We Will Not Offer</h2>
            <ul className="space-y-5">
              {red.map((r) => (
                <li key={r.t} className="flex gap-3">
                  <X className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-zinc-200 mb-1">{r.t}</p>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-500 mt-6 pt-4 border-t border-white/10 leading-relaxed font-normal">
              Equity vests over four years with a one-year cliff after the registered entity exists. Letters of intent govern pre-incorporation trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Confidential Application Form Section */}
      <section id="apply" className="relative px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24 sm:pb-32 scroll-mt-28">
        <div className="relative rounded-[28px] sm:rounded-[36px] border border-white/20 bg-transparent shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(300px,38%)_minmax(0,1fr)] lg:items-stretch">
            {/* Left Info Panel */}
            <div className="relative hidden lg:block self-stretch min-h-full overflow-hidden">
              <Image
                src="/assets/careers_bg.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 38vw, 0px"
                quality={70}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/90 via-[#0A0F1E]/50 to-[#0A0F1E]/80" />
              
              <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-between h-full gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-950/50 backdrop-blur-md mb-4">
                    <Lock className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                      Confidential Submission
                    </span>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight uppercase leading-[1.05] text-white mb-4">
                    Join the Leadership Table
                  </h2>

                  <p className="text-sm text-zinc-300 leading-relaxed font-normal mb-8">
                    Four open seats. One founder. If you have already shipped a function — operations, engineering, sales, or AI — this is the confidential intake. Titles are not for sale.
                  </p>

                  <div className="space-y-4 text-xs sm:text-sm text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                      </div>
                      <span>Instant confirmation email on submit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-cyan-300" />
                      </div>
                      <span>Reviewed by Vikash within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-cyan-300" />
                      </div>
                      <span>Direct 45-minute working session invitation</span>
                    </div>
                  </div>
                </div>

                {seats.find((s) => s.id === seat) && (
                  <div className="rounded-2xl border border-cyan-400/40 bg-black/60 backdrop-blur-md p-5 shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 mb-1">
                      Target Appointment
                    </p>
                    <p className="text-lg font-black uppercase text-white mb-1.5">
                      {seats.find((s) => s.id === seat)!.t}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                      {seats.find((s) => s.id === seat)!.who}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="min-w-0 p-6 sm:p-8 lg:p-10 bg-transparent/80 backdrop-blur-md">
              <div className="lg:hidden mb-8 pb-6 border-b border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-950/40 mb-3">
                  <Lock className="w-3 h-3 text-cyan-300" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Confidential Application
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  Join the Leadership Table
                </h2>
              </div>

              {ok ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-cyan-300" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white uppercase tracking-tight">
                    Application Received
                  </h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed font-normal">
                    Check your inbox for confirmation. Vikash reviews every application within 24 hours and will respond directly with call availability.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-6">
                  {/* Seat Selection */}
                  <div>
                    <p className={label}>Select Target Seat</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {seats.filter((s) => s.open).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSeat(s.id)}
                          className={`text-left rounded-xl border p-3.5 transition-all ${
                            seat === s.id
                              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                          }`}
                        >
                          <span className="block text-xs font-black tracking-tight text-white uppercase">{s.t}</span>
                          <span className="block text-[10px] text-cyan-300/80 mt-1 uppercase tracking-wide">{s.salary}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 1 */}
                  <div className="pt-2 border-t border-white/8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Section 1</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">Identity & Reach</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={label} htmlFor="name">Full Name</label>
                        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="First name and last name" />
                      </div>
                      <div>
                        <label className={label} htmlFor="email">Email Address</label>
                        <input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="name@company.com" />
                        <p className={hint}>We send confirmation to this inbox.</p>
                      </div>
                      <div>
                        <label className={label} htmlFor="phone">WhatsApp Number</label>
                        <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="+91 98765 43210" />
                      </div>
                      <div>
                        <label className={label} htmlFor="city">Current Location</label>
                        <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={field} placeholder="Coimbatore, or willing to relocate" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={label} htmlFor="linkedin">LinkedIn Profile URL</label>
                        <input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={field} placeholder="https://www.linkedin.com/in/your-name" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="pt-2 border-t border-white/8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Section 2</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">Functional Experience</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={label} htmlFor="role">Current Designation & Company</label>
                        <input id="role" required value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={field} placeholder="e.g. VP Engineering, Acme Labs" />
                      </div>
                      <div>
                        <label className={label} htmlFor="years">Years in this Discipline</label>
                        <input id="years" required value={years} onChange={(e) => setYears(e.target.value)} className={field} placeholder="e.g. 8" />
                      </div>
                      <div>
                        <label className={label} htmlFor="start">Earliest Joining Availability</label>
                        <input id="start" required value={start} onChange={(e) => setStart(e.target.value)} className={field} placeholder="Immediate, or 30 days notice" />
                      </div>
                      <div>
                        <label className={label} htmlFor="cash">Compensation Expectations</label>
                        <input id="cash" value={cash} onChange={(e) => setCash(e.target.value)} className={field} placeholder="Optional — post first revenue" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="pt-2 border-t border-white/8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Section 3</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">Verifiable Proof of Work</span>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className={label} htmlFor="shipped">Products, P&Ls, or Systems You Personally Shipped</label>
                        <textarea id="shipped" required minLength={20} rows={3} value={shipped} onChange={(e) => setShipped(e.target.value)} className={area} placeholder="Revenue numbers, uptime metrics, headcount scaled, codebases delivered — measurable facts, not buzzwords." />
                        <p className={hint}>Applications without demonstrable outcomes are declined without an interview.</p>
                      </div>
                      <div>
                        <label className={label} htmlFor="ninety">First 90 Days Ownership Plan</label>
                        <textarea id="ninety" required minLength={20} rows={3} value={ninety} onChange={(e) => setNinety(e.target.value)} className={area} placeholder="Three concrete, verifiable outcomes you will deliver in Coimbatore in your first 90 days." />
                      </div>
                      <div>
                        <label className={label} htmlFor="why">Why Logic Intelligence Technologies?</label>
                        <textarea id="why" required minLength={20} rows={2} value={whySeat} onChange={(e) => setWhySeat(e.target.value)} className={area} placeholder="Why this studio. Why Coimbatore. Why now." />
                      </div>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="pt-2 border-t border-white/8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Section 4</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">Referral & Document</span>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className={label} htmlFor="heard">How Did You Hear About Us?</label>
                        <input id="heard" value={heard} onChange={(e) => setHeard(e.target.value)} className={field} placeholder="LinkedIn, direct referral, Logic AI, Instagram" />
                      </div>
                      <div>
                        <label className={label}>Curriculum Vitae (PDF)</label>
                        {cv ? (
                          <div className="flex items-center gap-4 rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-5 py-4">
                            <span className="h-10 w-10 rounded-lg border border-cyan-400/40 bg-black/40 grid place-items-center shrink-0 text-cyan-300 text-[10px] font-black">
                              PDF
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{cv.name}</p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">PDF verified and attached.</p>
                            </div>
                            <button type="button" onClick={() => { setCv(null); setCvNote(null); }} className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-400 hover:text-red-300 shrink-0">
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-4 cursor-pointer hover:border-cyan-400/50 hover:bg-white/[0.05] transition-all">
                            <span className="h-10 w-10 rounded-lg border border-cyan-400/30 bg-cyan-400/10 grid place-items-center shrink-0">
                              <Upload className="w-4 h-4 text-cyan-300" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-white uppercase tracking-wide">Upload CV (PDF)</span>
                              <span className="block text-[11px] text-zinc-400 mt-0.5">
                                Optional. PDF only under 2 MB. Word and image files are blocked.
                              </span>
                            </div>
                            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { onCv(e.target.files?.[0]); e.target.value = ""; }} />
                          </label>
                        )}
                        {cvNote && <p className="mt-2 text-xs text-amber-300 font-medium">{cvNote}</p>}
                      </div>
                    </div>
                  </div>

                  {err && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                      {err}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="h-14 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black uppercase tracking-[0.18em] text-xs shadow-[0_12px_40px_rgba(0,191,255,0.35)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{busy ? "Transmitting Application…" : "Submit Confidential Application"}</span>
                  </button>

                  <p className="text-center text-[11px] text-zinc-500">
                    Your submission is encrypted and delivered directly to the executive hiring desk.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Quick Action Bar */}
      <div className="jobs-sticky-apply">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Open Seats · 2026 Executive Cohort
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => goApply(seat)}
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-[0.14em] shadow-md hover:brightness-110 transition"
            >
              Apply Now
            </button>
            <a
              href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Executive leadership application — " + seat)}`}
              className="h-11 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white grid place-items-center text-xs font-bold uppercase tracking-[0.12em] transition"
            >
              Email Desk
            </a>
            <a
              href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — applying for the executive leadership cohort.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] transition"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-300" />
              <span>WhatsApp</span>
            </a>
            <a
              href="/docs/jobs-leadership.pdf"
              download
              className="hidden md:inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-[0.12em] transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>Brief PDF</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
