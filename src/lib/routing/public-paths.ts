/**
 * Routes reachable without signing in. The middleware is default-deny: any
 * path not matched here is redirected to /login, so every public marketing
 * page MUST be listed. tests/navigation/public-paths.test.ts fails if a page
 * under src/app/(marketing) is missing, which is how routes like /pricing and
 * /voice-shield/request were previously locked behind the login wall.
 */
export const PUBLIC_MARKETING_PREFIXES: readonly string[] = [
  // (marketing) route group
  "/about", "/accessibility", "/ai-assistant", "/ai-discovery", "/ai-ethics",
  "/architecture", "/blog", "/book-consultation", "/booking", "/careers",
  "/certifications", "/checklist", "/community", "/contact", "/cookie-policy",
  "/discovery", "/docs", "/expertise", "/free-demo", "/help-center",
  "/industries", "/investor-brief", "/investors", "/jobs", "/knowledge-base",
  "/packages", "/press", "/privacy", "/privacy-policy", "/products",
  "/proposal", "/refund-policy", "/resources", "/roi-calculator", "/sales",
  "/search", "/services", "/status", "/support", "/terms",
  "/terms-of-service", "/work",
  // Public pages that live outside the (marketing) group
  "/ai", "/company", "/pricing", "/security", "/voice-shield",
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
