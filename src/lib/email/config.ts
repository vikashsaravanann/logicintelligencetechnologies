import "server-only";
import { COMPANY } from "@/config/company";

export const EMAIL_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  COMPANY.websiteUrl;

export function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return false;
  if (url.includes("placeholder")) return false;
  if (key === "placeholder" || key === "placeholder_key") return false;
  return true;
}

export function isEmailDryRun(): boolean {
  return (
    process.env.EMAIL_PROVIDER === "mock" ||
    process.env.EMAIL_DRY_RUN === "true"
  );
}

export function isPreviewEmailIsolation(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" &&
    process.env.EMAIL_ALLOW_PREVIEW !== "true"
  );
}

export function isAllowedPreviewRecipient(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

export function unsubscribeSecret(): string | null {
  return (
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_WEBHOOK_SECRET ||
    null
  );
}

export const SEND_MAIL_TIMEOUT_MS = 28_000;
