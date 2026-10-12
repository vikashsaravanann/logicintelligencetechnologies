import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { executeCycle } from "@/lib/seo/scheduler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { forced, site, reason } = body;

    const result = await executeCycle({
      site: typeof site === "string" ? site : undefined,
      forced: Boolean(forced),
      reason: typeof reason === "string" ? reason : undefined,
      actorEmail: auth.email || "admin@logicintelligencetechnologies.in",
    });

    return NextResponse.json({
      success: true,
      cycle: result,
    });
  } catch (err) {
    console.error("[api/admin/seo/v1/cycle/request] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
