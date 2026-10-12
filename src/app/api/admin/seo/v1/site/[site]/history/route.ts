import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getCycleHistory, resolveSiteCodes } from "@/lib/seo/scheduler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { site } = await params;
  if (!site) {
    return NextResponse.json({ success: false, message: "Missing site identifier" }, { status: 400 });
  }

  const resolved = resolveSiteCodes(site);
  if (!resolved) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid site '${site}'. Expected one of: corporate (LIT-CORP), healthcare (LIT-HC), logic_voice (LIT-LV), voice_shield (LIT-VS).`,
      },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);

    const history = await getCycleHistory(resolved.siteCode, limit);

    return NextResponse.json({
      success: true,
      siteCode: resolved.siteCode,
      dbSiteId: resolved.dbSiteId,
      displayTimezone: "Asia/Kolkata",
      persistenceTimezone: "UTC",
      history,
      count: history.length,
    });
  } catch (err) {
    console.error("[api/admin/seo/v1/site/[site]/history] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
