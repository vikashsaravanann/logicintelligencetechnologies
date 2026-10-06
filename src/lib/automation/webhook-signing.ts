import { createHmac, timingSafeEqual } from "crypto";

/**
 * HMAC signing for the n8n <-> app automation channel. The signature covers
 * `${timestamp}.${eventId}.${rawBody}` so a body cannot be replayed with a new
 * id or outside the time window. Pure except for the system clock in verify.
 *
 * Header format: `v1=<hex>` plus a separate timestamp and event id, matching
 * what the n8n Code node computes and what /api/automation/callback checks.
 */

export const SIGNATURE_VERSION = "v1";
const DEFAULT_TOLERANCE_SEC = 300;

function signingString(timestamp: string, eventId: string, rawBody: string): string {
  return `${timestamp}.${eventId}.${rawBody}`;
}

/** Compute the `v1=<hex>` signature for a payload. */
export function signV1(secret: string, timestamp: string, eventId: string, rawBody: string): string {
  const mac = createHmac("sha256", secret).update(signingString(timestamp, eventId, rawBody)).digest("hex");
  return `${SIGNATURE_VERSION}=${mac}`;
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export interface VerifyResult {
  ok: boolean;
  reason?: "bad_signature" | "stale" | "malformed" | "no_secret";
}

/**
 * Verify a received signature against the payload. Fails closed when the secret
 * is missing, the signature does not match, or the timestamp is outside the
 * tolerance window (replay protection). Timing-safe.
 */
export function verifyV1(
  secret: string | undefined,
  header: string | null,
  timestamp: string | null,
  eventId: string | null,
  rawBody: string,
  nowSec: number = Math.floor(Date.now() / 1000),
  toleranceSec: number = DEFAULT_TOLERANCE_SEC,
): VerifyResult {
  if (!secret) return { ok: false, reason: "no_secret" };
  if (!header || !timestamp || !eventId) return { ok: false, reason: "malformed" };
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "malformed" };
  if (Math.abs(nowSec - ts) > toleranceSec) return { ok: false, reason: "stale" };
  const expected = signV1(secret, timestamp, eventId, rawBody);
  return constantTimeEqual(expected, header) ? { ok: true } : { ok: false, reason: "bad_signature" };
}
