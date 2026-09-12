import "server-only";
import crypto from "crypto";
import { EMAIL_SITE_URL, unsubscribeSecret } from "./config";
import { isValidEmail, normalizeEmail } from "./validation";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180; // 180 days

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64url");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function createUnsubscribeToken(email: string): string | null {
  const secret = unsubscribeSecret();
  if (!secret) return null;
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${normalized}|${exp}`;
  return `${b64url(payload)}.${sign(payload, secret)}`;
}

export function verifyUnsubscribeToken(token: string): { email: string } | null {
  const secret = unsubscribeSecret();
  if (!secret || !token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  let payload = "";
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  const [email, expRaw] = payload.split("|");
  const exp = Number(expRaw);
  if (!isValidEmail(email) || !exp || Date.now() > exp) return null;
  return { email: normalizeEmail(email) };
}

export function buildUnsubscribeUrl(email: string): string | undefined {
  const token = createUnsubscribeToken(email);
  if (!token) return undefined;
  return `${EMAIL_SITE_URL.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function buildOneClickUnsubscribeUrl(email: string): string | undefined {
  const token = createUnsubscribeToken(email);
  if (!token) return undefined;
  return `${EMAIL_SITE_URL.replace(/\/$/, "")}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
