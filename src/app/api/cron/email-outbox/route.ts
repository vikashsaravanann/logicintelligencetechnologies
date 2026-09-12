import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getSmtpTransporter,
  getSmtpFromAddress,
  isSmtpConfigured,
  resolveSender,
} from "@/lib/email/smtp";
import { COMPANY } from "@/config/company";
import {
  claimDueRow,
  loadDueOutbox,
  markOutboxFailure,
  markOutboxSent,
  recordAttempt,
} from "@/lib/email/outbox";
import { classifyEmailError } from "@/lib/email/errors";
import { isSuppressed } from "@/lib/email/suppression";
import { isEmailDryRun, isSupabaseLive, SEND_MAIL_TIMEOUT_MS } from "@/lib/email/config";
import { emailLog, maskEmail } from "@/lib/email/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { SenderKey } from "@/lib/email/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// How long a row may sit in 'processing' before it is considered stuck.
// Must be safely longer than SEND_MAIL_TIMEOUT_MS (28 s) + handler overhead.
const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`SMTP sendMail timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function senderFromAddress(from: string): SenderKey {
  const normalized = from.toLowerCase().replace(/.*</, "").replace(/>.*/, "").trim();
  for (const [key, value] of Object.entries(COMPANY.emails)) {
    if (value.toLowerCase() === normalized) return key as SenderKey;
  }
  return "noReply";
}

/**
 * Recover records that have been stuck in 'processing' for longer than
 * STUCK_THRESHOLD_MS.  These are rows where a previous worker invocation
 * claimed the record but crashed or timed out before updating its status.
 *
 * We reset them back to 'retrying' with an incremented attempt count so the
 * normal processing loop can pick them up.
 */
async function recoverStuckRows(): Promise<number> {
  if (!isSupabaseLive()) return 0;
  const stuckBefore = new Date(Date.now() - STUCK_THRESHOLD_MS).toISOString();
  try {
    const { data, error } = await supabaseAdmin
      .from("email_outbox")
      .update({
        status: "retrying",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "processing")
      .lt("updated_at", stuckBefore)
      .select("id");

    if (error) {
      emailLog("warn", "stuck_recovery_failed", { message: error.message });
      return 0;
    }
    const count = data?.length ?? 0;
    if (count > 0) {
      emailLog("warn", "stuck_rows_recovered", { count });
    }
    return count;
  } catch (err) {
    emailLog("warn", "stuck_recovery_exception", {
      message: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (
    !secret ||
    !authHeader.startsWith("Bearer ") ||
    !timingEqual(authHeader.slice(7), secret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 1: recover any rows stuck in processing from a previous run
  const recovered = await recoverStuckRows();

  // Step 2: process due rows (pending + retrying, next_attempt_at <= now)
  const due = await loadDueOutbox(10);
  const processed: Array<{ id: string; status: string }> = [];

  for (const row of due) {
    // Atomic CAS claim — skips row if another worker already grabbed it
    const claimed = await claimDueRow(row.id, row.status);
    if (!claimed) continue;

    // Marketing suppression check
    if (
      row.category === "marketing" &&
      (await isSuppressed(row.recipient.split(",")[0] ?? "", "marketing"))
    ) {
      await markOutboxFailure(row.id, row.attempt_count, {
        category: "suppressed",
        retryable: false,
        message: "Recipient suppressed",
      });
      processed.push({ id: row.id, status: "suppressed" });
      continue;
    }

    // Dry-run mode
    if (isEmailDryRun()) {
      await markOutboxSent(row.id, "dry-run");
      processed.push({ id: row.id, status: "sent" });
      continue;
    }

    // Rows without rendered HTML cannot be retried by the worker
    if (!row.html) {
      await markOutboxFailure(row.id, row.attempt_count + 1, {
        category: "permanent",
        retryable: false,
        message: "Missing rendered body; cannot retry without re-render",
      });
      processed.push({ id: row.id, status: "failed" });
      continue;
    }

    const sender = resolveSender(senderFromAddress(row.sender));
    if (!isSmtpConfigured(sender) && !isSmtpConfigured("noReply")) {
      await markOutboxFailure(row.id, row.attempt_count + 1, {
        category: "configuration",
        retryable: false,
        message: "SMTP not configured",
      });
      processed.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const transporter = getSmtpTransporter(sender);
      const result = await withTimeout(
        transporter.sendMail({
          from: getSmtpFromAddress(sender),
          to: row.recipient.split(",").map((r) => r.trim()),
          subject: row.subject,
          html: row.html,
          text: row.text ?? undefined,
          replyTo: row.reply_to ?? COMPANY.emails.support,
        }),
        SEND_MAIL_TIMEOUT_MS
      );
      await recordAttempt({
        outboxId: row.id,
        attempt: row.attempt_count + 1,
        status: "sent",
        providerMessageId: result.messageId,
      });
      await markOutboxSent(row.id, result.messageId);
      processed.push({ id: row.id, status: "sent" });
    } catch (err) {
      const classified = classifyEmailError(err);
      emailLog("error", "outbox_retry_failed", {
        id: row.id,
        recipient: maskEmail(row.recipient),
        message: classified.message,
        code: classified.code,
      });
      const status = await markOutboxFailure(row.id, row.attempt_count + 1, classified);
      await recordAttempt({
        outboxId: row.id,
        attempt: row.attempt_count + 1,
        status: "failed",
        errorCode: classified.code,
        errorMessage: classified.message,
      });
      processed.push({ id: row.id, status });
    }
  }

  return NextResponse.json({
    success: true,
    recovered,
    processed: processed.length,
    results: processed,
  });
}
