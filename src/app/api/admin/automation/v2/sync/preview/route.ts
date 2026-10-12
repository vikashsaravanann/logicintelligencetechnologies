import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { loadLocalRegistry, getRegistryWorkflows } from "@/lib/automations/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const local = loadLocalRegistry();
    const existing = await getRegistryWorkflows();
    const existingMap = new Map(existing.map((e) => [e.workflow_code.toUpperCase(), e]));

    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const unaltered: any[] = [];

    for (const item of local) {
      const current = existingMap.get(item.workflow_code.toUpperCase());
      if (!current) {
        toInsert.push(item);
      } else {
        const hasDiff =
          current.status !== item.status ||
          current.title !== item.title ||
          current.risk_class !== item.risk_class ||
          current.runtime_engine !== item.runtime_engine ||
          current.live_approval_required !== item.live_approval_required;

        if (hasDiff) {
          toUpdate.push({
            workflow_code: item.workflow_code,
            current: {
              status: current.status,
              risk: current.risk_class,
              title: current.title,
            },
            incoming: {
              status: item.status,
              risk: item.risk_class,
              title: item.title,
            },
          });
        } else {
          unaltered.push(item.workflow_code);
        }
      }
    }

    return NextResponse.json({
      success: true,
      preview: {
        totalCanonical: local.length,
        toInsertCount: toInsert.length,
        toUpdateCount: toUpdate.length,
        unalteredCount: unaltered.length,
        toInsert,
        toUpdate,
        requiresDualControlApproval: false,
        summary: `Sync preview: ${toInsert.length} new workflows, ${toUpdate.length} updates, ${unaltered.length} unchanged.`,
      },
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/sync/preview] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
