import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export interface ClientNotification {
  id: string;
  clientEmail: string;
  engagementRef?: string | null;
  title: string;
  message: string;
  category: "action_required" | "milestone" | "document" | "payment" | "system" | "message";
  actionUrl?: string | null;
  actionLabel?: string | null;
  readAt?: string | null;
  createdAt: string;
  formattedDate: string;
  metadata?: Record<string, any>;
}

export interface ClientActionItem {
  id: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  description?: string | null;
  category: "decision" | "approval" | "review" | "submission" | "meeting" | "payment";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_review" | "completed" | "cancelled";
  dueAt?: string | null;
  assignedTo: "client" | "lit_team";
  actionUrl?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  createdAt: string;
}

export interface ClientChangeRequest {
  id: string;
  rfcRef: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  category: "scope_expansion" | "architecture_change" | "integration" | "timeline_amendment" | "other";
  description: string;
  justification?: string | null;
  impactSummary?: string | null;
  status: "draft" | "submitted" | "in_review" | "quoted" | "client_approved" | "rejected" | "implemented";
  estimatedCostInr?: number | null;
  estimatedTimelineDays?: number | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ClientSharedDecision {
  id: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  decisionText: string;
  contextMeeting?: string | null;
  agreedDate: string;
  status: "proposed" | "acknowledged" | "disputed";
  acknowledgedAt?: string | null;
  createdAt: string;
}

export interface ClientProjectBlocker {
  id: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "mitigated" | "resolved";
  impact: string;
  mitigationPlan?: string | null;
  owner: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ClientQACriterion {
  id: string;
  engagementRef: string;
  criterionRef: string;
  title: string;
  category: string;
  status: "not_run" | "in_progress" | "passed" | "failed" | "blocked";
  evidenceUrl?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ClientNotificationPreferences {
  clientEmail: string;
  emailCriticalAlerts: boolean;
  emailStageMilestones: boolean;
  emailMessages: boolean;
  emailWeeklyDigest: boolean;
  updatedAt: string;
}

// ── 1. Notifications ─────────────────────────────────────────────────────────

export async function listClientNotifications(
  clientEmail: string,
  engagementRef?: string | null,
  limit = 50
): Promise<ClientNotification[]> {
  const normalizedEmail = clientEmail.trim().toLowerCase();

  let query = supabaseAdmin
    .from("client_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  query = query.eq("client_email", normalizedEmail);
  if (engagementRef && engagementRef.trim()) {
    query = query.eq("engagement_ref", engagementRef.trim());
  }

  const { data: rows, error } = await query;

  if (error || !rows || rows.length === 0) {
    // Generate default welcome notification if completely empty
    return [
      {
        id: "notif_welcome",
        clientEmail: normalizedEmail,
        engagementRef: engagementRef || null,
        title: "Enterprise Client Workspace Ready",
        message:
          "Welcome to your Logic Intelligence Technologies client portal. All 13 canonical stages, project milestones, invoices, and asynchronous engineering communications are accessible here.",
        category: "system",
        actionUrl: engagementRef ? `/client/dashboard?ref=${encodeURIComponent(engagementRef)}` : "/client/dashboard",
        actionLabel: "View Dashboard",
        readAt: null,
        createdAt: new Date().toISOString(),
        formattedDate: formatIST(new Date()),
      },
    ];
  }

  return rows.map((r) => ({
    id: r.id,
    clientEmail: r.client_email,
    engagementRef: r.engagement_ref,
    title: r.title,
    message: r.message,
    category: r.category,
    actionUrl: r.action_url,
    actionLabel: r.action_label,
    readAt: r.read_at,
    createdAt: r.created_at,
    formattedDate: formatIST(r.created_at),
    metadata: r.metadata,
  }));
}

export const getClientNotifications = listClientNotifications;

export async function getUnreadNotificationCount(
  clientEmail: string,
  engagementRef?: string | null
): Promise<number> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  let query = supabaseAdmin
    .from("client_notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  query = query.eq("client_email", normalizedEmail);
  if (engagementRef && engagementRef.trim()) {
    query = query.eq("engagement_ref", engagementRef.trim());
  }

  const { count, error } = await query;

  if (error) return 0;
  return count || 0;
}

export async function markNotificationAsRead(
  clientEmail: string,
  notificationId: string
): Promise<boolean> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from("client_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("client_email", normalizedEmail);

  return !error;
}

export async function markAllNotificationsAsRead(clientEmail: string): Promise<boolean> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from("client_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("client_email", normalizedEmail)
    .is("read_at", null);

  return !error;
}

export async function createClientNotification(payload: {
  clientEmail: string;
  engagementRef?: string | null;
  title: string;
  message: string;
  category: "action_required" | "milestone" | "document" | "payment" | "system" | "message";
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  const { error } = await supabaseAdmin.from("client_notifications").insert([
    {
      client_email: payload.clientEmail.trim().toLowerCase(),
      engagement_ref: payload.engagementRef || null,
      title: payload.title,
      message: payload.message,
      category: payload.category,
      action_url: payload.actionUrl || null,
      action_label: payload.actionLabel || null,
      metadata: payload.metadata || {},
    },
  ]);

  if (error) {
    console.error("[notifications] Failed to create notification:", error);
    return false;
  }
  return true;
}

// ── 2. Action Items & Approvals ───────────────────────────────────────────────

export async function listClientActionItems(
  clientEmail: string,
  engagementRef?: string
): Promise<ClientActionItem[]> {
  const normalizedEmail = clientEmail.trim().toLowerCase();

  let query = supabaseAdmin
    .from("client_action_items")
    .select("*")
    .eq("client_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (engagementRef) {
    query = query.eq("engagement_ref", engagementRef);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    engagementRef: r.engagement_ref,
    clientEmail: r.client_email,
    title: r.title,
    description: r.description,
    category: r.category,
    priority: r.priority,
    status: r.status,
    dueAt: r.due_at,
    assignedTo: r.assigned_to,
    actionUrl: r.action_url,
    completedAt: r.completed_at,
    completedBy: r.completed_by,
    createdAt: r.created_at,
  }));
}

export async function updateActionItemStatus(
  clientEmail: string,
  id: string,
  status: "pending" | "in_review" | "completed" | "cancelled",
  completedBy?: string
): Promise<boolean> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const updatePayload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    updatePayload.completed_at = new Date().toISOString();
    updatePayload.completed_by = completedBy || normalizedEmail;
  }

  const { error } = await supabaseAdmin
    .from("client_action_items")
    .update(updatePayload)
    .eq("id", id)
    .eq("client_email", normalizedEmail);

  return !error;
}

// ── 3. Change Requests (RFCs) ────────────────────────────────────────────────

export async function listClientChangeRequests(
  clientEmail: string,
  engagementRef?: string
): Promise<ClientChangeRequest[]> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  let query = supabaseAdmin
    .from("client_change_requests")
    .select("*")
    .eq("client_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (engagementRef) {
    query = query.eq("engagement_ref", engagementRef);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    rfcRef: r.rfc_ref,
    engagementRef: r.engagement_ref,
    clientEmail: r.client_email,
    title: r.title,
    category: r.category,
    description: r.description,
    justification: r.justification,
    impactSummary: r.impact_summary,
    status: r.status,
    estimatedCostInr: r.estimated_cost_inr ? Number(r.estimated_cost_inr) : null,
    estimatedTimelineDays: r.estimated_timeline_days,
    submittedAt: r.submitted_at,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
  }));
}

export async function listProjectChangeRequests(
  engagementRef: string
): Promise<ClientChangeRequest[]> {
  const { data: rows, error } = await supabaseAdmin
    .from("client_change_requests")
    .select("*")
    .eq("engagement_ref", engagementRef)
    .order("created_at", { ascending: false });

  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    rfcRef: r.rfc_ref,
    engagementRef: r.engagement_ref,
    clientEmail: r.client_email,
    title: r.title,
    category: r.category,
    description: r.description,
    justification: r.justification,
    impactSummary: r.impact_summary,
    status: r.status,
    estimatedCostInr: r.estimated_cost_inr ? Number(r.estimated_cost_inr) : null,
    estimatedTimelineDays: r.estimated_timeline_days,
    submittedAt: r.submitted_at,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
  }));
}

export async function createChangeRequest(payload: {
  clientEmail: string;
  engagementRef: string;
  title: string;
  category: "scope_expansion" | "architecture_change" | "integration" | "timeline_amendment" | "other";
  description: string;
  justification?: string;
  impactSummary?: string;
}): Promise<{ ok: boolean; rfcRef?: string; error?: string }> {
  const rfcRef = `RFC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error } = await supabaseAdmin.from("client_change_requests").insert([
    {
      rfc_ref: rfcRef,
      engagement_ref: payload.engagementRef,
      client_email: payload.clientEmail.trim().toLowerCase(),
      title: payload.title,
      category: payload.category,
      description: payload.description,
      justification: payload.justification || null,
      impact_summary: payload.impactSummary || null,
      status: "submitted",
    },
  ]);

  if (error) {
    return { ok: false, error: error.message };
  }

  // Create notification for team
  await createClientNotification({
    clientEmail: payload.clientEmail,
    engagementRef: payload.engagementRef,
    title: `Change Request ${rfcRef} Submitted`,
    message: `Your request "${payload.title}" has been registered and assigned to Solutions Architecture for review.`,
    category: "action_required",
    actionUrl: `/client/change-requests`,
    actionLabel: "View RFC",
  });

  try {
    const { notifyAssignedStaffForEngagement, resolveStaffUserIdsForClientEmail, notifyStaff } =
      await import("@/lib/staff/notifications");
    // Prefer engagement_ref → id lookup
    let engagementId: string | null = null;
    if (payload.engagementRef && payload.engagementRef !== "GENERAL") {
      const { data: eng } = await supabaseAdmin
        .from("client_engagements")
        .select("id")
        .eq("engagement_ref", payload.engagementRef)
        .maybeSingle();
      engagementId = eng?.id || null;
    }
    if (engagementId) {
      await notifyAssignedStaffForEngagement(engagementId, {
        eventType: "client.change_request",
        title: `Change request ${rfcRef}`,
        summary: payload.title,
        sourceId: rfcRef,
        actionUrl: "/staff/change-requests",
        idempotencyKey: `rfc:${rfcRef}`,
      });
    } else {
      const staff = await resolveStaffUserIdsForClientEmail(payload.clientEmail);
      for (const s of staff) {
        await notifyStaff({
          recipientUserId: s.userId,
          engagementId: s.engagementId,
          eventType: "client.change_request",
          title: `Change request ${rfcRef}`,
          summary: payload.title,
          sourceId: rfcRef,
          actionUrl: "/staff/change-requests",
          idempotencyKey: `rfc:${rfcRef}:${s.userId}`,
        });
      }
    }
  } catch (e) {
    console.warn("[rfc] staff notification failed", e);
  }

  return { ok: true, rfcRef };
}

// ── 4. Shared Decisions & Meeting Notes ──────────────────────────────────────

export async function listSharedDecisions(
  clientEmail: string,
  engagementRef?: string
): Promise<ClientSharedDecision[]> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  let query = supabaseAdmin
    .from("client_shared_decisions")
    .select("*")
    .eq("client_email", normalizedEmail)
    .order("agreed_date", { ascending: false });

  if (engagementRef) {
    query = query.eq("engagement_ref", engagementRef);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    engagementRef: r.engagement_ref,
    clientEmail: r.client_email,
    title: r.title,
    decisionText: r.decision_text,
    contextMeeting: r.context_meeting,
    agreedDate: r.agreed_date,
    status: r.status,
    acknowledgedAt: r.acknowledged_at,
    createdAt: r.created_at,
  }));
}

export async function acknowledgeDecision(
  clientEmail: string,
  decisionId: string
): Promise<boolean> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from("client_shared_decisions")
    .update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", decisionId)
    .eq("client_email", normalizedEmail);

  return !error;
}

// ── 5. Project Blockers & Risks ──────────────────────────────────────────────

export async function listProjectBlockers(
  clientEmail: string,
  engagementRef?: string
): Promise<ClientProjectBlocker[]> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  let query = supabaseAdmin
    .from("client_project_blockers")
    .select("*")
    .eq("client_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (engagementRef) {
    query = query.eq("engagement_ref", engagementRef);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    engagementRef: r.engagement_ref,
    clientEmail: r.client_email,
    title: r.title,
    severity: r.severity,
    status: r.status,
    impact: r.impact,
    mitigationPlan: r.mitigation_plan,
    owner: r.owner,
    resolvedAt: r.resolved_at,
    createdAt: r.created_at,
  }));
}

// ── 6. QA Criteria & Evidence ────────────────────────────────────────────────

export async function listQACriteria(
  engagementRef: string
): Promise<ClientQACriterion[]> {
  const { data: rows, error } = await supabaseAdmin
    .from("client_qa_criteria")
    .select("*")
    .eq("engagement_ref", engagementRef)
    .order("criterion_ref", { ascending: true });

  if (error || !rows) return [];

  return rows.map((r) => ({
    id: r.id,
    engagementRef: r.engagement_ref,
    criterionRef: r.criterion_ref,
    title: r.title,
    category: r.category,
    status: r.status,
    evidenceUrl: r.evidence_url,
    verifiedAt: r.verified_at,
    verifiedBy: r.verified_by,
    notes: r.notes,
    createdAt: r.created_at,
  }));
}

// ── 7. Notification Preferences ──────────────────────────────────────────────

export async function getNotificationPreferences(
  clientEmail: string
): Promise<ClientNotificationPreferences> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const { data: row } = await supabaseAdmin
    .from("client_notification_preferences")
    .select("*")
    .eq("client_email", normalizedEmail)
    .maybeSingle();

  if (!row) {
    return {
      clientEmail: normalizedEmail,
      emailCriticalAlerts: true,
      emailStageMilestones: true,
      emailMessages: true,
      emailWeeklyDigest: false,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    clientEmail: row.client_email,
    emailCriticalAlerts: row.email_critical_alerts,
    emailStageMilestones: row.email_stage_milestones,
    emailMessages: row.email_messages,
    emailWeeklyDigest: row.email_weekly_digest,
    updatedAt: row.updated_at,
  };
}

export async function updateNotificationPreferences(
  clientEmail: string,
  prefs: {
    emailCriticalAlerts?: boolean;
    emailStageMilestones?: boolean;
    emailMessages?: boolean;
    emailWeeklyDigest?: boolean;
  }
): Promise<boolean> {
  const normalizedEmail = clientEmail.trim().toLowerCase();
  const existing = await getNotificationPreferences(normalizedEmail);

  const payload = {
    client_email: normalizedEmail,
    email_critical_alerts: prefs.emailCriticalAlerts ?? existing.emailCriticalAlerts,
    email_stage_milestones: prefs.emailStageMilestones ?? existing.emailStageMilestones,
    email_messages: prefs.emailMessages ?? existing.emailMessages,
    email_weekly_digest: prefs.emailWeeklyDigest ?? existing.emailWeeklyDigest,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("client_notification_preferences")
    .upsert(payload, { onConflict: "client_email" });

  return !error;
}
