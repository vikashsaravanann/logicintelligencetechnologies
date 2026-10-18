/**
 * Client-to-Staff Routing Service
 *
 * Implements deterministic routing for client communications:
 * - Messages, Change Requests (RFCs), Meetings, Support Tickets
 * - Resolves assigned project leads from active database assignments
 * - Enqueues unassigned items into Super Admin triage queue (never silently drops)
 * - Sends transactional notification to assigned staff
 */

import React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import ClientRequestRoutedEmail from "@/emails/client-request-routed-email";

export type ClientRequestType =
  | "message"
  | "change_request"
  | "meeting"
  | "support_ticket"
  | "document_review";

export interface RoutingPayload {
  engagementId?: string | null;
  requestType: ClientRequestType;
  sourceId: string;
  clientEmail: string;
  summary: string;
  details?: Record<string, any>;
  baseUrl?: string;
}

export interface RoutingResult {
  routedTo: "assigned_staff" | "triage_queue";
  assignedStaffUserId?: string;
  assignedStaffEmail?: string;
  triageId?: string;
}

/**
 * Routes a client request to assigned staff or enqueues it to the Super Admin triage queue.
 */
export async function routeClientRequest(payload: RoutingPayload): Promise<RoutingResult> {
  const {
    engagementId,
    requestType,
    sourceId,
    clientEmail,
    summary,
    details = {},
    baseUrl = "https://www.logicintelligencetechnologies.in",
  } = payload;

  let assignedStaff: { userId: string; email: string; name: string } | null = null;

  // 1. Look for active assigned staff if engagementId is supplied
  if (engagementId) {
    const { data: assignments } = await supabaseAdmin
      .from("staff_client_assignments")
      .select(`
        staff_user_id,
        is_primary_lead,
        assignment_role,
        profiles:staff_user_id (id, email, full_name)
      `)
      .eq("engagement_id", engagementId)
      .eq("status", "active")
      .order("is_primary_lead", { ascending: false }); // Primary lead first

    if (assignments && assignments.length > 0) {
      const top = assignments[0];
      const p = (top as any).profiles;
      if (p?.email) {
        assignedStaff = {
          userId: p.id,
          email: p.email,
          name: p.full_name || "LIT Lead Engineer",
        };
      }
    }
  }

  // 2. If assigned staff found, dispatch notification and return
  if (assignedStaff) {
    try {
      const { notifyStaff } = await import("@/lib/staff/notifications");
      const typeMap: Record<string, "client.message" | "client.support_ticket" | "client.change_request" | "client.meeting" | "document.review"> = {
        message: "client.message",
        support_ticket: "client.support_ticket",
        change_request: "client.change_request",
        meeting: "client.meeting",
        document_review: "document.review",
      };
      await notifyStaff({
        recipientUserId: assignedStaff.userId,
        engagementId: engagementId || null,
        eventType: typeMap[requestType] || "client.message",
        title: `Client ${requestType.replace(/_/g, " ")}`,
        summary: summary.slice(0, 200),
        sourceId: sourceId,
        actionUrl:
          requestType === "support_ticket"
            ? "/staff/support"
            : requestType === "change_request"
              ? "/staff/change-requests"
              : engagementId
                ? `/staff/projects/${engagementId}`
                : "/staff/messages",
        idempotencyKey: `route:${requestType}:${sourceId}:${assignedStaff.userId}`,
      });

      await sendEmail({
        to: assignedStaff.email,
        subject: `[Client Request] New ${requestType.replace("_", " ")}: ${summary.slice(0, 50)} | LIT`,
        from: "operations",
        category: "operational",
        templateKey: "client-request-routed",
        idempotencyKey: `client-req-${sourceId}`,
        react: React.createElement(ClientRequestRoutedEmail, {
          staffName: assignedStaff.name,
          requestType: requestType.replace("_", " ").toUpperCase(),
          summary,
          clientEmail,
          actionUrl: `${baseUrl}/admin/command-center`,
        }),
      });
    } catch (err: any) {
      console.error("Failed to notify assigned staff:", err?.message);
    }

    return {
      routedTo: "assigned_staff",
      assignedStaffUserId: assignedStaff.userId,
      assignedStaffEmail: assignedStaff.email,
    };
  }

  // 3. Fallback: Enqueue into Super Admin triage queue so nothing is lost
  const { data: triageItem, error: triageErr } = await supabaseAdmin
    .from("project_triage_queue")
    .insert({
      engagement_id: engagementId || null,
      request_type: requestType,
      source_id: sourceId,
      client_email: clientEmail,
      summary,
      status: "pending_assignment",
    })
    .select()
    .single();

  if (triageErr) {
    console.error("Failed to insert into triage queue:", triageErr.message);
  }

  return {
    routedTo: "triage_queue",
    triageId: triageItem?.id,
  };
}
