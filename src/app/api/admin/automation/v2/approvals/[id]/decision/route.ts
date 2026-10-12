import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setWorkflowActiveState } from "@/lib/automations/n8n-client";
import { getWorkflowByCode } from "@/lib/automations/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing approval request ID" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { decision, reason } = body;

    if (!decision || (decision !== "APPROVED" && decision !== "REJECTED")) {
      return NextResponse.json(
        { success: false, message: "Decision must be either 'APPROVED' or 'REJECTED'." },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "A substantive operational justification (minimum 8 characters) is required." },
        { status: 400 }
      );
    }

    // Lookup approval request
    const { data: reqData, error: reqErr } = await supabaseAdmin
      .from("automation_approval_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (reqErr || !reqData) {
      return NextResponse.json(
        { success: false, message: `Approval request '${id}' not found.` },
        { status: 404 }
      );
    }

    if (reqData.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: `Request is already closed with status '${reqData.status}'.` },
        { status: 409 }
      );
    }

    // Dual-Control Enforcer: Requester cannot self-approve unless super_admin
    const isSelfApproval =
      auth.userId &&
      reqData.requested_by &&
      auth.userId === reqData.requested_by;

    if (isSelfApproval && auth.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Dual-control violation: Requesters cannot approve their own change requests. Another administrator must review.",
        },
        { status: 403 }
      );
    }

    // Insert approval decision
    const { error: decErr } = await supabaseAdmin
      .from("automation_approval_decisions")
      .insert({
        request_id: id,
        decided_by: auth.userId.startsWith("system") ? null : auth.userId,
        decided_by_email: auth.email || "admin@logicintelligencetechnologies.in",
        decision,
        decision_reason: reason.trim(),
      });

    if (decErr) {
      console.warn("[approvals/decision] Decision record warning:", decErr.message);
    }

    // Update request status
    await supabaseAdmin
      .from("automation_approval_requests")
      .update({ status: decision })
      .eq("id", id);

    // If APPROVED and action_type was ACTIVATE, execute activation
    if (decision === "APPROVED" && reqData.action_type === "ACTIVATE") {
      const wf = await getWorkflowByCode(reqData.workflow_code);
      if (wf && wf.n8n_id) {
        await setWorkflowActiveState(wf.n8n_id, true, {
          actor: auth.email || auth.userId,
          reason: `Approved under request ${id}`,
        });
      }
      await supabaseAdmin
        .from("automation_registry")
        .update({ status: "ACTIVE", updated_at: new Date().toISOString() })
        .eq("workflow_code", reqData.workflow_code);
    }

    // Record audit event
    await supabaseAdmin.from("ops_audit_events").insert({
      actor_id: auth.userId.startsWith("system") ? null : auth.userId,
      actor_email: auth.email || "admin@logicintelligencetechnologies.in",
      site: reqData.site,
      action: `automation.approval.${decision.toLowerCase()}`,
      target_type: "approval_request",
      target_id: id,
      metadata: {
        workflowCode: reqData.workflow_code,
        actionType: reqData.action_type,
        decision,
        decisionReason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      requestId: id,
      decision,
      workflowCode: reqData.workflow_code,
      message: `Approval request was ${decision.toLowerCase()} successfully.`,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/approvals/[id]/decision] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
