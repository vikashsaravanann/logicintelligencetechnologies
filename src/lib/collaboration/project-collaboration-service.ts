/**
 * Project Team Collaboration & Staff Invitation Service
 *
 * Implements project-scoped staff invitations:
 * - Cryptographically random tokens (stored as SHA-256 hashes)
 * - Single-use acceptance and recipient account binding
 * - Expiration and revocation checks
 * - Integration with staff_client_assignments for team access
 * - Complete isolation of individual private staff workspaces
 */

import crypto from "crypto";
import React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import ProjectInvitationEmail from "@/emails/project-invitation-email";

export const INVITATION_EXPIRATION_DAYS = 7;

export type ProjectStaffRole =
  | "primary_lead"
  | "collaborator"
  | "support_owner"
  | "technical_specialist"
  | "technical_support"
  | "project_coordinator"
  | "delivery_engineer";

export interface ProjectInvitationRecord {
  id: string;
  engagement_id: string;
  inviter_user_id: string;
  recipient_email: string;
  requested_role: ProjectStaffRole;
  token_hash: string;
  status: "pending" | "accepted" | "declined" | "revoked" | "expired";
  expires_at: string;
  accepted_by_user_id: string | null;
  accepted_at: string | null;
  revoked_by_user_id: string | null;
  revoked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  assignmentId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  isPrimaryLead: boolean;
  canInviteCollaborators: boolean;
  canViewTechnicalStages: boolean;
  assignedAt: string;
}

/**
 * Computes a SHA-256 hash of a raw invitation token.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export const hashInvitationToken = hashToken;

/**
 * Creates a project-scoped staff invitation with a cryptographic token.
 */
export async function createProjectInvitation(params: {
  engagementId: string;
  inviterUserId: string;
  isSuperAdmin: boolean;
  recipientEmail: string;
  requestedRole: ProjectStaffRole;
  notes?: string;
  baseUrl?: string;
}): Promise<{ invitationId: string; rawToken: string; inviteUrl: string }> {
  const {
    engagementId,
    inviterUserId,
    isSuperAdmin,
    recipientEmail,
    requestedRole,
    notes,
    baseUrl = "https://www.logicintelligencetechnologies.in",
  } = params;

  const normalizedEmail = recipientEmail.trim().toLowerCase();

  // 1. Verify caller has permission to invite (Super Admin OR assigned lead with can_invite_collaborators)
  if (!isSuperAdmin) {
    const { data: assignment } = await supabaseAdmin
      .from("staff_client_assignments")
      .select("is_primary_lead, can_invite_collaborators, status")
      .eq("engagement_id", engagementId)
      .eq("staff_user_id", inviterUserId)
      .eq("status", "active")
      .maybeSingle();

    if (!assignment || (!assignment.is_primary_lead && !assignment.can_invite_collaborators)) {
      throw new Error("FORBIDDEN: You do not have permission to invite collaborators to this project.");
    }
  }

  // 2. Verify recipient is a valid registered staff member
  const { data: recipientProfile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (profErr || !recipientProfile) {
    throw new Error("RECIPIENT_NOT_FOUND: Recipient must be an existing verified staff employee.");
  }

  // 3. Verify recipient is not already actively assigned to this project
  const { data: existingAssignment } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("id")
    .eq("engagement_id", engagementId)
    .eq("staff_user_id", recipientProfile.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingAssignment) {
    throw new Error("ALREADY_ASSIGNED: Staff member is already actively assigned to this project.");
  }

  // 4. Generate random 256-bit token and store hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

  const { data: invite, error: insErr } = await supabaseAdmin
    .from("project_staff_invitations")
    .insert({
      engagement_id: engagementId,
      inviter_user_id: inviterUserId,
      recipient_email: normalizedEmail,
      requested_role: requestedRole,
      token_hash: tokenHash,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      notes: notes?.trim() || null,
    })
    .select()
    .single();

  if (insErr) {
    throw new Error(`Failed to create project invitation: ${insErr.message}`);
  }

  const inviteUrl = `${baseUrl}/admin/invitations/${rawToken}/accept`;

  // 5. Send notification email to recipient
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Project Collaboration Invitation: Client Engineering Engagement | LIT",
      from: "operations",
      category: "operational",
      templateKey: "project-invitation",
      idempotencyKey: `proj-invite-${invite.id}`,
      react: React.createElement(ProjectInvitationEmail, {
        recipientName: recipientProfile.full_name || "LIT Team Member",
        recipientEmail: normalizedEmail,
        projectTitle: "Client Engineering Engagement",
        requestedRole: requestedRole.replace("_", " "),
        invitationUrl: inviteUrl,
        inviterName: isSuperAdmin ? "Executive Leadership" : "Project Lead",
        expiresInDays: INVITATION_EXPIRATION_DAYS,
      }),
    });
  } catch (err: any) {
    console.error("Failed to dispatch project invitation email:", err?.message);
  }

  return {
    invitationId: invite.id,
    rawToken,
    inviteUrl,
  };
}

/**
 * Accepts a project invitation using the raw token.
 */
export async function acceptProjectInvitation(rawToken: string, callerUserId: string): Promise<{
  success: boolean;
  engagementId: string;
  role: string;
}> {
  const tokenHash = hashToken(rawToken);

  // 1. Fetch invitation
  const { data: invite, error } = await supabaseAdmin
    .from("project_staff_invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .single();

  if (error || !invite) {
    throw new Error("INVALID_TOKEN: Invitation not found or invalid.");
  }

  if (invite.status === "accepted") {
    // Idempotent return if caller already accepted
    if (invite.accepted_by_user_id === callerUserId) {
      return { success: true, engagementId: invite.engagement_id, role: invite.requested_role };
    }
    throw new Error("ALREADY_ACCEPTED: This invitation has already been accepted.");
  }

  if (invite.status === "revoked") {
    throw new Error("REVOKED: This invitation was revoked by the project lead.");
  }

  if (new Date(invite.expires_at) < new Date() || invite.status === "expired") {
    throw new Error("EXPIRED: This invitation has expired.");
  }

  // 2. Verify caller matches recipient email
  const { data: callerProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("id", callerUserId)
    .single();

  if (!callerProfile || callerProfile.email.toLowerCase() !== invite.recipient_email.toLowerCase()) {
    throw new Error("ACCOUNT_MISMATCH: You must sign in with the email address this invitation was sent to.");
  }

  // 3. Update invitation status to accepted
  const now = new Date().toISOString();
  await supabaseAdmin
    .from("project_staff_invitations")
    .update({
      status: "accepted",
      accepted_by_user_id: callerUserId,
      accepted_at: now,
      updated_at: now,
    })
    .eq("id", invite.id);

  // 4. Upsert project assignment
  const { error: assignErr } = await supabaseAdmin
    .from("staff_client_assignments")
    .upsert(
      {
        staff_user_id: callerUserId,
        engagement_id: invite.engagement_id,
        assignment_role: invite.requested_role,
        status: "active",
        can_view_technical_stages: true,
        is_primary_lead: invite.requested_role === "primary_lead",
        can_invite_collaborators: invite.requested_role === "primary_lead",
        assigned_by: invite.inviter_user_id,
        assignment_reason: `Accepted project invitation (${invite.requested_role})`,
        starts_at: now,
        updated_at: now,
      },
      { onConflict: "staff_user_id,engagement_id" }
    );

  if (assignErr) {
    throw new Error(`Failed to create assignment: ${assignErr.message}`);
  }

  return {
    success: true,
    engagementId: invite.engagement_id,
    role: invite.requested_role,
  };
}

/**
 * Lists active team members for a project.
 */
export async function getProjectTeamMembers(engagementId: string): Promise<ProjectTeamMember[]> {
  const { data, error } = await supabaseAdmin
    .from("staff_client_assignments")
    .select(`
      id,
      staff_user_id,
      assignment_role,
      is_primary_lead,
      can_invite_collaborators,
      can_view_technical_stages,
      created_at,
      profiles:staff_user_id (id, full_name, email)
    `)
    .eq("engagement_id", engagementId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list project team members: ${error.message}`);
  }

  const userIds = (data || []).map((row: any) => row.staff_user_id).filter(Boolean);
  const profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: details } = await supabaseAdmin
      .from("staff_profile_details")
      .select("user_id, portrait_url, avatar_url, skills, bio")
      .in("user_id", userIds);
    if (details) {
      for (const d of details) {
        profileMap[d.user_id] = d;
      }
    }
  }

  return (data || []).map((row: any) => {
    const detail = profileMap[row.staff_user_id] || {};
    return {
      assignmentId: row.id,
      userId: row.staff_user_id,
      name: row.profiles?.full_name || "LIT Staff Member",
      email: row.profiles?.email || "",
      role: row.assignment_role,
      isPrimaryLead: Boolean(row.is_primary_lead),
      canInviteCollaborators: Boolean(row.can_invite_collaborators),
      canViewTechnicalStages: Boolean(row.can_view_technical_stages),
      assignedAt: row.created_at,
      portraitUrl: detail.portrait_url || null,
      avatarUrl: detail.avatar_url || null,
      skills: detail.skills || [],
      bio: detail.bio || null,
    };
  });
}

export interface ClientDeliveryTeamMember {
  userId: string;
  name: string;
  role: string;
  isPrimaryLead: boolean;
  portraitUrl: string | null;
  avatarUrl: string | null;
  skills: string[];
  bio: string | null;
}

/**
 * Resolves the assigned LIT delivery team for a client project view.
 * Guaranteed zero financial/commercial fields are returned.
 */
export async function getDeliveryTeamForClientProject(
  projectId: string,
  clientId?: string
): Promise<ClientDeliveryTeamMember[]> {
  try {
    let engagementIds: string[] = [];
    const clientIds: string[] = [];

    if (clientId) {
      clientIds.push(clientId);
    }

    // Check project row in projects table
    const { data: projectRow } = await supabaseAdmin
      .from("projects")
      .select("id, client_id, project_code, proposal_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectRow?.client_id) {
      clientIds.push(projectRow.client_id);
    }

    if (projectRow?.project_code) {
      const { data: engs } = await supabaseAdmin
        .from("client_engagements")
        .select("id")
        .eq("engagement_ref", projectRow.project_code);
      if (engs && engs.length > 0) {
        engagementIds.push(...engs.map((e: any) => e.id));
      }
    }

    if (clientIds.length > 0) {
      const { data: engsByClient } = await supabaseAdmin
        .from("client_engagements")
        .select("id")
        .in("client_id", clientIds);
      if (engsByClient) {
        engagementIds.push(...engsByClient.map((e: any) => e.id));
      }
    }

    // Direct engagement ID check
    const { data: directEng } = await supabaseAdmin
      .from("client_engagements")
      .select("id")
      .eq("id", projectId)
      .maybeSingle();
    if (directEng) {
      engagementIds.push(directEng.id);
    }

    engagementIds = Array.from(new Set(engagementIds));
    const uniqueClientIds = Array.from(new Set(clientIds));

    let assignmentsQuery = supabaseAdmin
      .from("staff_client_assignments")
      .select(`
        id,
        staff_user_id,
        assignment_role,
        is_primary_lead,
        created_at,
        profiles:staff_user_id (id, full_name, email)
      `)
      .eq("status", "active");

    if (engagementIds.length > 0 && uniqueClientIds.length > 0) {
      assignmentsQuery = assignmentsQuery.or(
        `engagement_id.in.(${engagementIds.join(",")}),client_id.in.(${uniqueClientIds.join(",")})`
      );
    } else if (engagementIds.length > 0) {
      assignmentsQuery = assignmentsQuery.in("engagement_id", engagementIds);
    } else if (uniqueClientIds.length > 0) {
      assignmentsQuery = assignmentsQuery.in("client_id", uniqueClientIds);
    } else {
      return [];
    }

    const { data: assignments, error } = await assignmentsQuery;
    if (error || !assignments || assignments.length === 0) {
      return [];
    }

    const staffMap = new Map<string, any>();
    for (const a of assignments) {
      const existing = staffMap.get(a.staff_user_id);
      if (!existing || (!existing.is_primary_lead && a.is_primary_lead)) {
        staffMap.set(a.staff_user_id, a);
      }
    }

    const uniqueAssignments = Array.from(staffMap.values());
    const userIds = uniqueAssignments.map((a) => a.staff_user_id).filter(Boolean);

    const profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: details } = await supabaseAdmin
        .from("staff_profile_details")
        .select("user_id, portrait_url, avatar_url, skills, bio")
        .in("user_id", userIds);
      if (details) {
        for (const d of details) {
          profileMap[d.user_id] = d;
        }
      }
    }

    const formatRole = (r: string, isLead: boolean) => {
      if (isLead) return "Primary Delivery Lead";
      switch (r) {
        case "primary_lead":
          return "Primary Delivery Lead";
        case "collaborator":
          return "Senior Solutions Engineer";
        case "technical_specialist":
          return "Principal Technical Specialist";
        case "technical_support":
          return "Support & Escalations Lead";
        case "delivery_engineer":
          return "Cloud & AI Delivery Engineer";
        case "project_coordinator":
          return "Engineering Delivery Coordinator";
        case "operations_prep":
          return "Infrastructure Operations Lead";
        default:
          return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
    };

    return uniqueAssignments
      .map((row: any) => {
        const details = profileMap[row.staff_user_id] || {};
        return {
          userId: row.staff_user_id,
          name: row.profiles?.full_name || "LIT Engineering Lead",
          role: formatRole(row.assignment_role, Boolean(row.is_primary_lead)),
          isPrimaryLead: Boolean(row.is_primary_lead),
          portraitUrl: details.portrait_url || null,
          avatarUrl: details.avatar_url || null,
          skills: details.skills || [],
          bio: details.bio || null,
        };
      })
      .sort((a, b) => (b.isPrimaryLead ? 1 : 0) - (a.isPrimaryLead ? 1 : 0));
  } catch (err) {
    console.warn("[getDeliveryTeamForClientProject] failed gracefully:", err);
    return [];
  }
}

