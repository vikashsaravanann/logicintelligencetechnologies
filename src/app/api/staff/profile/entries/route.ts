import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TYPES = new Set([
  "skill",
  "education",
  "experience",
  "certification",
  "project",
  "achievement",
  "link",
  "language",
]);

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const entryType = String(body.entry_type || "");
  if (!TYPES.has(entryType)) {
    return NextResponse.json({ error: "Invalid entry_type" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("staff_profile_entries")
    .insert({
      user_id: session.userId,
      entry_type: entryType,
      title: body.title || null,
      organization: body.organization || null,
      category: body.category || null,
      description: body.description || null,
      metadata: body.metadata || {},
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      is_current: Boolean(body.is_current),
      include_in_resume: body.include_in_resume !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entry: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of [
    "title",
    "organization",
    "category",
    "description",
    "metadata",
    "start_date",
    "end_date",
    "is_current",
    "include_in_resume",
    "sort_order",
  ]) {
    if (k in body) patch[k] = body[k];
  }

  const { data, error } = await supabaseAdmin
    .from("staff_profile_entries")
    .update(patch)
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, entry: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("staff_profile_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
