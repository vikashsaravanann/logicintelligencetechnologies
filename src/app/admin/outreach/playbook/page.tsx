import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { OPPORTUNITY_GUIDANCE } from "@/lib/outreach/intelligence/opportunities";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Target,
  FileText,
  Ban,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Outreach Playbook & Cadence Directive | Admin | Logic Intelligence Technologies",
  description: "Standard operating procedure, 4-step sequence cadence, and evidence-based writing guidelines for B2B client outreach.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const CADENCE_STEPS = [
  {
    step: 1,
    day: "Day 0",
    badge: "First Contact",
    title: "Verified Technical Observation",
    objective: "Start an honest, low-friction professional conversation — not a sales pitch.",
    guideline:
      "Cite exactly one verified technical or business observation from the lead record. State measured values with tools and dates. Do not include company bios, service catalogs, or claims of lost revenue.",
    ctaExample: '"Want me to send over the quick 2-minute breakdown?"',
    tone: "border-blue-200 bg-blue-50/50 text-[var(--lit-blue,#1565C0)]",
  },
  {
    step: 2,
    day: "Day 3",
    badge: "Context Follow-Up",
    title: "User Impact & Operational Friction",
    objective: "Provide brief context on why the observation affects user experience or conversion friction.",
    guideline:
      "Follow up only if unreplied after 3 business days. Frame impact carefully with 'can' or 'may'. Offer a concise reference without aggressive pressure or meeting demands.",
    ctaExample: '"I mapped out what I would adjust on the mobile layout. Would it be helpful to review?"',
    tone: "border-teal-200 bg-teal-50/50 text-[var(--lit-teal,#1FA9A2)]",
  },
  {
    step: 3,
    day: "Day 7",
    badge: "Value Delivery",
    title: "Tangible Deliverable & Fix Outline",
    objective: "Deliver concrete technical value with zero obligations.",
    guideline:
      "Offer a concrete technical artifact (e.g., remediation checklist, code snippet, or simplified layout schema). Never attach unsolicited files or demand long discovery calls.",
    ctaExample: '"Would you like me to share the 1-page technical audit with your team?"',
    tone: "border-indigo-200 bg-indigo-50/50 text-indigo-700",
  },
  {
    step: 4,
    day: "Day 14",
    badge: "Graceful Close",
    title: "Respectful Breakaway & Unsubscribe",
    objective: "Respect the prospect's inbox, protect sender reputation, and leave the door open.",
    guideline:
      "Acknowledge other priorities with zero guilt or passive aggression. Provide a clear opt-out. If unreplied, the lead sequence closes and moves to archive.",
    ctaExample: '"No worries if this is not on your radar right now. Feel free to reach out down the road if useful."',
    tone: "border-slate-200 bg-slate-50/60 text-slate-700",
  },
];

const QA_BLOCKERS = [
  {
    name: "Evidence Grounding",
    desc: "Every observation must derive from verified data in the lead record. No hallucinations.",
  },
  {
    name: "Zero Financial Claims",
    desc: "Strictly forbidden from asserting customer loss, dollar revenue impact, or churn percentages.",
  },
  {
    name: "Permission-First CTA",
    desc: "Calls to action must ask permission to send information, never demand a 30-minute calendar block.",
  },
  {
    name: "No Service Dumping",
    desc: "Draft must never dump an all-in-one product catalog or generic company biography in step 1.",
  },
  {
    name: "Jurisdiction Whitelist",
    desc: "Destination country must be marked 'allowed' in the database jurisdiction registry.",
  },
  {
    name: "Suppression & DNC",
    desc: "Domain and email must pass the global suppression check before any draft can generate.",
  },
  {
    name: "Duplication Window",
    desc: "No other outreach attempt within the past 14 days to the same target business domain.",
  },
  {
    name: "Human Gate Requirement",
    desc: "No message may dispatch autonomously. A human operator must explicitly authorize transmission.",
  },
  {
    name: "Subject Line Integrity",
    desc: "No sensationalist spam flags (URGENT, ACT NOW, GUARANTEED, 10X REVENUE).",
  },
  {
    name: "Clear Opt-Out Path",
    desc: "Every outbound template must honor opt-out mechanics and immediate suppression upon request.",
  },
];

export default async function OutreachPlaybookPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach/playbook");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & Navigation */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/outreach" label="Outreach Pipeline" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <BookOpen className="w-3 h-3" />
              Standard Operating Procedure
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              4-Step Sequence Protocol
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Outreach Playbook &amp; Cadence Directive
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            The canonical operating standard for Logic Intelligence Technologies B2B outbound: observe before
            pitching, cite verifiable evidence, eliminate fabricated revenue claims, and prioritize human permission.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="playbook" />
      </div>

      {/* Section 1: 4-Step Sequence Visual Cadence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
              4-Step Sequential Cadence (Day 0 &rarr; 3 &rarr; 7 &rarr; 14)
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Standard automated progression schedule. Each step is conditionally dispatched only if no prior response is detected.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-mono font-medium text-slate-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            14-Day Life Span
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CADENCE_STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${s.tone}`}>
                    {s.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                    {s.day}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                    Step 0{s.step}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] mt-0.5">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {s.guideline}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                  Sample CTA
                </span>
                <p className="font-serif italic text-xs text-slate-800 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
                  {s.ctaExample}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: 3-Step Writing Framework & Truth Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3-Step Writing Framework */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              The 3-Step Message Framework
            </h3>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Every outbound message follows this exact architecture. No fluff, no filler, maximum clarity.
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--lit-navy,#0B2545)] text-white">
                  01
                </span>
                <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                  Verified Observation
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                One specific, current, evidence-backed detail about this exact business. Must reference a verified
                metric, tool, or observed UI flow.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--lit-navy,#0B2545)] text-white">
                  02
                </span>
                <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                  Relevance &amp; Proportionate Impact
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Why the observation matters to visitors or operators, strictly framed with "can" or "may". Never
                guarantee financial catastrophe or customer departure.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--lit-navy,#0B2545)] text-white">
                  03
                </span>
                <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                  Permission-First CTA
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                A 1-click low-friction question requesting consent to share a brief breakdown or mock. Never demand
                a 30-minute calendar block or aggressive discovery call.
              </p>
            </div>
          </div>
        </div>

        {/* Fact vs Inference Separation (Truth Matrix) */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
              <Target className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Fact vs. Inference Separation Matrix
            </h3>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Every sentence must be classified. Only verified facts and reasonable impacts are permitted in copy.
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md">
                  Level 1: Verified Fact
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Allowed as Fact</span>
              </div>
              <p className="mt-2 text-xs text-slate-700">
                &ldquo;Mobile PageSpeed measured 38/100 on 2026-10-06 via Lighthouse.&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                Derived directly from empirical evidence collected by our automated pipeline.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md">
                  Level 2: Reasonable Impact
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase">Allowed with Nuance</span>
              </div>
              <p className="mt-2 text-xs text-slate-700">
                &ldquo;A heavier mobile layout may cause visitors on cellular connections to wait longer before interacting.&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-amber-800 font-medium">
                Framed with nuance (&ldquo;can&rdquo; / &ldquo;may&rdquo;). Never stated as absolute fact.
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/70 border border-rose-300 px-2 py-0.5 rounded-md">
                  Level 3: Unverified Outcome
                </span>
                <span className="text-[10px] font-bold text-rose-700 uppercase">Strictly Forbidden</span>
              </div>
              <p className="mt-2 text-xs text-rose-900 font-medium">
                &ldquo;You are losing $50,000 every month in sales due to your site performance.&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-rose-700">
                Unverifiable fabrication. Fails automated QA blocker checks instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Impact Language Comparison (Do's & Don'ts) */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
            Impact Language: Approved vs. Prohibited Phrasing
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Side-by-side comparison for tone and risk governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Approved Column */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Approved Phrasing (Evidence-Framed)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&#10003;</span>
                <span>&ldquo;This can make the booking path harder to navigate on smaller screens.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&#10003;</span>
                <span>&ldquo;That may leave prospective clients relying on directory listings for opening hours.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&#10003;</span>
                <span>&ldquo;For someone ready to enquire, that leaves the next step less clear than it could be.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&#10003;</span>
                <span>&ldquo;Our audit on Oct 6 noted the contact form returned an HTTP 500 status.&rdquo;</span>
              </li>
            </ul>
          </div>

          {/* Prohibited Column */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-rose-200">
              <XCircle className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Prohibited Claims (Fabricated / Catastrophic)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">&#10007;</span>
                <span>&ldquo;You are losing 40% of all mobile customers right now.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">&#10007;</span>
                <span>&ldquo;Your current agency is cheating you out of rankings.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">&#10007;</span>
                <span>&ldquo;This is costing your firm thousands of dollars every week.&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">&#10007;</span>
                <span>&ldquo;We guarantee #1 rankings in 14 days or your money back.&rdquo;</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: Opportunity Archetypes (L0–L8) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            Opportunity Archetypes &amp; Directive Guidance (L0–L8)
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Preset guidelines mapped to automated lead intelligence scans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(OPPORTUNITY_GUIDANCE).map((g) => (
            <div
              key={g.type}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700">
                    {g.type}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                    {g.recommendedOffer}
                  </span>
                </div>

                <h4 className="mt-2 text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  {g.label}
                </h4>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                      Observation Rule
                    </span>
                    <p className="text-slate-600">{g.observationHint}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                      Impact Framing
                    </span>
                    <p className="text-slate-600">{g.impactHint}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                  Permitted CTA
                </span>
                <p className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                  {g.ctaHint}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Pre-Dispatch QA Blocker Gates */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Pre-Dispatch QA Checklist (10 Automated Blocker Gates)
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Every draft must pass all 10 gates before human approval is unlocked.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Pass Threshold
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {QA_BLOCKERS.map((b, i) => (
            <div
              key={b.name}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-[var(--lit-teal,#1FA9A2)]">
                  Gate #{i + 1}
                </span>
                <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] mt-1">
                  {b.name}
                </h4>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
