"use server";

import { z } from "zod";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { getRequestContext } from "@/lib/admin/request-context";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ASSIGNABLE_ROLES } from "@/config/roles";
import { revalidatePath } from "next/cache";

const schema = z.object({
  targetId: z.string().uuid(),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/** Assign a role to an account. super_admin only (capability team.manage). */
export async function setStaffRole(input: { targetId: string; role: string }): Promise<ActionResult> {
  const session = await requireCapabilityAction("team.manage", "team.role_change");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid role selection." };
  }

  if (parsed.data.targetId === session.userId && parsed.data.role !== "super_admin") {
    // The DB also enforces last-super-admin; this is a clearer early message.
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "You are the last super admin; promote someone else first." };
    }
  }

  const ctx = await getRequestContext();
  const { data, error } = await supabaseAdmin.rpc("admin_set_role", {
    p_target: parsed.data.targetId,
    p_role: parsed.data.role,
    p_actor: session.userId,
    p_actor_email: session.email,
    p_request_id: ctx.requestId,
  });

  if (error) {
    // The RPC also writes a denied/failed path only on success; record the failure here.
    await recordAdminAction({
      actor: { userId: session.userId, email: session.email, role: session.role },
      action: "team.role_change",
      capability: "team.manage",
      target: { type: "user", id: parsed.data.targetId },
      outcome: "failed",
      metadata: { attempted_role: parsed.data.role },
      errorCode: error.code,
    });
    const msg = error.message?.includes("last super_admin")
      ? "Cannot remove the last super admin."
      : "Could not change the role.";
    return { ok: false, error: msg };
  }

  revalidatePath("/admin/team");
  const result = (data ?? {}) as { old_role?: string; new_role?: string };
  return { ok: true, message: `Role set to ${result.new_role ?? parsed.data.role}.` };
}
