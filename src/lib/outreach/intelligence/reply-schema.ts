import { z } from "zod";

/**
 * Reply intent taxonomy. Mirrors the outreach_reply_category DB enum exactly
 * (directive: POSITIVE / QUESTION / REQUEST_AUDIT / NOT_NOW / NOT_INTERESTED /
 * OPT_OUT / BOUNCE), plus auto_reply (out-of-office) and the uncategorized
 * default so nothing is ever silently mislabelled.
 */
export const REPLY_CATEGORIES = [
  "positive",
  "question",
  "request_audit",
  "not_now",
  "not_interested",
  "opt_out",
  "bounce",
  "auto_reply",
  "uncategorized",
] as const;

export type ReplyCategory = (typeof REPLY_CATEGORIES)[number];

/** Human-readable labels + what each category means operationally. */
export const REPLY_CATEGORY_META: Record<ReplyCategory, { label: string; hint: string; tone: string }> = {
  positive: { label: "Positive", hint: "Interested — a human should respond personally.", tone: "emerald" },
  question: { label: "Question", hint: "Asked something — answer it, do not pitch.", tone: "sky" },
  request_audit: { label: "Requested audit", hint: "Wants the detail/audit/proposal.", tone: "indigo" },
  not_now: { label: "Not now", hint: "Timing, not interest — schedule a later follow-up.", tone: "amber" },
  not_interested: { label: "Not interested", hint: "Declined — close the thread, no chasing.", tone: "neutral" },
  opt_out: { label: "Opt-out", hint: "Must be suppressed immediately.", tone: "rose" },
  bounce: { label: "Bounce", hint: "Undeliverable — suppress the address.", tone: "rose" },
  auto_reply: { label: "Auto-reply", hint: "Out-of-office — no action; follow-up keeps its schedule.", tone: "neutral" },
  uncategorized: { label: "Uncategorized", hint: "A human must classify this.", tone: "neutral" },
};

/** Strict JSON shape expected from the AI classifier. */
export const replyClassificationSchema = z
  .object({
    category: z.enum(REPLY_CATEGORIES),
    confidence: z.number().min(0).max(1),
    rationale: z.string().min(1).max(500),
  })
  .strict();

export type ReplyClassification = z.infer<typeof replyClassificationSchema>;

/**
 * Conservative rule-based fallback, used when no AI provider is configured or
 * the model output is unusable. It NEVER guesses a soft intent with high
 * confidence — only the unambiguous operational signals (opt-out, bounce,
 * out-of-office) get a high score; everything else is flagged for a human.
 * Patterns are checked in priority order; the first match wins.
 */
const RULES: Array<{ category: ReplyCategory; confidence: number; patterns: RegExp[] }> = [
  {
    category: "bounce",
    confidence: 0.95,
    patterns: [
      /mailer-daemon/i,
      /delivery status notification/i,
      /undeliverable/i,
      /address not found/i,
      /recipient.{0,20}not found/i,
      /\b550[ -]/,
      /message could not be delivered/i,
    ],
  },
  {
    category: "opt_out",
    confidence: 0.9,
    patterns: [
      /\bunsubscribe\b/i,
      /\bremove me\b/i,
      /\btake me off\b/i,
      /\bstop (emailing|contacting|messaging)\b/i,
      /\bdo not (contact|email|message)\b/i,
      /\bopt[ -]?out\b/i,
    ],
  },
  {
    category: "auto_reply",
    confidence: 0.85,
    patterns: [
      /out of (the )?office/i,
      /auto(matic)?[ -]?reply/i,
      /on (annual |medical )?leave/i,
      /currently away/i,
      /i am (currently )?out/i,
    ],
  },
];

/** Soft-intent hints: matched only to SUGGEST a category to a human (low confidence). */
const SOFT_HINTS: Array<{ category: ReplyCategory; patterns: RegExp[] }> = [
  { category: "not_interested", patterns: [/\bnot interested\b/i, /\bno,? thank/i, /\bnot a (good )?fit\b/i, /\bplease stop\b/i] },
  { category: "request_audit", patterns: [/\b(send|share).{0,20}(audit|report|proposal|details|pricing|quote)\b/i, /\bfull (audit|report)\b/i] },
  { category: "not_now", patterns: [/\bnot (right )?now\b/i, /\bmaybe later\b/i, /\bcircle back\b/i, /\bnext (quarter|month|year)\b/i, /\breach out.{0,15}later\b/i] },
  { category: "positive", patterns: [/\b(interested|keen|sounds good|let'?s (talk|chat|connect)|happy to|would love)\b/i] },
  { category: "question", patterns: [/\?\s*$/, /\b(how|what|which|can you|could you|do you)\b.*\?/i] },
];

export interface RuleClassification {
  category: ReplyCategory;
  confidence: number;
  rationale: string;
  requiresHuman: boolean;
}

/**
 * Classify a reply body with rules only. Pure and deterministic — no network,
 * no fabrication. Operational signals are confident; soft intents are only a
 * low-confidence suggestion that always requires a human.
 */
export function classifyByRules(subject: string | null, body: string): RuleClassification {
  const text = `${subject ?? ""}\n${body}`;
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      // opt-out and bounce are actionable without a human; auto-reply is informational.
      const requiresHuman = rule.category === "auto_reply";
      return { category: rule.category, confidence: rule.confidence, rationale: `Matched ${rule.category} signal.`, requiresHuman };
    }
  }
  for (const hint of SOFT_HINTS) {
    if (hint.patterns.some((p) => p.test(text))) {
      return { category: hint.category, confidence: 0.35, rationale: `Possible ${hint.category}; needs human confirmation.`, requiresHuman: true };
    }
  }
  return { category: "uncategorized", confidence: 0, rationale: "No clear signal; a human must classify this.", requiresHuman: true };
}

/** Categories that are safe to act on automatically (suppress) without review. */
export const AUTO_ACTIONABLE: ReadonlySet<ReplyCategory> = new Set(["opt_out", "bounce"]);
