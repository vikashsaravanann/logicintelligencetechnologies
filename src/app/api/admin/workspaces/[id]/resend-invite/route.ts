import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { resendStaffWorkspaceInvitation } from "@/lib/workspaces/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.is_anonymous || !user.email_confirmed_at) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super_admin") {
    return NextResponse.json(
      { error: "FORBIDDEN: Only Super Admin may resend workspace invitations." },
      { status: 403 }
    );
  }

  const { id: workspaceId } = await params;

  try {
    const result = await resendStaffWorkspaceInvitation(workspaceId, user.id, req);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[api/workspaces/resend-invite] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to resend invitation." },
      { status: 500 }
    );
  }
}
