import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { loadLocalRegistry } from "@/lib/automations/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  // Dual-control / role check: only super_admin or admin can execute sync commit
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden: Super Admin or Admin role required for sync commit" },
      { status: 403 }
    );
  }

  try {
    const local = loadLocalRegistry();
    let upsertCount = 0;

    for (const item of local) {
      const { error } = await supabaseAdmin.from("automation_registry").upsert(
        {
          workflow_code: item.workflow_code,
          site: item.site,
          title: item.title,
          status: item.status,
          baseline_provenance: item.baseline_provenance,
          risk_class: item.risk_class,
          runtime_engine: item.runtime_engine,
          audit_state: item.audit_state,
          live_approval_required: item.live_approval_required,
          event_type: item.event_type,
          webhook_path: item.webhook_path,
          schedule_cron: item.schedule_cron,
          data_class: item.data_class,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workflow_code" }
      );

      if (!error) {
        upsertCount++;
      }
    }

    // Record audit event
    try {
      await supabaseAdmin.from("ops_audit_events").insert({
        actor_id: auth.userId.startsWith("system") ? null : auth.userId,
        actor_email: auth.email || "admin@logicintelligencetechnologies.in",
        site: "Cross-Site",
        action: "automation.sync.commit",
        target_type: "registry",
        target_id: "canonical_workflow_registry",
        metadata: {
          syncedCount: upsertCount,
          totalLocal: local.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${upsertCount} workflows into automation_registry.`,
      syncedCount: upsertCount,
      totalLocal: local.length,
    });
  } catch (err) {
    console.error("[api/admin/automation/v2/sync/commit] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
