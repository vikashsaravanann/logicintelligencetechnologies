import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { getEngagementByRef } from "@/lib/engagements/db";
import { listClientMessages, postStaffReplyMessage } from "@/lib/client-portal/messages";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const engagement = await getEngagementByRef(id);
    if (!engagement) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    // Verify staff assignment or super_admin
    if (session.role !== "super_admin") {
      const { data: assignment } = await supabaseAdmin
        .from("staff_client_assignments")
        .select("id")
        .eq("staff_user_id", session.userId)
        .eq("engagement_id", engagement.id)
        .eq("status", "active")
        .maybeSingle();

      if (!assignment) {
        return NextResponse.json({ ok: false, error: "Forbidden: Not assigned to project" }, { status: 403 });
      }
    }

    const threadResult = await listClientMessages(engagement.contact_email);
    return NextResponse.json({ ok: true, messages: threadResult.messages, threadId: threadResult.threadId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const engagement = await getEngagementByRef(id);
    if (!engagement) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    // Verify staff assignment or super_admin
    let staffRole = session.role === "super_admin" ? "Super Admin" : "Engineering Delivery";
    if (session.role !== "super_admin") {
      const { data: assignment } = await supabaseAdmin
        .from("staff_client_assignments")
        .select("id, assignment_role")
        .eq("staff_user_id", session.userId)
        .eq("engagement_id", engagement.id)
        .eq("status", "active")
        .maybeSingle();

      if (!assignment) {
        return NextResponse.json({ ok: false, error: "Forbidden: Not assigned to project" }, { status: 403 });
      }
      staffRole = assignment.assignment_role ? assignment.assignment_role.replace("_", " ") : "Engineering Delivery";
    }

    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length < 2) {
      return NextResponse.json({ ok: false, error: "Message content is required" }, { status: 400 });
    }

    const message = await postStaffReplyMessage({
      clientEmail: engagement.contact_email,
      staffEmail: session.email || "staff@logicintelligencetechnologies.in",
      staffName: (session as any).fullName || (session.email ? session.email.split("@")[0] : "LIT Engineering"),
      staffRole,
      content,
    });

    return NextResponse.json({ ok: true, message }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
