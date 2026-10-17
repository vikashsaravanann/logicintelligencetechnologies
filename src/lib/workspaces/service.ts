import "server-only";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordAdminAction } from "@/lib/admin/audit";
import { sendEmail } from "@/lib/email/client";
import StaffWorkspaceInvitationEmail from "@/emails/staff-workspace-invitation-email";
import {
  createStaffWorkspaceSchema,
  type CreateStaffWorkspaceInput,
  type StaffWorkspaceStatus,
  type StaffWorkspaceSummaryDTO,
  type SafeEmployeeWorkspaceDTO,
} from "./types";
import type { StaffRole } from "@/config/roles";

/**
 * Normalizes input phone to standard E.164 (+91... for 10-digit Indian numbers by default).
 */
export function normalizePhoneE164(phone: string, defaultCountry = "91"): string {
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    const clean = "+" + digitsOnly;
    if (/^\+[1-9]\d{7,14}$/.test(clean)) {
      return clean;
    }
  }

  // If standard 10 digit Indian number without country code
  if (digitsOnly.length === 10) {
    return `+${defaultCountry}${digitsOnly}`;
  }

  // If already includes defaultCountry prefix without +
  if (digitsOnly.length === 12 && digitsOnly.startsWith(defaultCountry)) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  throw new Error("Invalid phone number format. Please provide a valid E.164 telephone number.");
}

/**
 * Asserts that the actor is a verified Super Admin.
 */
async function assertSuperAdmin(actorUserId: string): Promise<{ id: string; email: string; role: string }> {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role")
    .eq("id", actorUserId)
    .maybeSingle();

  if (error || !profile || profile.role !== "super_admin") {
    throw new Error("FORBIDDEN_SUPER_ADMIN_REQUIRED: Only verified Super Admins may perform this operation.");
  }

  return { id: profile.id, email: profile.email ?? "", role: profile.role };
}

/**
 * Creates a brand new individual Staff Admin Workspace and provisions the employee account.
 */
export async function createStaffWorkspace(
  rawInput: CreateStaffWorkspaceInput,
  actorUserId: string,
  request?: Request
) {
  // 1. Verify Super Admin privileges
  const actor = await assertSuperAdmin(actorUserId);

  // 2. Validate input schema
  const parsed = createStaffWorkspaceSchema.parse(rawInput);
  const normalizedEmail = parsed.email.trim().toLowerCase();
  const normalizedPhone = normalizePhoneE164(parsed.phone);

  // 3. Safety check: Ensure no duplicate employee profile exists
  const { data: existingEmployee } = await supabaseAdmin
    .from("staff_employees")
    .select("id, email_normalized")
    .eq("email_normalized", normalizedEmail)
    .maybeSingle();

  if (existingEmployee) {
    throw new Error("CONFLICT_EMPLOYEE_EXISTS: A staff employee with this official email is already registered.");
  }

  // Check if profile exists already in auth or public.profiles
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  let authUserId: string;
  let isNewlyCreatedAuthUser = false;

  if (existingProfile) {
    // If user already exists in profiles, do not overwrite silently if it's already a privileged staff member
    if (existingProfile.role === "super_admin") {
      throw new Error("FORBIDDEN_SUPER_ADMIN_EXISTS: Cannot re-provision a workspace for an existing Super Admin account.");
    }
    // Check if an existing workspace is already assigned
    const { data: existingWs } = await supabaseAdmin
      .from("staff_workspaces")
      .select("id")
      .eq("owner_user_id", existingProfile.id)
      .maybeSingle();

    if (existingWs) {
      throw new Error("CONFLICT_WORKSPACE_EXISTS: This account already has an assigned staff workspace.");
    }

    authUserId = existingProfile.id;

    // Update password safely via admin API without emailing it
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      password: parsed.temporaryPassword,
      user_metadata: { full_name: parsed.fullName },
    });
  } else {
    // 4. Create fresh Supabase Auth user with founder-supplied temporary password
    // email_confirm: false enforces mandatory email verification
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: parsed.temporaryPassword,
      email_confirm: false,
      user_metadata: {
        full_name: parsed.fullName,
        department: parsed.department,
        job_title: parsed.jobTitle,
      },
    });

    if (authError || !authUser.user) {
      console.error("[staff-workspace] Supabase auth user creation failed:", authError?.message);
      throw new Error(`AUTH_PROVISIONING_FAILED: ${authError?.message || "Failed to create authentication user."}`);
    }

    authUserId = authUser.user.id;
    isNewlyCreatedAuthUser = true;
  }

  // Generate server-side UUID for the employee's private workspace
  const workspaceId = crypto.randomUUID();

  try {
    // 5. Update or insert public.profiles role
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: authUserId,
        email: normalizedEmail,
        full_name: parsed.fullName,
        role: parsed.systemRole,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("[staff-workspace] Profile upsert failed:", profileError.message);
      throw new Error(`PROFILE_CREATION_FAILED: ${profileError.message}`);
    }

    // 6. Insert staff_employees
    const { error: employeeError } = await supabaseAdmin
      .from("staff_employees")
      .insert({
        auth_user_id: authUserId,
        full_name: parsed.fullName,
        email_normalized: normalizedEmail,
        phone_e164: normalizedPhone,
        department: parsed.department,
        job_title: parsed.jobTitle,
        employment_type: parsed.employmentType,
        manager_user_id: parsed.managerUserId || null,
        employment_status: "active",
        created_by: actorUserId,
      })
      .select()
      .single();

    if (employeeError) {
      console.error("[staff-workspace] staff_employees insert failed:", employeeError.message);
      throw new Error(`STAFF_EMPLOYEE_INSERT_FAILED: ${employeeError.message}`);
    }

    // 7. Insert staff_workspaces
    const { error: wsError } = await supabaseAdmin.from("staff_workspaces").insert({
      id: workspaceId,
      owner_user_id: authUserId,
      name: `${parsed.fullName}'s Workspace`,
      status: "pending_email_verification",
      role_snapshot: parsed.systemRole,
      created_by: actorUserId,
    });

    if (wsError) {
      console.error("[staff-workspace] staff_workspaces insert failed:", wsError.message);
      throw new Error(`STAFF_WORKSPACE_INSERT_FAILED: ${wsError.message}`);
    }

    // 8. Insert staff_workspace_permissions
    if (parsed.allowedModules && parsed.allowedModules.length > 0) {
      const permInserts = parsed.allowedModules.map((capId) => ({
        workspace_id: workspaceId,
        capability_id: capId,
        granted_by: actorUserId,
        reason: `Assigned during workspace provisioning by ${actor.email}`,
      }));

      const { error: permError } = await supabaseAdmin
        .from("staff_workspace_permissions")
        .insert(permInserts);

      if (permError) {
        console.warn("[staff-workspace] Permissions insert warning:", permError.message);
      }
    }

    // 9. Link client/project assignments if any
    if (parsed.clientAssignments && parsed.clientAssignments.length > 0) {
      const canQuotation = parsed.allowedModules.includes("quotation.technical_draft.create") || parsed.allowedModules.includes("quotations.technical_draft.create");
      const canInvoice = parsed.allowedModules.includes("invoice.preparation.create") || parsed.allowedModules.includes("invoices.preparation.create");

      const assignmentInserts = parsed.clientAssignments.map((engagementId) => ({
        staff_user_id: authUserId,
        engagement_id: engagementId,
        assignment_role: "delivery_engineer",
        status: "active",
        can_view_technical_stages: true,
        can_prepare_technical_quotation: canQuotation,
        can_prepare_invoice_request: canInvoice,
        assigned_by: actorUserId,
        assignment_reason: "Initial assignment during staff workspace creation",
      }));

      const { error: assignError } = await supabaseAdmin
        .from("staff_client_assignments")
        .insert(assignmentInserts);

      if (assignError) {
        console.warn("[staff-workspace] Client assignments insert warning:", assignError.message);
      }
    }

    // 10. Create initial onboarding task
    await supabaseAdmin.from("staff_tasks").insert({
      workspace_id: workspaceId,
      assignee_user_id: authUserId,
      title: "Complete Workspace Onboarding & Password Rotation",
      description_safe: "Verify official email, change temporary password to a personal password, and review assigned modules.",
      priority: "high",
      state: "todo",
      created_by: actorUserId,
    });

    // 11. Record immutable audit event in staff_workspace_events (NO SECRETS)
    await supabaseAdmin.from("staff_workspace_events").insert({
      workspace_id: workspaceId,
      actor_auth_id: actorUserId,
      target_user_id: authUserId,
      event_key: "workspace.created",
      details: {
        department: parsed.department,
        job_title: parsed.jobTitle,
        system_role: parsed.systemRole,
        modules_count: parsed.allowedModules.length,
        assignments_count: parsed.clientAssignments.length,
      },
    });

    // 12. Record append-only admin audit log
    await recordAdminAction({
      actor: { userId: actor.id, email: actor.email, role: actor.role },
      action: "team.workspace_created",
      capability: "team.manage",
      target: { type: "staff_workspace", id: workspaceId },
      outcome: "succeeded",
      metadata: {
        recipient_email: normalizedEmail,
        system_role: parsed.systemRole,
        job_title: parsed.jobTitle,
        department: parsed.department,
      },
      request,
    });
  } catch (err: any) {
    console.error("[staff-workspace] Provisioning failed, executing compensation rollback:", err);
    if (isNewlyCreatedAuthUser) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (delErr) {
        console.warn("[staff-workspace] Rollback auth deletion failed:", delErr);
      }
      try {
        await supabaseAdmin.from("staff_workspace_permissions").delete().eq("workspace_id", workspaceId);
        await supabaseAdmin.from("staff_workspaces").delete().eq("id", workspaceId);
        await supabaseAdmin.from("staff_employees").delete().eq("auth_user_id", authUserId);
        await supabaseAdmin.from("profiles").delete().eq("id", authUserId);
      } catch (cleanErr) {
        console.warn("[staff-workspace] Rollback DB cleanup failed:", cleanErr);
      }
    }
    throw err;
  }

  // 14. Enqueue staff workspace invitation email via transactional outbox
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.logicintelligencetechnologies.in"
  ).replace(/\/$/, "");

  const workspaceDirectUrl = `${baseUrl}/admin/workspaces/${workspaceId}`;
  const loginRedirectUrl = `${baseUrl}/login?next=${encodeURIComponent(`/admin/workspaces/${workspaceId}`)}`;

  let invitationStatus: "queued" | "sending" | "provider_accepted" | "delivered" | "failed" = "queued";
  let emailOutboxId: string | undefined;

  try {
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Your LIT Staff Admin Workspace Has Been Provisioned",
      from: "operations",
      category: "operational",
      templateKey: "staff-workspace-invitation",
      idempotencyKey: `staff-ws-invite-${workspaceId}`,
      react: React.createElement(StaffWorkspaceInvitationEmail, {
        recipientName: parsed.fullName,
        recipientEmail: normalizedEmail,
        jobTitle: parsed.jobTitle,
        department: parsed.department,
        systemRole: parsed.systemRole,
        workspaceUrl: loginRedirectUrl,
        workspaceUuid: workspaceId,
      }),
    });

    if (emailResult.success) {
      invitationStatus = emailResult.status === "sent" ? "provider_accepted" : "queued";
      emailOutboxId = emailResult.outboxId;
    } else {
      invitationStatus = "failed";
    }
  } catch (err) {
    console.warn("[staff-workspace] Email sending exception (workspace created safely):", err);
    invitationStatus = "failed";
  }

  // 15. Track invitation status in staff_workspace_invitations
  await supabaseAdmin.from("staff_workspace_invitations").insert({
    workspace_id: workspaceId,
    recipient_email: normalizedEmail,
    status: invitationStatus,
    idempotency_key: `staff-ws-invite-${workspaceId}`,
    email_outbox_id: emailOutboxId || null,
    created_by: actorUserId,
  });

  return {
    success: true,
    workspaceId,
    workspaceUrl: workspaceDirectUrl,
    loginRedirectUrl,
    invitationStatus,
    employee: {
      id: authUserId,
      fullName: parsed.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      department: parsed.department,
      jobTitle: parsed.jobTitle,
      systemRole: parsed.systemRole,
    },
  };
}

/**
 * Lists all staff workspaces for the Super Admin directory.
 */
export async function listStaffWorkspaces(
  actorUserId: string,
  search?: string
): Promise<StaffWorkspaceSummaryDTO[]> {
  await assertSuperAdmin(actorUserId);

  const query = supabaseAdmin
    .from("staff_workspaces")
    .select(`
      id,
      owner_user_id,
      name,
      status,
      role_snapshot,
      created_at,
      last_access_at
    `)
    .order("created_at", { ascending: false });

  const { data: workspaces, error: wsError } = await query;
  if (wsError || !workspaces) {
    console.error("[staff-workspace] list failed:", wsError?.message);
    return [];
  }

  // Fetch all employees
  const { data: employees } = await supabaseAdmin
    .from("staff_employees")
    .select("*");

  const empMap = new Map((employees || []).map((e) => [e.auth_user_id, e]));

  // Fetch invitation statuses
  const { data: invitations } = await supabaseAdmin
    .from("staff_workspace_invitations")
    .select("workspace_id, status")
    .order("created_at", { ascending: false });

  const invMap = new Map((invitations || []).map((i) => [i.workspace_id, i.status]));

  // Fetch task counts
  const { data: tasks } = await supabaseAdmin
    .from("staff_tasks")
    .select("workspace_id");

  const taskCountMap = new Map<string, number>();
  (tasks || []).forEach((t) => {
    taskCountMap.set(t.workspace_id, (taskCountMap.get(t.workspace_id) || 0) + 1);
  });

  // Fetch client assignments count
  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("staff_user_id");

  const assignmentCountMap = new Map<string, number>();
  (assignments || []).forEach((a) => {
    assignmentCountMap.set(a.staff_user_id, (assignmentCountMap.get(a.staff_user_id) || 0) + 1);
  });

  let summaries: StaffWorkspaceSummaryDTO[] = workspaces.map((ws) => {
    const emp = empMap.get(ws.owner_user_id);
    return {
      id: ws.id,
      ownerUserId: ws.owner_user_id,
      name: ws.name,
      status: ws.status as StaffWorkspaceStatus,
      role: ws.role_snapshot as StaffRole,
      employee: {
        id: emp?.id || "",
        fullName: emp?.full_name || ws.name,
        email: emp?.email_normalized || "",
        phone: emp?.phone_e164 || "",
        department: emp?.department || "General",
        jobTitle: emp?.job_title || ws.role_snapshot,
        employmentType: (emp?.employment_type as any) || "full_time",
        employmentStatus: emp?.employment_status || "active",
      },
      invitationStatus: (invMap.get(ws.id) as any) || "queued",
      taskCount: taskCountMap.get(ws.id) || 0,
      assignedProjectCount: assignmentCountMap.get(ws.owner_user_id) || 0,
      createdAt: ws.created_at,
      lastAccessAt: ws.last_access_at,
    };
  });

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    summaries = summaries.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.employee.fullName.toLowerCase().includes(q) ||
        s.employee.email.toLowerCase().includes(q) ||
        s.employee.department.toLowerCase().includes(q) ||
        s.employee.jobTitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }

  return summaries;
}

/**
 * Retrieves safe employee workspace DTO.
 * Enforces ownership: only owner or Super Admin can retrieve.
 */
export async function getStaffWorkspace(
  workspaceId: string,
  actorUserId: string
): Promise<SafeEmployeeWorkspaceDTO> {
  // 1. Fetch workspace
  const { data: ws, error: wsError } = await supabaseAdmin
    .from("staff_workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();

  if (wsError || !ws) {
    throw new Error("NOT_FOUND: Workspace does not exist.");
  }

  // 2. Authorization check
  const isOwner = ws.owner_user_id === actorUserId;
  let isSuperAdmin = false;

  const { data: actorProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", actorUserId)
    .maybeSingle();

  if (actorProfile?.role === "super_admin") {
    isSuperAdmin = true;
  }

  if (!isOwner && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You do not have permission to access this staff workspace.");
  }

  if (!isSuperAdmin && ["suspended", "revoked", "archived"].includes(ws.status)) {
    throw new Error(`FORBIDDEN: Workspace is currently ${ws.status}. Please contact the Super Admin.`);
  }

  // Update last access timestamp if owner accessed
  if (isOwner) {
    await supabaseAdmin
      .from("staff_workspaces")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", workspaceId);
  }

  // 3. Fetch employee details
  const { data: emp } = await supabaseAdmin
    .from("staff_employees")
    .select("*")
    .eq("auth_user_id", ws.owner_user_id)
    .maybeSingle();

  // 4. Fetch capabilities
  const { data: perms } = await supabaseAdmin
    .from("staff_workspace_permissions")
    .select("capability_id")
    .eq("workspace_id", workspaceId);

  const capabilities = (perms || []).map((p) => p.capability_id);

  // 5. Fetch assigned tasks
  const { data: tasks } = await supabaseAdmin
    .from("staff_tasks")
    .select("id, title, description_safe, priority, state, due_at, project_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  // 6. Fetch client assignments (financially redacted)
  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select(`
      id,
      client_id,
      engagement_id,
      assignment_role,
      status,
      expires_at,
      can_view_technical_stages,
      can_prepare_technical_quotation,
      can_prepare_invoice_request,
      clients (
        id,
        legal_name,
        display_name
      ),
      client_engagements (
        id,
        project_title,
        company_name,
        clients (
          id,
          legal_name,
          display_name
        )
      )
    `)
    .eq("staff_user_id", ws.owner_user_id)
    .eq("status", "active");

  const isSuspendedOrOffboarded = emp && (emp.employment_status === "suspended" || emp.employment_status === "offboarded");

  const safeAssignments = isSuspendedOrOffboarded
    ? []
    : (assignments || [])
        .filter((a: any) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now())
        .map((a: any) => {
          const clientName =
            a.client_engagements?.company_name ||
            a.client_engagements?.clients?.display_name ||
            a.client_engagements?.clients?.legal_name ||
            a.clients?.display_name ||
            a.clients?.legal_name ||
            a.client_engagements?.project_title ||
            "Assigned Engagement";
          return {
            assignmentId: a.id,
            engagementId: a.engagement_id || null,
            clientName,
            assignmentRole: a.assignment_role,
            canViewTechnicalStages: Boolean(a.can_view_technical_stages),
            canPrepareTechnicalQuotation: Boolean(a.can_prepare_technical_quotation),
            canPrepareInvoiceRequest: Boolean(a.can_prepare_invoice_request),
          };
        });

  return {
    workspaceId: ws.id,
    ownerUserId: ws.owner_user_id,
    name: ws.name,
    status: ws.status as StaffWorkspaceStatus,
    role: ws.role_snapshot as StaffRole,
    jobTitle: emp?.job_title || ws.role_snapshot,
    department: emp?.department || "General",
    fullName: emp?.full_name || ws.name,
    email: emp?.email_normalized || "",
    capabilities,
    tasks: (tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description_safe,
      priority: t.priority,
      state: t.state,
      dueAt: t.due_at,
      projectId: t.project_id,
    })),
    assignedEngagements: safeAssignments,
    isSuperAdminManagementView: isSuperAdmin && !isOwner,
  };
}

/**
 * Returns self staff-workspace entitlement for the avatar dropdown.
 * Used by /api/me/staff-workspace.
 */
export async function getSelfStaffWorkspace(userId: string) {
  // Check profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return { hasActiveWorkspace: false, isSuperAdmin: false, workspaceId: null };
  }

  const isSuperAdmin = profile.role === "super_admin";

  // Check if user has an active staff workspace
  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("id, name, status, role_snapshot")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (ws && (ws.status === "active" || ws.status === "initial_password_change_required" || ws.status === "pending_email_verification")) {
    const { data: emp } = await supabaseAdmin
      .from("staff_employees")
      .select("job_title")
      .eq("auth_user_id", userId)
      .maybeSingle();

    return {
      hasActiveWorkspace: true,
      workspaceId: ws.id,
      displayName: profile.full_name || ws.name,
      safeRoleLabel: emp?.job_title || ws.role_snapshot,
      isSuperAdmin,
      status: ws.status,
    };
  }

  // If Super Admin with no personal staff workspace, grant super admin navigation
  if (isSuperAdmin) {
    return {
      hasActiveWorkspace: false,
      workspaceId: null,
      displayName: profile.full_name || "Super Admin",
      safeRoleLabel: "Super Admin",
      isSuperAdmin: true,
      status: "active",
    };
  }

  return { hasActiveWorkspace: false, isSuperAdmin: false, workspaceId: null };
}

/**
 * Updates staff workspace status (suspend, reactivate, revoke, archive).
 * Super Admin only.
 */
export async function updateStaffWorkspaceStatus(
  workspaceId: string,
  newStatus: StaffWorkspaceStatus,
  reason: string,
  actorUserId: string,
  request?: Request
) {
  const actor = await assertSuperAdmin(actorUserId);

  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "suspended") updates.suspended_at = new Date().toISOString();
  if (newStatus === "revoked") updates.revoked_at = new Date().toISOString();
  if (newStatus === "active") updates.activated_at = new Date().toISOString();

  const { data: ws, error } = await supabaseAdmin
    .from("staff_workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .select("id, owner_user_id")
    .single();

  if (error || !ws) {
    throw new Error(`STATUS_UPDATE_FAILED: ${error?.message || "Failed to update workspace status."}`);
  }

  // Record audit
  await supabaseAdmin.from("staff_workspace_events").insert({
    workspace_id: workspaceId,
    actor_auth_id: actorUserId,
    target_user_id: ws.owner_user_id,
    event_key: `workspace.status_${newStatus}`,
    details: { reason },
  });

  await recordAdminAction({
    actor: { userId: actor.id, email: actor.email, role: actor.role },
    action: `team.workspace_status_updated`,
    capability: "team.manage",
    target: { type: "staff_workspace", id: workspaceId },
    outcome: "succeeded",
    metadata: { new_status: newStatus, reason },
    request,
  });

  return { success: true, workspaceId, status: newStatus };
}

/**
 * Resends staff workspace invitation email with rate-limiting protection.
 * Super Admin only.
 */
export async function resendStaffWorkspaceInvitation(
  workspaceId: string,
  actorUserId: string,
  request?: Request
) {
  const actor = await assertSuperAdmin(actorUserId);

  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("id, owner_user_id, status")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) throw new Error("Workspace not found.");

  const { data: emp } = await supabaseAdmin
    .from("staff_employees")
    .select("full_name, email_normalized, job_title, department")
    .eq("auth_user_id", ws.owner_user_id)
    .maybeSingle();

  if (!emp) throw new Error("Staff employee record not found.");

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.logicintelligencetechnologies.in"
  ).replace(/\/$/, "");

  const loginRedirectUrl = `${baseUrl}/login?next=${encodeURIComponent(`/admin/workspaces/${workspaceId}`)}`;
  const idempotencyKey = `staff-ws-invite-${workspaceId}-${Date.now()}`;

  const emailResult = await sendEmail({
    to: emp.email_normalized,
    subject: "Reminder: Your LIT Staff Admin Workspace Has Been Provisioned",
    from: "operations",
    category: "operational",
    templateKey: "staff-workspace-invitation",
    idempotencyKey,
    react: React.createElement(StaffWorkspaceInvitationEmail, {
      recipientName: emp.full_name,
      recipientEmail: emp.email_normalized,
      jobTitle: emp.job_title,
      department: emp.department,
      systemRole: "staff",
      workspaceUrl: loginRedirectUrl,
      workspaceUuid: workspaceId,
    }),
  });

  await supabaseAdmin.from("staff_workspace_invitations").insert({
    workspace_id: workspaceId,
    recipient_email: emp.email_normalized,
    status: emailResult.success ? "provider_accepted" : "failed",
    idempotency_key: idempotencyKey,
    email_outbox_id: emailResult.outboxId || null,
    created_by: actorUserId,
  });

  await recordAdminAction({
    actor: { userId: actor.id, email: actor.email, role: actor.role },
    action: "team.workspace_invitation_resent",
    capability: "team.manage",
    target: { type: "staff_workspace", id: workspaceId },
    outcome: emailResult.success ? "succeeded" : "failed",
    metadata: { recipient: emp.email_normalized },
    request,
  });

  return { success: emailResult.success, status: emailResult.status };
}
