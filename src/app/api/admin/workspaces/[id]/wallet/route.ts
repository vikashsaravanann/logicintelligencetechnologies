import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  listWalletDocuments,
  recordWalletDocument,
  WALLET_BUCKET,
  validateWalletFile,
  WalletCategory,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await getCallerUser();
  if (!caller) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  try {
    const ws = await getStaffWorkspace(workspaceId, caller.userId);
    if (ws.ownerUserId !== caller.userId && caller.role !== "super_admin") {
      return NextResponse.json({ error: "FORBIDDEN: You cannot view another employee's document wallet." }, { status: 403 });
    }
    const isSuperAdmin = caller.role === "super_admin";
    const docs = await listWalletDocuments(ws.ownerUserId, caller.userId, isSuperAdmin);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    const msg = String(err?.message || "Failed to load wallet");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("NOT_FOUND")) {
      return NextResponse.json({ error: msg }, { status: 404 });
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
    if (ws.ownerUserId !== caller.userId && caller.role !== "super_admin") {
      return NextResponse.json({ error: "FORBIDDEN: You cannot upload to another employee's document wallet." }, { status: 403 });
    }
    const isSuperAdmin = caller.role === "super_admin";

    let fileName = "";
    let fileSizeBytes = 0;
    let mimeType = "";
    let storagePath = "";
    let category: WalletCategory = "other";
    let description: string | undefined = undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      fileName = file.name;
      fileSizeBytes = file.size;
      mimeType = file.type || "application/octet-stream";
      category = (formData.get("category") as WalletCategory) || "other";
      description = (formData.get("description") as string) || undefined;

      const validation = validateWalletFile(fileName, fileSizeBytes, mimeType);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      storagePath = `${ws.ownerUserId}/${Date.now()}_${sanitizedName}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from(WALLET_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadErr) {
        return NextResponse.json({ error: `Storage upload failed: ${uploadErr.message}` }, { status: 500 });
      }
    } else {
      const body = await req.json();
      fileName = body.fileName;
      fileSizeBytes = Number(body.fileSizeBytes);
      mimeType = body.mimeType;
      storagePath = body.storagePath;
      category = body.category;
      description = body.description;
    }

    const doc = await recordWalletDocument({
      ownerUserId: ws.ownerUserId,
      callerUserId: caller.userId,
      isSuperAdmin,
      fileName,
      fileSizeBytes,
      mimeType,
      storagePath,
      category,
      description,
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err: any) {
    const msg = String(err?.message || "Upload recording failed");
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("VALIDATION_FAILED") || msg.includes("INVALID_STORAGE_PATH")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
