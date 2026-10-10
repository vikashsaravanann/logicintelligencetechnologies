"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { COMPANY } from "@/config/company";
import ExecutiveSeatAnimation from "@/components/jobs/executive-seat-animation";
import DirectorSeatAnimation from "@/components/jobs/director-seat-animation";
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

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const field =
  "w-full h-12 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] px-4 text-[15px] text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 shadow-xs focus:bg-white focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]/15 transition";
const area = `${field} h-auto min-h-[108px] py-3 leading-relaxed`;
const label = "block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)] mb-1.5";
const hint = "mt-1.5 text-[12px] text-[var(--lit-text-muted,#52677C)] leading-snug";

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
        className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-16 sm:mb-20"
      >
        <div className="relative rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-14 items-center">
            <div className="relative aspect-[3/4] w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] shadow-sm group">
              <Image
                src={COMPANY.founder.photoPath}
                alt={`${COMPANY.founder.name}, Founder of ${COMPANY.displayName}`}
                fill
                sizes="(max-width: 1024px) 100vw, 340px"
                quality={75}
                className="object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--lit-navy,#0B2545)]/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-md px-3.5 py-1 text-[var(--lit-navy,#0B2545)] shadow-sm">
                  Seat Status: Filled
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">
                  Founder & Technical Architect
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-teal,#1FA9A2)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lit-text-muted,#52677C)]">
                  {COMPANY.address}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 uppercase text-[var(--lit-navy,#0B2545)] font-poppins">
                {COMPANY.founder.name}
              </h2>

              <p className="text-[var(--lit-ink,#121826)] text-base leading-relaxed mb-4 font-normal">
                {COMPANY.founder.bio}
              </p>

              <p className="text-[var(--lit-text-muted,#52677C)] text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {founder.d}
              </p>

              <div className="bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-5 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lit-navy,#0B2545)] mb-3">
                  Core Mandates Maintained by the Founder
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {founder.days.map((d) => (
                    <div key={d} className="flex items-center gap-2 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2.5 shadow-xs">
                      <span className="text-[var(--lit-teal,#1FA9A2)] font-bold shrink-0">✓</span>
                      <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.14em] text-[var(--lit-text-muted,#52677C)]">
                <span className="w-2 h-2 rounded-full bg-[var(--lit-text-muted,#52677C)]/40" />
                <span>Not hiring for this seat. Directors report into their owned function.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Why LIT Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16 sm:pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lit-blue,#1565C0)] mb-2">The Proposition</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[var(--lit-navy,#0B2545)] font-poppins">
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
              className="group relative rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 hover:border-[var(--lit-blue,#1565C0)]/40 hover:shadow-md transition-all duration-300 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20 flex items-center justify-center mb-4 text-[var(--lit-blue,#1565C0)] group-hover:scale-105 transition-transform">
                <w.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--lit-navy,#0B2545)] mb-2 font-poppins">{w.t}</h3>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{w.d}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Open Seats Overview Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--lit-border-light,#DFE7EF)] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue,#1565C0)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)]">Cohort 2026</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-[var(--lit-navy,#0B2545)] font-poppins">
              Open Leadership Seats
            </h2>
          </div>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-md leading-relaxed font-normal">
            Each seat owns a critical functional pillar. You apply for one. We email you a confirmation the moment the application lands. Real trial, real vesting, no title games.
          </p>
        </div>
      </section>

      {/* Featured CEO Card */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-14">
        <article className="relative isolate overflow-hidden rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-md bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[540px]">
            <div className="relative min-h-[300px] lg:min-h-full order-1">
              <ExecutiveSeatAnimation />
            </div>
            <div className="relative z-10 order-2 flex flex-col justify-center p-6 sm:p-9 lg:p-11 bg-white border-t lg:border-t-0 lg:border-l border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)]">Executive Appointment</span>
                <span className="text-[var(--lit-border-light,#DFE7EF)]" aria-hidden>|</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lit-text-muted,#52677C)]">Coimbatore HQ</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase text-[var(--lit-navy,#0B2545)] leading-[1.15] mb-4 font-poppins">{featured.t}</h3>
              <p className="text-sm sm:text-base text-[var(--lit-ink,#121826)] leading-relaxed mb-5 max-w-prose font-normal">{featured.d}</p>
              <div className="space-y-3 mb-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-4">
                <p className="text-xs sm:text-sm text-[var(--lit-ink,#121826)] leading-relaxed">
                  <span className="text-[var(--lit-navy,#0B2545)] font-bold uppercase tracking-wider text-[11px] block mb-1">Ideal Profile</span>
                  {featured.who}
                </p>
                <p className="text-xs sm:text-sm text-[var(--lit-ink,#121826)] leading-relaxed">
                  <span className="text-[var(--lit-navy,#0B2545)] font-bold uppercase tracking-wider text-[11px] block mb-1">Location Requirement</span>
                  {featured.extra}
                </p>
              </div>
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-xl border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] mb-6 max-w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-blue,#1565C0)] shrink-0">Terms</span>
                <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] uppercase tracking-wide">{featured.salary} · {featured.equity}</span>
              </div>
              <div className="space-y-2 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lit-text-muted,#52677C)]">90-Day Ownership Goals</p>
                <div className="grid gap-2">
                  {featured.days.map((d) => (
                    <div key={d} className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-4 py-3 text-xs font-semibold text-[var(--lit-navy,#0B2545)] tracking-wide flex items-start gap-2">
                      <span className="text-[var(--lit-teal,#1FA9A2)] font-bold shrink-0" aria-hidden>✓</span>
                      <span className="normal-case sm:uppercase">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => goApply("ceo")} className="h-12 px-8 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-bold text-xs uppercase tracking-[0.16em] w-full sm:w-auto shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-blue,#1565C0)] transition-all">
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
            className="group rounded-3xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white flex flex-col hover:border-[var(--lit-blue,#1565C0)]/40 hover:shadow-md transition-all duration-300 shadow-sm"
          >
            <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
              <DirectorSeatAnimation id={s.id} title={s.t} />
              <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.18em] rounded-full bg-white/95 border border-[var(--lit-border-light,#DFE7EF)] px-3 py-1 text-[var(--lit-teal,#1FA9A2)] backdrop-blur-md shadow-xs">
                Directorship Open
              </span>
            </div>

            <div className="relative z-10 p-6 sm:p-7 flex flex-col gap-3.5 flex-1 bg-white">
              <h3 className="text-xl font-bold tracking-tight uppercase text-[var(--lit-navy,#0B2545)] font-poppins">{s.t}</h3>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{s.d}</p>
              
              <div className="bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-3.5 text-xs space-y-1.5 text-[var(--lit-ink,#121826)]">
                <p><strong className="text-[var(--lit-navy,#0B2545)]">Profile:</strong> {s.who}</p>
                <p><strong className="text-[var(--lit-navy,#0B2545)]">Context:</strong> {s.extra}</p>
              </div>

              <p className="text-xs font-semibold text-[var(--lit-blue,#1565C0)] uppercase tracking-wide">
                {s.salary} · {s.equity}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-ink,#121826)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-text-muted,#52677C)] mb-1">Deliverables:</p>
                {s.days.map((d) => (
                  <p key={d} className="flex items-center gap-1.5">
                    <span className="text-[var(--lit-teal,#1FA9A2)] text-sm">▸</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goApply(s.id)}
                className="mt-auto h-11 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-blue,#1565C0)] font-bold text-xs uppercase tracking-[0.14em] text-[var(--lit-navy,#0B2545)] transition-colors"
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
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)] mb-2">Transparency</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[var(--lit-navy,#0B2545)] font-poppins">
            Indicative Compensation Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-2 font-normal">
            Clear, honest financial framework. Every candidate knows the numbers before entering the room.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {seats.map((s) => (
            <article
              key={s.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between ${
                s.id === "ceo"
                  ? "border-[var(--lit-blue,#1565C0)] bg-[var(--lit-light-blue,#E7F3FF)]/35 shadow-sm"
                  : "border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs"
              }`}
            >
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--lit-navy,#0B2545)] mb-4 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
                  {s.t}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-[var(--lit-text-muted,#52677C)]">Pre-Revenue Trial</p>
                    <p className="text-xs font-semibold text-[var(--lit-ink,#121826)] mt-0.5">
                      {s.id === "founder" ? "Equity Holder" : s.id === "sales" ? "Commission" : "None until revenue"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-[var(--lit-text-muted,#52677C)]">Post-Revenue</p>
                    <p className="text-xs font-semibold text-[var(--lit-ink,#121826)] mt-0.5">{s.salary}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-[var(--lit-text-muted,#52677C)]">Equity Vesting</p>
                    <p className="text-xs font-semibold text-[var(--lit-blue,#1565C0)] mt-0.5">{s.equity}</p>
                  </div>
                </div>
              </div>

              {s.id !== "founder" && (
                <button
                  type="button"
                  onClick={() => goApply(s.id)}
                  className="mt-6 w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.14em] border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-blue,#1565C0)] transition text-[var(--lit-navy,#0B2545)]"
                >
                  Select Role
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 3 Gates / Hiring Process Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
        <div className="relative rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm p-8 sm:p-12 lg:p-14">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lit-blue,#1565C0)] mb-2">Selection Framework</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-[var(--lit-navy,#0B2545)] font-poppins">
              Three Gates. Then You Own a Function.
            </h2>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              We do not collect résumés for a pile. Every candidate names a seat, proves work, and sits a 45-minute working call with the founder. Those who pass enter a six-month trial next to the desk.
            </p>
          </div>

          <div className="relative space-y-0">
            <div className="hidden sm:block absolute left-[28px] top-6 bottom-6 w-px bg-[var(--lit-border-light,#DFE7EF)]" />
            {steps.map((s, i) => (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative sm:pl-20 pb-12 last:pb-0"
              >
                <span className="hidden sm:grid absolute left-0 top-0 h-14 w-14 place-items-center rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-blue,#1565C0)] shadow-xs">
                  <s.icon className="w-5 h-5" />
                </span>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20 text-[10px] font-bold tracking-[0.16em] text-[var(--lit-blue,#1565C0)] mb-2">
                  <span>GATE {s.n}</span>
                  <span>·</span>
                  <span>{s.time.toUpperCase()}</span>
                </div>

                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2 text-[var(--lit-navy,#0B2545)] font-poppins">{s.t}</h3>
                <p className="text-sm sm:text-base text-[var(--lit-ink,#121826)] leading-relaxed mb-2 max-w-3xl font-normal">{s.d}</p>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-3xl font-normal">{s.extra}</p>
              </motion.article>
            ))}
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
            className="rounded-3xl border border-[#BBF7D0] bg-[#F0FDF4] p-6 sm:p-10 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#16A34A]">Contractual Commitment</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6 text-[var(--lit-navy,#0B2545)] font-poppins">We Will Offer</h2>
            <ul className="space-y-6">
              {offer.map((o) => (
                <li key={o.t} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--lit-navy,#0B2545)] mb-1 font-poppins">{o.t}</p>
                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{o.d}</p>
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
            className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-6 sm:p-10 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#DC2626]">Strict Boundaries</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6 text-[var(--lit-navy,#0B2545)] font-poppins">We Will Not Offer</h2>
            <ul className="space-y-5">
              {red.map((r) => (
                <li key={r.t} className="flex gap-3">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--lit-navy,#0B2545)] mb-1 font-poppins">{r.t}</p>
                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-6 pt-4 border-t border-[#FECACA] leading-relaxed font-normal">
              Equity vests over four years with a one-year cliff after the registered entity exists. Letters of intent govern pre-incorporation trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Confidential Application Form Section */}
      <section id="apply" className="relative px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24 sm:pb-32 scroll-mt-28">
        <div className="relative rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-md overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(300px,38%)_minmax(0,1fr)] lg:items-stretch">
            {/* Left Info Panel */}
            <div className="relative hidden lg:flex flex-col justify-between p-8 sm:p-10 bg-[var(--lit-cloud,#F7F9FC)] border-r border-[var(--lit-border-light,#DFE7EF)]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] mb-4">
                  <Lock className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)]">
                    Confidential Submission
                  </span>
                </div>

                <h2 className="text-3xl font-black tracking-tight uppercase leading-[1.08] text-[var(--lit-navy,#0B2545)] mb-4 font-poppins">
                  Join the Leadership Table
                </h2>

                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal mb-8">
                  Four open seats. One founder. If you have already shipped a function — operations, engineering, sales, or AI — this is the confidential intake. Titles are not for sale.
                </p>

                <div className="space-y-4 text-xs sm:text-sm text-[var(--lit-ink,#121826)]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                    </div>
                    <span>Instant confirmation email on submit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                    </div>
                    <span>Reviewed by Vikash within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                    </div>
                    <span>Direct 45-minute working session invitation</span>
                  </div>
                </div>
              </div>

              {seats.find((s) => s.id === seat) && (
                <div className="mt-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)] mb-1">
                    Target Appointment
                  </p>
                  <p className="text-lg font-bold uppercase text-[var(--lit-navy,#0B2545)] mb-1.5 font-poppins">
                    {seats.find((s) => s.id === seat)!.t}
                  </p>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                    {seats.find((s) => s.id === seat)!.who}
                  </p>
                </div>
              )}
            </div>

            {/* Right Form Panel */}
            <div className="min-w-0 p-6 sm:p-8 lg:p-10 bg-white">
              <div className="lg:hidden mb-8 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] mb-3">
                  <Lock className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)]">
                    Confidential Application
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--lit-navy,#0B2545)] font-poppins">
                  Join the Leadership Table
                </h2>
              </div>

              {ok ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--lit-mint,#E0F2F1)] border border-[var(--lit-teal,#1FA9A2)]/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-[var(--lit-teal,#1FA9A2)]" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-[var(--lit-navy,#0B2545)] uppercase tracking-tight font-poppins">
                    Application Received
                  </h3>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto leading-relaxed font-normal">
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
                              ? "border-[var(--lit-blue,#1565C0)] bg-[var(--lit-light-blue,#E7F3FF)] shadow-xs"
                              : "border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white"
                          }`}
                        >
                          <span className="block text-xs font-bold tracking-tight text-[var(--lit-navy,#0B2545)] uppercase font-poppins">{s.t}</span>
                          <span className="block text-[10px] text-[var(--lit-blue,#1565C0)] mt-1 uppercase tracking-wide font-medium">{s.salary}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 1 */}
                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">Section 1</span>
                      <span className="text-[var(--lit-border-light,#DFE7EF)]">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)]">Identity & Reach</span>
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
                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">Section 2</span>
                      <span className="text-[var(--lit-border-light,#DFE7EF)]">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)]">Functional Experience</span>
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
                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">Section 3</span>
                      <span className="text-[var(--lit-border-light,#DFE7EF)]">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)]">Verifiable Proof of Work</span>
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
                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">Section 4</span>
                      <span className="text-[var(--lit-border-light,#DFE7EF)]">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)]">Referral & Document</span>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className={label} htmlFor="heard">How Did You Hear About Us?</label>
                        <input id="heard" value={heard} onChange={(e) => setHeard(e.target.value)} className={field} placeholder="LinkedIn, direct referral, Logic AI, Instagram" />
                      </div>
                      <div>
                        <label className={label}>Curriculum Vitae (PDF)</label>
                        {cv ? (
                          <div className="flex items-center gap-4 rounded-xl border border-[var(--lit-blue,#1565C0)]/30 bg-[var(--lit-light-blue,#E7F3FF)] px-5 py-4">
                            <span className="h-10 w-10 rounded-lg border border-[var(--lit-blue,#1565C0)]/30 bg-white grid place-items-center shrink-0 text-[var(--lit-blue,#1565C0)] text-[10px] font-black">
                              PDF
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)] truncate">{cv.name}</p>
                              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">PDF verified and attached.</p>
                            </div>
                            <button type="button" onClick={() => { setCv(null); setCvNote(null); }} className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600 hover:text-red-700 shrink-0">
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-4 rounded-xl border border-dashed border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-5 py-4 cursor-pointer hover:border-[var(--lit-blue,#1565C0)]/50 hover:bg-white transition-all">
                            <span className="h-10 w-10 rounded-lg border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] grid place-items-center shrink-0">
                              <Upload className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wide font-poppins">Upload CV (PDF)</span>
                              <span className="block text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                                Optional. PDF only under 2 MB. Word and image files are blocked.
                              </span>
                            </div>
                            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { onCv(e.target.files?.[0]); e.target.value = ""; }} />
                          </label>
                        )}
                        {cvNote && <p className="mt-2 text-xs text-amber-700 font-medium">{cvNote}</p>}
                      </div>
                    </div>
                  </div>

                  {err && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {err}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="h-14 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-bold uppercase tracking-[0.18em] text-xs shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{busy ? "Transmitting Application…" : "Submit Confidential Application"}</span>
                  </button>

                  <p className="text-center text-[12px] text-[var(--lit-text-muted,#52677C)]">
                    Your submission is encrypted and delivered directly to the executive hiring desk.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Quick Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--lit-border-light,#DFE7EF)] py-3 px-4 shadow-[0_-4px_20px_rgba(11,37,69,0.06)]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--lit-teal,#1FA9A2)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--lit-navy,#0B2545)]">
              Open Seats · 2026 Executive Cohort
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => goApply(seat)}
              className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-[0.14em] shadow-xs hover:bg-[var(--lit-blue,#1565C0)] transition"
            >
              Apply Now
            </button>
            <a
              href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Executive leadership application — " + seat)}`}
              className="h-10 px-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white text-[var(--lit-navy,#0B2545)] grid place-items-center text-xs font-semibold uppercase tracking-[0.12em] transition"
            >
              Email Desk
            </a>
            <a
              href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — applying for the executive leadership cohort.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white text-[var(--lit-navy,#0B2545)] inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              <span>WhatsApp</span>
            </a>
            <a
              href="/docs/jobs-leadership.pdf"
              download
              className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white text-[var(--lit-navy,#0B2545)] text-xs font-semibold uppercase tracking-[0.12em] transition"
            >
              <Download className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              <span>Brief PDF</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
