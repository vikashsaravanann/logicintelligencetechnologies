import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getSmtpTransporter,
  getSmtpFromAddress,
  isSmtpConfigured,
  resolveSender,
} from "@/lib/email/smtp";
import { COMPANY } from "@/config/company";
import { claimDueRow, loadDueOutbox, markOutboxFailure, markOutboxSent, recordAttempt } from "@/lib/email/outbox";
import { classifyEmailError } from "@/lib/email/errors";
import { isSuppressed } from "@/lib/email/suppression";
import { isEmailDryRun, SEND_MAIL_TIMEOUT_MS } from "@/lib/email/config";
import { emailLog, maskEmail } from "@/lib/email/logger";
import type { SenderKey } from "@/lib/email/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    timer = setTimeout(() => reject(new Error(`SMTP sendMail timed out after ${ms}ms`)), ms);
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

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (!secret || !authHeader.startsWith("Bearer ") || !timingEqual(authHeader.slice(7), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await loadDueOutbox(10);
  const processed: Array<{ id: string; status: string }> = [];

  for (const row of due) {
    const claimed = await claimDueRow(row.id, row.status);
    if (!claimed) continue;

    if (row.category === "marketing" && (await isSuppressed(row.recipient.split(",")[0], "marketing"))) {
      await markOutboxFailure(row.id, row.attempt_count, {
        category: "suppressed",
        retryable: false,
        message: "Recipient suppressed",
      });
      processed.push({ id: row.id, status: "suppressed" });
      continue;
    }

    if (isEmailDryRun()) {
      await markOutboxSent(row.id, "dry-run");
      processed.push({ id: row.id, status: "sent" });
      continue;
    }

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
          to: row.recipient.split(",").map((item) => item.trim()),
          subject: row.subject,
          html: row.html,
          text: row.text || undefined,
          replyTo: row.reply_to || COMPANY.emails.support,
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

  return NextResponse.json({ success: true, processed: processed.length, results: processed });
}
