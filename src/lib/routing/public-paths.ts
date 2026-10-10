/**
 * Routes reachable without signing in. Every public marketing page MUST be
 * listed. tests/navigation/public-paths.test.ts fails if a page under
 * src/app/(marketing) is missing.
 */
export const PUBLIC_MARKETING_PREFIXES: readonly string[] = [
  // (marketing) route group
  "/about", "/accessibility", "/ai-assistant", "/ai-discovery", "/ai-ethics",
  "/architecture", "/blog", "/book-consultation", "/booking", "/careers",
  "/certifications", "/checklist", "/community", "/contact", "/cookie-policy",
  "/discovery", "/docs", "/expertise", "/free-demo", "/healthcare", "/help-center",
  "/industries", "/investor-brief", "/investors", "/jobs", "/knowledge-base",
  "/onboard", "/packages", "/press", "/privacy", "/privacy-policy", "/products",
  "/proposal", "/refund-policy", "/resources", "/roi-calculator", "/sales",
  "/search", "/services", "/status", "/support", "/terms",
  "/terms-of-service", "/voice-shield", "/work",
  // Public pages that live outside the (marketing) group
  "/ai", "/company", "/pricing", "/security",
];

export function isPublicPath(path: string): boolean {
  if (path === "/") return true;
  if (path.startsWith("/login")) return true;
  if (path.startsWith("/reset-password")) return true;
  if (path.startsWith("/auth/")) return true;
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/unsubscribe")) return true;
  if (path.startsWith("/_next/")) return true;
  if (path.startsWith("/assets/")) return true;
  if (path.startsWith("/images/")) return true;
  if (path.startsWith("/favicon")) return true;
  if (path.startsWith("/icon")) return true;
  if (path.startsWith("/apple-")) return true;
  if (path.startsWith("/sitemap")) return true;
  if (path.startsWith("/robots")) return true;
  if (path.startsWith("/manifest")) return true;
  return PUBLIC_MARKETING_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
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
  "/admin", "/client", "/dashboard", "/profile",
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
