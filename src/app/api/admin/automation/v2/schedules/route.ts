import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getSchedulesList } from "@/lib/automations/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const schedules = await getSchedulesList();
    return NextResponse.json({
      success: true,
      timezone: "Asia/Kolkata",
      persistenceTimezone: "UTC",
      schedules,
      count: schedules.length,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/schedules] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
