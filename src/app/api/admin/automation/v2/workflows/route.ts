import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getRegistryWorkflows } from "@/lib/automations/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
    const status = searchParams.get("status");
    const risk = searchParams.get("risk");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const cursor = searchParams.get("cursor");

    // Try Supabase first
    try {
      let query = supabaseAdmin
        .from("automation_registry")
        .select("*", { count: "exact" })
        .order("workflow_code", { ascending: true })
        .limit(limit);

      if (site && site !== "ALL") {
        query = query.ilike("site", site);
      }
      if (status && status !== "ALL") {
        query = query.eq("status", status.toUpperCase());
      }
      if (risk && risk !== "ALL") {
        query = query.eq("risk_class", risk.toUpperCase());
      }
      if (cursor) {
        query = query.gt("workflow_code", cursor);
      }

      const { data, count, error } = await query;
      if (!error && data) {
        const nextCursor = data.length === limit ? data[data.length - 1].workflow_code : null;
        return NextResponse.json({
          success: true,
          workflows: data,
          total: count ?? data.length,
          count: data.length,
          nextCursor,
        });
      }
    } catch {
      // Fall through to fallback
    }

    // In-memory / CSV fallback
    const all = await getRegistryWorkflows();
    let filtered = [...all];
    if (site && site !== "ALL") {
      filtered = filtered.filter((w) => w.site.toLowerCase() === site.toLowerCase());
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((w) => w.status.toUpperCase() === status.toUpperCase());
    }
    if (risk && risk !== "ALL") {
      filtered = filtered.filter((w) => w.risk_class.toUpperCase() === risk.toUpperCase());
    }

    const offset = cursor ? parseInt(Buffer.from(cursor, "base64").toString("utf8"), 10) || 0 : 0;
    const paged = filtered.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const nextCursor = nextOffset < filtered.length ? Buffer.from(String(nextOffset)).toString("base64") : null;

    return NextResponse.json({
      success: true,
      workflows: paged,
      total: filtered.length,
      count: paged.length,
      nextCursor,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/workflows] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
