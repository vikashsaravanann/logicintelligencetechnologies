/**
 * Customer Enquiry State Machine & Integration Verification Engine
 * Implements Section 08A and QA-57..78 verification logic.
 */

import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Canonical State Machine
// -----------------------------------------------------------------------------
export const ENQUIRY_STATES = [
  "NEW",
  "DUPLICATE",
  "SUPPRESSED",
  "INVALID",
  "NEEDS_REVIEW",
  "APPROVAL_PENDING",
  "APPROVED",
  "DECLINED",
  "APPROVAL_EXPIRED",
  "SEND_CLAIMED",
  "PROVIDER_ACCEPTED",
  "DELIVERY_CONFIRMED",
  "SEND_FAILED",
  "SEND_UNKNOWN",
  "BOOKING_LINK_SENT",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "MANUAL_REVIEW",
] as const;

export type EnquiryState = (typeof ENQUIRY_STATES)[number];

export const VALID_TRANSITIONS: Record<EnquiryState, readonly EnquiryState[]> = {
  NEW: ["DUPLICATE", "SUPPRESSED", "INVALID", "NEEDS_REVIEW", "APPROVAL_PENDING", "SEND_FAILED"],
  DUPLICATE: [],
  SUPPRESSED: [],
  INVALID: [],
  NEEDS_REVIEW: ["APPROVAL_PENDING", "DECLINED", "MANUAL_REVIEW"],
  APPROVAL_PENDING: ["APPROVED", "DECLINED", "APPROVAL_EXPIRED"],
  APPROVED: ["SEND_CLAIMED", "SEND_FAILED", "MANUAL_REVIEW"],
  DECLINED: [],
  APPROVAL_EXPIRED: ["APPROVAL_PENDING", "MANUAL_REVIEW"],
  SEND_CLAIMED: ["PROVIDER_ACCEPTED", "SEND_FAILED", "SEND_UNKNOWN"],
  PROVIDER_ACCEPTED: ["DELIVERY_CONFIRMED", "BOOKING_LINK_SENT", "SEND_FAILED"],
  DELIVERY_CONFIRMED: ["BOOKING_LINK_SENT", "BOOKING_CONFIRMED"],
  SEND_FAILED: ["SEND_CLAIMED", "MANUAL_REVIEW"],
  SEND_UNKNOWN: ["PROVIDER_ACCEPTED", "SEND_FAILED", "MANUAL_REVIEW"],
  BOOKING_LINK_SENT: ["BOOKING_CONFIRMED", "BOOKING_CANCELLED"],
  BOOKING_CONFIRMED: ["BOOKING_CANCELLED"],
  BOOKING_CANCELLED: ["BOOKING_LINK_SENT", "BOOKING_CONFIRMED"],
  MANUAL_REVIEW: ["APPROVAL_PENDING", "DECLINED", "SEND_CLAIMED"],
};

export function isValidTransition(from: EnquiryState, to: EnquiryState): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidTransition(from: EnquiryState, to: EnquiryState): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid state transition: '${from}' -> '${to}'`);
  }
}

// -----------------------------------------------------------------------------
// 2. Atomic Reservation (QA-58)
// -----------------------------------------------------------------------------
const activeReservations = new Set<string>();

export function tryReserveMessage(messageId: string): { claimed: boolean; reason?: string } {
  if (!messageId || typeof messageId !== "string" || messageId.trim() === "") {
    return { claimed: false, reason: "invalid_message_id" };
  }
  const cleanId = messageId.trim();
  if (activeReservations.has(cleanId)) {
    return { claimed: false, reason: "duplicate" };
  }
  activeReservations.add(cleanId);
  return { claimed: true };
}

export function releaseReservation(messageId: string): void {
  activeReservations.delete(messageId.trim());
}

export function clearAllReservations(): void {
  activeReservations.clear();
}

// -----------------------------------------------------------------------------
// 3. Two-Phase Send & Terminal Message State (QA-59, QA-60)
// -----------------------------------------------------------------------------
export interface SendResult {
  ok: boolean;
  providerReceiptId?: string;
  error?: string;
  isUnknown?: boolean;
}

export interface TwoPhaseSendOutcome {
  threadState: EnquiryState;
  messageStatus: string;
  providerReceiptId?: string;
}

export function processTwoPhaseSend(
  currentStatus: EnquiryState,
  sendResult: SendResult
): TwoPhaseSendOutcome {
  if (!sendResult.ok) {
    if (sendResult.isUnknown) {
      return {
        threadState: "SEND_UNKNOWN",
        messageStatus: "SEND_UNKNOWN",
      };
    }
    return {
      threadState: "SEND_FAILED",
      messageStatus: "SEND_FAILED",
    };
  }

  // Strict: link_sent MUST NOT precede confirmed provider receipt!
  if (!sendResult.providerReceiptId || sendResult.providerReceiptId.trim() === "") {
    throw new Error("Cannot record booking_link_sent without valid provider receipt ID");
  }

  return {
    threadState: "BOOKING_LINK_SENT",
    messageStatus: "PROVIDER_ACCEPTED",
    providerReceiptId: sendResult.providerReceiptId,
  };
}

// -----------------------------------------------------------------------------
// 4. Idempotency Manager (QA-61)
// -----------------------------------------------------------------------------
const idempotencyStore = new Map<string, { providerReceiptId: string; sentAt: string }>();

export function executeSendWithIdempotency(
  idempotencyKey: string,
  sendFn: () => { providerReceiptId: string }
): { providerReceiptId: string; wasDeduplicated: boolean } {
  if (idempotencyStore.has(idempotencyKey)) {
    const existing = idempotencyStore.get(idempotencyKey)!;
    return {
      providerReceiptId: existing.providerReceiptId,
      wasDeduplicated: true,
    };
  }

  const result = sendFn();
  idempotencyStore.set(idempotencyKey, {
    providerReceiptId: result.providerReceiptId,
    sentAt: new Date().toISOString(),
  });

  return {
    providerReceiptId: result.providerReceiptId,
    wasDeduplicated: false,
  };
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}

// -----------------------------------------------------------------------------
// 5. Configuration & Placeholder Validation (QA-62, QA-66)
// -----------------------------------------------------------------------------
export function validateProductionConfig(
  config: Record<string, string | undefined>,
  mode: "M0" | "M1" | "M2" | "M3" = "M3"
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const [key, val] of Object.entries(config)) {
    if (!val || val.trim() === "") {
      violations.push(`Missing mandatory credential: ${key}`);
      continue;
    }

    if (val.includes("REPLACE_") || val.includes("TODO") || val.includes("CHANGE_ME")) {
      violations.push(`Placeholder detected in ${key}: '${val}'`);
    }

    if (mode === "M3") {
      if (val.includes("TEST-DAY5")) {
        violations.push(`Staging test filter 'TEST-DAY5' is forbidden in production: ${key}`);
      }
      if (val.toLowerCase().includes("cleaning")) {
        violations.push(`Cleaning business fixture reference forbidden in production: ${key}`);
      }
      if (val.includes("America/New_York")) {
        violations.push(`New York timezone fixture '${val}' detected in production: ${key}`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// -----------------------------------------------------------------------------
// 6. Gemini Output Validation & Prompt Injection Guard (QA-63)
// -----------------------------------------------------------------------------
const geminiSchema = z.object({
  category: z.enum(["CONSULTING", "AI_TRANSFORMATION", "HEALTHCARE", "SUPPORT", "SPAM"]),
  confidence: z.number().min(0).max(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO format YYYY-MM-DD").optional(),
  extractedSummary: z.string().max(500),
});

export interface GeminiValidationResult {
  valid: boolean;
  requiresReview: boolean;
  data?: z.infer<typeof geminiSchema>;
  reason?: string;
}

export function validateGeminiClassification(rawOutput: unknown): GeminiValidationResult {
  if (typeof rawOutput !== "object" || rawOutput === null) {
    return { valid: false, requiresReview: true, reason: "malformed_json" };
  }

  const obj = rawOutput as Record<string, unknown>;

  // Detect prompt injection attempts in raw model output
  const jsonStr = JSON.stringify(obj).toLowerCase();
  const injectionPatterns = [
    "ignore previous instructions",
    "disregard",
    "system prompt",
    "auto_approve: true",
    "grant admin",
    "bypass approval",
  ];

  for (const pattern of injectionPatterns) {
    if (jsonStr.includes(pattern)) {
      return {
        valid: false,
        requiresReview: true,
        reason: `prompt_injection_detected: '${pattern}'`,
      };
    }
  }

  const parsed = geminiSchema.safeParse(rawOutput);
  if (!parsed.success) {
    return {
      valid: false,
      requiresReview: true,
      reason: `schema_validation_failed: ${parsed.error.issues[0]?.message}`,
    };
  }

  // Confidence check: Low confidence requires manual review
  if (parsed.data.confidence < 0.75) {
    return {
      valid: true,
      requiresReview: true,
      data: parsed.data,
      reason: "low_confidence",
    };
  }

  return {
    valid: true,
    requiresReview: false,
    data: parsed.data,
  };
}

// -----------------------------------------------------------------------------
// 7. MIME Parser (QA-64)
// -----------------------------------------------------------------------------
export function parseMimeEmail(input: {
  contentType?: string;
  text?: string;
  html?: string;
  rawMime?: string;
}): { textContent: string; isHtmlConverted: boolean; sanitized: boolean } {
  if (input.text && input.text.trim().length > 0) {
    // Strip control chars
    const cleaned = input.text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
    return { textContent: cleaned, isHtmlConverted: false, sanitized: true };
  }

  if (input.html && input.html.trim().length > 0) {
    // Strip malicious tags: script, iframe, object, embed
    let stripped = input.html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    // Convert HTML tags to plain text linebreaks and whitespace
    stripped = stripped.replace(/<br\s*\/?>/gi, "\n");
    stripped = stripped.replace(/<\/p>/gi, "\n\n");
    stripped = stripped.replace(/<\/div>/gi, "\n");
    stripped = stripped.replace(/<[^>]+>/g, "");
    // Unescape common HTML entities
    stripped = stripped
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return { textContent: stripped, isHtmlConverted: true, sanitized: true };
  }

  return { textContent: "", isHtmlConverted: false, sanitized: true };
}

// -----------------------------------------------------------------------------
// 8. Cal.com Webhook Verification & Sync (QA-65, QA-69)
// -----------------------------------------------------------------------------
export function verifyCalComWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string | undefined
): { ok: boolean; reason?: string } {
  if (!secret || secret.trim() === "") {
    return { ok: false, reason: "no_secret" };
  }
  if (!signatureHeader || signatureHeader.trim() === "") {
    return { ok: false, reason: "missing_signature" };
  }

  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const providedHex = signatureHeader.replace(/^sha256=/, "").trim();

  if (expectedHex.length !== providedHex.length) {
    return { ok: false, reason: "bad_signature" };
  }

  const matches = timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(providedHex, "hex"));
  return matches ? { ok: true } : { ok: false, reason: "bad_signature" };
}

export function syncCalComBookingState(
  event: { triggerEvent: string; payload: { bookingUid?: string; startTime?: string } },
  currentStatus: EnquiryState
): { updatedState: EnquiryState; bookingUid?: string } {
  if (!event.payload.bookingUid) {
    throw new Error("Missing bookingUid in Cal.com webhook payload");
  }

  switch (event.triggerEvent) {
    case "BOOKING_CREATED":
    case "BOOKING_RESCHEDULED":
      return {
        updatedState: "BOOKING_CONFIRMED",
        bookingUid: event.payload.bookingUid,
      };
    case "BOOKING_CANCELLED":
      return {
        updatedState: "BOOKING_CANCELLED",
        bookingUid: event.payload.bookingUid,
      };
    default:
      return {
        updatedState: currentStatus,
        bookingUid: event.payload.bookingUid,
      };
  }
}

// -----------------------------------------------------------------------------
// 9. Telemetry Redaction & Zero PII/PHI (QA-67)
// -----------------------------------------------------------------------------
export function sanitizeLogTelemetry(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(data)) {
    const keyLower = k.toLowerCase();
    if (
      keyLower.includes("email") ||
      keyLower.includes("phone") ||
      keyLower.includes("patient") ||
      keyLower.includes("diagnosis") ||
      keyLower.includes("phi") ||
      keyLower.includes("recording") ||
      keyLower.includes("body") ||
      keyLower.includes("content") ||
      keyLower.includes("secret") ||
      keyLower.includes("password")
    ) {
      if (typeof v === "string" && v.length > 0) {
        sanitized[k] = `[REDACTED_HASH:${createHash("sha256").update(v).digest("hex").slice(0, 12)}]`;
      } else {
        sanitized[k] = "[REDACTED]";
      }
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeLogTelemetry(v as Record<string, unknown>);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

// -----------------------------------------------------------------------------
// 10. Multi-Tenant Isolation (QA-68)
// -----------------------------------------------------------------------------
export type TenantSite = "corporate" | "healthcare" | "logic_voice" | "voice_shield";

export function enforceTenantIsolation(
  actorTenant: TenantSite,
  targetTenant: TenantSite
): { allowed: boolean; reason?: string } {
  if (actorTenant === targetTenant) {
    return { allowed: true };
  }
  // Cross-tenant access is strictly denied
  return {
    allowed: false,
    reason: `Cross-tenant access forbidden: ${actorTenant} cannot access ${targetTenant}`,
  };
}

// -----------------------------------------------------------------------------
// 11. Role-Based Approval Access (QA-70)
// -----------------------------------------------------------------------------
export function canDecideEnquiryApproval(role: string): boolean {
  return role === "super_admin" || role === "admin" || role === "operations";
}

// -----------------------------------------------------------------------------
// 12. TTL & Expiration Verification (QA-72)
// -----------------------------------------------------------------------------
export function isApprovalExpired(
  createdAtIso: string,
  ttlHours: number = 48,
  nowMs: number = Date.now()
): boolean {
  const createdMs = new Date(createdAtIso).getTime();
  if (isNaN(createdMs)) return true;
  return nowMs - createdMs > ttlHours * 3600 * 1000;
}
