import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { createProjectInvitation, ProjectStaffRole } from "@/lib/collaboration/project-collaboration-service";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: projectId } = await params;

  try {
    const body = await req.json();
    const { recipientEmail, requestedRole, notes } = body;

    if (!recipientEmail || !requestedRole) {
      return NextResponse.json(
        { error: "recipientEmail and requestedRole are required" },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "www.logicintelligencetechnologies.in";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${proto}://${host}`;

    const res = await createProjectInvitation({
      engagementId: projectId,
      inviterUserId: caller.userId,
      isSuperAdmin: caller.role === "super_admin",
      recipientEmail,
      requestedRole: requestedRole as ProjectStaffRole,
      notes,
      baseUrl,
    });

    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    const msg = String(err?.message || "Failed to invite collaborator");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("RECIPIENT_NOT_FOUND") || msg.includes("ALREADY_ASSIGNED")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
