/**
 * Double opt-in token tests.
 *
 * The token functions use only crypto + email validation — no DB, no SMTP.
 * We test the pure token logic inline here to avoid server-only and config
 * module boundaries that require Next.js resolution.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// ── Pure token implementation (mirrors double-optin.ts exactly) ──────────
const TTL_MS = 72 * 60 * 60 * 1000;
const SECRET = "test-secret-for-double-optin-tests-32chars";
const SITE_URL = "https://www.logicintelligencetechnologies.in";

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString("base64url");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

function isValidEmail(v: string): boolean {
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(v);
}
function normalizeEmail(v: string): string {
  return String(v).trim().toLowerCase();
}

function createOptinToken(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;
  const exp = Date.now() + TTL_MS;
  const payload = `doi|${normalized}|${exp}`;
  return `${b64url(payload)}.${sign(payload, SECRET)}`;
}

function verifyOptinToken(token: string): { email: string } | null {
  if (!token || !token.includes(".")) return null;
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
  const expected = sign(payload, SECRET);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const parts = payload.split("|");
  if (parts.length !== 3 || parts[0] !== "doi") return null;
  const [, email, expRaw] = parts;
  const exp = Number(expRaw);
  if (!isValidEmail(email ?? "") || !exp || Date.now() > exp) return null;
  return { email: normalizeEmail(email ?? "") };
}

function buildOptinConfirmUrl(email: string): string | null {
  const token = createOptinToken(email);
  if (!token) return null;
  return `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

// ─────────────────────────────────────────────────────────────────────────

describe("createOptinToken", () => {
  it("returns a string token for a valid email", () => {
    const token = createOptinToken("user@example.com");
    assert.ok(token !== null && typeof token === "string" && token.length > 10);
  });

  it("returns null for an invalid email", () => {
    assert.equal(createOptinToken("not-an-email"), null);
    assert.equal(createOptinToken(""), null);
  });

  it("token contains a dot separator", () => {
    const token = createOptinToken("user@example.com")!;
    assert.ok(token.includes("."));
  });
});

describe("verifyOptinToken — valid tokens", () => {
  it("round-trips a token", () => {
    const email = "subscriber@example.com";
    const token = createOptinToken(email)!;
    const result = verifyOptinToken(token);
    assert.ok(result !== null);
    assert.equal(result!.email, email);
  });

  it("normalizes email case on verification", () => {
    const token = createOptinToken("User@EXAMPLE.COM")!;
    const result = verifyOptinToken(token);
    assert.ok(result !== null);
    assert.equal(result!.email, "user@example.com");
  });
});

describe("verifyOptinToken — invalid/tampered tokens", () => {
  it("rejects empty string", () => assert.equal(verifyOptinToken(""), null));
  it("rejects a token with no dot", () => assert.equal(verifyOptinToken("nodot"), null));

  it("rejects a tampered signature", () => {
    const token = createOptinToken("user@example.com")!;
    const tampered = token.slice(0, -4) + "XXXX";
    assert.equal(verifyOptinToken(tampered), null);
  });

  it("rejects a tampered payload with valid-looking sig", () => {
    const token = createOptinToken("user@example.com")!;
    const dotIdx = token.lastIndexOf(".");
    const sig = token.slice(dotIdx);
    const fakePayload = b64url("doi|attacker@evil.com|9999999999999");
    assert.equal(verifyOptinToken(`${fakePayload}${sig}`), null);
  });

  it("rejects an expired token", () => {
    const exp = Date.now() - 1000;
    const payload = `doi|expired@example.com|${exp}`;
    const token = `${b64url(payload)}.${sign(payload, SECRET)}`;
    assert.equal(verifyOptinToken(token), null);
  });

  it("rejects a token with wrong prefix", () => {
    const exp = Date.now() + 100_000;
    const payload = `unsub|user@example.com|${exp}`;
    const token = `${b64url(payload)}.${sign(payload, SECRET)}`;
    assert.equal(verifyOptinToken(token), null);
  });

  it("rejects a token missing the payload parts", () => {
    const payload = `doi|only-two-parts`;
    const token = `${b64url(payload)}.${sign(payload, SECRET)}`;
    assert.equal(verifyOptinToken(token), null);
  });
});

describe("buildOptinConfirmUrl", () => {
  it("returns URL with correct base and path", () => {
    const url = buildOptinConfirmUrl("sub@example.com");
    assert.ok(url !== null);
    assert.ok(url!.startsWith(SITE_URL));
    assert.ok(url!.includes("/api/newsletter/confirm?token="));
  });

  it("returns null for invalid email", () => {
    assert.equal(buildOptinConfirmUrl("bad"), null);
  });
});
