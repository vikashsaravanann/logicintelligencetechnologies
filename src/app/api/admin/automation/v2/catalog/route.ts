import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getWorkflowCatalog } from "@/lib/automations/catalog";

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
    const risk = searchParams.get("risk") || undefined;
    const search = searchParams.get("search") || undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const catalog = await getWorkflowCatalog({ site, risk, search, cursor, limit });
    return NextResponse.json({ success: true, ...catalog });
  } catch (err) {
    console.error("[api/admin/automation/v2/catalog] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
