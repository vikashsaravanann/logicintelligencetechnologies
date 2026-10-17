import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getCallerUser() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.is_anonymous) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? "", role: profile?.role || "user" };
}

export async function GET(req: NextRequest) {
  const caller = await getCallerUser();
  if (!caller || !["super_admin", "admin", "operations"].includes(caller.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("project_triage_queue")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ queue: data || [] });
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerUser();
  if (!caller || caller.role !== "super_admin") {
    return NextResponse.json({ error: "FORBIDDEN: Super Admin required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { triageId, assignedToUserId, status } = body;

    if (!triageId) {
      return NextResponse.json({ error: "triageId is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (assignedToUserId) {
      updates.assigned_to_user_id = assignedToUserId;
      updates.assigned_by = caller.userId;
      updates.assigned_at = new Date().toISOString();
      updates.status = "assigned";
    }

    if (status) {
      updates.status = status;
    }

    const { data, error } = await supabaseAdmin
      .from("project_triage_queue")
      .update(updates)
      .eq("id", triageId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Triage update failed" }, { status: 500 });
  }
}
