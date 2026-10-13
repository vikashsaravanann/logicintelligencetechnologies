import "server-only";
import { google } from "googleapis";

export type SiteCode = "LIT-CORP" | "LIT-HC" | "LIT-LV" | "LIT-VS";

export interface GscSiteProperty {
  siteCode: SiteCode;
  name: string;
  siteUrl: string;
  sitemapUrl: string;
  repo: string;
  propertyType: "URL_PREFIX" | "DOMAIN";
  status: "VERIFIED" | "PENDING_VERIFICATION" | "UNCONFIGURED" | "BLOCKED";
  lastVerifiedAt: string | null;
}

export const CANONICAL_GSC_SITES: Record<SiteCode, GscSiteProperty> = {
  "LIT-CORP": {
    siteCode: "LIT-CORP",
    name: "Corporate LIT",
    siteUrl: "https://www.logicintelligencetechnologies.in/",
    sitemapUrl: "https://www.logicintelligencetechnologies.in/sitemap.xml",
    repo: "logicintelligencetechnologies",
    propertyType: "URL_PREFIX",
    status: "UNCONFIGURED",
    lastVerifiedAt: null,
  },
  "LIT-HC": {
    siteCode: "LIT-HC",
    name: "Healthcare Platform",
    siteUrl: "https://healthcare.logicintelligencetechnologies.in/",
    sitemapUrl: "https://healthcare.logicintelligencetechnologies.in/sitemap.xml",
    repo: "lit-smart-hospital-platform",
    propertyType: "URL_PREFIX",
    status: "UNCONFIGURED",
    lastVerifiedAt: null,
  },
  "LIT-LV": {
    siteCode: "LIT-LV",
    name: "Logic Voice",
    siteUrl: "https://logicvoice.logicintelligencetechnologies.in/",
    sitemapUrl: "https://logicvoice.logicintelligencetechnologies.in/sitemap.xml",
    repo: "logic-voice",
    propertyType: "URL_PREFIX",
    status: "UNCONFIGURED",
    lastVerifiedAt: null,
  },
  "LIT-VS": {
    siteCode: "LIT-VS",
    name: "VoiceShield",
    siteUrl: "https://voiceshield.logicintelligencetechnologies.in/",
    sitemapUrl: "https://voiceshield.logicintelligencetechnologies.in/sitemap.xml",
    repo: "voice-shield",
    propertyType: "URL_PREFIX",
    status: "UNCONFIGURED",
    lastVerifiedAt: null,
  },
};

export interface EdgeIndexabilityDetails {
  httpStatus: number;
  httpStatusText: string;
  xRobotsTag: string | null;
  metaRobots: string | null;
  userCanonical: string | null;
  googleSiteVerification: string | null;
  isCanonicalSelfReferential: boolean;
  isRobotsAllowed: boolean;
  responseTimeMs: number;
  error?: string;
}

export interface GscIntegrationStatus {
  configured: boolean;
  reason?: string;
}

export interface UrlInspectionResult {
  url: string;
  siteCode: SiteCode;
  verdict: "PASS" | "NEUTRAL" | "FAIL" | "UNKNOWN";
  coverageState: string;
  indexingState: "INDEXING_ALLOWED" | "BLOCKED_BY_META_TAG" | "BLOCKED_BY_HTTP_HEADER" | "BLOCKED_BY_ROBOTS_TXT" | "UNKNOWN";
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  crawledAs: "DESKTOP" | "MOBILE" | "EDGE_INSPECTOR" | "UNKNOWN";
  inspectedAt: string;
  source: "GOOGLE_SEARCH_CONSOLE" | "DIRECT_EDGE_INSPECTION" | "MOCK_FIXTURE_DENIED";
  edgeDetails?: EdgeIndexabilityDetails;
  gscStatus?: GscIntegrationStatus;
}

export interface SitemapSummary {
  path: string;
  lastSubmitted: string | null;
  isPending: boolean;
  isSitemapsIndex: boolean;
  lastDownloaded: string | null;
  warningsCount: number;
  errorsCount: number;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// In-memory daily inspection quota tracker (max 2,000 per project/day)
let dailyInspectionCount = 0;
let quotaResetDate = new Date().toISOString().slice(0, 10);

function checkAndIncrementQuota(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== quotaResetDate) {
    dailyInspectionCount = 0;
    quotaResetDate = today;
  }
  if (dailyInspectionCount >= 2000) {
    return false;
  }
  dailyInspectionCount++;
  return true;
}

export function getRemainingDailyQuota(): number {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== quotaResetDate) {
    dailyInspectionCount = 0;
    quotaResetDate = today;
  }
  return Math.max(0, 2000 - dailyInspectionCount);
}

/**
 * Hard guard against improper Google Indexing API usage.
 * Section 10.3 / QA-50: Do NOT call Indexing API for ordinary pages.
 */
export function assertIndexingApiEligibility(pageType: string, url: string): void {
  const eligibleTypes = ["JobPosting", "BroadcastEvent"];
  if (!eligibleTypes.includes(pageType)) {
    throw new Error(
      `CRITICAL_POLICY_VIOLATION: Google Indexing API is strictly forbidden for standard page types (${pageType}) on ${url}. ` +
      `Only qualifying JobPosting or BroadcastEvent pages are permitted under Google Developer terms. Use Search Console Sitemaps API instead.`
    );
  }
}

export interface GscCredentialsResolution {
  clientEmail: string;
  configured: boolean;
  reason?: string;
}

/**
 * Resolve GSC OAuth / service-account credentials from environment.
 * Requires OAuth2 Service Account with an RSA private key.
 * Explicitly rejects API keys (AIza...). Never logs raw private key or tokens.
 */
export function resolveGscCredentials(): GscCredentialsResolution {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || "";
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY || "";

  if (!clientEmail || !privateKey) {
    return {
      clientEmail: clientEmail ? `${clientEmail.slice(0, 4)}***@***` : "",
      configured: false,
      reason: "Google Search Console API credentials unconfigured (GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL/PRIVATE_KEY).",
    };
  }

  if (privateKey.startsWith("AIza")) {
    return {
      clientEmail: `${clientEmail.slice(0, 4)}***@***`,
      configured: false,
      reason: "API_KEY_UNSUPPORTED: Google Search Console requires OAuth2 Service Account RSA private key, not simple API key (AIza...).",
    };
  }

  const isRsaKey = privateKey.includes("BEGIN PRIVATE KEY") || privateKey.includes("BEGIN RSA PRIVATE KEY");
  if (!isRsaKey) {
    return {
      clientEmail: `${clientEmail.slice(0, 4)}***@***`,
      configured: false,
      reason: "API_KEY_UNSUPPORTED: Google Search Console requires OAuth2 Service Account RSA private key, not simple API key (AIza...).",
    };
  }

  return {
    clientEmail: `${clientEmail.slice(0, 4)}***@***`,
    configured: true,
  };
}

function getGoogleClient() {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!key || !email) throw new Error("GSC credentials unconfigured");
  
  if (key.startsWith("AIza")) {
    throw new Error("API keys are not supported by Google Search Console API. OAuth2 Service Account RSA private key is required.");
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/webmasters']
  });
  return google.searchconsole({ version: 'v1', auth });
}

const DISALLOWED_PREFIXES = [
  "/admin",
  "/client",
  "/api",
  "/proposal",
  "/dashboard",
  "/profile",
];

export function isPathRobotsAllowed(urlStr: string): boolean {
  try {
    const pathname = urlStr.startsWith("/") ? urlStr : new URL(urlStr).pathname;
    for (const prefix of DISALLOWED_PREFIXES) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function isCanonicalSelfReferential(canonical: string | null, url: string): boolean {
  if (!canonical) return false;
  try {
    const cleanCanonical = canonical.trim().replace(/\/+$/, "").toLowerCase();
    const cleanUrl = url.trim().replace(/\/+$/, "").toLowerCase();
    return cleanCanonical === cleanUrl;
  } catch {
    return false;
  }
}

export function extractEdgeDirectives(
  html: string,
  headers?: { get?: (k: string) => string | null } | Record<string, string | null | undefined>
): {
  userCanonical: string | null;
  metaRobots: string | null;
  googleSiteVerification: string | null;
  xRobotsTag: string | null;
} {
  let userCanonical: string | null = null;
  const canonicalTag =
    html.match(/<link\b[^>]*?\brel\s*=\s*["']canonical["'][^>]*>/i) ||
    html.match(/<link\b[^>]*?\bhref\s*=\s*["'][^"']+["'][^>]*?\brel\s*=\s*["']canonical["'][^>]*>/i);
  if (canonicalTag) {
    const hrefMatch = canonicalTag[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch) userCanonical = hrefMatch[1].trim();
  }

  let metaRobots: string | null = null;
  const robotsTag =
    html.match(/<meta\b[^>]*?\bname\s*=\s*["']robots["'][^>]*>/i) ||
    html.match(/<meta\b[^>]*?\bcontent\s*=\s*["'][^"']+["'][^>]*?\bname\s*=\s*["']robots["'][^>]*>/i);
  if (robotsTag) {
    const contentMatch = robotsTag[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    if (contentMatch) metaRobots = contentMatch[1].trim();
  }

  let googleSiteVerification: string | null = null;
  const gsvTag =
    html.match(/<meta\b[^>]*?\bname\s*=\s*["']google-site-verification["'][^>]*>/i) ||
    html.match(/<meta\b[^>]*?\bcontent\s*=\s*["'][^"']+["'][^>]*?\bname\s*=\s*["']google-site-verification["'][^>]*>/i);
  if (gsvTag) {
    const contentMatch = gsvTag[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    if (contentMatch) googleSiteVerification = contentMatch[1].trim();
  }

  let xRobotsTag: string | null = null;
  if (headers) {
    if (typeof (headers as any).get === "function") {
      xRobotsTag = (headers as any).get("x-robots-tag");
    } else {
      const rec = headers as Record<string, string | null | undefined>;
      xRobotsTag = rec["x-robots-tag"] || rec["X-Robots-Tag"] || null;
    }
  }

  return {
    userCanonical,
    metaRobots,
    googleSiteVerification,
    xRobotsTag,
  };
}

/**
 * Perform live fetch using native fetch with 5-second timeout and LIT-SEO-EdgeInspector/1.0 User-Agent.
 * Inspects HTTP response status, x-robots-tag header, HTML canonical, meta robots, and google-site-verification.
 */
export async function inspectEdgeIndexability(
  siteCode: SiteCode,
  inspectionUrl: string
): Promise<{
  ok: boolean;
  verdict: "PASS" | "NEUTRAL" | "FAIL" | "UNKNOWN";
  coverageState: string;
  indexingState: "INDEXING_ALLOWED" | "BLOCKED_BY_META_TAG" | "BLOCKED_BY_HTTP_HEADER" | "BLOCKED_BY_ROBOTS_TXT" | "UNKNOWN";
  userCanonical: string | null;
  googleCanonical: string | null;
  edgeDetails: EdgeIndexabilityDetails;
}> {
  const startTime = performance.now();
  let res: Response;
  let html = "";
  try {
    res = await fetch(inspectionUrl, {
      headers: {
        "User-Agent": "LIT-SEO-EdgeInspector/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    html = await res.text();
  } catch (fetchErr: any) {
    const duration = Math.round(performance.now() - startTime);
    const errorMsg =
      fetchErr.name === "TimeoutError" || fetchErr.name === "AbortError"
        ? "Inspection timed out after 5 seconds"
        : fetchErr.message;
    return {
      ok: false,
      verdict: "FAIL",
      coverageState: "Crawl failed: Edge connection error",
      indexingState: "UNKNOWN",
      userCanonical: null,
      googleCanonical: null,
      edgeDetails: {
        httpStatus: 0,
        httpStatusText: "Connection Error",
        xRobotsTag: null,
        metaRobots: null,
        userCanonical: null,
        googleSiteVerification: null,
        isCanonicalSelfReferential: false,
        isRobotsAllowed: isPathRobotsAllowed(inspectionUrl),
        responseTimeMs: duration,
        error: errorMsg,
      },
    };
  }

  const duration = Math.round(performance.now() - startTime);
  const directives = extractEdgeDirectives(html, res.headers);
  const selfReferential = isCanonicalSelfReferential(directives.userCanonical, inspectionUrl);
  const robotsAllowed = isPathRobotsAllowed(inspectionUrl);

  const hasHeaderNoindex = Boolean(directives.xRobotsTag && /noindex/i.test(directives.xRobotsTag));
  const hasMetaNoindex = Boolean(directives.metaRobots && /noindex/i.test(directives.metaRobots));

  let indexingState:
    | "INDEXING_ALLOWED"
    | "BLOCKED_BY_META_TAG"
    | "BLOCKED_BY_HTTP_HEADER"
    | "BLOCKED_BY_ROBOTS_TXT"
    | "UNKNOWN" = "UNKNOWN";

  if (hasHeaderNoindex) {
    indexingState = "BLOCKED_BY_HTTP_HEADER";
  } else if (hasMetaNoindex) {
    indexingState = "BLOCKED_BY_META_TAG";
  } else if (!robotsAllowed) {
    indexingState = "BLOCKED_BY_ROBOTS_TXT";
  } else if (res.status >= 200 && res.status < 400) {
    indexingState = "INDEXING_ALLOWED";
  } else {
    indexingState = "UNKNOWN";
  }

  let verdict: "PASS" | "NEUTRAL" | "FAIL" | "UNKNOWN" = "FAIL";
  let coverageState = "Unknown";

  if (res.status >= 200 && res.status < 300) {
    if (indexingState === "INDEXING_ALLOWED") {
      verdict = "PASS";
      coverageState = "Live URL Verified (Direct Edge Inspection)";
    } else if (indexingState === "BLOCKED_BY_ROBOTS_TXT") {
      verdict = "FAIL";
      coverageState = "Blocked by robots.txt";
    } else {
      verdict = "FAIL";
      coverageState = "Excluded by 'noindex' tag";
    }
  } else if (res.status >= 300 && res.status < 400) {
    verdict = "NEUTRAL";
    coverageState = `Redirect (${res.status})`;
  } else if (res.status === 404) {
    verdict = "FAIL";
    coverageState = "URL is unknown to Google (404 Not Found)";
  } else {
    verdict = "FAIL";
    coverageState = `Server error (HTTP ${res.status})`;
  }

  const canonicalFound = directives.userCanonical;
  const googleCanonical = canonicalFound || inspectionUrl;

  return {
    ok: res.status >= 200 && res.status < 400,
    verdict,
    coverageState,
    indexingState,
    userCanonical: canonicalFound,
    googleCanonical,
    edgeDetails: {
      httpStatus: res.status,
      httpStatusText: res.statusText || (res.status === 200 ? "OK" : ""),
      xRobotsTag: directives.xRobotsTag,
      metaRobots: directives.metaRobots,
      userCanonical: canonicalFound,
      googleSiteVerification: directives.googleSiteVerification,
      isCanonicalSelfReferential: selfReferential,
      isRobotsAllowed: robotsAllowed,
      responseTimeMs: duration,
    },
  };
}

/**
 * Get the 4-site property list with live configuration state.
 */
export async function getGscSiteProperties(): Promise<GscSiteProperty[]> {
  const creds = resolveGscCredentials();
  return Object.values(CANONICAL_GSC_SITES).map((site) => ({
    ...site,
    status: creds.configured ? "VERIFIED" : "UNCONFIGURED",
    lastVerifiedAt: creds.configured ? new Date().toISOString() : null,
  }));
}

/**
 * Inspect a URL via Google Search Console URL Inspection API or Direct Edge Inspection.
 * Always runs edge inspection and falls back gracefully when GSC service account credentials
 * are unconfigured or pending delegation.
 */
export async function inspectUrl(
  siteCode: SiteCode,
  inspectionUrl: string
): Promise<{ ok: boolean; result: UrlInspectionResult | null; error?: string }> {
  const site = CANONICAL_GSC_SITES[siteCode];
  if (!site) {
    return { ok: false, result: null, error: `Unknown site code: ${siteCode}` };
  }

  // URL must belong to site
  if (!inspectionUrl.startsWith(site.siteUrl)) {
    return {
      ok: false,
      result: null,
      error: `URL ${inspectionUrl} does not match canonical site prefix ${site.siteUrl}`,
    };
  }

  if (!checkAndIncrementQuota()) {
    return {
      ok: false,
      result: null,
      error: "Search Console URL Inspection quota exceeded (2,000 requests/day limit).",
    };
  }

  // Always perform edge indexability telemetry
  const edgeResult = await inspectEdgeIndexability(siteCode, inspectionUrl);
  const creds = resolveGscCredentials();

  // If GSC credentials are validly configured, query Google Search Console API
  if (creds.configured) {
    try {
      const client = getGoogleClient();
      const res = await client.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl: site.siteUrl,
          languageCode: "en-US",
        },
      });
      const resultData = res.data.inspectionResult;

      return {
        ok: true,
        result: {
          url: inspectionUrl,
          siteCode,
          verdict: resultData?.indexStatusResult?.verdict === "PASS" ? "PASS" : "FAIL",
          coverageState: resultData?.indexStatusResult?.coverageState || edgeResult.coverageState,
          indexingState:
            resultData?.indexStatusResult?.indexingState === "INDEXING_ALLOWED"
              ? "INDEXING_ALLOWED"
              : edgeResult.indexingState,
          lastCrawlTime: resultData?.indexStatusResult?.lastCrawlTime || null,
          googleCanonical: resultData?.indexStatusResult?.googleCanonical || edgeResult.googleCanonical,
          userCanonical: resultData?.indexStatusResult?.userCanonical || edgeResult.userCanonical,
          crawledAs: resultData?.indexStatusResult?.crawledAs === "MOBILE" ? "MOBILE" : "DESKTOP",
          inspectedAt: new Date().toISOString(),
          source: "GOOGLE_SEARCH_CONSOLE",
          edgeDetails: edgeResult.edgeDetails,
          gscStatus: { configured: true },
        },
      };
    } catch (gscErr: any) {
      // GSC call failed -> fallback truthfully to DIRECT_EDGE_INSPECTION
      return {
        ok: edgeResult.ok,
        result: {
          url: inspectionUrl,
          siteCode,
          verdict: edgeResult.verdict,
          coverageState: edgeResult.coverageState,
          indexingState: edgeResult.indexingState,
          lastCrawlTime: new Date().toISOString(),
          googleCanonical: edgeResult.googleCanonical,
          userCanonical: edgeResult.userCanonical,
          crawledAs: "EDGE_INSPECTOR",
          inspectedAt: new Date().toISOString(),
          source: "DIRECT_EDGE_INSPECTION",
          edgeDetails: edgeResult.edgeDetails,
          gscStatus: {
            configured: false,
            reason: `Search Console API request error: ${gscErr.message || "Failed"}. Evaluated via Direct Edge Inspection.`,
          },
        },
        error: edgeResult.ok ? undefined : (edgeResult.edgeDetails.error || "Edge inspection failed"),
      };
    }
  }

  // GSC credentials are not configured -> return truthful DIRECT_EDGE_INSPECTION outcome
  return {
    ok: edgeResult.ok,
    result: {
      url: inspectionUrl,
      siteCode,
      verdict: edgeResult.verdict,
      coverageState: edgeResult.coverageState,
      indexingState: edgeResult.indexingState,
      lastCrawlTime: new Date().toISOString(),
      googleCanonical: edgeResult.googleCanonical,
      userCanonical: edgeResult.userCanonical,
      crawledAs: "EDGE_INSPECTOR",
      inspectedAt: new Date().toISOString(),
      source: "DIRECT_EDGE_INSPECTION",
      edgeDetails: edgeResult.edgeDetails,
      gscStatus: {
        configured: false,
        reason:
          creds.reason ||
          "Search Console API pending service account delegation. Evaluated via Direct Edge Inspection.",
      },
    },
    error: edgeResult.ok ? undefined : (edgeResult.edgeDetails.error || "Edge inspection failed"),
  };
}

/**
 * List sitemaps registered in Google Search Console for a property.
 */
export async function listSitemaps(siteCode: SiteCode): Promise<{
  ok: boolean;
  sitemaps: SitemapSummary[];
  error?: string;
}> {
  const site = CANONICAL_GSC_SITES[siteCode];
  if (!site) return { ok: false, sitemaps: [], error: `Unknown site code: ${siteCode}` };

  const creds = resolveGscCredentials();
  if (!creds.configured) {
    return {
      ok: false,
      sitemaps: [],
      error: "Google Search Console API unconfigured. Property status is UNCONFIGURED.",
    };
  }

  try {
    const client = getGoogleClient();
    const res = await client.sitemaps.list({ siteUrl: site.siteUrl });
    const items = res.data.sitemap || [];
    
    return {
      ok: true,
      sitemaps: items.map((sm: any) => ({
        path: sm.path || site.sitemapUrl,
        lastSubmitted: sm.lastSubmitted || null,
        isPending: sm.isPending || false,
        isSitemapsIndex: sm.isSitemapsIndex || false,
        lastDownloaded: sm.lastDownloaded || null,
        warningsCount: sm.warnings || 0,
        errorsCount: sm.errors || 0,
      }))
    };
  } catch (error: any) {
    return { ok: false, sitemaps: [], error: error.message };
  }
}

/**
 * Submit sitemap to Search Console. Requires write scope.
 */
export async function submitSitemap(
  siteCode: SiteCode,
  feedpath: string
): Promise<{ ok: boolean; message: string }> {
  const site = CANONICAL_GSC_SITES[siteCode];
  if (!site) return { ok: false, message: `Unknown site code: ${siteCode}` };

  const creds = resolveGscCredentials();
  if (!creds.configured) {
    return { ok: false, message: "GSC write scope unconfigured. Submission cannot be completed." };
  }

  try {
    const client = getGoogleClient();
    await client.sitemaps.submit({ siteUrl: site.siteUrl, feedpath });
    return { ok: true, message: `Sitemap ${feedpath} submitted successfully for site ${siteCode}.` };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
}
