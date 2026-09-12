import type { EmailErrorCategory } from "./types";

export type ClassifiedEmailError = {
  category: EmailErrorCategory;
  retryable: boolean;
  code: string;
  message: string;
};

function asRecord(err: unknown): Record<string, unknown> {
  if (err && typeof err === "object") return err as Record<string, unknown>;
  return {};
}

export function classifyEmailError(err: unknown): ClassifiedEmailError {
  const rec = asRecord(err);
  const code = String(rec.code || rec.responseCode || rec.name || "UNKNOWN");
  const responseCode = Number(rec.responseCode || 0);
  const command = String(rec.command || "");
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown email error";
  const message = raw.slice(0, 300);
  const lower = `${code} ${message} ${command}`.toLowerCase();

  if (
    lower.includes("invalid recipient") ||
    lower.includes("no valid recipients") ||
    lower.includes("header") ||
    lower.includes("malformed")
  ) {
    return { category: "validation", retryable: false, code, message };
  }

  if (
    lower.includes("eauth") ||
    lower.includes("invalid login") ||
    lower.includes("authentication failed") ||
    responseCode === 535
  ) {
    return { category: "configuration", retryable: false, code, message };
  }

  if (
    lower.includes("smtp not configured") ||
    (lower.includes("missing") && lower.includes("smtp"))
  ) {
    return { category: "configuration", retryable: false, code, message };
  }

  const permanentCodes = new Set([550, 551, 552, 553, 554, 501, 503, 504, 521, 523, 541]);
  if (permanentCodes.has(responseCode) || lower.includes("user unknown") || lower.includes("mailbox unavailable")) {
    return { category: "permanent", retryable: false, code, message };
  }

  const temporaryCodes = new Set([421, 441, 442, 450, 451, 452, 454]);
  if (
    temporaryCodes.has(responseCode) ||
    /etimedout|econnreset|econnection|esocket|enotfound|eai_again|etimedout|timeout|429|rate limit|temporarily/.test(
      lower
    )
  ) {
    return { category: "temporary", retryable: true, code, message };
  }

  return { category: "unknown", retryable: true, code, message };
}

export function publicEmailFailureMessage(): string {
  return "We received your request, but email delivery is temporarily unavailable. Please try again shortly.";
}
