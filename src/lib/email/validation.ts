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

// ---------------------------------------------------------------------------
// SSRF-safe URL check
// Blocks private/loopback/link-local/metadata addresses in addition to
// non-http(s) schemes.  This prevents user-supplied URLs from being used to
// probe internal infrastructure.
// ---------------------------------------------------------------------------

/** IPv4 ranges that are never valid external destinations. */
const PRIVATE_IPV4 = [
  // Loopback
  /^127\./,
  // RFC-1918 private
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  // Link-local (APIPA, AWS/GCP metadata)
  /^169\.254\./,
  // Broadcast / unspecified
  /^0\./,
  /^255\./,
];

function isPrivateHostname(hostname: string): boolean {
  // url.hostname for IPv6 includes brackets: "[::1]"
  // Strip them for matching, but keep the raw value for name checks
  const stripped = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const h = stripped.split(":")[0]; // strip port from IPv4/name (IPv6 already stripped)

  // Loopback names
  if (h === "localhost" || h === "ip6-localhost" || h === "ip6-loopback") return true;
  // IPv6 loopback / unspecified
  if (stripped === "::1" || stripped === "::") return true;
  // IPv6 link-local (fe80::/10)
  if (stripped.startsWith("fe80")) return true;

  // IPv4 private ranges
  return PRIVATE_IPV4.some((re) => re.test(h));
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (isPrivateHostname(url.hostname)) return false;
    return true;
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
