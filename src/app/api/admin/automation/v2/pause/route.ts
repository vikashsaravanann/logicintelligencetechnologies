import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { workflowCode, site, reason, resume } = body;

    if (!workflowCode && !site) {
      return NextResponse.json(
        { success: false, message: "Either workflowCode or site must be specified." },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "A substantive operational justification (minimum 8 characters) is required." },
        { status: 400 }
      );
    }

    const targetStatus = resume ? "ACTIVE" : "PAUSED";
    let updatedCount = 0;

    let query = supabaseAdmin.from("automation_registry").update({
      status: targetStatus,
      updated_at: new Date().toISOString(),
    });

    if (workflowCode) {
      query = query.eq("workflow_code", workflowCode);
    } else if (site && site !== "ALL") {
      query = query.ilike("site", site);
    }

    const { error, count } = await query.select("workflow_code");
    if (!error) {
      updatedCount = count || (workflowCode ? 1 : 0);
    }

    // Record audit event
    await supabaseAdmin.from("ops_audit_events").insert({
      actor_id: auth.userId.startsWith("system") ? null : auth.userId,
      actor_email: auth.email || "admin@logicintelligencetechnologies.in",
      site: site || "Cross-Site",
      action: resume ? "automation.bulk.resume" : "automation.emergency.pause",
      target_type: workflowCode ? "workflow" : "site",
      target_id: workflowCode || site || "ALL",
      metadata: {
        workflowCode,
        site,
        targetStatus,
        reason: reason.trim(),
        affectedCount: updatedCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${resume ? "resumed" : "paused"} automation target(s).`,
      targetStatus,
      target: workflowCode || site,
      affectedCount: updatedCount,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/pause] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
