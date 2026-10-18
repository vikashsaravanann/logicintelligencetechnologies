import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/session";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type StaffPortalContext = {
  userId: string;
  email: string | null;
  role: string;
  isSuperAdmin: boolean;
  workspaceId: string;
  workspaceName: string;
  workspaceStatus: string;
  fullName: string;
  jobTitle: string;
  department: string;
  employeeCode: string | null;
  capabilities: string[];
};

/**
 * Resolve authenticated staff workspace context.
 * Reconciles pending_email_verification → initial_password_change_required when Auth email is confirmed.
 */
export async function requireStaffPortal(
  currentPath = "/staff/dashboard",
  options?: { allowSetupPath?: boolean }
): Promise<StaffPortalContext> {
  const session = await getStaffSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  const isSuperAdmin = session.role === "super_admin";

  const { data: emp } = await supabaseAdmin
    .from("staff_employees")
    .select("full_name, employee_code, job_title, department, employment_status")
    .eq("auth_user_id", session.userId)
    .maybeSingle();

  if (emp && (emp.employment_status === "suspended" || emp.employment_status === "offboarded")) {
    redirect("/login?reason=employment-inactive");
  }

  let self = await getSelfStaffWorkspace(session.userId);

  if (!self?.hasActiveWorkspace || !self.workspaceId) {
    if (isSuperAdmin) {
      redirect("/admin/command-center");
    }
    redirect(`/admin/forbidden?need=staff.workspace`);
  }

  let status = self.status || "active";

  // Reconcile: Auth session exists only when email is confirmed (session gate).
  // If workspace is still pending_email_verification, advance to password setup.
  if (status === "pending_email_verification" && self.workspaceId) {
    const { error: recErr } = await supabaseAdmin
      .from("staff_workspaces")
      .update({
        status: "initial_password_change_required",
        updated_at: new Date().toISOString(),
      })
      .eq("id", self.workspaceId)
      .eq("owner_user_id", session.userId)
      .eq("status", "pending_email_verification");
    if (!recErr) {
      status = "initial_password_change_required";
      await supabaseAdmin.from("staff_workspace_events").insert({
        workspace_id: self.workspaceId,
        actor_auth_id: session.userId,
        target_user_id: session.userId,
        event_key: "workspace.email_verified_reconciled",
        details: { previous_status: "pending_email_verification" },
      });
    }
  }

  const isSetupPath =
    currentPath.startsWith("/staff/setup-password") || options?.allowSetupPath === true;

  if (
    (status === "pending_email_verification" || status === "initial_password_change_required") &&
    !isSetupPath
  ) {
    redirect("/staff/setup-password");
  }

  const { data: perms } = await supabaseAdmin
    .from("staff_workspace_permissions")
    .select("capability_id")
    .eq("workspace_id", self.workspaceId);

  const capabilities = (perms || []).map((p) => p.capability_id as string);

  return {
    userId: session.userId,
    email: session.email,
    role: session.role,
    isSuperAdmin,
    workspaceId: self.workspaceId,
    workspaceName: self.displayName || "Staff Workspace",
    workspaceStatus: status,
    fullName: emp?.full_name || self.displayName || session.email || "Staff Member",
    jobTitle: emp?.job_title || self.safeRoleLabel || session.role,
    department: emp?.department || "General",
    employeeCode: emp?.employee_code ?? null,
    capabilities,
  };
}

export async function requireStaffCapability(
  capability: string,
  currentPath: string
): Promise<StaffPortalContext> {
  const ctx = await requireStaffPortal(currentPath);
  // Deny-by-default: missing grants never unlock optional modules
  if (!ctx.capabilities.includes(capability) && !ctx.isSuperAdmin) {
    redirect(`/staff/dashboard?denied=${encodeURIComponent(capability)}`);
  }
  return ctx;
}
