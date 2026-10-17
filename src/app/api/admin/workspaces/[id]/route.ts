import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { getStaffWorkspace, updateStaffWorkspaceStatus } from "@/lib/workspaces/service";
import type { StaffWorkspaceStatus } from "@/lib/workspaces/types";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  try {
    const ws = await getStaffWorkspace(workspaceId, caller.userId);
    return NextResponse.json({ workspace: ws });
  } catch (err: any) {
    const msg = String(err?.message || "Workspace not found");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("NOT_FOUND")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller || caller.role !== "super_admin") {
    return NextResponse.json(
      { error: "FORBIDDEN: Super Admin required to update workspace status." },
      { status: 403 }
    );
  }

  const { id: workspaceId } = await params;

  let body: { status?: StaffWorkspaceStatus; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status || !body.reason) {
    return NextResponse.json(
      { error: "status and reason are required" },
      { status: 400 }
    );
  }

  try {
    const result = await updateStaffWorkspaceStatus(
      workspaceId,
      body.status,
      body.reason,
      caller.userId,
      req
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update status." },
      { status: 500 }
    );
  }
}
