import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { acceptProjectInvitation } from "@/lib/collaboration/project-collaboration-service";

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

  return { userId: user.id, email: user.email ?? "" };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json(
      { error: "UNAUTHORIZED: Please sign in to accept this invitation." },
      { status: 401 }
    );
  }

  const { token } = await params;

  try {
    const result = await acceptProjectInvitation(token, caller.userId);
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = String(err?.message || "Failed to accept invitation");
    if (msg.includes("ACCOUNT_MISMATCH")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("EXPIRED") || msg.includes("REVOKED") || msg.includes("ALREADY_ACCEPTED") || msg.includes("INVALID_TOKEN")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
