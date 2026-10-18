import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Super Admin only — assign/correct employee_code */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ userId: string }> | { userId: string } }
) {
  const session = await getStaffSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { userId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const code = typeof body.employee_code === "string" ? body.employee_code.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!code || code.length < 3) {
    return NextResponse.json({ error: "employee_code required (min 3 characters)" }, { status: 400 });
  }
  if (reason.length < 5) {
    return NextResponse.json({ error: "reason required (min 5 characters)" }, { status: 400 });
  }

  const { data: before } = await supabaseAdmin
    .from("staff_employees")
    .select("employee_code, full_name")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!before) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const { error } = await supabaseAdmin
    .from("staff_employees")
    .update({ employee_code: code, updated_at: new Date().toISOString() })
    .eq("auth_user_id", userId);

  if (error) {
    if (/unique|duplicate/i.test(error.message)) {
      return NextResponse.json({ error: "Employee code already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("staff_profile_change_events").insert({
    user_id: userId,
    actor_user_id: session.userId,
    field_key: "employee_code",
    old_value: before.employee_code,
    new_value: code,
  });

  return NextResponse.json({
    ok: true,
    employee_code: code,
    previous: before.employee_code,
  });
}
