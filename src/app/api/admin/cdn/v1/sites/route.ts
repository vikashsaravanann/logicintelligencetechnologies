import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { CANONICAL_CDN_SITES } from "@/lib/cdn/edge-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const sites = Object.values(CANONICAL_CDN_SITES).map((s) => ({
      ...s,
      edgeNetwork: "Vercel Edge Network",
      policy: "Targeted Invalidation Only (Section 11 Compliant)",
    }));

    return NextResponse.json({
      success: true,
      sites,
      count: sites.length,
    });
  } catch (err) {
    console.error("[api/admin/cdn/v1/sites] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
