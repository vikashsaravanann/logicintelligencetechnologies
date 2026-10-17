import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user || user.is_anonymous) {
      return NextResponse.json({
        hasActiveWorkspace: false,
        isSuperAdmin: false,
        workspaceId: null,
      });
    }

    const selfWorkspace = await getSelfStaffWorkspace(user.id);
    return NextResponse.json(selfWorkspace);
  } catch (err: any) {
    console.error("[api/me/staff-workspace] error:", err?.message);
    return NextResponse.json({
      hasActiveWorkspace: false,
      isSuperAdmin: false,
      workspaceId: null,
    });
  }
}
