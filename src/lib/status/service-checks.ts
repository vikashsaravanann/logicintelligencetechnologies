/**
 * Live reachability checks for the company's public services.
 *
 * Each check is a single server-side request with a timeout. Results describe
 * only what that request observed: no uptime history is kept, so none is
 * claimed. A service is OPERATIONAL only after a successful response, never
 * by default.
 */

export type ServiceState = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  url: string;
  /** "health": JSON body with a `status` field; "page": any successful page load. */
  kind: "health" | "page";
}

export interface ServiceCheckResult {
  id: string;
  name: string;
  description: string;
  state: ServiceState;
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string;
  detail: string;
}

export const PUBLIC_SERVICES: readonly ServiceDefinition[] = [
  {
    id: "corporate",
    name: "Corporate website",
    description: "www.logicintelligencetechnologies.in",
    url: "https://www.logicintelligencetechnologies.in/api/health",
    kind: "health",
  },
  {
    id: "healthcare-web",
    name: "LIT Healthcare platform",
    description: "healthcare.logicintelligencetechnologies.in",
    url: "https://healthcare.logicintelligencetechnologies.in/",
    kind: "page",
  },
  {
    id: "logic-voice-web",
    name: "Logic Voice web app",
    description: "logicvoice.logicintelligencetechnologies.in",
    url: "https://logicvoice.logicintelligencetechnologies.in/",
    kind: "page",
  },
];

/** Responses slower than this are reported as DEGRADED. */
export const SLOW_RESPONSE_MS = 3000;
const HEALTHY_BODY_STATUSES = new Set(["ok", "healthy", "operational"]);

export function classifyResponse(
  kind: ServiceDefinition["kind"],
  httpStatus: number,
  latencyMs: number,
  bodyStatus: string | null,
): { state: ServiceState; detail: string } {
  if (httpStatus >= 500) {
    return httpStatus === 503
      ? { state: "DEGRADED", detail: "Service reports degraded health (HTTP 503)" }
      : { state: "OUTAGE", detail: `Server error (HTTP ${httpStatus})` };
  }
  if (httpStatus >= 400) {
    return { state: "DEGRADED", detail: `Unexpected response (HTTP ${httpStatus})` };
  }
  if (kind === "health" && (bodyStatus === null || !HEALTHY_BODY_STATUSES.has(bodyStatus))) {
    return { state: "DEGRADED", detail: `Health endpoint reported "${bodyStatus ?? "no status"}"` };
  }
  if (latencyMs > SLOW_RESPONSE_MS) {
    return { state: "DEGRADED", detail: `Slow response (${latencyMs} ms)` };
  }
  return { state: "OPERATIONAL", detail: "Responding normally" };
}

export async function checkService(
  def: ServiceDefinition,
  timeoutMs = 5000,
): Promise<ServiceCheckResult> {
  const base = { id: def.id, name: def.name, description: def.description };
  const started = Date.now();
  try {
    const res = await fetch(def.url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "user-agent": "LIT-StatusCheck/1.0" },
    });
    const latencyMs = Date.now() - started;
    let bodyStatus: string | null = null;
    if (def.kind === "health") {
      try {
        const body = (await res.json()) as { status?: unknown };
        bodyStatus = typeof body.status === "string" ? body.status.toLowerCase() : null;
      } catch {
        bodyStatus = null;
      }
    }
    const { state, detail } = classifyResponse(def.kind, res.status, latencyMs, bodyStatus);
    return { ...base, state, detail, httpStatus: res.status, latencyMs, checkedAt: new Date().toISOString() };
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ...base,
      state: "OUTAGE",
      detail: timedOut ? `No response within ${timeoutMs / 1000} s` : "Could not connect",
      httpStatus: null,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
    };
  }
}

export function checkAllServices(
  services: readonly ServiceDefinition[] = PUBLIC_SERVICES,
): Promise<ServiceCheckResult[]> {
  return Promise.all(services.map((s) => checkService(s)));
}

export function overallState(results: readonly ServiceCheckResult[]): {
  state: ServiceState;
  label: string;
} {
  if (results.length === 0) return { state: "UNKNOWN", label: "Status unknown" };
  const outages = results.filter((r) => r.state === "OUTAGE").length;
  if (outages === results.length) return { state: "OUTAGE", label: "Major outage" };
  if (outages > 0) return { state: "OUTAGE", label: "Partial outage" };
  if (results.some((r) => r.state === "DEGRADED")) return { state: "DEGRADED", label: "Degraded performance" };
  if (results.every((r) => r.state === "OPERATIONAL")) {
    return { state: "OPERATIONAL", label: "All checked services operational" };
  }
  return { state: "UNKNOWN", label: "Status unknown" };
}
