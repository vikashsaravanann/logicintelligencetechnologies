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

export interface UrlInspectionResult {
  url: string;
  siteCode: SiteCode;
  verdict: "PASS" | "NEUTRAL" | "FAIL" | "UNKNOWN";
  coverageState: string;
  indexingState: "INDEXING_ALLOWED" | "BLOCKED_BY_META_TAG" | "BLOCKED_BY_HTTP_HEADER" | "BLOCKED_BY_ROBOTS_TXT" | "UNKNOWN";
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  crawledAs: "DESKTOP" | "MOBILE" | "UNKNOWN";
  inspectedAt: string;
  source: "GOOGLE_SEARCH_CONSOLE" | "MOCK_FIXTURE_DENIED";
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

/**
 * Resolve GSC OAuth / service-account credentials from environment.
 * Never logs raw private key or tokens.
 */
export function resolveGscCredentials(): { clientEmail: string; configured: boolean } {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || "";
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY || "";
  return {
    clientEmail: clientEmail ? `${clientEmail.slice(0, 4)}***@***` : "",
    configured: Boolean(clientEmail && privateKey),
  };
}

function getGoogleClient() {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!key) throw new Error("GSC key not configured");
  
  // If key is an API key (e.g., AIza...)
  if (key.startsWith('AIza')) {
    return google.searchconsole({ version: 'v1', auth: key });
  }
  
  // If it's a service account key
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/webmasters']
  });
  return google.searchconsole({ version: 'v1', auth });
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
 * Inspect a URL via Google Search Console URL Inspection API.
 * Never simulates a live crawl. Returns Google's indexed version state.
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

  const creds = resolveGscCredentials();
  if (!creds.configured) {
    return {
      ok: false,
      result: null,
      error: "Google Search Console API credentials unconfigured (GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL/PRIVATE_KEY).",
    };
  }

  if (!checkAndIncrementQuota()) {
    return {
      ok: false,
      result: null,
      error: "Search Console URL Inspection quota exceeded (2,000 requests/day limit).",
    };
  }

  try {
    const client = getGoogleClient();
    const res = await client.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl,
        siteUrl: site.siteUrl,
        languageCode: 'en-US'
      }
    });
    const resultData = res.data.inspectionResult;
    
    return {
      ok: true,
      result: {
        url: inspectionUrl,
        siteCode,
        verdict: resultData?.indexStatusResult?.verdict === 'PASS' ? 'PASS' : 'FAIL',
        coverageState: resultData?.indexStatusResult?.coverageState || 'Unknown',
        indexingState: resultData?.indexStatusResult?.indexingState === 'INDEXING_ALLOWED' ? 'INDEXING_ALLOWED' : 'UNKNOWN',
        lastCrawlTime: resultData?.indexStatusResult?.lastCrawlTime || null,
        googleCanonical: resultData?.indexStatusResult?.googleCanonical || null,
        userCanonical: resultData?.indexStatusResult?.userCanonical || null,
        crawledAs: resultData?.indexStatusResult?.crawledAs === 'MOBILE' ? 'MOBILE' : 'DESKTOP',
        inspectedAt: new Date().toISOString(),
        source: "GOOGLE_SEARCH_CONSOLE"
      }
    };
  } catch (error: any) {
    return { ok: false, result: null, error: error.message };
  }
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
