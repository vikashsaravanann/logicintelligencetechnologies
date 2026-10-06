import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { normalizeN8nBase } from "@/lib/automations/n8n-core";
import { WORKFLOWS } from "@/config/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 8000;

type WorkflowAction = "created" | "exists" | "error";
interface WorkflowResult {
  name: string;
  action: WorkflowAction;
}

interface N8nWorkflowItem {
  id?: string | number;
  name?: string;
}

async function n8nFetch(url: string, apiKey: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "X-N8N-API-KEY": apiKey,
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

export async function POST(req: Request) {
  const auth = await requireCapabilityApi(req, "automations.sync");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status, headers: { "cache-control": "no-store" } });
  }
  const { session } = auth;
  if (session.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden: super admin only" },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  const actor = { userId: session.userId, email: session.email, role: session.role };

  const base = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!base || !apiKey) {
    return NextResponse.json(
      { state: "not_configured", detail: "N8N_BASE_URL and N8N_API_KEY are not both set." },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  let apiRoot: string;
  try {
    apiRoot = normalizeN8nBase(base, process.env.NODE_ENV === "production").apiRoot;
  } catch (err) {
    await recordAdminAction({
      actor,
      action: "automation.import",
      capability: "automations.sync",
      outcome: "failed",
      errorCode: "invalid_base_url",
      request: req,
    });
    return NextResponse.json(
      { state: "error", detail: err instanceof Error ? err.message : "Invalid n8n base URL." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  // Fetch the existing workflow list once so we can create-if-missing by name.
  let existingNames: Set<string>;
  try {
    const res = await n8nFetch(`${apiRoot}/workflows?limit=200`, apiKey);
    if (!res.ok) {
      await recordAdminAction({
        actor,
        action: "automation.import",
        capability: "automations.sync",
        outcome: "failed",
        errorCode: `list_${res.status}`,
        request: req,
      });
      return NextResponse.json(
        { state: "error", detail: `n8n API responded ${res.status} when listing workflows.` },
        { status: 502, headers: { "cache-control": "no-store" } },
      );
    }
    const body = (await res.json()) as { data?: N8nWorkflowItem[] };
    existingNames = new Set(
      Array.isArray(body?.data)
        ? body.data.map((w) => (typeof w?.name === "string" ? w.name : "")).filter(Boolean)
        : [],
    );
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    await recordAdminAction({
      actor,
      action: "automation.import",
      capability: "automations.sync",
      outcome: "failed",
      errorCode: timedOut ? "list_timeout" : "list_unreachable",
      request: req,
    });
    return NextResponse.json(
      { state: "error", detail: timedOut ? "n8n request timed out." : "Could not reach the n8n API." },
      { status: 504, headers: { "cache-control": "no-store" } },
    );
  }

  const results: WorkflowResult[] = [];
  for (const wf of WORKFLOWS) {
    try {
      if (existingNames.has(wf.name)) {
        results.push({ name: wf.name, action: "exists" });
        continue;
      }
      const filePath = path.join(process.cwd(), "src/lib/automation/n8n", wf.file);
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as {
        name?: string;
        nodes?: unknown;
        connections?: unknown;
        settings?: unknown;
      };
      // Never send `active` and never call the activate endpoint.
      const payload = {
        name: wf.name,
        nodes: parsed.nodes ?? [],
        connections: parsed.connections ?? {},
        settings: parsed.settings ?? {},
      };
      const res = await n8nFetch(`${apiRoot}/workflows`, apiKey, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.push({ name: wf.name, action: res.ok ? "created" : "error" });
    } catch {
      results.push({ name: wf.name, action: "error" });
    }
  }

  const hadError = results.some((r) => r.action === "error");
  await recordAdminAction({
    actor,
    action: "automation.import",
    capability: "automations.sync",
    outcome: hadError ? "failed" : "succeeded",
    metadata: { results },
    request: req,
  });

  return NextResponse.json(
    { state: "ok", results },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
