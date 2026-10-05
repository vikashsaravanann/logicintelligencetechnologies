/**
 * GET /api/health
 *
 * Lightweight health check for load-balancer probes and uptime monitors.
 * Returns the overall status and a status per component. Explanatory notes
 * are omitted here because they can describe security gaps; admins see them
 * on /admin/status.
 *
 * Responds with HTTP 200 when healthy, HTTP 503 when degraded.
 */
import { NextResponse } from "next/server";
import { runConfigChecks } from "@/lib/status/config-checks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { overall, healthy, checks } = runConfigChecks();
  const publicChecks = Object.fromEntries(
    Object.entries(checks).map(([name, check]) => [name, { status: check.status }]),
  );

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV ?? "local",
      checks: publicChecks,
    },
    { status: healthy ? 200 : 503 }
  );
}
