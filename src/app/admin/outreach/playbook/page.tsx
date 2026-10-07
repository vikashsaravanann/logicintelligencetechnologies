import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { OPPORTUNITY_GUIDANCE } from "@/lib/outreach/intelligence/opportunities";

export const metadata: Metadata = { title: "Message Playbook | Outreach" };
export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-indigo-300">{title}</h2>
      <div className="space-y-2 text-sm text-neutral-300">{children}</div>
    </section>
  );
}

export default async function OutreachPlaybookPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach/playbook");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Message Playbook</h1>
        <p className="mt-1 text-sm text-neutral-400">
          How Logic Intelligence Technologies writes first-contact B2B outreach: observe before pitching, use verified
          evidence, never fabricate business impact, start a conversation — not a sales presentation.
        </p>
      </div>

      <Section title="The 3-step framework">
        <ol className="list-decimal space-y-1 pl-5">
          <li><strong>Verified observation</strong> — one specific, current, evidence-backed detail about this business.</li>
          <li><strong>Relevance / impact</strong> — why it may matter, framed as "may/can", never as a guaranteed loss.</li>
          <li><strong>Permission CTA</strong> — a low-friction next step ("want me to send the short breakdown?").</li>
        </ol>
      </Section>

      <Section title="Fact / inference separation">
        <p>Every claim is one of three kinds, and only the first two may appear as fact:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong className="text-emerald-300">VERIFIED fact</strong> — e.g. "Mobile PageSpeed measured 42/100 on 2026-10-06."</li>
          <li><strong className="text-amber-300">Reasonable impact</strong> — e.g. "A heavier mobile page can add friction for visitors."</li>
          <li><strong className="text-rose-300">Unverified outcome</strong> — e.g. "This is causing customers to leave." — <em>never allowed.</em></li>
        </ul>
      </Section>

      <Section title="Impact language">
        <p className="text-emerald-300">Allowed: "This can make the enquiry path harder to find on mobile." · "This may add friction for visitors trying to book."</p>
        <p className="text-rose-300">Not allowed without evidence: "You're losing customers." · "This is costing you thousands." · "You're losing 40% of mobile traffic."</p>
      </Section>

      <Section title="CTA library">
        <ul className="list-disc space-y-1 pl-5">
          <li>"Want me to send over the quick breakdown?"</li>
          <li>"I mapped out what I'd change. Want me to send it?"</li>
          <li>"Would it be useful if I sent the short audit?"</li>
        </ul>
        <p className="text-rose-300">Avoid demanding a 30-minute meeting, sales call, proposal, contract or payment in the first message.</p>
      </Section>

      <Section title="Subject lines">
        <p className="text-emerald-300">Good: "Quick question about {'{company}'}'s website" · "{'{company}'} mobile site" · "Small website observation for {'{company}'}"</p>
        <p className="text-rose-300">Avoid: URGENT · ACT NOW · Guaranteed growth · Double your sales · Secret strategy.</p>
      </Section>

      <Section title="Opportunity templates (L0–L8)">
        <div className="space-y-2">
          {Object.values(OPPORTUNITY_GUIDANCE).map((g) => (
            <div key={g.type} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
              <p className="text-xs font-bold text-white">{g.label} <span className="font-mono text-[10px] text-neutral-500">{g.type}</span></p>
              <p className="mt-1 text-xs text-neutral-400"><strong>Observe:</strong> {g.observationHint}</p>
              <p className="text-xs text-neutral-400"><strong>Impact:</strong> {g.impactHint}</p>
              <p className="text-xs text-neutral-400"><strong>CTA:</strong> {g.ctaHint}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="QA checklist (before approval)">
        <p>Specificity · Validity · Relevance · Factuality · Tone · Friction · Compliance · Personalization · Claim safety · Duplication. A draft never auto-sends on score — a human approves every send, and suppression + jurisdiction are enforced by the database.</p>
      </Section>

      <Section title="Common mistakes">
        <ul className="list-disc space-y-1 pl-5">
          <li>Opening with "We are Logic Intelligence Technologies…" or a company bio.</li>
          <li>Dumping a service list into the first message.</li>
          <li>Converting a technical issue into a claim of financial loss without evidence.</li>
          <li>Inventing a recipient name, a metric, or a problem that wasn't measured.</li>
        </ul>
      </Section>
    </div>
  );
}
