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

  if (session.role !== "super_admin") {
    await recordAdminAction({
      actor: { userId: session.userId, email: session.email, role: session.role },
      action: "team.role_change",
      capability: "team.manage",
      target: { type: "user", id: parsed.data.targetId },
      outcome: "denied",
      metadata: { attempted_role: parsed.data.role, reason: "Actor is not super_admin" },
      errorCode: "42501",
    });
    return { ok: false, error: "Only super administrators can change member roles." };
  }

  // Prevent removing the last super admin
  if (parsed.data.role !== "super_admin") {
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", parsed.data.targetId)
      .maybeSingle();

    if (targetProfile?.role === "super_admin") {
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if ((count ?? 0) <= 1) {
        return { ok: false, error: "Cannot remove the last super admin; promote someone else first." };
      }
    }
  }

  const ctx = await getRequestContext();
  let oldRole: string | undefined;

  // Try the database RPC function first
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc("admin_set_role", {
    p_target: parsed.data.targetId,
    p_role: parsed.data.role,
    p_actor: session.userId,
    p_actor_email: session.email,
    p_request_id: ctx.requestId,
  });

  if (!rpcError) {
    const res = (rpcData ?? {}) as { old_role?: string; new_role?: string };
    oldRole = res.old_role;
  } else {
    // If the RPC fails (e.g. Postgres 42501 insufficient_privilege on auth.users or missing function),
    // use direct service-role update to guarantee super admins can change member roles.
    console.warn("[team.role_change] admin_set_role RPC failed, applying service-role update:", rpcError);

    // Fetch target user email to populate profile row if needed
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(parsed.data.targetId);
    const targetEmail = targetUser?.user?.email ?? "";

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", parsed.data.targetId)
      .maybeSingle();
    oldRole = existingProfile?.role;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: parsed.data.targetId,
        email: targetEmail || undefined,
        role: parsed.data.role,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) {
      await recordAdminAction({
        actor: { userId: session.userId, email: session.email, role: session.role },
        action: "team.role_change",
        capability: "team.manage",
        target: { type: "user", id: parsed.data.targetId },
        outcome: "failed",
        metadata: { attempted_role: parsed.data.role, error: profileError.message },
        errorCode: profileError.code,
      });
      const msg = profileError.message?.includes("last super_admin")
        ? "Cannot remove the last super admin."
        : "Could not change the role.";
      return { ok: false, error: msg };
    }

    // Keep auth user metadata synchronized
    try {
      await supabaseAdmin.auth.admin.updateUserById(parsed.data.targetId, {
        user_metadata: { role: parsed.data.role },
      });
    } catch {
      // non-fatal
    }

    // Record audit entry for service-role execution path
    await recordAdminAction({
      actor: { userId: session.userId, email: session.email, role: session.role },
      action: "team.role_change",
      capability: "team.manage",
      target: { type: "user", id: parsed.data.targetId },
      outcome: "succeeded",
      metadata: { role: parsed.data.role, old_role: oldRole, mechanism: "service_role_direct" },
    });
  }

  revalidatePath("/admin/team");
  return { ok: true, message: `Role successfully updated to ${parsed.data.role}.` };
}

const inviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.enum(ASSIGNABLE_ROLES),
});

/** Invite a new member by email with designated role. super_admin only (capability team.manage). */
export async function inviteTeamMember(input: { email: string; role: string }): Promise<ActionResult> {
  const session = await requireCapabilityAction("team.manage", "team.member_invite");

  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invitation input." };
  }

  if (session.role !== "super_admin") {
    await recordAdminAction({
      actor: { userId: session.userId, email: session.email, role: session.role },
      action: "team.member_invite",
      capability: "team.manage",
      outcome: "denied",
      metadata: { email: parsed.data.email, attempted_role: parsed.data.role, reason: "Actor is not super_admin" },
      errorCode: "42501",
    });
    return { ok: false, error: "Only super administrators can invite team members." };
  }

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { role: parsed.data.role },
  });

  if (error) {
    await recordAdminAction({
      actor: { userId: session.userId, email: session.email, role: session.role },
      action: "team.member_invite",
      capability: "team.manage",
      outcome: "failed",
      metadata: { email: parsed.data.email, attempted_role: parsed.data.role },
      errorCode: error.code ?? "invite_failed",
    });
    return { ok: false, error: error.message || "Could not send member invitation." };
  }

  if (data?.user?.id) {
    await supabaseAdmin.from("profiles").upsert({
      id: data.user.id,
      role: parsed.data.role,
    });
  }

  await recordAdminAction({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "team.member_invite",
    capability: "team.manage",
    target: { type: "user", id: data.user.id },
    outcome: "succeeded",
    metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/admin/team");
  return { ok: true, message: `Invitation successfully sent to ${parsed.data.email}.` };
}
