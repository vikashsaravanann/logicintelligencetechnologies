import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import {
  getWalletDocumentSignedUrl,
  deleteWalletDocument,
} from "@/lib/workspaces/wallet-service";

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
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: workspaceId, fileId } = await params;

  try {
    await getStaffWorkspace(workspaceId, caller.userId);
    const isSuperAdmin = caller.role === "super_admin";
    const res = await getWalletDocumentSignedUrl(fileId, caller.userId, isSuperAdmin);
    return NextResponse.json(res);
  } catch (err: any) {
    const msg = String(err?.message || "Failed to retrieve document");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("NOT_FOUND")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: workspaceId, fileId } = await params;

  try {
    await getStaffWorkspace(workspaceId, caller.userId);
    const isSuperAdmin = caller.role === "super_admin";
    const res = await deleteWalletDocument(fileId, caller.userId, isSuperAdmin);
    return NextResponse.json(res);
  } catch (err: any) {
    const msg = String(err?.message || "Failed to delete document");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("NOT_FOUND")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
