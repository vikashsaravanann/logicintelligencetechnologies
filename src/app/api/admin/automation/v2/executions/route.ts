import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchExecutionsPaginated } from "@/lib/automations/n8n-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const workflowCode = searchParams.get("workflowCode");
    const site = searchParams.get("site");
    const status = searchParams.get("status");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const cursor = searchParams.get("cursor");

    // Attempt retrieval from projection table
    try {
      let query = supabaseAdmin
        .from("automation_executions_projection")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (workflowCode) {
        query = query.eq("workflow_code", workflowCode);
      }
      if (site && site !== "ALL") {
        query = query.ilike("site", site);
      }
      if (status && status !== "ALL") {
        query = query.eq("status", status.toLowerCase());
      }
      if (cursor) {
        query = query.lt("started_at", cursor);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const nextCursor = data.length === limit ? data[data.length - 1].started_at : null;
        return NextResponse.json({
          success: true,
          source: "projection",
          executions: data,
          count: data.length,
          nextCursor,
        });
      }
    } catch {
      // Fallback
    }

    // Secondary fallback: fetch from live n8n client
    const live = await fetchExecutionsPaginated({
      limit,
      status: status && status !== "ALL" ? status.toLowerCase() : undefined,
    });

    return NextResponse.json({
      success: true,
      source: "n8n_live",
      executions: live.executions,
      count: live.executions.length,
      nextCursor: live.nextCursor,
      detail: live.detail,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/executions] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
