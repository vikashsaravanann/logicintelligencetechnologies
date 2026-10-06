import "server-only";
import { normalizeN8nBase, toWorkflowSummary, type N8nWorkflowSummary } from "./n8n-core";

export type AutomationsState = "CONNECTED" | "ERROR" | "NOT CONFIGURED";

export interface AutomationsSnapshot {
  state: AutomationsState;
  /** Human-safe detail. Never contains secrets or execution payloads. */
  detail: string;
  healthy: boolean | null;
  workflows: N8nWorkflowSummary[];
}

const TIMEOUT_MS = 8000;

function creds(): { base: string; apiKey: string } | null {
  const base = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!base || !apiKey) return null;
  return { base, apiKey };
}

async function timedFetch(url: string, apiKey: string): Promise<Response> {
  return fetch(url, {
    headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" },
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
  const c = creds();
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
      return {
        state: "ERROR",
        detail: `n8n API responded ${res.status}.`,
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
