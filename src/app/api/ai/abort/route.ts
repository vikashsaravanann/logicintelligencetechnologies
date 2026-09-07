import { NextResponse } from "next/server";
import { logAgentRun } from "@/lib/agent-eval/logger";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`abort:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const reason = body.reason === "retry" ? "retry" : "timeout";
    await logAgentRun({
      run_id: typeof body.run_id === "string" ? body.run_id : `abort_${Date.now()}`,
      agent_role: "logic-ai",
      success: false,
      steps: 1,
      tool_calls: 0,
      tokens_in: 0,
      tokens_out: 0,
      latency_ms: Number(body.latency_ms) || 0,
      cost_usd: 0,
      failure_class: reason === "retry" ? "unknown" : "timeout",
      used_fallback: true,
      model: typeof body.model === "string" ? body.model : null,
      meta: { abort: true, reason, path: body.path || "/ai" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
