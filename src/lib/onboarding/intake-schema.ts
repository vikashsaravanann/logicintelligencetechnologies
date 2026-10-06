import { z } from "zod";

/**
 * Pure zod schema for the onboarding intake. Strict (no unknown keys), bounded
 * sizes, and URL fields must be https. Clients are told never to send secrets;
 * the schema has no credential fields, and a separate secret scan rejects any
 * that slip into free text.
 */

const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(4000);
const httpsUrl = z
  .string()
  .trim()
  .max(300)
  .url()
  .refine((u) => u.startsWith("https://"), "URL must be https");

export const intakeSchema = z
  .object({
    company: z
      .object({
        legalName: shortText.min(1),
        displayName: shortText.optional(),
        website: httpsUrl.optional(),
        industry: shortText.optional(),
      })
      .strict(),
    contact: z
      .object({
        name: shortText.min(1),
        email: z.string().trim().email().max(200),
        phone: shortText.optional(),
        role: shortText.optional(),
      })
      .strict(),
    project: z
      .object({
        goals: longText.optional(),
        existingUrls: z.array(httpsUrl).max(20).optional(),
        repositories: z.array(httpsUrl).max(20).optional(),
      })
      .strict(),
    access: z
      .object({
        // Access handover is coordinated later over a secure channel — never
        // collected here. Only non-secret notes.
        notes: longText.optional(),
        hostingProvider: shortText.optional(),
        domainRegistrar: shortText.optional(),
      })
      .strict(),
    preferences: z
      .object({
        timezone: shortText.optional(),
        communication: shortText.optional(),
      })
      .strict()
      .optional(),
    confirmation: z
      .object({
        noSecretsConfirmed: z.literal(true),
        authorized: z.literal(true),
      })
      .strict(),
  })
  .strict();

export type OnboardingIntake = z.infer<typeof intakeSchema>;

/** Max accepted body size for an onboarding submission (bytes). */
export const MAX_INTAKE_BYTES = 64 * 1024;
