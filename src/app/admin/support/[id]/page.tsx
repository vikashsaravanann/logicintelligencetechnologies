import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import BackToHome from "@/components/ui/back-to-home";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SupportTicketActions } from "./support-ticket-actions";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { formatIST } from "@/lib/format/datetime";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Ticket Details | Admin Command Center",
};

export default async function AdminSupportDetailPage({ params }: Props) {
  await requireCapabilityPage("support.read", "/admin/support");
  const { id } = await params;
  await requireAdminPage(`/admin/support/${id}`);

  const { data: ticket, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const { data: messages } = await supabaseAdmin
    .from("support_ticket_messages")
    .select("id, sender_type, sender_name, message, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <BackToHome href="/admin/support" label="Back to Support" inline />

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 space-y-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest block mb-1">
              Ticket ID: {ticket.id}
            </span>
            <h1 className="uppercase text-2xl font-bold text-white">{ticket.subject}</h1>
            <p className="text-xs text-neutral-400 mt-1">Submitted by: {ticket.requester_email || "Linked client account"}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
              ticket.status === "Open"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {ticket.status}
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Original Submission
          </h2>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
            {ticket.message}
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Conversation</h2>
          {messages && messages.length > 0 ? (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`rounded-xl border p-4 text-sm ${
                    m.sender_type === "agent"
                      ? "border-primary/20 bg-primary/5"
                      : "border-neutral-800 bg-neutral-950"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-semibold text-neutral-300">
                      {m.sender_name}
                      <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neutral-400 ring-1 ring-neutral-700">
                        {m.sender_type}
                      </span>
                    </span>
                    <span>{formatIST(m.created_at, "datetime")}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed text-neutral-300">{m.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500">No replies yet.</p>
          )}
        </div>

        <div className="pt-4">
          <SupportTicketActions ticketId={ticket.id} email={ticket.requester_email || "linked client"} status={ticket.status} />
        </div>

        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
          <span>Opened: {formatIST(ticket.created_at, "datetime")}</span>
        </div>
      </div>
    </div>
  );
}
