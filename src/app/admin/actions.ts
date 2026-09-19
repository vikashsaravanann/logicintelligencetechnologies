"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { COMPANY } from "@/config/company";
import { revalidatePath } from "next/cache";
import AdminGenericEmail from "@/emails/admin-generic-email";

export async function resolveSupportTicket(ticketId: string) {
  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status: "Resolved" })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function sendAdminEmail(to: string, subject: string, message: string) {
  const { success, message: emailMsg } = await sendEmail({
    to,
    subject,
    from: "admin",
    category: "transactional",
    react: AdminGenericEmail({ message }),
  });

  if (!success) {
    throw new Error(emailMsg);
  }
  return { success: true };
}
