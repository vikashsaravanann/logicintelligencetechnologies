import { z } from "zod";

/**
 * Structured contracts for the LIT outreach message generator. Only verified,
 * structured fields reach the model — never a raw database row. Every factual
 * claim is tied to evidence, and the output separates measured facts from
 * reasonable implications (never an unverified business outcome).
 *
 * Mirrors the master directive: §7 evidence model, §10 generator input, §11
 * generator output, §16 opportunity taxonomy.
 */

/** Opportunity taxonomy L0–L8, matching the `opportunity_type` DB enum. */
export const OPPORTUNITY_TYPES = [
  "L0_no_website",
  "L1_social_only",
  "L2_broken_website",
  "L3_legacy_website",
  "L4_performance",
  "L5_mobile_ux",
  "L6_conversion",
  "L7_seo_foundation",
  "L8_growth_automation",
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OUTREACH_CHANNELS = ["email", "linkedin", "whatsapp"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const OUTREACH_TONES = ["professional", "friendly", "concise"] as const;

/** A single piece of evidence behind an observation — fact, not inference. */
export const evidenceItemSchema = z
  .object({
    kind: z.enum(["technical_measurement", "observation", "public_signal"]),
    statement: z.string().trim().min(1).max(400),
    source: z.string().trim().max(200).optional(),
    source_url: z.string().trim().url().max(500).optional(),
    measured_value: z.string().trim().max(120).optional(),
    data_source: z.enum(["lab", "field_crux", "manual_check", "public_page"]).optional(),
    checked_at: z.string().trim().max(40).optional(),
  })
  .strict();
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

/**
 * The ONLY shape handed to the model. No raw DB objects, no secrets, no
 * invented contact names — a recipient_name is included only when verified.
 */
export const generatorInputSchema = z
  .object({
    company_name: z.string().trim().min(1).max(200),
    recipient_name: z.string().trim().max(120).optional(),
    industry: z.string().trim().max(120).optional(),
    city: z.string().trim().max(120).optional(),
    country_code: z.string().trim().length(2).optional(),
    official_website: z.string().trim().url().max(500).optional(),
    opportunity_type: z.enum(OPPORTUNITY_TYPES),
    channel: z.enum(OUTREACH_CHANNELS).default("email"),
    tone: z.enum(OUTREACH_TONES).default("professional"),
    language: z.string().trim().max(40).default("English"),
    /** At least one verified evidence item or the generator returns insufficient. */
    evidence: z.array(evidenceItemSchema).max(12).default([]),
  })
  .strict();
export type GeneratorInput = z.infer<typeof generatorInputSchema>;

/**
 * The structured output the model must return — never free-form text dropped
 * straight into a send. `claims_requiring_review` surfaces anything the model
 * is unsure is verified, for the human reviewer.
 */
export const generatorOutputSchema = z
  .object({
    subject: z.string().trim().max(160).default(""),
    observation: z.string().trim().max(600),
    impact: z.string().trim().max(600),
    cta: z.string().trim().max(300),
    body: z.string().trim().min(1).max(2000),
    evidence_used: z.array(z.string().trim().max(400)).max(12).default([]),
    claims_requiring_review: z.array(z.string().trim().max(400)).max(12).default([]),
  })
  .strict();
export type GeneratorOutput = z.infer<typeof generatorOutputSchema>;

/** The model returns this sentinel when evidence is too thin to write honestly. */
export const INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE" as const;

/** A fact classification label used in the UI (§8). */
export type FactClass = "VERIFIED" | "INFERRED" | "UNKNOWN";
