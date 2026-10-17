import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { getProjectTeamMembers } from "@/lib/collaboration/project-collaboration-service";

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

  const { id: projectId } = await params;

  try {
    const members = await getProjectTeamMembers(projectId);
    return NextResponse.json({ team: members });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to list project team members" },
      { status: 500 }
    );
  }
}
