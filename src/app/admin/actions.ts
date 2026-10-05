"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { revalidatePath } from "next/cache";
import AdminGenericEmail from "@/emails/admin-generic-email";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { isValidEmail } from "@/lib/email/validation";
import { z } from "zod";

export async function resolveSupportTicket(ticketId: string) {
  await requireAdminAction();
  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status: "Resolved" })
    .eq("id", ticketId);

  if (error) throw new Error("Could not resolve ticket");
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await requireAdminAction();
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw new Error("Could not update booking");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function sendAdminEmail(to: string, subject: string, message: string) {
  await requireAdminAction();
  const { success, message: emailMsg } = await sendEmail({
    to,
    subject,
    from: "admin",
    category: "transactional",
    react: AdminGenericEmail({ message }),
  });

  if (!success) {
    throw new Error("Could not send email");
  }
  return { success: true };
}

/** Resolve recipient from the ticket, never an email supplied by the browser. */
export async function replyToSupportTicket(ticketId: string, message: string) {
  await requireAdminAction();
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
  const result = await sendEmail({ to: recipient, subject: `Re: Support Ticket #${ticketId}`,
    from: "support", category: "transactional", react: AdminGenericEmail({ message }) });
  if (!result.success) throw new Error("Could not send reply");
  return { success: true };
}
