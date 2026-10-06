"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { revalidatePath } from "next/cache";
import AdminGenericEmail from "@/emails/admin-generic-email";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction, type StaffActor } from "@/lib/admin/audit";
import { isValidEmail } from "@/lib/email/validation";
import { z } from "zod";

const actorOf = (s: { userId: string; email: string | null; role: string }): StaffActor => ({
  userId: s.userId,
  email: s.email,
  role: s.role,
});

export async function resolveSupportTicket(ticketId: string) {
  const session = await requireCapabilityAction("support.reply", "support.resolve");
  const actor = actorOf(session);
  if (!z.string().uuid().safeParse(ticketId).success) {
    await recordAdminAction({ actor, action: "support.resolve", capability: "support.reply", outcome: "failed", errorCode: "invalid_id" });
    throw new Error("Invalid ticket");
  }
  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status: "Resolved" })
    .eq("id", ticketId);

  await recordAdminAction({
    actor, action: "support.resolve", capability: "support.reply",
    target: { type: "support_ticket", id: ticketId },
    outcome: error ? "failed" : "succeeded",
    errorCode: error?.code,
  });
  if (error) throw new Error("Could not resolve ticket");
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}

const BOOKING_STATUS = z.enum(["Scheduled", "Completed", "Cancelled", "Rescheduled"]);

export async function updateBookingStatus(bookingId: string, status: string) {
  const session = await requireCapabilityAction("bookings.write", "booking.status_change");
  const actor = actorOf(session);
  const idOk = z.string().uuid().safeParse(bookingId).success;
  const parsed = BOOKING_STATUS.safeParse(status);
  if (!idOk || !parsed.success) {
    await recordAdminAction({ actor, action: "booking.status_change", capability: "bookings.write", outcome: "failed", errorCode: "invalid_input" });
    throw new Error("Invalid booking update");
  }
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: parsed.data })
    .eq("id", bookingId);

  await recordAdminAction({
    actor, action: "booking.status_change", capability: "bookings.write",
    target: { type: "booking", id: bookingId },
    outcome: error ? "failed" : "succeeded",
    metadata: { status: parsed.data },
    errorCode: error?.code,
  });
  if (error) throw new Error("Could not update booking");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function sendAdminEmail(to: string, subject: string, message: string) {
  const session = await requireCapabilityAction("emails.send", "email.send_adhoc");
  const actor = actorOf(session);
  if (!isValidEmail(to) || typeof subject !== "string" || !subject.trim() || subject.length > 300 ||
      typeof message !== "string" || !message.trim() || message.length > 10000) {
    await recordAdminAction({ actor, action: "email.send_adhoc", capability: "emails.send", outcome: "failed", errorCode: "invalid_input" });
    throw new Error("Invalid email");
  }
  const { success, skipped } = await sendEmail({
    to,
    subject,
    from: "admin",
    category: "transactional",
    react: AdminGenericEmail({ message }),
  });

  await recordAdminAction({
    actor, action: "email.send_adhoc", capability: "emails.send",
    target: { type: "email", id: to },
    outcome: success ? "succeeded" : "failed",
    metadata: { subject, delivered: success && !skipped, skipped: Boolean(skipped) },
  });
  if (!success) throw new Error("Could not send email");
  return { success: true, delivered: !skipped };
}

/** Resolve recipient from the ticket, never an email supplied by the browser. */
export async function replyToSupportTicket(ticketId: string, message: string) {
  const session = await requireCapabilityAction("support.reply", "support.reply");
  const actor = actorOf(session);
  if (!z.string().uuid().safeParse(ticketId).success || typeof message !== "string" ||
      !message.trim() || message.length > 10000) throw new Error("Invalid reply");
  const { data: ticket, error } = await supabaseAdmin.from("support_tickets")
    .select("requester_email, user_id").eq("id", ticketId).single();
  if (error || !ticket) throw new Error("Ticket not found");
  let recipient = ticket.requester_email;
  if (!recipient && ticket.user_id) {
    const { data } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);
    recipient = data.user?.email;
  }
  if (!recipient || !isValidEmail(recipient)) throw new Error("No valid ticket recipient");

  // Persist the reply to the ticket thread first, so the conversation is
  // recorded even if the email send is skipped or fails.
  const { error: msgError } = await supabaseAdmin.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "agent",
    sender_id: session.userId,
    sender_name: session.email ?? "LIT Support",
    message,
  });
  if (msgError) {
    await recordAdminAction({
      actor, action: "support.reply", capability: "support.reply",
      target: { type: "support_ticket", id: ticketId }, outcome: "failed", errorCode: "thread_insert_failed",
    });
    throw new Error("Could not record the reply");
  }

  const result = await sendEmail({ to: recipient, subject: `Re: Support Ticket #${ticketId}`,
    from: "support", category: "transactional", react: AdminGenericEmail({ message }) });
  await recordAdminAction({
    actor, action: "support.reply", capability: "support.reply",
    target: { type: "support_ticket", id: ticketId },
    outcome: result.success ? "succeeded" : "failed",
    metadata: { delivered: result.success && !result.skipped, emailStatus: result.status },
  });
  revalidatePath(`/admin/support/${ticketId}`);
  // The reply is saved to the thread regardless; report the real email status.
  return { success: true, emailDelivered: result.success && !result.skipped };
}
