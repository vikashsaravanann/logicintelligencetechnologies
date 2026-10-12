import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  canApproveEnquiry,
  markMessageDeclined,
  inMemoryReservationStore,
  type EnquiryState,
} from "@/lib/automations/enquiry-adapter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1. Authenticate admin / operations actor
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { threadId, messageId, decision, notes } = body;

    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'threadId'" },
        { status: 400 }
      );
    }

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'messageId'" },
        { status: 400 }
      );
    }

    if (!["approved", "declined", "needs_review"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "Invalid decision. Allowed values: 'approved', 'declined', 'needs_review'" },
        { status: 400 }
      );
    }

    // 2. Fetch existing enquiry state
    let submittedBy: string | null = null;
    let currentStatus: EnquiryState = "pending_approval";

    try {
      if (supabaseAdmin && typeof supabaseAdmin.from === "function") {
        const { data } = await supabaseAdmin
          .from("customer_enquiry_threads")
          .select("status, submitted_by")
          .eq("thread_id", threadId)
          .maybeSingle();

        if (data) {
          if (data.status) currentStatus = data.status as EnquiryState;
          if (data.submitted_by) submittedBy = data.submitted_by;
        }
      }
    } catch {
      // Non-fatal, fallback to in-memory status
    }

    // If still in memory store, get status
    const memStatus = inMemoryReservationStore.getStatus(messageId);
    if (memStatus) {
      currentStatus = memStatus;
    }

    // 3. Dual-Control & Authorization Check
    const check = canApproveEnquiry(
      { userId: auth.userId, email: auth.email, role: auth.role },
      { threadId, messageId, submittedBy, status: currentStatus }
    );

    if (!check.allowed) {
      return NextResponse.json(
        { success: false, error: check.reason },
        { status: 403 }
      );
    }

    const decidedAt = new Date().toISOString();
    const targetStatus: EnquiryState =
      decision === "approved"
        ? "approved"
        : decision === "declined"
        ? "declined"
        : "needs_review";

    // 4. Update status in memory
    if (decision === "declined") {
      await markMessageDeclined(messageId, threadId, notes ?? "Declined by operator", auth.email ?? undefined);
    } else {
      // Update in-memory reservation status if present
      const res = inMemoryReservationStore.getStatus(messageId);
      if (res) {
        // Find token and update
      }
    }

    // 5. Persist to database if available
    try {
      if (supabaseAdmin && typeof supabaseAdmin.from === "function") {
        await supabaseAdmin
          .from("customer_enquiry_threads")
          .update({
            status: targetStatus,
            updated_at: decidedAt,
            metadata: {
              lastDecision: {
                decision,
                decidedAt,
                decidedBy: auth.email,
                notes: notes ?? null,
              },
            },
          })
          .eq("thread_id", threadId);

        await supabaseAdmin
          .from("customer_enquiry_messages")
          .update({
            status: targetStatus,
            updated_at: decidedAt,
          })
          .eq("message_id", messageId);

        await supabaseAdmin
          .from("customer_enquiry_approvals")
          .insert({
            message_id: messageId,
            thread_id: threadId,
            approver_email: auth.email ?? "unknown",
            approver_role: auth.role,
            decision,
            notes: notes ?? null,
            decided_at: decidedAt,
          });
      }
    } catch (dbErr) {
      console.error("[enquiry/approve] DB persist warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      threadId,
      messageId,
      decision,
      status: targetStatus,
      decidedBy: auth.email,
      decidedAt,
      notes: notes ?? null,
    });
  } catch (err) {
    console.error("[enquiry/approve] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
