import type { GeneratorInput } from "./message-schema";
import { guidanceFor } from "./opportunities";
import { INSUFFICIENT_EVIDENCE, OUTREACH_CHANNELS } from "./message-schema";

/**
 * The canonical server-side system prompt for the LIT B2B outreach generator
 * (master directive §34). Kept server-only; never exposed to the browser.
 */
export const OUTREACH_SYSTEM_PROMPT = `You are the B2B outreach drafting system for Logic Intelligence Technologies (LIT).

Generate a concise FIRST-CONTACT outreach message from VERIFIED structured evidence.
Your objective is to start a relevant conversation, not to close a sale.

Use exactly:
1. one specific verified observation;
2. a proportionate explanation of why it may matter;
3. one low-friction permission CTA.

Never invent: business facts, contact names, technical problems, traffic data,
conversion data, revenue loss, customer behaviour, or any metric.

Do not introduce LIT with a company biography. Do not dump a service list.
Do not make unsupported promises. Do not use urgency or sensational wording.

Distinguish measured facts ("measured X on <date>") from reasonable implications
("this can add friction..."). Never state an unverified business outcome as fact.

If the evidence is insufficient to write an honest, specific message, return the
single token ${INSUFFICIENT_EVIDENCE} and nothing else.

Return STRICT JSON ONLY, no markdown, matching exactly:
{
  "subject": string,                     // short, specific, non-deceptive; "" for non-email
  "observation": string,                 // the one verified observation
  "impact": string,                      // proportionate "may/can" impact
  "cta": string,                         // one low-friction permission ask
  "body": string,                        // the full message a human would send
  "evidence_used": string[],             // which evidence items you relied on
  "claims_requiring_review": string[]    // anything you are unsure is verified
}`;

const CHANNEL_LENGTH: Record<(typeof OUTREACH_CHANNELS)[number], string> = {
  email: "Email: aim for ~50–120 words. Include a short, specific subject line.",
  linkedin: "LinkedIn DM: aim for ~25–70 words. subject must be \"\".",
  whatsapp: "WhatsApp: aim for ~20–60 words, only if appropriate. subject must be \"\".",
};

/** Build the user turn: the structured input + per-opportunity + per-channel guidance. */
export function buildUserPrompt(input: GeneratorInput): string {
  const g = guidanceFor(input.opportunity_type);
  const payload = {
    company_name: input.company_name,
    recipient_name: input.recipient_name ?? null,
    industry: input.industry ?? null,
    city: input.city ?? null,
    country_code: input.country_code ?? null,
    official_website: input.official_website ?? null,
    opportunity_type: input.opportunity_type,
    channel: input.channel,
    tone: input.tone,
    language: input.language,
    evidence: input.evidence,
  };
  return [
    `Opportunity: ${g.label}`,
    `Observation guidance: ${g.observationHint}`,
    `Impact guidance: ${g.impactHint}`,
    `CTA guidance: ${g.ctaHint}`,
    CHANNEL_LENGTH[input.channel],
    input.recipient_name
      ? `A verified recipient name is provided; you may address them by it.`
      : `No verified recipient name — do NOT invent one; open generically.`,
    ``,
    `Structured verified input (JSON):`,
    JSON.stringify(payload, null, 2),
  ].join("\n");
}
