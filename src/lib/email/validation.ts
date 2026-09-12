/**
 * Header-injection and recipient sanitization.
 * Keep this module free of Next.js / server-only imports so unit tests can load it.
 */

const HEADER_BREAK = /[\r\n\0\u2028\u2029]/;
const HEADER_BREAK_ALL = /[\r\n\0\u2028\u2029]/g;
const ENCODED_BREAK = /%0[ad]|&#10;|&#13;|\\r|\\n/i;
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export function containsHeaderInjection(value: string): boolean {
  if (!value) return false;
  return HEADER_BREAK.test(value) || ENCODED_BREAK.test(value);
}

export function sanitizeHeaderValue(value: string, maxLen = 200): string {
  return String(value || "")
    .replace(HEADER_BREAK_ALL, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeSubject(value: string, maxLen = 180): string {
  const cleaned = sanitizeHeaderValue(value, maxLen);
  return cleaned || "Message from Logic Intelligence Technologies";
}

export function normalizeEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  if (containsHeaderInjection(email)) return false;
  if (email.includes(" ") || email.includes(",")) return false;
  return EMAIL_RE.test(email);
}

export function parseRecipientList(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const email = normalizeEmail(raw);
    if (!isValidEmail(email)) continue;
    if (email.endsWith("@example.com")) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

export function assertSafeHeader(value: string | undefined, field: string): string | undefined {
  if (value == null || value === "") return undefined;
  if (containsHeaderInjection(value)) {
    throw new Error(`Unsafe ${field} header`);
  }
  return sanitizeHeaderValue(value);
}

export function sanitizePersonName(value: string, maxLen = 120): string {
  return sanitizeHeaderValue(value, maxLen);
}

export function sanitizeMultilineText(value: string, maxLen = 5000): string {
  return String(value || "")
    .replace(/\0/g, "")
    .slice(0, maxLen);
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeFilename(name: string): string {
  const base = String(name || "file").split(/[/\\]/).pop() || "file";
  const cleaned = base
    .replace(/\0/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return cleaned || "file";
}
