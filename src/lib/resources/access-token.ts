import "server-only";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const TOKEN_TTL_MS = 15 * 60 * 1000;

type Payload = {
  slug: string;
  exp: number;
  jti: string;
};

function secret(): string {
  return (
    process.env.RESOURCE_ACCESS_SECRET ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "lit-resource-dev-only-change-me"
  );
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64url");
}

function sign(data: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(data).digest());
}

export function issueResourceAccessToken(slug: string): {
  token: string;
  expiresAt: string;
  expiresInSec: number;
} {
  const payload: Payload = {
    slug,
    exp: Date.now() + TOKEN_TTL_MS,
    jti: crypto.randomBytes(16).toString("hex"),
  };
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return {
    token: `${body}.${sig}`,
    expiresAt: new Date(payload.exp).toISOString(),
    expiresInSec: Math.floor(TOKEN_TTL_MS / 1000),
  };
}

export type TokenVerify =
  | { ok: true; slug: string; jti: string }
  | { ok: false; reason: "invalid" | "expired" | "mismatch" };

export function verifyResourceAccessToken(
  token: string,
  expectedSlug: string
): TokenVerify {
  if (!token || typeof token !== "string" || token.length > 2048) {
    return { ok: false, reason: "invalid" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [body, sig] = parts;
  const expectedSig = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: "invalid" };
    }
  } catch {
    return { ok: false, reason: "invalid" };
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Payload;
    if (!payload?.slug || !payload?.exp || !payload?.jti) {
      return { ok: false, reason: "invalid" };
    }
    if (payload.slug !== expectedSlug) return { ok: false, reason: "mismatch" };
    if (Date.now() > payload.exp) return { ok: false, reason: "expired" };
    return { ok: true, slug: payload.slug, jti: payload.jti };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function resolveResourcePdfPath(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), "private", "resources", filename),
    path.join(process.cwd(), "public", "resources", filename),
    path.join(process.cwd(), "public", filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
