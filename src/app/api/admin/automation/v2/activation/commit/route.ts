import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getWorkflowByCode } from "@/lib/automations/catalog";
import { setWorkflowActiveState } from "@/lib/automations/n8n-client";
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
    const { workflowCode, targetState, reason, approvalRequestId } = body;

    if (!workflowCode || typeof targetState !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Missing required fields: workflowCode and boolean targetState" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "A substantive operational justification (minimum 8 characters) is required." },
        { status: 400 }
      );
    }

    const workflow = await getWorkflowByCode(workflowCode);
    if (!workflow) {
      return NextResponse.json(
        { success: false, message: `Workflow '${workflowCode}' not found.` },
        { status: 404 }
      );
    }

    const isHighRisk = workflow.risk_class === "R3" || workflow.risk_class === "R4";
    const requiresApproval = workflow.live_approval_required || (isHighRisk && targetState);

    // If approval is required, check if an approved request exists
    if (requiresApproval && auth.role !== "super_admin") {
      let isApproved = false;

      if (approvalRequestId) {
        const { data: appReq } = await supabaseAdmin
          .from("automation_approval_requests")
          .select("id, status")
          .eq("id", approvalRequestId)
          .maybeSingle();

        if (appReq && appReq.status === "APPROVED") {
          isApproved = true;
        }
      }

      if (!isApproved) {
        // Create pending approval request
        const { data: newReq, error: reqErr } = await supabaseAdmin
          .from("automation_approval_requests")
          .insert({
            workflow_code: workflow.workflow_code,
            site: workflow.site,
            requested_by: auth.userId.startsWith("system") ? null : auth.userId,
            requested_by_email: auth.email || "admin@logicintelligencetechnologies.in",
            action_type: targetState ? "ACTIVATE" : "PAUSE",
            justification: reason.trim(),
            status: "PENDING",
          })
          .select("id")
          .single();

        return NextResponse.json({
          success: true,
          status: "PENDING_APPROVAL",
          approvalRequestId: newReq?.id || null,
          message: "Approval request created. High-risk activation requires dual-control approval before execution.",
        });
      }
    }

    // Execute state change
    const targetStatus = targetState ? "ACTIVE" : "PAUSED";

    // If n8n ID exists, toggle n8n instance
    if (workflow.n8n_id) {
      await setWorkflowActiveState(workflow.n8n_id, targetState, {
        actor: auth.email || auth.userId,
        reason: reason.trim(),
      });
    }

    // Update in database
    await supabaseAdmin
      .from("automation_registry")
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("workflow_code", workflow.workflow_code);

    // Update schedule active state if present
    await supabaseAdmin
      .from("automation_schedules")
      .update({
        is_active: targetState,
        updated_at: new Date().toISOString(),
      })
      .eq("workflow_code", workflow.workflow_code);

    // Record audit event
    await supabaseAdmin.from("ops_audit_events").insert({
      actor_id: auth.userId.startsWith("system") ? null : auth.userId,
      actor_email: auth.email || "admin@logicintelligencetechnologies.in",
      site: workflow.site,
      action: targetState ? "automation.activate" : "automation.deactivate",
      target_type: "workflow",
      target_id: workflow.workflow_code,
      metadata: {
        previousStatus: workflow.status,
        newStatus: targetStatus,
        reason: reason.trim(),
        approvalRequestId: approvalRequestId || null,
      },
    });

    return NextResponse.json({
      success: true,
      status: "COMMITTED",
      workflowCode: workflow.workflow_code,
      newStatus: targetStatus,
      message: `Workflow '${workflow.workflow_code}' successfully transitioned to ${targetStatus}.`,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/activation/commit] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
