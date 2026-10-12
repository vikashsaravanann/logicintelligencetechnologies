import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);

    let query = supabaseAdmin
      .from("ops_audit_events")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (site && site !== "ALL") {
      query = query.ilike("site", site);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[api/admin/automation/v2/events] Database query warning:", error.message);
    }

    const events = (data || []).map((e) => ({
      ...e,
      occurred_at_ist: formatIST(e.occurred_at),
    }));

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/events] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
