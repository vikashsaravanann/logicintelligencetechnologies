import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TicketReplyForm } from "./TicketReplyForm";

export const dynamic = "force-dynamic";

export default async function StaffTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }> | { ticketId: string };
}) {
  const { ticketId } = await params;
  const ctx = await requireStaffPortal(`/staff/support/${ticketId}`);

  const { data: ticket } = await supabaseAdmin
    .from("support_tickets")
    .select(
      "id, ticket_ref, subject, message, status, severity, priority, requester_email, requester_name, engagement_id, assigned_staff_id, created_at"
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) notFound();
  if (ticket.assigned_staff_id && ticket.assigned_staff_id !== ctx.userId && !ctx.isSuperAdmin) {
    notFound();
  }

  const { data: messages } = await supabaseAdmin
    .from("support_ticket_messages")
    .select("id, sender_type, sender_name, message, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <Link href="/staff/support" className="text-xs font-medium text-teal-700 hover:underline">
        ← Support
      </Link>
      <div>
        <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
        <p className="text-xs text-slate-500">
          {ticket.ticket_ref || ticket.id.slice(0, 8)} · {ticket.status}
          {ticket.requester_email ? ` · ${ticket.requester_email}` : ""}
        </p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm whitespace-pre-wrap">
        {ticket.message}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Conversation</h2>
        {(messages || []).map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              m.sender_type === "staff" ? "border-teal-100 bg-teal-50" : "border-slate-100 bg-slate-50"
            }`}
          >
            <p className="text-[11px] font-semibold text-slate-500">{m.sender_name || m.sender_type}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <p className="text-sm text-slate-500">No replies yet.</p>
        )}
      </section>
      <TicketReplyForm ticketId={ticket.id} />
    </div>
  );
}
