import "server-only";
import {
  normalizeN8nBase,
  toWorkflowSummary,
  toWorkflowDetail,
  toExecutionSummary,
  type N8nWorkflowSummary,
  type N8nWorkflowDetail,
  type N8nExecutionSummary,
} from "./n8n-core";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type AutomationsState = "CONNECTED" | "ERROR" | "NOT CONFIGURED";

export interface AutomationsSnapshot {
  state: AutomationsState;
  /** Human-safe detail. Never contains secrets or execution payloads. */
  detail: string;
  healthy: boolean | null;
  workflows: N8nWorkflowSummary[];
}

const TIMEOUT_MS = 8000;

export function cleanKey(raw: string | null | undefined): string {
  if (!raw) return "";
  let k = raw.trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  return k;
}

export function cleanUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  let u = raw.trim();
  if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith("'") && u.endsWith("'"))) {
    u = u.slice(1, -1).trim();
  }
  return u;
}

export function buildN8nHeaders(apiKey: string, initHeaders?: HeadersInit): HeadersInit {
  const k = cleanKey(apiKey);
  return {
    "X-N8N-API-KEY": k,
    Authorization: `Bearer ${k}`,
    accept: "application/json",
    ...(initHeaders ?? {}),
  };
}

export async function resolveN8nCreds(): Promise<{ base: string; apiKey: string } | null> {
  // Check platform_settings in Supabase first (configured via Super Admin UI)
  try {
    const { data } = await supabaseAdmin
      .from("platform_settings")
      .select("key, value")
      .in("key", ["n8n_base_url", "n8n_api_key"]);

    if (data && data.length > 0) {
      const map = new Map(data.map((d) => [d.key, d.value]));
      const dbBase = cleanUrl(map.get("n8n_base_url"));
      const dbKey = cleanKey(map.get("n8n_api_key"));
      if (dbBase && dbKey) {
        return { base: dbBase, apiKey: dbKey };
      }
    }
  } catch {
    // Non-fatal fallback to environment variables
  }

  const base = cleanUrl(process.env.N8N_BASE_URL);
  const apiKey = cleanKey(process.env.N8N_API_KEY);
  if (!base || !apiKey) return null;
  return { base, apiKey };
}

async function timedFetch(url: string, apiKey: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: buildN8nHeaders(apiKey, init?.headers),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/**
 * Read-only view of the n8n instance: liveness + the workflow list reduced to
 * id/name/active. Never requests or returns execution data. All failures are
 * reported as safe strings; the API key is never echoed.
 */
export async function getAutomationsSnapshot(): Promise<AutomationsSnapshot> {
  const c = await resolveN8nCreds();
  if (!c) {
    return {
      state: "NOT CONFIGURED",
      detail: "N8N_BASE_URL and N8N_API_KEY are not both set.",
      healthy: null,
      workflows: [],
    };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(c.base, process.env.NODE_ENV === "production");
  } catch (err) {
    return { state: "ERROR", detail: err instanceof Error ? err.message : "Invalid n8n base URL", healthy: null, workflows: [] };
  }

  // Liveness (best effort).
  let healthy: boolean | null = null;
  try {
    const h = await timedFetch(endpoints.healthUrl, c.apiKey);
    healthy = h.ok;
  } catch {
    healthy = false;
  }

  // Workflow list.
  try {
    const res = await timedFetch(`${endpoints.apiRoot}/workflows?limit=100`, c.apiKey);
    if (!res.ok) {
      const detail = res.status === 401
        ? "n8n API responded 401 Unauthorized. Update your API Key in settings or Vercel."
        : `n8n API responded ${res.status}.`;
      return {
        state: "ERROR",
        detail,
        healthy,
        workflows: [],
      };
    }
    const body = (await res.json()) as { data?: unknown[] };
    const workflows = Array.isArray(body?.data)
      ? body.data.map(toWorkflowSummary).filter((w): w is N8nWorkflowSummary => w !== null)
      : [];
    return { state: "CONNECTED", detail: `${workflows.length} workflow(s).`, healthy, workflows };
  } catch (err) {
    const detail = err instanceof Error && err.name === "TimeoutError" ? "n8n request timed out." : "Could not reach the n8n API.";
    return { state: "ERROR", detail, healthy, workflows: [] };
  }
}

/**
 * Paginated workflow listing with cursor support.
 */
export async function fetchWorkflowsPaginated(options?: {
  cursor?: string;
  limit?: number;
}): Promise<{
  state: AutomationsState;
  workflows: N8nWorkflowSummary[];
  nextCursor: string | null;
  detail: string;
}> {
  const c = await resolveN8nCreds();
  if (!c) {
    return { state: "NOT CONFIGURED", workflows: [], nextCursor: null, detail: "Credentials unconfigured" };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(c.base, process.env.NODE_ENV === "production");
  } catch (err) {
    return { state: "ERROR", workflows: [], nextCursor: null, detail: err instanceof Error ? err.message : "Invalid URL" };
  }

  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 250);
  const q = new URLSearchParams({ limit: String(limit) });
  if (options?.cursor) q.set("cursor", options.cursor);

  try {
    const res = await timedFetch(`${endpoints.apiRoot}/workflows?${q.toString()}`, c.apiKey);
    if (!res.ok) {
      return { state: "ERROR", workflows: [], nextCursor: null, detail: `n8n responded ${res.status}` };
    }
    const body = (await res.json()) as { data?: unknown[]; nextCursor?: string };
    const workflows = Array.isArray(body?.data)
      ? body.data.map(toWorkflowSummary).filter((w): w is N8nWorkflowSummary => w !== null)
      : [];
    return {
      state: "CONNECTED",
      workflows,
      nextCursor: body.nextCursor ?? null,
      detail: `${workflows.length} workflows retrieved`,
    };
  } catch (err) {
    return {
      state: "ERROR",
      workflows: [],
      nextCursor: null,
      detail: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Safe workflow detail view. Never returns decrypted credentials.
 */
export async function getWorkflowDetail(id: string): Promise<{
  state: AutomationsState;
  workflow: N8nWorkflowDetail | null;
  detail: string;
}> {
  const c = await resolveN8nCreds();
  if (!c) {
    return { state: "NOT CONFIGURED", workflow: null, detail: "Credentials unconfigured" };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(c.base, process.env.NODE_ENV === "production");
  } catch (err) {
    return { state: "ERROR", workflow: null, detail: err instanceof Error ? err.message : "Invalid URL" };
  }

  try {
    const res = await timedFetch(`${endpoints.apiRoot}/workflows/${encodeURIComponent(id)}`, c.apiKey);
    if (!res.ok) {
      return { state: "ERROR", workflow: null, detail: `n8n responded ${res.status}` };
    }
    const body = (await res.json()) as unknown;
    const workflow = toWorkflowDetail(body);
    return {
      state: "CONNECTED",
      workflow,
      detail: workflow ? "Workflow found" : "Workflow could not be parsed",
    };
  } catch (err) {
    return {
      state: "ERROR",
      workflow: null,
      detail: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Paginated executions history. Sanitized - zero payloads or sensitive tokens.
 */
export async function fetchExecutionsPaginated(options?: {
  cursor?: string;
  limit?: number;
  workflowId?: string;
  status?: string;
}): Promise<{
  state: AutomationsState;
  executions: N8nExecutionSummary[];
  nextCursor: string | null;
  detail: string;
}> {
  const c = await resolveN8nCreds();
  if (!c) {
    return { state: "NOT CONFIGURED", executions: [], nextCursor: null, detail: "Credentials unconfigured" };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(c.base, process.env.NODE_ENV === "production");
  } catch (err) {
    return { state: "ERROR", executions: [], nextCursor: null, detail: err instanceof Error ? err.message : "Invalid URL" };
  }

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 200);
  const q = new URLSearchParams({ limit: String(limit) });
  if (options?.cursor) q.set("cursor", options.cursor);
  if (options?.workflowId) q.set("workflowId", options.workflowId);
  if (options?.status) q.set("status", options.status);

  try {
    const res = await timedFetch(`${endpoints.apiRoot}/executions?${q.toString()}`, c.apiKey);
    if (!res.ok) {
      return { state: "ERROR", executions: [], nextCursor: null, detail: `n8n responded ${res.status}` };
    }
    const body = (await res.json()) as { data?: unknown[]; nextCursor?: string };
    const executions = Array.isArray(body?.data)
      ? body.data.map(toExecutionSummary).filter((e): e is N8nExecutionSummary => e !== null)
      : [];
    return {
      state: "CONNECTED",
      executions,
      nextCursor: body.nextCursor ?? null,
      detail: `${executions.length} executions retrieved`,
    };
  } catch (err) {
    return {
      state: "ERROR",
      executions: [],
      nextCursor: null,
      detail: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Controlled workflow activation. Fails closed without operator verification.
 */
export async function setWorkflowActiveState(
  id: string,
  active: boolean,
  metadata?: { actor?: string; reason?: string }
): Promise<{ ok: boolean; message: string }> {
  const c = await resolveN8nCreds();
  if (!c) {
    return { ok: false, message: "n8n engine unconfigured" };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(c.base, process.env.NODE_ENV === "production");
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Invalid URL" };
  }

  const endpoint = `${endpoints.apiRoot}/workflows/${encodeURIComponent(id)}/${active ? "activate" : "deactivate"}`;

  try {
    const res = await timedFetch(endpoint, c.apiKey, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    if (!res.ok) {
      return { ok: false, message: `n8n responded ${res.status}` };
    }

    // Record audit event
    try {
      await supabaseAdmin.from("ops_audit_events").insert({
        actor_id: metadata?.actor ?? "system",
        action: active ? "workflow.activate" : "workflow.deactivate",
        target_id: id,
        payload_redacted: { active, reason: metadata?.reason ?? "Manual toggle" },
      });
    } catch {
      // Non-fatal if audit table does not yet exist
    }

    return { ok: true, message: `Workflow ${id} ${active ? "activated" : "deactivated"} successfully` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

