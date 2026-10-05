import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { LEAD_LIFECYCLE_STAGES } from "@/lib/outreach/types";
import { recordLeadActivity } from "@/lib/outreach/activity";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  if (!isSupabaseLive()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const stage = String(body.lifecycle_stage || "").toUpperCase();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!LEAD_LIFECYCLE_STAGES.includes(stage as (typeof LEAD_LIFECYCLE_STAGES)[number])) {
    return NextResponse.json({ error: "Invalid lifecycle_stage" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contact_leads")
    .update({
      lifecycle_stage: stage,
      pipeline_stage: stage.toLowerCase(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (["REPLIED", "WON", "LOST", "UNSUBSCRIBED", "SUPPRESSED"].includes(stage)) {
    await supabaseAdmin
      .from("outreach_enrollments")
      .update({
        status: "STOPPED",
        stop_reason: `lifecycle_${stage}`,
        updated_at: new Date().toISOString(),
      })
      .eq("lead_id", id)
      .eq("status", "ACTIVE");
  }

  await recordLeadActivity({
    leadId: id,
    eventType: "lead_updated",
    actor: "admin",
    metadata: { lifecycle_stage: stage },
  });

  return NextResponse.json({ ok: true, lifecycle_stage: stage });
}
