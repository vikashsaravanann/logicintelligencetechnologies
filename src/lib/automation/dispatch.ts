import "server-only";
import { normalizeN8nBase } from "@/lib/automations/n8n-core";
import { signV1 } from "./webhook-signing";
import { workflowForEvent } from "@/config/automation";

export type DispatchState = "dispatched" | "not_configured" | "no_workflow" | "error";

export interface DispatchResult {
  state: DispatchState;
  detail?: string;
}

/**
 * Send a signed automation event to its n8n workflow webhook. A 2xx means the
 * event was accepted for processing ("dispatched") — NOT that the workflow
 * succeeded; completion comes back later via the signed callback. Fails closed
 * (not_configured) when the base URL or shared secret is unset. Never throws.
 */
export async function dispatchAutomationEvent(
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<DispatchResult> {
  const base = process.env.N8N_BASE_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!base || !secret) return { state: "not_configured", detail: "N8N_BASE_URL or N8N_WEBHOOK_SECRET unset" };

  const wf = workflowForEvent(eventType);
  if (!wf) return { state: "no_workflow", detail: `no workflow for ${eventType}` };

  let origin: string;
  try {
    origin = normalizeN8nBase(base, process.env.NODE_ENV === "production").origin;
  } catch (err) {
    return { state: "error", detail: err instanceof Error ? err.message : "bad base url" };
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify({ eventId, eventType, payload });
  const signature = signV1(secret, timestamp, eventId, rawBody);

  try {
    const res = await fetchImpl(`${origin}${wf.webhookPath}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lit-timestamp": timestamp,
        "x-lit-event-id": eventId,
        "x-lit-signature": signature,
      },
      body: rawBody,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 200 && res.status < 300) return { state: "dispatched" };
    return { state: "error", detail: `n8n responded ${res.status}` };
  } catch (err) {
    const detail = err instanceof Error && err.name === "TimeoutError" ? "dispatch timed out" : "could not reach n8n";
    return { state: "error", detail };
  }
}
