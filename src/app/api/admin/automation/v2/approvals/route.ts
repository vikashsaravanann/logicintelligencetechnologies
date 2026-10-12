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
    const status = searchParams.get("status");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    let query = supabaseAdmin
      .from("automation_approval_requests")
      .select("*, decisions:automation_approval_decisions(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status && status !== "ALL") {
      query = query.eq("status", status.toUpperCase());
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[api/admin/automation/v2/approvals] Query warning:", error.message);
    }

    const requests = (data || []).map((r) => ({
      ...r,
      created_at_ist: formatIST(r.created_at),
    }));

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/approvals] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
