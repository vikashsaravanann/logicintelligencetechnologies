/**
 * GET /api/health
 *
 * Health check for load-balancer probes and uptime monitors. It performs a
 * real database round-trip and returns HTTP 503 only when that live DB check
 * fails — a degraded-but-serving configuration (e.g. rate limiter not set) is
 * reported in the body without flipping the probe to unhealthy. Config notes
 * are omitted here (they can describe security gaps); admins see them on
 * /admin/status.
 */
import { NextResponse } from "next/server";
import { runConfigChecks } from "@/lib/status/config-checks";
import { checkDatabase } from "@/lib/status/live-checks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [{ overall, checks }, db] = await Promise.all([
    Promise.resolve(runConfigChecks()),
    checkDatabase(),
  ]);
  const publicChecks = Object.fromEntries(
    Object.entries(checks).map(([name, check]) => [name, { status: check.status }]),
  );

  // 503 only when the live database check fails. A reachable DB means the app
  // can serve, even if some optional configuration is degraded.
  const dbHealthy = db.state !== "FAIL";

  return NextResponse.json(
    {
      status: dbHealthy ? overall : "unhealthy",
      database: db.state,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV ?? "local",
      checks: publicChecks,
    },
    { status: dbHealthy ? 200 : 503 },
  );
}
