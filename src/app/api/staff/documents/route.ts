import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";

export const runtime = "nodejs";

const MAX = 15 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

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
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const self = await getSelfStaffWorkspace(user.id);
    if (!self.hasActiveWorkspace) {
      return NextResponse.json({ error: "NO_WORKSPACE" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const path = `${user.id}/${Date.now()}-${safeName}`;

    // Prefer staff-documents bucket; fall back to staff-avatars path namespace if needed
    let bucket = "staff-documents";
    let up = await supabaseAdmin.storage.from(bucket).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (up.error) {
      bucket = "staff-avatars";
      up = await supabaseAdmin.storage.from(bucket).upload(`docs/${path}`, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (up.error) {
        return NextResponse.json({ error: up.error.message }, { status: 500 });
      }
    }

    const storagePath = bucket === "staff-documents" ? path : `docs/${path}`;
    const { data: row, error: insErr } = await supabaseAdmin
      .from("staff_document_wallet")
      .insert({
        owner_user_id: user.id,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || null,
        storage_path: storagePath,
        category: "personal",
        description: null,
      })
      .select("id, file_name, file_size_bytes, mime_type, category, description, created_at")
      .single();

    if (insErr || !row) {
      return NextResponse.json({ error: insErr?.message || "INSERT_FAILED" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: {
        id: row.id,
        fileName: row.file_name,
        sizeBytes: row.file_size_bytes,
        mimeType: row.mime_type,
        category: row.category,
        description: row.description,
        createdAt: row.created_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UPLOAD_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
