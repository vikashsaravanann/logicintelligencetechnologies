import "server-only";
import { normalizeN8nBase, toWorkflowSummary, type N8nWorkflowSummary } from "./n8n-core";
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

async function timedFetch(url: string, apiKey: string): Promise<Response> {
  return fetch(url, {
    headers: buildN8nHeaders(apiKey),
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
