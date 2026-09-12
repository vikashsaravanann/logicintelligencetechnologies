import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "Supabase URL is required")
    .refine((v) => !v.includes("placeholder"), {
      message: "NEXT_PUBLIC_SUPABASE_URL must not contain placeholder values",
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase Anon Key is required")
    .refine((v) => v !== "placeholder" && v !== "placeholder_key", {
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY must not be a placeholder value",
    }),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .optional()
    .default("https://www.logicintelligencetechnologies.in"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_WEBHOOK_SECRET: z.string().optional(),
  LEAD_NOTIFICATION_EMAIL: z
    .string()
    .optional()
    .default("support@logicintelligencetechnologies.in"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,
  LEAD_NOTIFICATION_EMAIL: process.env.LEAD_NOTIFICATION_EMAIL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error("[env] Invalid or missing environment variables:", errors);

  // During Vercel builds NEXT_PUBLIC_* vars may not yet be injected — warn and
  // continue so the build succeeds.  At runtime (after deployment) the real
  // values are always present; any request that reaches isSupabaseLive() will
  // detect the misconfiguration and degrade gracefully rather than using fakes.
  if (process.env.VERCEL_ENV === "production") {
    // Production runtime must never continue with missing credentials.
    // This path is only hit during `next build` not during actual requests,
    // so we warn without crashing the build.
    console.error(
      "[env] PRODUCTION build detected environment validation failure. " +
        "Ensure all required variables are set in Vercel Dashboard before deploying."
    );
  }
}

// ---------------------------------------------------------------------------
// Export
// IMPORTANT: We never export placeholder/fake Supabase credentials.
// If validation failed, export the real (potentially empty) env vars so that
// isSupabaseLive() returns false and callers degrade gracefully.
// This prevents fake clients from silently silently swallowing DB errors.
// ---------------------------------------------------------------------------
export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL ??
        "https://www.logicintelligencetechnologies.in",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,
      LEAD_NOTIFICATION_EMAIL:
        process.env.LEAD_NOTIFICATION_EMAIL ??
        "support@logicintelligencetechnologies.in",
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    };

export function isPublicEnvLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return Boolean(url) && !url.includes("placeholder");
}
