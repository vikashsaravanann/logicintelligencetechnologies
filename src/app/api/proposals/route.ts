import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";

const proposalSchema = z.object({
  clientName: z.string().min(2).max(160),
  clientEmail: z.string().email().max(200),
  clientCompany: z.string().max(200).optional(),
  title: z.string().min(3).max(200),
  scope: z.array(z.string().max(500)).max(50).default([]),
  deliverables: z.array(z.string().max(500)).max(50).default([]),
  milestones: z.array(z.any()).max(50).default([]),
  timeline: z.string().max(120).default("4-8 Weeks"),
  pricing: z.number().nonnegative().max(1_000_000_000),
  currency: z.string().max(8).default("INR"),
  terms: z.string().max(5000).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    const { data: proposals, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[proposals]", error.message);
      return NextResponse.json({ error: "Request failed" }, { status: 500 });
    }
    return NextResponse.json({ proposals: proposals || [] });
  } catch (err) {
    console.error("[proposals]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };
  try {
    const body = await req.json().catch(() => null);
    const validated = proposalSchema.parse(body);

    const secureToken = uuidv4().replace(/-/g, "").slice(0, 24);

    // Server-generated human reference (LIT-PROP-YYYY-NNNN).
    const { data: reference, error: refError } = await supabaseAdmin.rpc("next_reference", {
      p_prefix: "LIT-PROP",
    });
    if (refError || !reference) {
      console.error("next_reference failed", refError?.message);
      return NextResponse.json({ error: "Could not allocate a proposal number" }, { status: 500 });
    }

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .insert({
        secure_token: secureToken,
        reference: reference as string,
        client_name: validated.clientName,
        client_email: validated.clientEmail,
        client_company: validated.clientCompany || null,
        title: validated.title,
        scope: validated.scope,
        deliverables: validated.deliverables,
        milestones: validated.milestones,
        timeline: validated.timeline,
        pricing: validated.pricing,
        currency: validated.currency,
        terms: validated.terms || null,
        // Draft until an admin explicitly sends it. Not "Sent" on creation.
        status: "Draft",
      })
      .select()
      .single();

    if (error || !proposal) {
      console.error("[proposals]", error?.message);
      return NextResponse.json({ error: "Request failed" }, { status: 500 });
    }

    await recordAdminAction({
      actor,
      action: "proposal.create",
      capability: "proposals.write",
      target: { type: "proposal", id: proposal.id },
      outcome: "succeeded",
      metadata: { reference: proposal.reference },
      request: req,
    });

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("[proposals]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
