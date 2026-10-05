import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { isAgentSecretValid } from "@/lib/auth/agent-secret";
import { aggregateAgentRuns } from "@/lib/agent-eval/aggregate";

/**
 * Aggregate online agent metrics.
 * Requires AGENT_METRICS_SECRET (automation) or an admin session.
 */
export async function GET(request: Request) {
  // Automation callers present AGENT_METRICS_SECRET; people need an admin session.
  if (!(await isAgentSecretValid(request))) {
    const auth = await requireAdminApi(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
  }

  const { searchParams } = new URL(request.url);
  const hours = Math.min(168, Math.max(1, Number(searchParams.get("hours") || 24)));

  const agg = await aggregateAgentRuns(hours);
  if (!agg) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to aggregate (missing Supabase service role or table)",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, metrics: agg });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
