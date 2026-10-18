import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("staff_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", session.userId)
    .is("read_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
