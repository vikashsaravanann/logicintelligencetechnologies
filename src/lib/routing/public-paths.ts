/**
 * Routes reachable without signing in.
 * Only the homepage and essential auth / static asset routes are public.
 */
export const PUBLIC_MARKETING_PREFIXES: readonly string[] = [];

export function isPublicPath(path: string): boolean {
  const p = path.split("?")[0];
  if (p === "/") return true;
  if (p === "/login" || p.startsWith("/login/")) return true;
  if (p === "/reset-password" || p.startsWith("/reset-password/")) return true;
  if (p.startsWith("/auth/")) return true;
  if (p.startsWith("/api/")) return true;
  if (p === "/unsubscribe" || p.startsWith("/unsubscribe/")) return true;
  if (p.startsWith("/_next/")) return true;
  if (p.startsWith("/assets/")) return true;
  if (p.startsWith("/images/")) return true;
  if (p.startsWith("/favicon")) return true;
  if (p.startsWith("/icon")) return true;
  if (p.startsWith("/apple-")) return true;
  if (p.startsWith("/sitemap")) return true;
  if (p.startsWith("/robots")) return true;
  if (p.startsWith("/manifest")) return true;
  return false;
}

/**
 * Signed-in areas. Requests here without a session are redirected to /login.
 * Paths that are neither public nor protected match no route, so the
 * middleware lets them through and Next renders the 404 page instead of
 * sending a mistyped URL to /login. The route-classification test fails if a
 * page exists that is in neither list, so a new private page cannot ship
 * unprotected.
 */
export const PROTECTED_PREFIXES: readonly string[] = [
  // Administrative and internal areas
  "/admin",
  "/client",
  "/dashboard",
  "/profile",

  // Pages requiring sign-in
  "/about",
  "/accessibility",
  "/ai",
  "/ai-assistant",
  "/ai-discovery",
  "/ai-ethics",
  "/architecture",
  "/blog",
  "/book-consultation",
  "/booking",
  "/careers",
  "/certifications",
  "/checklist",
  "/community",
  "/company",
  "/contact",
  "/cookie-policy",
  "/discovery",
  "/docs",
  "/enterprise-checklist",
  "/expertise",
  "/free-demo",
  "/handover",
  "/healthcare",
  "/help-center",
  "/industries",
  "/investor-brief",
  "/investors",
  "/jobs",
  "/knowledge-base",
  "/onboard",
  "/onboarding",
  "/packages",
  "/payment",
  "/press",
  "/pricing",
  "/privacy",
  "/privacy-policy",
  "/products",
  "/proposal",
  "/refund-policy",
  "/resources",
  "/roi-calculator",
  "/sales",
  "/search",
  "/security",
  "/services",
  "/status",
  "/support",
  "/terms",
  "/terms-of-service",
  "/voice-shield",
  "/work",
];

/** Decoded, slash-collapsed, lower-cased path; null when the encoding is malformed. */
function normalizePath(path: string): string | null {
  try {
    return decodeURIComponent(path).replace(/\/{2,}/g, "/").toLowerCase();
  } catch {
    return null;
  }
}

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  const normalized = normalizePath(path);
  if (normalized === null) return true; // malformed encoding: fail closed
  return prefixes.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

export function isProtectedPath(path: string): boolean {
  return matchesPrefix(path, PROTECTED_PREFIXES);
}

/** Internal areas restricted to company accounts (in addition to signing in). */
export const COMPANY_ONLY_PREFIXES: readonly string[] = ["/admin", "/dashboard"];

export function isCompanyOnlyPath(path: string): boolean {
  return matchesPrefix(path, COMPANY_ONLY_PREFIXES);
}
