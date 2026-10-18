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
 * Enforces: session, employment active, workspace exists.
 * Forces /staff/setup-password when status requires first-login password change.
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

  const self = await getSelfStaffWorkspace(session.userId);

  if (!self?.hasActiveWorkspace || !self.workspaceId) {
    if (isSuperAdmin) {
      redirect("/admin/command-center");
    }
    redirect(`/admin/forbidden?need=staff.workspace`);
  }

  const status = self.status || "active";
  const isSetupPath = currentPath.startsWith("/staff/setup-password");

  // Mandatory first-login password rotation
  if (
    (status === "pending_email_verification" || status === "initial_password_change_required") &&
    !isSetupPath &&
    !options?.allowSetupPath
  ) {
    // If email not confirmed, session.ts may already block; still send to setup after confirm
    redirect("/staff/setup-password");
  }

  // Transition pending_email_verification → initial_password_change_required once email is confirmed
  // (session only exists when confirmed via getStaffSession)
  if (status === "pending_email_verification" && isSetupPath) {
    await supabaseAdmin
      .from("staff_workspaces")
      .update({
        status: "initial_password_change_required",
        updated_at: new Date().toISOString(),
      })
      .eq("id", self.workspaceId)
      .eq("owner_user_id", session.userId)
      .eq("status", "pending_email_verification");
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
  if (
    ctx.capabilities.length > 0 &&
    !ctx.capabilities.includes(capability) &&
    !ctx.isSuperAdmin
  ) {
    redirect(`/staff/dashboard?denied=${encodeURIComponent(capability)}`);
  }
  return ctx;
}
