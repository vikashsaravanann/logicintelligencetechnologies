import type { GeneratorInput, GeneratorOutput } from "./message-schema";

/**
 * Pre-flight QA for a generated outreach draft (master directive §14–§15).
 * Pure: no I/O. Compliance + duplication are facts the caller supplies from the
 * DB (suppression/jurisdiction gate + recent-send check); every other gate is
 * derived from the draft and its evidence. A draft never auto-sends on score —
 * this is a review aid and a hard blocker for claim-safety / compliance.
 */

export interface GateContext {
  /** DB-verified: jurisdiction allowlisted AND no active suppression. */
  complianceCleared: boolean;
  /** DB-verified: no substantially identical outreach recently sent. */
  noRecentDuplicate: boolean;
}

export type GateKey =
  | "specificity"
  | "validity"
  | "relevance"
  | "factuality"
  | "tone"
  | "friction"
  | "compliance"
  | "personalization"
  | "claim_safety"
  | "duplication";

export interface GateResult {
  key: GateKey;
  pass: boolean;
  /** A blocker gate must pass before a draft may be approved/sent. */
  blocker: boolean;
  detail: string;
}

/** Unsupported business-outcome claims — never allowed without evidence (§8, §9). */
const UNSUPPORTED_CLAIM_PATTERNS: RegExp[] = [
  /\b(you(?:'re| are)?|your business)\s+losing\b/i,
  /\blos(?:e|ing)\s+(?:customers|clients|sales|revenue|business|leads)\b/i,
  /\bcosting you\b/i,
  /\bcosting\s+(?:you\s+)?(?:thousands|millions|\$|₹|lakhs|crores)\b/i,
  /\bbounce rate\b/i,
  /\bconversion(?:s)?\s+(?:are|is)\s+(?:dropping|down|low)\b/i,
  /\byour conversion rate\b/i,
  /\bcustomers?\s+(?:are\s+)?(?:leaving|hitting dead ends)\b/i,
  /\b\d{1,3}\s*%\s+of\s+(?:your\s+)?(?:mobile\s+)?(?:traffic|visitors|customers)\b/i,
];

/** Sensational / spammy tone markers (§13). */
const SENSATIONAL_PATTERNS: RegExp[] = [
  /\burgent\b/i,
  /\bact now\b/i,
  /\bguaranteed? (?:growth|results|roi)\b/i,
  /\bdouble your (?:sales|revenue|traffic)\b/i,
  /\bsecret strategy\b/i,
  /\blimited time\b/i,
  /!!+/,
];

/** Generic agency-bio openers the first message must avoid (§4). */
const GENERIC_OPENERS: RegExp[] = [
  /^\s*(?:hi[^.]*,?\s*)?we are\b/i,
  /\bwe (?:are|provide|offer) (?:a )?(?:leading|professional) /i,
  /\bX years of experience\b/i,
];

/** Unfilled template placeholders that must never ship. */
const PLACEHOLDER = /\{\{[^}]+\}\}|\[[a-z_ ]+\]/i;

function textOf(o: GeneratorOutput): string {
  return `${o.subject}\n${o.observation}\n${o.impact}\n${o.cta}\n${o.body}`;
}

export function runGates(input: GeneratorInput, output: GeneratorOutput, ctx: GateContext): GateResult[] {
  const all = textOf(output);
  const body = output.body;
  const hasEvidence = input.evidence.length > 0;

  const mentionsBusiness =
    body.toLowerCase().includes(input.company_name.toLowerCase().slice(0, Math.min(12, input.company_name.length))) ||
    output.evidence_used.length > 0;

  const demandsMeeting = /\b(?:30[- ]?min|half[- ]?hour|schedule a (?:call|meeting)|book a (?:call|demo)|get on a call)\b/i.test(
    output.cta,
  );

  const greeting = body.match(/^\s*(?:hi|hello|hey|dear)\s+([A-Za-z]+)/i);
  const greetWord = greeting?.[1]?.toLowerCase();
  const GENERIC_GREETINGS = new Set(["there", "team", "all", "everyone", "folks"]);
  const usesInventedName = !input.recipient_name && !!greetWord && !GENERIC_GREETINGS.has(greetWord);

  const results: GateResult[] = [
    {
      key: "specificity",
      pass: mentionsBusiness && !PLACEHOLDER.test(all),
      blocker: true,
      detail: "Contains a concrete detail about this business and no unfilled placeholders.",
    },
    {
      key: "validity",
      pass: hasEvidence && output.observation.trim().length > 0,
      blocker: true,
      detail: "The observation is backed by at least one evidence item.",
    },
    {
      key: "relevance",
      pass: output.impact.trim().length > 0,
      blocker: false,
      detail: "States why the observation may matter.",
    },
    {
      key: "factuality",
      pass: !UNSUPPORTED_CLAIM_PATTERNS.some((re) => re.test(all)),
      blocker: true,
      detail: "Separates measured facts from assumptions; no unverified outcomes.",
    },
    {
      key: "tone",
      pass: !SENSATIONAL_PATTERNS.some((re) => re.test(all)) && !GENERIC_OPENERS.some((re) => re.test(body)),
      blocker: false,
      detail: "Reads like a professional human note, not mass marketing.",
    },
    {
      key: "friction",
      pass: output.cta.trim().length > 0 && !demandsMeeting,
      blocker: false,
      detail: "Ends with a low-friction next step, not a meeting demand.",
    },
    {
      key: "compliance",
      pass: ctx.complianceCleared,
      blocker: true,
      detail: "Jurisdiction allowlisted and no active suppression (DB-enforced).",
    },
    {
      key: "personalization",
      pass: !usesInventedName,
      blocker: true,
      detail: "Personalization uses verified info; no invented recipient name.",
    },
    {
      key: "claim_safety",
      pass: !UNSUPPORTED_CLAIM_PATTERNS.some((re) => re.test(all)),
      blocker: true,
      detail: "No unsupported performance / revenue / conversion claims.",
    },
    {
      key: "duplication",
      pass: ctx.noRecentDuplicate,
      blocker: false,
      detail: "No substantially identical outreach sent recently.",
    },
  ];

  return results;
}

export interface QaScore {
  specificity: number;
  evidenceQuality: number;
  relevance: number;
  tone: number;
  ctaQuality: number;
  claimSafety: number;
  total: number; // 0–60
}

/** A 0–60 review aid (§15). Never a trigger to auto-send. */
export function qaScore(input: GeneratorInput, output: GeneratorOutput, gates: GateResult[]): QaScore {
  const g = (k: GateKey) => gates.find((x) => x.key === k)?.pass ?? false;
  const evidenceQuality = Math.min(10, input.evidence.length * 3 + (input.evidence.some((e) => e.measured_value) ? 2 : 0));
  const score: QaScore = {
    specificity: g("specificity") ? 10 : 3,
    evidenceQuality,
    relevance: g("relevance") ? 9 : 4,
    tone: g("tone") ? 9 : 4,
    ctaQuality: g("friction") ? 9 : 4,
    claimSafety: g("claim_safety") ? 10 : 0,
    total: 0,
  };
  score.total =
    score.specificity + score.evidenceQuality + score.relevance + score.tone + score.ctaQuality + score.claimSafety;
  return score;
}

/** True only when every blocker gate passes. */
export function passesBlockers(gates: GateResult[]): boolean {
  return gates.filter((g) => g.blocker).every((g) => g.pass);
}
