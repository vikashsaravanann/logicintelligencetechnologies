import "server-only";
import { buildRenderRequest, looksLikePdf, type RenderRequest } from "./renderer-core";
import { assertPdf } from "@/lib/documents/integrity";

export type RenderState = "RENDERED" | "NOT CONFIGURED" | "ERROR";

export interface RenderOutcome {
  state: RenderState;
  bytes?: Uint8Array;
  detail?: string;
}

function config(): { url: string; auth: string } | null {
  const url = process.env.PDF_RENDERER_URL;
  const user = process.env.PDF_RENDERER_USERNAME;
  const pass = process.env.PDF_RENDERER_PASSWORD;
  if (!url || !user || !pass) return null;
  return { url: url.replace(/\/+$/, ""), auth: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64") };
}

/**
 * Render a document by filling an approved master via the PDF service. Returns
 * NOT CONFIGURED when the service env is unset (truthful, never a fake PDF).
 * The service is authenticated with basic auth over https and the response is
 * validated as a real PDF before it is used.
 *
 * `fetchImpl` is injectable for tests; production uses global fetch.
 */
export async function renderDocument(
  docKey: string,
  data: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<RenderOutcome> {
  const cfg = config();
  if (!cfg) return { state: "NOT CONFIGURED", detail: "PDF_RENDERER_URL/USERNAME/PASSWORD not set" };

  let body: RenderRequest;
  try {
    body = buildRenderRequest(docKey, data);
  } catch (err) {
    return { state: "ERROR", detail: err instanceof Error ? err.message : "bad request" };
  }

  try {
    const res = await fetchImpl(`${cfg.url}/render`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: cfg.auth },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return { state: "ERROR", detail: `PDF service responded ${res.status}` };
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!looksLikePdf(bytes)) return { state: "ERROR", detail: "PDF service did not return a PDF" };
    assertPdf(bytes);
    return { state: "RENDERED", bytes };
  } catch (err) {
    const detail = err instanceof Error && err.name === "TimeoutError" ? "PDF service timed out" : "Could not reach the PDF service";
    return { state: "ERROR", detail };
  }
}

/** Liveness probe for /admin/status. */
export async function pdfServiceHealthy(fetchImpl: typeof fetch = fetch): Promise<"PASS" | "FAIL" | "NOT CONFIGURED"> {
  const cfg = config();
  if (!cfg) return "NOT CONFIGURED";
  try {
    const res = await fetchImpl(`${cfg.url}/health`, {
      headers: { authorization: cfg.auth },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok ? "PASS" : "FAIL";
  } catch {
    return "FAIL";
  }
}
