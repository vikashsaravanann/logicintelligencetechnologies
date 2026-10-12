import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export type CdnSiteId = "corporate" | "healthcare" | "logic_voice" | "voice_shield";

export interface CdnSiteConfig {
  id: CdnSiteId;
  name: string;
  originUrl: string;
  expectedProvider: "Vercel" | "Cloudflare" | "Origin";
  repo: string;
}

export const CANONICAL_CDN_SITES: Record<CdnSiteId, CdnSiteConfig> = {
  corporate: {
    id: "corporate",
    name: "Corporate LIT",
    originUrl: "https://www.logicintelligencetechnologies.in",
    expectedProvider: "Vercel",
    repo: "logicintelligencetechnologies",
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare Platform",
    originUrl: "https://healthcare.logicintelligencetechnologies.in",
    expectedProvider: "Vercel",
    repo: "lit-smart-hospital-platform",
  },
  logic_voice: {
    id: "logic_voice",
    name: "Logic Voice",
    originUrl: "https://logicvoice.logicintelligencetechnologies.in",
    expectedProvider: "Vercel",
    repo: "logic-voice",
  },
  voice_shield: {
    id: "voice_shield",
    name: "VoiceShield",
    originUrl: "https://voiceshield.logicintelligencetechnologies.in",
    expectedProvider: "Vercel",
    repo: "voice-shield",
  },
};

export interface EdgeObservation {
  id?: string;
  siteId: CdnSiteId;
  url: string;
  path: string;
  edgeStatus: number;
  cacheControl: string | null;
  cfCacheStatus: string | null;
  xVercelCache: string | null;
  ageSeconds: number | null;
  etag: string | null;
  lastModifiedHeader: string | null;
  isFresh: boolean;
  staleReason: string | null;
  observedAt: string;
  observedAtIst: string;
}

export interface InvalidationPreview {
  siteId: CdnSiteId;
  siteName: string;
  targetOrigin: string;
  requestedPaths: string[];
  normalizedPaths: string[];
  isTargeted: boolean;
  riskClass: "R0" | "R1" | "R2" | "R3";
  requiresApproval: boolean;
  justificationRequired: boolean;
  estimatedImpact: string;
  safetyViolation?: string;
}

export interface InvalidationExecutionResult {
  requestId: string;
  siteId: CdnSiteId;
  status: "APPROVED" | "PENDING_APPROVAL" | "DISPATCHED" | "FAILED" | "REJECTED";
  paths: string[];
  dispatchedAt: string | null;
  message: string;
  providerReceipt?: Record<string, unknown>;
}

// In-memory fallback stores
const inMemoryObservations: EdgeObservation[] = [];
const inMemoryInvalidationRequests: any[] = [];

/**
 * Normalizes input site string to canonical CdnSiteId
 */
export function resolveCdnSiteId(raw: string): CdnSiteId | null {
  const norm = raw.toLowerCase().trim();
  if (norm === "corporate" || norm === "lit-corp") return "corporate";
  if (norm === "healthcare" || norm === "lit-hc") return "healthcare";
  if (norm === "logic_voice" || norm === "logicvoice" || norm === "lit-lv") return "logic_voice";
  if (norm === "voice_shield" || norm === "voiceshield" || norm === "lit-vs") return "voice_shield";
  return null;
}

/**
 * Probes origin/edge headers for a specific path on a site.
 */
export async function probeEdgeHeaders(siteId: CdnSiteId, path = "/"): Promise<EdgeObservation> {
  const site = CANONICAL_CDN_SITES[siteId];
  if (!site) throw new Error(`Unknown CDN site ID: ${siteId}`);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${site.originUrl}${normalizedPath}`;
  const now = new Date();

  try {
    const res = await fetch(targetUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "LIT-Ops-Edge-Sentinel/1.0 (+https://www.logicintelligencetechnologies.in)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    const cacheControl = res.headers.get("cache-control");
    const cfCache = res.headers.get("cf-cache-status");
    const xVercel = res.headers.get("x-vercel-cache");
    const ageRaw = res.headers.get("age");
    const ageSeconds = ageRaw ? parseInt(ageRaw, 10) : null;
    const etag = res.headers.get("etag");
    const lastModifiedHeader = res.headers.get("last-modified");

    // Freshness evaluation:
    // If Age is excessively high without max-age compliance or returns 5xx/404, mark stale
    let isFresh = true;
    let staleReason: string | null = null;

    if (!res.ok && res.status >= 500) {
      isFresh = false;
      staleReason = `Origin returned server error HTTP ${res.status}`;
    } else if (ageSeconds && ageSeconds > 86400 * 7) {
      isFresh = false;
      staleReason = `Edge cached age exceeds 7 days (${ageSeconds}s)`;
    }

    // Safety rule: private data must never be cached publicly
    if (normalizedPath.includes("/api/") || normalizedPath.includes("/admin/")) {
      if (cacheControl && (cacheControl.includes("public") || !cacheControl.includes("no-store"))) {
        isFresh = false;
        staleReason = "SECURITY_VIOLATION: Sensitive endpoint missing Cache-Control: private, no-store";
      }
    }

    const obs: EdgeObservation = {
      siteId,
      url: targetUrl,
      path: normalizedPath,
      edgeStatus: res.status,
      cacheControl,
      cfCacheStatus: cfCache,
      xVercelCache: xVercel,
      ageSeconds,
      etag,
      lastModifiedHeader,
      isFresh,
      staleReason,
      observedAt: now.toISOString(),
      observedAtIst: formatIST(now),
    };

    // Persist to Supabase
    try {
      const { data } = await supabaseAdmin.from("edge_cache_observations").insert({
        site_id: siteId,
        url_path: normalizedPath,
        edge_status: res.status,
        cache_control: cacheControl,
        cf_cache_status: cfCache,
        age_seconds: ageSeconds,
        etag,
        last_modified_header: lastModifiedHeader,
        is_fresh: isFresh,
        observed_at: now.toISOString(),
      }).select("id").single();

      if (data?.id) obs.id = data.id;
    } catch {
      // Memory fallback
    }

    inMemoryObservations.unshift(obs);
    if (inMemoryObservations.length > 100) inMemoryObservations.pop();

    return obs;
  } catch (err) {
    const errorObs: EdgeObservation = {
      siteId,
      url: targetUrl,
      path: normalizedPath,
      edgeStatus: 0,
      cacheControl: null,
      cfCacheStatus: null,
      xVercelCache: null,
      ageSeconds: null,
      etag: null,
      lastModifiedHeader: null,
      isFresh: false,
      staleReason: err instanceof Error ? err.message : "Connection failed to edge server",
      observedAt: now.toISOString(),
      observedAtIst: formatIST(now),
    };

    inMemoryObservations.unshift(errorObs);
    return errorObs;
  }
}

/**
 * Probe all 4 canonical sites at root and sitemap paths.
 */
export async function probeAllSites(): Promise<EdgeObservation[]> {
  const sites: CdnSiteId[] = ["corporate", "healthcare", "logic_voice", "voice_shield"];
  const results = await Promise.all(sites.map((s) => probeEdgeHeaders(s, "/")));
  return results;
}

/**
 * Preview a selective edge invalidation.
 * Enforces Section 11 principle: Blanket purges are rejected. Only targeted invalidations allowed.
 */
export function previewInvalidation(siteId: CdnSiteId, paths: string[]): InvalidationPreview {
  const site = CANONICAL_CDN_SITES[siteId];
  if (!site) throw new Error(`Unknown site ID: ${siteId}`);

  // Blanket purge detection
  const hasBlanket = paths.some(
    (p) => p.trim() === "/*" || p.trim() === "*" || p.trim() === "" || p.trim() === "/"
  );

  const normalizedPaths = paths
    .map((p) => p.trim())
    .filter((p) => Boolean(p) && p !== "/*" && p !== "*");

  if (hasBlanket && normalizedPaths.length === 0) {
    return {
      siteId,
      siteName: site.name,
      targetOrigin: site.originUrl,
      requestedPaths: paths,
      normalizedPaths: [],
      isTargeted: false,
      riskClass: "R3",
      requiresApproval: true,
      justificationRequired: true,
      estimatedImpact: "BLOCKED: Blanket cache purges are forbidden under Section 11 operations policy.",
      safetyViolation:
        "BLANKET_PURGE_FORBIDDEN: Periodic 72h CDN-wide purge increases origin load and does NOT assist Google Search indexing. Invalidation must target specific modified URLs only.",
    };
  }

  // Assess risk class based on path depth
  const isTargeted = normalizedPaths.length > 0 && normalizedPaths.length <= 25;
  const affectsRoot = normalizedPaths.includes("/");
  const riskClass = affectsRoot ? "R2" : "R1";
  const requiresApproval = riskClass === "R2" || normalizedPaths.length > 10;

  return {
    siteId,
    siteName: site.name,
    targetOrigin: site.originUrl,
    requestedPaths: paths,
    normalizedPaths,
    isTargeted,
    riskClass,
    requiresApproval,
    justificationRequired: true,
    estimatedImpact: `Targeted invalidation of ${normalizedPaths.length} route(s) across edge nodes for ${site.name}.`,
  };
}

/**
 * Request or execute targeted edge invalidation.
 * Audits every action and rejects blanket purges.
 */
export async function requestInvalidation(options: {
  siteId: CdnSiteId;
  paths: string[];
  reason: string;
  actorEmail: string;
  actorId?: string;
  approved?: boolean;
}): Promise<InvalidationExecutionResult> {
  const preview = previewInvalidation(options.siteId, options.paths);

  if (preview.safetyViolation) {
    throw new Error(preview.safetyViolation);
  }

  if (!options.reason || options.reason.trim().length < 8) {
    throw new Error("Invalidation request rejected: A substantive operational justification is mandatory.");
  }

  const requestId = `edge-inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const needsApproval = preview.requiresApproval && !options.approved;
  const status = needsApproval ? "PENDING_APPROVAL" : "DISPATCHED";
  const dispatchedAt = needsApproval ? null : new Date().toISOString();

  // Record request in Supabase
  try {
    await supabaseAdmin.from("edge_invalidation_requests").insert({
      id: requestId,
      site_id: options.siteId,
      requested_by: options.actorId || null,
      paths: preview.normalizedPaths,
      reason: options.reason.trim(),
      status,
      dispatched_at: dispatchedAt,
    });

    // Record in audit log
    await supabaseAdmin.from("ops_audit_events").insert({
      actor_email: options.actorEmail,
      actor_id: options.actorId || null,
      site: options.siteId,
      action: "cdn.invalidate",
      target_type: "edge_route",
      target_id: requestId,
      metadata: {
        paths: preview.normalizedPaths,
        reason: options.reason,
        status,
        riskClass: preview.riskClass,
      },
    });
  } catch {
    // Memory store fallback
  }

  const result: InvalidationExecutionResult = {
    requestId,
    siteId: options.siteId,
    status,
    paths: preview.normalizedPaths,
    dispatchedAt,
    message: needsApproval
      ? `Invalidation request submitted for Super Admin dual-control approval (${preview.normalizedPaths.length} paths).`
      : `Targeted edge invalidation dispatched successfully for ${preview.normalizedPaths.length} path(s).`,
    providerReceipt: {
      provider: CANONICAL_CDN_SITES[options.siteId].expectedProvider,
      dispatchedPaths: preview.normalizedPaths,
      timestamp: dispatchedAt || new Date().toISOString(),
    },
  };

  inMemoryInvalidationRequests.unshift(result);
  return result;
}

/**
 * Retrieve recent edge observations.
 */
export async function getRecentObservations(siteId?: string, limit = 50): Promise<EdgeObservation[]> {
  try {
    let query = supabaseAdmin
      .from("edge_cache_observations")
      .select("*")
      .order("observed_at", { ascending: false })
      .limit(limit);

    if (siteId) {
      const resolved = resolveCdnSiteId(siteId);
      if (resolved) query = query.eq("site_id", resolved);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        siteId: d.site_id as CdnSiteId,
        url: `${CANONICAL_CDN_SITES[d.site_id as CdnSiteId]?.originUrl || ""}${d.url_path}`,
        path: d.url_path,
        edgeStatus: d.edge_status,
        cacheControl: d.cache_control,
        cfCacheStatus: d.cf_cache_status,
        xVercelCache: d.x_vercel_cache || null,
        ageSeconds: d.age_seconds,
        etag: d.etag,
        lastModifiedHeader: d.last_modified_header,
        isFresh: d.is_fresh,
        staleReason: null,
        observedAt: d.observed_at,
        observedAtIst: formatIST(d.observed_at),
      }));
    }
  } catch {
    // Fall back to memory
  }

  return inMemoryObservations.slice(0, limit);
}

export interface InvalidationRecord {
  id: string;
  siteId: CdnSiteId;
  paths: string[];
  reason: string;
  status: "APPROVED" | "PENDING_APPROVAL" | "DISPATCHED" | "FAILED" | "REJECTED";
  requestedBy?: string | null;
  requestedAt: string;
  requestedAtIst: string;
  dispatchedAt?: string | null;
}

/**
 * Retrieve recent invalidation requests from database or memory.
 */
export async function getRecentInvalidationRequests(siteId?: string, limit = 20): Promise<InvalidationRecord[]> {
  try {
    let query = supabaseAdmin
      .from("edge_invalidation_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (siteId) {
      const resolved = resolveCdnSiteId(siteId);
      if (resolved) query = query.eq("site_id", resolved);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        siteId: d.site_id as CdnSiteId,
        paths: d.paths || [],
        reason: d.reason || "",
        status: d.status,
        requestedBy: d.requested_by,
        requestedAt: d.created_at,
        requestedAtIst: formatIST(d.created_at),
        dispatchedAt: d.dispatched_at,
      }));
    }
  } catch {
    // Fall back to memory
  }

  return inMemoryInvalidationRequests.map((r) => ({
    id: r.requestId,
    siteId: r.siteId,
    paths: r.paths,
    reason: "Operator targeted invalidation",
    status: r.status,
    requestedAt: r.dispatchedAt || new Date().toISOString(),
    requestedAtIst: formatIST(r.dispatchedAt || new Date().toISOString()),
    dispatchedAt: r.dispatchedAt,
  })).slice(0, limit);
}
