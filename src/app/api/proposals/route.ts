import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";

const proposalSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientCompany: z.string().optional(),
  title: z.string().min(3),
  scope: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  milestones: z.array(z.any()).default([]),
  timeline: z.string().default("4-8 Weeks"),
  pricing: z.number().nonnegative(),
  currency: z.string().default("INR"),
  terms: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { data: proposals, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proposals: proposals || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = proposalSchema.parse(body);

    const secureToken = uuidv4().replace(/-/g, "").slice(0, 24);

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .insert({
        secure_token: secureToken,
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
        terms: validated.terms || "Standard 50% upfront, 50% on milestone sign-off. Full IP transferred upon final payment.",
        status: "Sent",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
