import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import {
  createCampaign,
  previewAudience,
  enrollEligibleLeads,
  setCampaignStatus,
} from "@/lib/outreach/campaigns";
import { DEFAULT_OUTREACH_STEPS } from "@/lib/outreach/default-sequence";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  if (!isSupabaseLive()) {
    return NextResponse.json({ campaigns: [], preview: null });
  }
  const { data: campaigns } = await supabaseAdmin
    .from("outreach_campaigns")
    .select("id, name, description, status, dry_run, created_at, started_at, created_by")
    .order("created_at", { ascending: false })
    .limit(50);

  const preview = await previewAudience({ limit: 500 });
  return NextResponse.json({ campaigns: campaigns || [], preview });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "create");

  if (action === "preview") {
    const preview = await previewAudience({
      lifecycle_stage: body.lifecycle_stage,
      source: body.source,
      limit: 500,
    });
    return NextResponse.json({ preview });
  }

  if (action === "create") {
    const steps =
      Array.isArray(body.steps) && body.steps.length > 0
        ? body.steps
        : DEFAULT_OUTREACH_STEPS;
    const result = await createCampaign({
      name: String(body.name || "Untitled campaign"),
      description: body.description ? String(body.description) : undefined,
      createdBy: body.actor ? String(body.actor) : "admin",
      steps,
      dryRun: Boolean(body.dryRun),
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ id: result.id, status: "DRAFT" });
  }

  if (action === "activate") {
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const enroll = await enrollEligibleLeads({
      campaignId: id,
      actor: body.actor ? String(body.actor) : "admin",
    });
    if ("error" in enroll) {
      return NextResponse.json({ error: enroll.error }, { status: 400 });
    }
    const status = await setCampaignStatus({
      id,
      status: "ACTIVE",
      actor: body.actor ? String(body.actor) : "admin",
    });
    if ("error" in status) {
      return NextResponse.json({ error: status.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      enrolled: enroll.enrolled,
      skipped: enroll.skipped,
    });
  }

  if (action === "pause" || action === "resume") {
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const status = await setCampaignStatus({
      id,
      status: action === "pause" ? "PAUSED" : "ACTIVE",
      actor: body.actor ? String(body.actor) : "admin",
    });
    if ("error" in status) {
      return NextResponse.json({ error: status.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
