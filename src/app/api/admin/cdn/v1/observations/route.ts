import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import {
  getRecentObservations,
  probeAllSites,
  probeEdgeHeaders,
  resolveCdnSiteId,
} from "@/lib/cdn/edge-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site") || undefined;
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const shouldProbe = searchParams.get("probe") === "true";

    // If live probe requested, execute probe across requested site or all sites
    if (shouldProbe) {
      if (site && site !== "ALL") {
        const resolved = resolveCdnSiteId(site);
        if (resolved) {
          await probeEdgeHeaders(resolved, "/");
        }
      } else {
        await probeAllSites();
      }
    }

    const observations = await getRecentObservations(site, limit);

    return NextResponse.json({
      success: true,
      probed: shouldProbe,
      observations,
      count: observations.length,
    });
  } catch (err) {
    console.error("[api/admin/cdn/v1/observations] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
