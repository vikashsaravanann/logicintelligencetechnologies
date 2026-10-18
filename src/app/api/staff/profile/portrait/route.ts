import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user || user.is_anonymous) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const self = await getSelfStaffWorkspace(user.id);
    if (!self.hasActiveWorkspace || !self.workspaceId) {
      return NextResponse.json({ success: false, error: "NO_WORKSPACE" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file") || form.get("portrait") || form.get("photo");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "FILE_REQUIRED" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ success: false, error: "INVALID_TYPE" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isWebp = bytes.slice(0, 4).toString() === "RIFF";
    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ success: false, error: "INVALID_CONTENT" }, { status: 400 });
    }

    const ext = isJpeg ? "jpg" : isPng ? "png" : "webp";
    const path = `${user.id}/portrait-${Date.now()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("staff-avatars")
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (upErr) {
      return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from("staff-avatars").getPublicUrl(path);
    const portraitUrl = pub?.publicUrl || path;

    // Schema: staff_profile_details.user_id (PK), portrait_url
    const { error: upsertErr } = await supabaseAdmin.from("staff_profile_details").upsert(
      {
        user_id: user.id,
        portrait_url: portraitUrl,
        avatar_url: portraitUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertErr) {
      return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      portraitUrl,
      profile: { portraitUrl },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UPLOAD_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
