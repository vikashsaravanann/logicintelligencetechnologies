import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getWorkflowByCode } from "@/lib/automations/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { workflowCode, targetState, reason } = body;

    if (!workflowCode || typeof targetState !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Missing required fields: workflowCode and boolean targetState" },
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

    const currentStatus = workflow.status;
    const targetStatus = targetState ? "ACTIVE" : "PAUSED";
    const isHighRisk = workflow.risk_class === "R3" || workflow.risk_class === "R4";
    const requiresApproval = workflow.live_approval_required || (isHighRisk && targetState);

    return NextResponse.json({
      success: true,
      preview: {
        workflowCode: workflow.workflow_code,
        title: workflow.title,
        site: workflow.site,
        currentStatus,
        targetStatus,
        riskClass: workflow.risk_class,
        runtimeEngine: workflow.runtime_engine,
        liveApprovalRequired: workflow.live_approval_required,
        requiresApproval,
        reasonProvided: Boolean(reason && reason.trim().length >= 8),
        impactAssessment: targetState
          ? `Workflow will start listening to events on ${workflow.event_type || "configured webhooks"} with risk level ${workflow.risk_class}.`
          : `Workflow execution will be suspended. No incoming triggers will dispatch runs.`,
        dualControlNotes: requiresApproval
          ? "High risk or mutating workflow requires explicit approval before activation."
          : "Direct activation permitted for low-risk staged automation.",
      },
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/activation/preview] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
