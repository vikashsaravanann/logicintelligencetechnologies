import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getWorkflowByCode } from "@/lib/automations/catalog";
import { getWorkflowDetail } from "@/lib/automations/n8n-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing workflow ID" }, { status: 400 });
  }

  try {
    const workflow = await getWorkflowByCode(id);

    // If not found in catalog, try fetching live from n8n by workflow ID
    if (!workflow) {
      const live = await getWorkflowDetail(id);
      if (live.workflow) {
        return NextResponse.json({
          success: true,
          workflow: {
            workflow_code: live.workflow.id,
            site: "Cross-Site",
            title: live.workflow.name,
            status: live.workflow.active ? "ACTIVE" : "PAUSED",
            baseline_provenance: "n8n live instance",
            risk_class: "R1",
            runtime_engine: "n8n",
            audit_state: "LIVE_INSPECTED",
            live_approval_required: false,
            n8n_id: live.workflow.id,
            liveDetail: live.workflow,
          },
        });
      }

      return NextResponse.json(
        { success: false, message: `Workflow '${id}' not found in registry or engine.` },
        { status: 404 }
      );
    }

    // Attempt enrichment with live n8n workflow if available
    let liveDetail = null;
    if (workflow.n8n_id) {
      const live = await getWorkflowDetail(workflow.n8n_id);
      if (live.workflow) liveDetail = live.workflow;
    }

    return NextResponse.json({
      success: true,
      workflow: {
        ...workflow,
        liveDetail,
      },
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/workflows/[id]] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
