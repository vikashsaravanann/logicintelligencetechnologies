import { randomBytes, createHash } from "crypto";

/**
 * Enterprise Checklist Token Helpers.
 *
 * The raw token is a 32-byte base64url string shown to the issuing admin
 * and sent in the private invitation URL.
 * Only the SHA-256 hash is stored in the database.
 */

export interface GeneratedChecklistToken {
  token: string;
  tokenHash: string;
}

/** Compute SHA-256 hex digest of a raw token. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Check if token has valid format (base64url, 32 bytes = 43 characters). */
export function isWellFormedToken(token: string): boolean {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

/** Mint a fresh token and its cryptographic hash. */
export function generateChecklistToken(): GeneratedChecklistToken {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export type ChecklistTokenState = "valid" | "invalid" | "revoked" | "submitted" | "expired";

/** Determine current token state based on row timestamps. */
export function checklistTokenState(
  invitation: {
    revoked_at?: string | null;
    submitted_at?: string | null;
    expires_at?: string | null;
  } | null,
  now: Date = new Date()
): ChecklistTokenState {
  if (!invitation) return "invalid";
  if (invitation.revoked_at) return "revoked";
  if (invitation.submitted_at) return "submitted";
  if (invitation.expires_at && new Date(invitation.expires_at).getTime() < now.getTime()) {
    return "expired";
  }
  return "valid";
}

/**
 * Generate a human-readable unique confirmation reference.
 * Format: CHK-YYYY-XXXXXX (e.g. CHK-2026-A8F9C2).
 */
export function generateConfirmationReference(): string {
  const year = new Date().getFullYear();
  const code = randomBytes(3).toString("hex").toUpperCase();
  return `CHK-${year}-${code}`;
}

/**
 * Build WhatsApp sharing link for an enterprise checklist invitation.
 */
export function buildChecklistWhatsAppShareUrl({
  recipientName,
  invitationUrl,
}: {
  recipientName?: string;
  invitationUrl: string;
}): string {
  const greeting = recipientName ? `Hi ${recipientName}, ` : "Hi, ";
  const text = `${greeting}here is your secure link to the 50-Point Enterprise Deployment Checklist from Logic Intelligence Technologies: ${invitationUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
