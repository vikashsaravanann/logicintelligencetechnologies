import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ ticketId: string }> | { ticketId: string } }
) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { ticketId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const { data: ticket } = await supabaseAdmin
      .from("support_tickets")
      .select("id, assigned_staff_id, requester_email, status")
      .eq("id", ticketId)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (ticket.assigned_staff_id && ticket.assigned_staff_id !== session.userId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { data: emp } = await supabaseAdmin
      .from("staff_employees")
      .select("full_name")
      .eq("auth_user_id", session.userId)
      .maybeSingle();

    const { error: insErr } = await supabaseAdmin.from("support_ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: session.userId,
      sender_type: "staff",
      sender_name: emp?.full_name || session.email || "Staff",
      message,
    });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    await supabaseAdmin
      .from("support_tickets")
      .update({ status: ticket.status === "new" ? "in_progress" : ticket.status })
      .eq("id", ticketId);

    if (ticket.requester_email) {
      try {
        await supabaseAdmin.from("client_notifications").insert({
          client_email: ticket.requester_email.toLowerCase(),
          title: "Support ticket update",
          message: message.slice(0, 200),
          category: "support",
          action_url: "/client/support",
          action_label: "View ticket",
        });
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "REPLY_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
