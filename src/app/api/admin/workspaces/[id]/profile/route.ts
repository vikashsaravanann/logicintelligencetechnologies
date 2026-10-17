import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import {
  getStaffProfile,
  updateStaffProfile,
} from "@/lib/workspaces/profile-service";

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
    const profile = await getStaffProfile(ws.ownerUserId);
    return NextResponse.json({ profile });
  } catch (err: any) {
    const msg = String(err?.message || "Profile not found");
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
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  try {
    const ws = await getStaffWorkspace(workspaceId, caller.userId);
    const isSuperAdmin = caller.role === "super_admin";

    const body = await req.json();
    const updated = await updateStaffProfile(ws.ownerUserId, caller.userId, isSuperAdmin, body);
    return NextResponse.json({ profile: updated });
  } catch (err: any) {
    const msg = String(err?.message || "Failed to update profile");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
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
    const isSuperAdmin = caller.role === "super_admin";

    if (ws.ownerUserId !== caller.userId && !isSuperAdmin) {
      return NextResponse.json(
        { error: "FORBIDDEN: You cannot upload portrait for another employee." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Portrait photo must be under 10 MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${ws.ownerUserId}/portrait_${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("staff-avatars")
      .upload(storagePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("staff-avatars")
      .getPublicUrl(storagePath);

    const updated = await updateStaffProfile(ws.ownerUserId, caller.userId, isSuperAdmin, {
      portraitUrl: publicUrl,
    });

    return NextResponse.json({ portraitUrl: publicUrl, profile: updated });
  } catch (err: any) {
    const msg = String(err?.message || "Failed to upload portrait");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
