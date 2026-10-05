import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { isAgentSecretValid } from "@/lib/auth/agent-secret";
import { GOLDEN_EVAL_CASES, scoreGoldenReply } from "@/lib/agent-eval/golden";

/**
 * Offline golden-set evaluation against live /api/ai (or local fallback path).
 * POST (evaluates this deployment; no caller-supplied target)
 * Requires AGENT_METRICS_SECRET (automation) or an admin session.
 */
export async function POST(request: Request) {
  // Automation callers present AGENT_METRICS_SECRET; people need an admin session.
  if (!(await isAgentSecretValid(request))) {
    const auth = await requireAdminApi(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
  }

  // Evaluate this deployment only. A caller-supplied baseUrl would let the
  // server be pointed at arbitrary hosts (SSRF), so it is not accepted.
  const targetBase = new URL(request.url).origin;

  const results: Array<{
    id: string;
    category: string;
    pass: boolean;
    latency_ms: number;
    missing: string[];
    forbidden_hit: string[];
    run_id?: string;
  }> = [];

  for (const testCase of GOLDEN_EVAL_CASES) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${targetBase}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testCase.prompt }),
        signal: AbortSignal.timeout(35000),
      });
      const data = await res.json();
      const reply = String(data.reply || data.generated_text || "");
      const scored = scoreGoldenReply(testCase, reply);
      results.push({
        id: testCase.id,
        category: testCase.category,
        pass: scored.pass,
        latency_ms: Date.now() - t0,
        missing: scored.missing,
        forbidden_hit: scored.forbidden_hit,
        run_id: data.run_id,
      });
    } catch {
      results.push({
        id: testCase.id,
        category: testCase.category,
        pass: false,
        latency_ms: Date.now() - t0,
        missing: testCase.must_include || [],
        forbidden_hit: [],
      });
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const pass_rate = results.length ? passed / results.length : 0;

  return NextResponse.json({
    success: true,
    pass_rate,
    passed,
    total: results.length,
    gate_ok: pass_rate >= 0.85,
    results,
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
