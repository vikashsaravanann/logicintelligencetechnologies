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
    const { executionId, workflowCode, reason } = body;

    if (!executionId) {
      return NextResponse.json(
        { success: false, message: "Missing required executionId" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "A substantive operational justification (minimum 8 characters) is required for execution retry." },
        { status: 400 }
      );
    }

    // Lookup original execution
    const { data: orig } = await supabaseAdmin
      .from("automation_executions_projection")
      .select("*")
      .or(`id.eq.${executionId},execution_id.eq.${executionId}`)
      .maybeSingle();

    const wfCode = workflowCode || orig?.workflow_code || "UNKNOWN";
    const site = orig?.site || "Cross-Site";

    // Insert new projected retry execution
    const retryId = `retry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await supabaseAdmin.from("automation_executions_projection").insert({
      workflow_code: wfCode,
      site,
      execution_id: retryId,
      status: "running",
      started_at: new Date().toISOString(),
      sanitized_receipt: {
        originalExecutionId: executionId,
        retryTriggeredBy: auth.email || auth.userId,
        reason: reason.trim(),
      },
    });

    // Record audit event
    await supabaseAdmin.from("ops_audit_events").insert({
      actor_id: auth.userId.startsWith("system") ? null : auth.userId,
      actor_email: auth.email || "admin@logicintelligencetechnologies.in",
      site,
      action: "automation.execution.retry",
      target_type: "execution",
      target_id: executionId,
      metadata: {
        workflowCode: wfCode,
        retryExecutionId: retryId,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Execution retry dispatched for ${wfCode}.`,
      originalExecutionId: executionId,
      retryExecutionId: retryId,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/retry] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
