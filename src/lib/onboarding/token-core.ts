import { randomBytes, createHash } from "crypto";

/**
 * Onboarding token helpers. The raw token is a 32-byte base64url string shown
 * to the client exactly once (in their onboarding link); only its SHA-256 hash
 * is stored. Pure/deterministic except generateOnboardingToken.
 */

export interface GeneratedToken {
  token: string;
  tokenHash: string;
}

/** SHA-256 hex of a raw token — what the database stores and looks up by. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A URL-safe token format check (base64url, 32 bytes → 43 chars). */
export function isWellFormedToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

/** Mint a fresh onboarding token + its stored hash. */
export function generateOnboardingToken(): GeneratedToken {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export type SessionState = "valid" | "invalid" | "revoked" | "consumed" | "expired";

/** Derive a session's state from its row timestamps (pure). */
export function sessionState(row: {
  revoked_at?: string | null;
  consumed_at?: string | null;
  expires_at?: string | null;
} | null, now: Date = new Date()): SessionState {
  if (!row) return "invalid";
  if (row.revoked_at) return "revoked";
  if (row.consumed_at) return "consumed";
  if (row.expires_at && new Date(row.expires_at).getTime() < now.getTime()) return "expired";
  return "valid";
}
