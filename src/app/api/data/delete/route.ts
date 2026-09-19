import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // 1. Delete derived data & embeddings (assuming a table for user embeddings exists, or AI contexts)
    // If we have AI contexts linked to user
    await supabaseAdmin.from("ai_contexts").delete().eq("user_id", userId);
    
    // 2. Delete Object Storage files
    const { data: files } = await supabaseAdmin.storage.from("client_vault").list(userId);
    if (files && files.length > 0) {
      const paths = files.map(f => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from("client_vault").remove(paths);
    }

    // 3. Delete Database User Data
    // User deletion is generally best handled via admin api for complete removal
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
       console.error("Auth delete error", error);
       return NextResponse.json({ success: false, message: "Failed to delete user profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Data deleted successfully" });
  } catch (err) {
    console.error("Deletion API Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
