/**
 * Pure helpers for talking to an n8n instance. No env or network here so the
 * URL normalization is unit-testable.
 */

export interface N8nEndpoints {
  /** Instance origin, e.g. https://n8n.example.com */
  origin: string;
  /** REST API root, e.g. https://n8n.example.com/api/v1 */
  apiRoot: string;
  /** Liveness probe, e.g. https://n8n.example.com/healthz */
  healthUrl: string;
}

/**
 * Normalize a configured base URL into the endpoints we use. Accepts a base
 * given with or without a trailing /api/v1 and with or without a trailing
 * slash. Throws when the URL is invalid, or when it is not https in
 * production (n8n carries an API key that must never travel in clear text).
 */
export function normalizeN8nBase(base: string, isProduction: boolean): N8nEndpoints {
  const trimmed = (base ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/\/+$/, "");
  if (!trimmed) throw new Error("n8n base URL is empty");

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("n8n base URL is not a valid URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("n8n base URL must be http(s)");
  }
  if (isProduction && url.protocol !== "https:") {
    throw new Error("n8n base URL must be https in production");
  }

  // Strip a trailing /api/v1 (any casing of the version segment is unlikely;
  // match exactly) to recover the origin, then rebuild canonical endpoints.
  const path = url.pathname.replace(/\/+$/, "");
  const originPath = path.endsWith("/api/v1") ? path.slice(0, -"/api/v1".length) : path;
  const originBase = `${url.origin}${originPath}`.replace(/\/+$/, "");

  return {
    origin: originBase,
    apiRoot: `${originBase}/api/v1`,
    healthUrl: `${originBase}/healthz`,
  };
}

/** A workflow row reduced to the safe fields we display. Never execution data. */
export interface N8nWorkflowSummary {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Reduce an n8n /workflows API item to the safe summary fields. */
export function toWorkflowSummary(item: unknown): N8nWorkflowSummary | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const id = o.id;
  const name = o.name;
  if ((typeof id !== "string" && typeof id !== "number") || typeof name !== "string") return null;
  const summary: N8nWorkflowSummary = { id: String(id), name, active: Boolean(o.active) };
  if (Array.isArray(o.tags)) {
    summary.tags = o.tags.map((t) => (typeof t === "object" && t && "name" in t ? String((t as { name: unknown }).name) : String(t)));
  }
  if (typeof o.createdAt === "string") summary.createdAt = o.createdAt;
  if (typeof o.updatedAt === "string") summary.updatedAt = o.updatedAt;
  return summary;
}

/** Safe, sanitized workflow detail graph overview. */
export interface N8nWorkflowDetail {
  id: string;
  name: string;
  active: boolean;
  nodeCount: number;
  triggerKinds: string[];
  tags: string[];
  versionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function toWorkflowDetail(item: unknown): N8nWorkflowDetail | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const id = o.id;
  const name = o.name;
  if ((typeof id !== "string" && typeof id !== "number") || typeof name !== "string") return null;

  const nodes = Array.isArray(o.nodes) ? o.nodes : [];
  const triggerKinds: string[] = [];
  for (const n of nodes) {
    if (n && typeof n === "object" && "type" in n) {
      const typeStr = String((n as { type: unknown }).type);
      if (typeStr.toLowerCase().includes("trigger") || typeStr.toLowerCase().includes("webhook") || typeStr.toLowerCase().includes("cron")) {
        triggerKinds.push(typeStr);
      }
    }
  }

  const tags: string[] = [];
  if (Array.isArray(o.tags)) {
    for (const t of o.tags) {
      tags.push(typeof t === "object" && t && "name" in t ? String((t as { name: unknown }).name) : String(t));
    }
  }

  return {
    id: String(id),
    name,
    active: Boolean(o.active),
    nodeCount: nodes.length,
    triggerKinds: Array.from(new Set(triggerKinds)),
    tags,
    versionId: typeof o.versionId === "string" ? o.versionId : undefined,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

/** Execution summary - sanitized. Zero secrets, zero payloads, zero PHI. */
export interface N8nExecutionSummary {
  id: string;
  workflowId: string;
  mode: string;
  status: "success" | "error" | "running" | "waiting" | "unknown";
  startedAt: string | null;
  stoppedAt: string | null;
  durationMs: number | null;
}

export function toExecutionSummary(item: unknown): N8nExecutionSummary | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const id = o.id;
  if (typeof id !== "string" && typeof id !== "number") return null;

  const workflowId = String(o.workflowId ?? "");
  const mode = String(o.mode ?? "integrated");
  const rawStatus = String(o.status ?? (o.finished ? "success" : "running")).toLowerCase();

  let status: N8nExecutionSummary["status"] = "unknown";
  if (rawStatus === "success" || rawStatus === "finished") status = "success";
  else if (rawStatus === "error" || rawStatus === "failed" || rawStatus === "crashed") status = "error";
  else if (rawStatus === "running") status = "running";
  else if (rawStatus === "waiting") status = "waiting";

  const startedAt = typeof o.startedAt === "string" ? o.startedAt : null;
  const stoppedAt = typeof o.stoppedAt === "string" ? o.stoppedAt : null;

  let durationMs: number | null = null;
  if (startedAt && stoppedAt) {
    const start = new Date(startedAt).getTime();
    const stop = new Date(stoppedAt).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(stop) && stop >= start) {
      durationMs = stop - start;
    }
  }

  return {
    id: String(id),
    workflowId,
    mode,
    status,
    startedAt,
    stoppedAt,
    durationMs,
  };
}

