/**
 * Newsletter double opt-in token management.
 *
 * Flow:
 *   1. POST /api/newsletter  → creates pending subscriber + sends confirmation email
 *   2. GET  /api/newsletter/confirm?token=...  → verifies token, activates subscriber
 *
 * Token format: <base64url(payload)>.<base64url(hmac-sha256)>
 * Payload: doi|<email>|<exp-unix-ms>
 * TTL: 72 hours
 */
import "server-only";
import crypto from "crypto";
import { isValidEmail, normalizeEmail } from "./validation";
import { EMAIL_SITE_URL, unsubscribeSecret } from "./config";

const TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64url");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

/** Create a signed, time-limited double opt-in token for the given email. */
export function createOptinToken(email: string): string | null {
  const secret = unsubscribeSecret();
  if (!secret) return null;
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;
  const exp = Date.now() + TTL_MS;
  const payload = `doi|${normalized}|${exp}`;
  return `${b64url(payload)}.${sign(payload, secret)}`;
}

/** Verify a double opt-in token. Returns { email } on success, null on failure. */
export function verifyOptinToken(token: string): { email: string } | null {
  const secret = unsubscribeSecret();
  if (!secret || !token || !token.includes(".")) return null;

  const dotIdx = token.lastIndexOf(".");
  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payloadB64 || !sig) return null;

  let payload = "";
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  // Timing-safe signature check
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  // Validate payload structure: doi|<email>|<exp>
  const parts = payload.split("|");
  if (parts.length !== 3 || parts[0] !== "doi") return null;
  const [, email, expRaw] = parts;
  const exp = Number(expRaw);
  if (!isValidEmail(email ?? "") || !exp || Date.now() > exp) return null;

  return { email: normalizeEmail(email ?? "") };
}

/** Build the confirmation URL for use in the opt-in email. */
export function buildOptinConfirmUrl(email: string): string | null {
  const token = createOptinToken(email);
  if (!token) return null;
  return `${EMAIL_SITE_URL.replace(/\/$/, "")}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}
