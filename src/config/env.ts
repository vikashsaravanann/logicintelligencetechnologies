import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
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
  console.error(
    "Invalid or missing public environment variables:",
    parsed.error.flatten().fieldErrors
  );
  if (process.env.VERCEL) {
    console.warn("Public env validation failed during Vercel build; runtime checks still apply.");
  }
}

const PLACEHOLDER = {
  NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder",
  NEXT_PUBLIC_SITE_URL: "https://www.logicintelligencetechnologies.in",
  SUPABASE_SERVICE_ROLE_KEY: undefined,
  SUPABASE_WEBHOOK_SECRET: undefined,
  LEAD_NOTIFICATION_EMAIL: "support@logicintelligencetechnologies.in",
  UPSTASH_REDIS_REST_URL: undefined,
  UPSTASH_REDIS_REST_TOKEN: undefined,
} as const;

export const env = parsed.success ? parsed.data : PLACEHOLDER;

export function isPublicEnvLive(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes("placeholder")
  );
}
