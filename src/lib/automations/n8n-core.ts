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
  const trimmed = (base ?? "").trim().replace(/\/+$/, "");
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
}

/** Reduce an n8n /workflows API item to the safe summary fields. */
export function toWorkflowSummary(item: unknown): N8nWorkflowSummary | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const id = o.id;
  const name = o.name;
  if ((typeof id !== "string" && typeof id !== "number") || typeof name !== "string") return null;
  return { id: String(id), name, active: Boolean(o.active) };
}
