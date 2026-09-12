import "server-only";
import * as React from "react";
import { render } from "@react-email/components";
import { COMPANY } from "@/config/company";
import {
  getSmtpTransporter,
  getSmtpFromAddress,
  isSmtpConfigured,
  resolveSender,
  hasSenderCredentials,
} from "./smtp";
import {
  parseRecipientList,
  sanitizeSubject,
  containsHeaderInjection,
  isValidEmail,
  normalizeEmail,
} from "./validation";
import { classifyEmailError } from "./errors";
import {
  isEmailDryRun,
  isPreviewEmailIsolation,
  isAllowedPreviewRecipient,
  SEND_MAIL_TIMEOUT_MS,
} from "./config";
import { defaultReplyTo } from "./recipients";
import { isSuppressed } from "./suppression";
import {
  claimOutbox,
  markOutboxFailure,
  markOutboxSent,
  recordAttempt,
} from "./outbox";
import { buildOneClickUnsubscribeUrl } from "./unsubscribe";
import { emailLog, maskEmail } from "./logger";
import type {
  EmailAttachment,
  EmailCategory,
  EmailDeliveryStatus,
  EmailResponse,
  SenderKey,
} from "./types";

export type { EmailResponse };

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
  from: keyof typeof COMPANY.emails | string;
  attachments?: EmailAttachment[];
  category?: EmailCategory;
  idempotencyKey?: string;
  eventType?: string;
  templateKey?: string;
  correlationId?: string;
  allowFallbackSender?: boolean;
  listUnsubscribeEmail?: string;
}

function getSenderKeyFromEmail(email: string): SenderKey {
  const normalized = email
    .toLowerCase()
    .replace(/.*</, "")
    .replace(/>.*/, "")
    .trim();
  for (const [key, value] of Object.entries(COMPANY.emails)) {
    if (value.toLowerCase() === normalized) {
      return key as SenderKey;
    }
  }
  return "noReply";
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function safeReplyTo(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (containsHeaderInjection(value)) return undefined;
  const cleaned = value.replace(/.*</, "").replace(/>.*/, "").trim();
  if (cleaned.includes("@")) {
    return isValidEmail(cleaned) ? normalizeEmail(cleaned) : undefined;
  }
  if (cleaned in COMPANY.emails) {
    return COMPANY.emails[cleaned as SenderKey];
  }
  return undefined;
}

/**
 * Canonical transactional/marketing sender.
 * Never throws. Lead-producing callers must persist business records first.
 */
export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
  from,
  attachments,
  category = "transactional",
  idempotencyKey,
  eventType = "transactional",
  templateKey,
  correlationId,
  allowFallbackSender = true,
  listUnsubscribeEmail,
}: SendEmailOptions): Promise<EmailResponse> {
  const recipients = parseRecipientList(to);
  if (!recipients.length) {
    return { success: false, message: "No valid recipients", status: "failed" };
  }

  const safeSubject = sanitizeSubject(subject);
  const requested: SenderKey =
    typeof from === "string" && from.includes("@")
      ? getSenderKeyFromEmail(from)
      : (from as SenderKey);
  const resolvedReplyTo = safeReplyTo(replyTo) || defaultReplyTo();

  if (isPreviewEmailIsolation()) {
    const allowed = recipients.filter(isAllowedPreviewRecipient);
    if (!allowed.length) {
      emailLog("info", "preview_blocked", {
        subject: safeSubject,
        recipients: recipients.map(maskEmail),
      });
      return {
        success: true,
        message: "Preview isolation: delivery skipped",
        status: "skipped",
        skipped: true,
      };
    }
    recipients.splice(0, recipients.length, ...allowed);
  }

  if (category === "marketing") {
    const kept: string[] = [];
    for (const recipient of recipients) {
      if (await isSuppressed(recipient, "marketing")) {
        emailLog("info", "suppressed", { recipient: maskEmail(recipient), subject: safeSubject });
      } else {
        kept.push(recipient);
      }
    }
    if (!kept.length) {
      return {
        success: true,
        message: "Recipient suppressed",
        status: "suppressed",
        skipped: true,
      };
    }
    recipients.splice(0, recipients.length, ...kept);
  }

  if (!isSmtpConfigured(requested) && !isSmtpConfigured("noReply") && !isEmailDryRun()) {
    emailLog("error", "smtp_unconfigured", { subject: safeSubject });
    return { success: false, message: "SMTP not configured", status: "failed" };
  }

  const primary = hasSenderCredentials(requested) ? requested : resolveSender(requested);
  const unsubRecipient = listUnsubscribeEmail || (category === "marketing" ? recipients[0] : undefined);
  const listUnsub = unsubRecipient ? buildOneClickUnsubscribeUrl(unsubRecipient) : undefined;

  let html = "";
  let text = "";
  try {
    html = await render(react);
    text = await render(react, { plainText: true });
  } catch (err) {
    emailLog("error", "render_failed", {
      message: err instanceof Error ? err.message : String(err),
      subject: safeSubject,
    });
    return { success: false, message: "Internal failure while sending email", status: "failed" };
  }

  const outbox = idempotencyKey
    ? await claimOutbox({
        eventType,
        templateKey,
        category,
        recipient: recipients.join(","),
        sender: COMPANY.emails[primary],
        replyTo: resolvedReplyTo,
        subject: safeSubject,
        html,
        text,
        idempotencyKey,
        correlationId,
      })
    : null;

  if (outbox?.duplicate && outbox.alreadySent) {
    return {
      success: true,
      message: "Already sent",
      status: "sent",
      outboxId: outbox.id,
      skipped: true,
    };
  }
  if (outbox?.duplicate && !outbox.alreadySent) {
    return {
      success: true,
      message: "Delivery already in progress",
      status: "queued",
      outboxId: outbox.id,
      skipped: true,
    };
  }

  if (isEmailDryRun()) {
    emailLog("info", "dry_run", {
      subject: safeSubject,
      recipients: recipients.map(maskEmail),
      from: primary,
    });
    if (outbox?.id) await markOutboxSent(outbox.id, "dry-run");
    return {
      success: true,
      message: "Dry run: email not sent",
      status: "sent",
      outboxId: outbox?.id,
      skipped: true,
    };
  }

  const attempt = async (sender: SenderKey) => {
    const transporter = getSmtpTransporter(sender);
    const fromAddress = getSmtpFromAddress(sender);
    return withTimeout(
      transporter.sendMail({
        from: fromAddress,
        to: recipients,
        subject: safeSubject,
        html,
        text,
        replyTo: resolvedReplyTo,
        attachments,
        headers: listUnsub
          ? {
              "List-Unsubscribe": `<${listUnsub}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : undefined,
      }),
      SEND_MAIL_TIMEOUT_MS,
      "SMTP sendMail"
    );
  };

  try {
    try {
      const result = await attempt(primary);
      await recordAttempt({
        outboxId: outbox?.id,
        attempt: 1,
        status: "sent",
        providerMessageId: result.messageId,
      });
      if (outbox?.id) await markOutboxSent(outbox.id, result.messageId, false);
      return {
        success: true,
        message: `Email sent: ${result.messageId}`,
        status: "sent",
        messageId: result.messageId,
        outboxId: outbox?.id,
      };
    } catch (primaryErr) {
      const classified = classifyEmailError(primaryErr);
      emailLog("error", "primary_send_failed", {
        sender: primary,
        err: classified.message,
        code: classified.code,
        retryable: classified.retryable,
        subject: safeSubject,
        recipients: recipients.map(maskEmail),
      });

      const canFallback =
        allowFallbackSender &&
        classified.retryable &&
        primary !== "noReply" &&
        isSmtpConfigured("noReply");

      if (canFallback) {
        const result = await attempt("noReply");
        await recordAttempt({
          outboxId: outbox?.id,
          attempt: 2,
          status: "sent",
          providerMessageId: result.messageId,
        });
        if (outbox?.id) await markOutboxSent(outbox.id, result.messageId, true);
        emailLog("warn", "fallback_sender_used", {
          primary,
          subject: safeSubject,
        });
        return {
          success: true,
          message: `Email sent via fallback: ${result.messageId}`,
          status: "sent",
          messageId: result.messageId,
          outboxId: outbox?.id,
          fallbackUsed: true,
        };
      }

      const status: EmailDeliveryStatus = outbox?.id
        ? await markOutboxFailure(outbox.id, 1, classified)
        : classified.retryable
          ? "retrying"
          : "failed";
      await recordAttempt({
        outboxId: outbox?.id,
        attempt: 1,
        status: "failed",
        errorCode: classified.code,
        errorMessage: classified.message,
      });
      return {
        success: false,
        message: "Internal failure while sending email",
        status,
        outboxId: outbox?.id,
      };
    }
  } catch (error: unknown) {
    const classified = classifyEmailError(error);
    emailLog("error", "delivery_failed", {
      type: error instanceof Error ? error.name : "UnknownEmailError",
      message: classified.message,
      code: classified.code,
      sender: primary,
      recipients: recipients.map(maskEmail),
      subject: safeSubject,
    });
    if (outbox?.id) await markOutboxFailure(outbox.id, 1, classified);
    return {
      success: false,
      message: "Internal failure while sending email",
      status: classified.retryable ? "retrying" : "failed",
      outboxId: outbox?.id,
    };
  }
}
