import "server-only";
import { isSupabaseLive, isEmailDryRun, isPreviewEmailIsolation } from "@/lib/email/config";
import { isSmtpConfigured } from "@/lib/email/smtp";

/**
 * Configuration checks for the corporate site. Notes can describe security
 * gaps (e.g. a missing secret), so callers must only expose them to admins;
 * the public /api/health endpoint returns statuses without notes.
 */
export type CheckStatus = "ok" | "degraded" | "unconfigured";

export interface ComponentCheck {
  status: CheckStatus;
  note?: string;
}

export function runConfigChecks(): ConfigCheckReport {
  const checks: Record<string, ComponentCheck> = {};

  // ── Database ──────────────────────────────────────────────────────────────
  const dbLive = isSupabaseLive();
  checks.database = dbLive
    ? { status: "ok" }
    : { status: "unconfigured", note: "Supabase env vars missing or placeholder" };

  // ── SMTP ──────────────────────────────────────────────────────────────────
  const smtpOk = isSmtpConfigured("noReply");
  const dryRun = isEmailDryRun();
  if (dryRun) {
    checks.smtp = { status: "ok", note: "dry-run mode active" };
  } else if (smtpOk) {
    checks.smtp = { status: "ok" };
  } else {
    checks.smtp = {
      status: "unconfigured",
      note: "SMTP_NOREPLY_PASS or SMTP_PASS not set",
    };
  }

  // ── Email isolation (preview safety) ─────────────────────────────────────
  const isolated = isPreviewEmailIsolation();
  checks.emailIsolation = isolated
    ? { status: "ok", note: "preview isolation active" }
    : { status: "ok", note: "production delivery mode" };

  // ── Cron secret ───────────────────────────────────────────────────────────
  const cronSet = Boolean(process.env.CRON_SECRET);
  checks.cronSecret = cronSet
    ? { status: "ok" }
    : { status: "degraded", note: "CRON_SECRET not set — cron endpoints are unprotected" };

  // ── Unsubscribe secret ────────────────────────────────────────────────────
  const unsubSet = Boolean(
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
      process.env.CRON_SECRET ||
      process.env.SUPABASE_WEBHOOK_SECRET
  );
  checks.unsubscribeSecret = unsubSet
    ? { status: "ok" }
    : {
        status: "degraded",
        note: "No unsubscribe secret configured — opt-out tokens cannot be generated",
      };

  // ── Overall status ────────────────────────────────────────────────────────
  const statuses = Object.values(checks).map((c) => c.status);
  const healthy = statuses.every((s) => s === "ok");
  const degraded = statuses.some((s) => s === "degraded");
  const overall = healthy ? "ok" : degraded ? "degraded" : "unconfigured";

  return { overall, healthy, checks };
}

export interface ConfigCheckReport {
  overall: "ok" | "degraded" | "unconfigured";
  healthy: boolean;
  checks: Record<string, ComponentCheck>;
}
