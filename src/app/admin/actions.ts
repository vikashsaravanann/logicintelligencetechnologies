"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { revalidatePath } from "next/cache";
import AdminGenericEmail from "@/emails/admin-generic-email";
import ConsultationBookingConfirmationEmail from "@/emails/consultation-booking-confirmation-email";
import {
  generateConsultationIcs,
  getGoogleCalendarUrl,
  formatConsultationDateTime,
  getConsultationDurationMinutes,
  DEFAULT_CONSULTATION_MEETING_URL,
} from "@/lib/calendar/consultation-ics";
import * as React from "react";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction, type StaffActor } from "@/lib/admin/audit";
import { isValidEmail } from "@/lib/email/validation";
import { COMPANY } from "@/config/company";
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

const SUPPORT_STATUS = z.enum(["Open", "In Progress", "Waiting on Client", "Resolved", "Closed"]);
const SUPPORT_PRIORITY = z.enum(["Urgent", "High", "Medium", "Low"]);

export async function updateSupportTicketStatus(ticketId: string, status: string) {
  const session = await requireCapabilityAction("support.reply", "support.status_change");
  const actor = actorOf(session);
  const idOk = z.string().uuid().safeParse(ticketId).success;
  const parsed = SUPPORT_STATUS.safeParse(status);
  if (!idOk || !parsed.success) {
    await recordAdminAction({ actor, action: "support.status_change", capability: "support.reply", outcome: "failed", errorCode: "invalid_input" });
    throw new Error("Invalid ticket status");
  }
  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status: parsed.data })
    .eq("id", ticketId);

  await recordAdminAction({
    actor, action: "support.status_change", capability: "support.reply",
    target: { type: "support_ticket", id: ticketId },
    outcome: error ? "failed" : "succeeded",
    metadata: { status: parsed.data },
    errorCode: error?.code,
  });
  if (error) throw new Error("Could not update ticket status");
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}

export async function updateSupportTicketPriority(ticketId: string, priority: string) {
  const session = await requireCapabilityAction("support.reply", "support.priority_change");
  const actor = actorOf(session);
  const idOk = z.string().uuid().safeParse(ticketId).success;
  const parsed = SUPPORT_PRIORITY.safeParse(priority);
  if (!idOk || !parsed.success) {
    await recordAdminAction({ actor, action: "support.priority_change", capability: "support.reply", outcome: "failed", errorCode: "invalid_input" });
    throw new Error("Invalid ticket priority");
  }
  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ priority: parsed.data })
    .eq("id", ticketId);

  await recordAdminAction({
    actor, action: "support.priority_change", capability: "support.reply",
    target: { type: "support_ticket", id: ticketId },
    outcome: error ? "failed" : "succeeded",
    metadata: { priority: parsed.data },
    errorCode: error?.code,
  });
  if (error) throw new Error("Could not update ticket priority");
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}

export async function addSupportInternalNote(ticketId: string, note: string) {
  const session = await requireCapabilityAction("support.reply", "support.internal_note");
  const actor = actorOf(session);
  if (!z.string().uuid().safeParse(ticketId).success || typeof note !== "string" || !note.trim() || note.length > 10000) {
    await recordAdminAction({ actor, action: "support.internal_note", capability: "support.reply", outcome: "failed", errorCode: "invalid_input" });
    throw new Error("Invalid note");
  }

  const { error: msgError } = await supabaseAdmin.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "internal",
    sender_id: session.userId,
    sender_name: session.email ?? "Internal Staff",
    message: note.trim(),
  });

  if (msgError) {
    await recordAdminAction({
      actor, action: "support.internal_note", capability: "support.reply",
      target: { type: "support_ticket", id: ticketId }, outcome: "failed", errorCode: "thread_insert_failed",
    });
    throw new Error("Could not record internal note");
  }

  await recordAdminAction({
    actor, action: "support.internal_note", capability: "support.reply",
    target: { type: "support_ticket", id: ticketId }, outcome: "succeeded",
  });

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

export async function sendConsultationConfirmationAction(
  bookingId: string,
  customMeetingUrl?: string,
  customSlotTime?: string
) {
  const session = await requireCapabilityAction("bookings.write", "booking.send_confirmation");
  const actor = actorOf(session);

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    await recordAdminAction({
      actor,
      action: "booking.send_confirmation",
      capability: "bookings.write",
      outcome: "failed",
      errorCode: "booking_not_found",
    });
    throw new Error("Booking record not found");
  }

  const meetingUrl = (customMeetingUrl && customMeetingUrl.trim()) || booking.calendar_event_id || DEFAULT_CONSULTATION_MEETING_URL;
  const slotTime = (customSlotTime && customSlotTime.trim()) || booking.slot_time;

  // Persist updated status, real meeting URL, and slot time in database
  await supabaseAdmin
    .from("bookings")
    .update({
      status: "Scheduled",
      calendar_event_id: meetingUrl,
      slot_time: slotTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  const durationMinutes = getConsultationDurationMinutes(booking.consultation_type || "");
  const durationLabel = `${durationMinutes} Mins`;
  const slotFormatted = formatConsultationDateTime(slotTime, booking.timezone || "Asia/Kolkata");

  const calendarDescription = [
    `Technical Consultation: ${booking.consultation_type}`,
    `Client: ${booking.name}${booking.company ? ` (${booking.company})` : ""}`,
    `Scheduled Time: ${slotFormatted}`,
    booking.notes ? `Agenda / Notes: ${booking.notes}` : "",
    `Join Video Teleconference: ${meetingUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const icsContent = generateConsultationIcs({
    bookingId: booking.id,
    title: `LIT Consultation: ${booking.consultation_type} — ${booking.name}`,
    description: calendarDescription,
    startTime: slotTime,
    durationMinutes,
    meetingUrl,
    attendeeEmail: booking.email,
    attendeeName: booking.name,
  });

  const calendarAddUrl = getGoogleCalendarUrl({
    title: `LIT Consultation: ${booking.consultation_type}`,
    description: calendarDescription,
    startTime: slotTime,
    durationMinutes,
    meetingUrl,
  });

  const emailRes = await sendEmail({
    to: booking.email,
    from: "hello",
    subject: `Consultation Confirmed: ${booking.consultation_type} — Logic Intelligence Technologies`,
    category: "transactional",
    eventType: "booking-confirmation",
    templateKey: "consultation-booking-confirmation-email",
    idempotencyKey: `consultation-dispatch:${booking.id}:${Date.now()}`,
    attachments: [
      {
        filename: "consultation-invitation.ics",
        content: icsContent,
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
      },
    ],
    react: React.createElement(ConsultationBookingConfirmationEmail, {
      fullName: booking.name,
      consultationType: booking.consultation_type,
      bookingRef: booking.id,
      slotFormatted,
      timezone: `${booking.timezone || "Asia/Kolkata"} (${(booking.timezone || "Asia/Kolkata") === "Asia/Kolkata" ? "IST · UTC+05:30" : booking.timezone})`,
      duration: durationLabel,
      meetingUrl,
      calendarAddUrl,
      companyName: booking.company || undefined,
      notes: booking.notes || undefined,
    }),
  });

  if (!emailRes.success) {
    await recordAdminAction({
      actor,
      action: "booking.send_confirmation",
      capability: "bookings.write",
      target: { type: "booking", id: bookingId },
      outcome: "failed",
      errorCode: emailRes.errorCode || "email_delivery_failed",
    });
    throw new Error(emailRes.message || "Could not dispatch consultation confirmation email.");
  }

  await recordAdminAction({
    actor,
    action: "booking.send_confirmation",
    capability: "bookings.write",
    target: { type: "booking", id: bookingId },
    outcome: "succeeded",
    metadata: {
      recipient: booking.email,
      messageId: emailRes.messageId,
      delivered: true,
    },
  });

  revalidatePath("/admin/bookings");
  return { success: true, messageId: emailRes.messageId, recipient: booking.email };
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
    from: "hello",
    replyTo: COMPANY.emails.hello,
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

  const result = await sendEmail({
    to: recipient,
    subject: `Re: Support Ticket #${ticketId}`,
    from: "hello",
    replyTo: COMPANY.emails.support,
    category: "transactional",
    react: AdminGenericEmail({ message }),
  });
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
