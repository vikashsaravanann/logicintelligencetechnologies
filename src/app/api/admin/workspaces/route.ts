import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { createStaffWorkspace, listStaffWorkspaces } from "@/lib/workspaces/service";
import { createStaffWorkspaceSchema } from "@/lib/workspaces/types";

async function getSuperAdminCaller() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.is_anonymous || !user.email_confirmed_at) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super_admin") {
    return null;
  }

  return { userId: user.id, email: user.email ?? "", role: profile.role };
}

export async function GET(req: NextRequest) {
  const caller = await getSuperAdminCaller();
  if (!caller) {
    return NextResponse.json(
      { error: "FORBIDDEN: Verified Super Admin access required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;

  try {
    const workspaces = await listStaffWorkspaces(caller.userId, search);
    return NextResponse.json({ workspaces });
  } catch (err: any) {
    console.error("[api/admin/workspaces] list error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to list workspaces." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const caller = await getSuperAdminCaller();
  if (!caller) {
    return NextResponse.json(
      { error: "FORBIDDEN: Only verified Super Admins may provision staff workspaces." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON: Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const validation = createStaffWorkspaceSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        details: validation.error.format(),
      },
      { status: 422 }
    );
  }

  try {
    const result = await createStaffWorkspace(validation.data, caller.userId, req);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const msg = String(err?.message || "Internal server error");
    console.error("[api/admin/workspaces] create error:", msg);

    if (msg.includes("CONFLICT_EMPLOYEE_EXISTS") || msg.includes("CONFLICT_WORKSPACE_EXISTS")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
