import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { z } from "zod";
import { insertLead } from "@/lib/forms/persist";
import { sendEmail } from "@/lib/email/send-email";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { sanitizePersonName, sanitizeMultilineText } from "@/lib/email/validation";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required").max(254),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  consultationType: z.string().min(2).max(100),
  slotTime: z.string().min(5).max(80),
  timezone: z.string().min(2).max(100).default("Asia/Kolkata"),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`booking:${clientIp(req)}`, 8, 15 * 60_000))) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid booking inputs" },
        { status: 400 }
      );
    }

    const name = sanitizePersonName(parsed.data.name);
    const email = parsed.data.email.trim().toLowerCase();
    const phone = parsed.data.phone ? sanitizePersonName(parsed.data.phone, 40) : "";
    const company = parsed.data.company ? sanitizePersonName(parsed.data.company, 160) : "";
    const consultationType = sanitizePersonName(parsed.data.consultationType, 100);
    const rawSlotTime = parsed.data.slotTime.trim();
    const timezone = sanitizePersonName(parsed.data.timezone || "Asia/Kolkata", 100);
    const notes = sanitizeMultilineText(parsed.data.notes || "", 2000);

    // Defensively normalize any input slotTime to valid ISO 8601 UTC timestamp
    function normalizeSlotTimeToIso(raw: string): string {
      // 1. Try standard Date parsing if no AM/PM
      if (!raw.includes("AM") && !raw.includes("PM")) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      // 2. Parse date and 12-hour or 24-hour time components
      const dateMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
      const timeMatch = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
      const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
      let hours = 10;
      let mins = "00";
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        mins = timeMatch[2];
        const modifier = timeMatch[4];
        if (modifier) {
          if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
      }
      return `${dateStr}T${String(hours).padStart(2, "0")}:${mins}:00.000Z`;
    }

    const normalizedSlotTime = normalizeSlotTimeToIso(rawSlotTime);

    // Initial status is 'received' per state machine (received -> pending_scheduling -> offered -> confirmed)
    const stored = await insertLead("bookings", {
      name,
      email,
      phone: phone || null,
      company: company || null,
      consultation_type: consultationType,
      slot_time: normalizedSlotTime,
      timezone,
      notes: notes || null,
      status: "received",
    });

    if (!stored.ok) {
      console.error("[Booking API] Insert failed for normalized slot:", normalizedSlotTime);
      return NextResponse.json({ success: false, message: stored.message }, { status: 503 });
    }

    const idemBase = stored.id;
    const requirements = [
      `Type: ${consultationType}`,
      `Slot: ${normalizedSlotTime}`,
      `Timezone: ${timezone}`,
      phone ? `Phone: ${phone}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const internal = await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "noReply",
        replyTo: email,
        subject: `New consultation booking: ${name} — ${consultationType}`,
        category: "transactional",
        eventType: "booking-internal",
        templateKey: "new-lead-notification-email",
        idempotencyKey: `booking:${idemBase}:internal`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName: name,
          companyName: company || "—",
          email,
          phone: phone || "—",
          service: consultationType,
          requirements,
          submissionDate: new Date().toISOString(),
        }),
      });
      if (!internal.success) {
        console.error("[Booking Email] internal failed:", internal.message);
      }
    } catch (emailErr) {
      console.error("[Booking Email] internal exception:", emailErr);
    }

    try {
      const customer = await sendEmail({
        to: email,
        from: "hello",
        subject: "Consultation received — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "booking-confirmation",
        templateKey: "lead-confirmation-email",
        idempotencyKey: `booking:${idemBase}:customer`,
        react: React.createElement(LeadConfirmationEmail, {
          fullName: name,
          service: consultationType,
        }),
      });
      if (!customer.success) {
        console.error("[Booking Email] customer failed:", customer.message);
      }
    } catch (emailErr) {
      console.error("[Booking Email] customer exception:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        requestId: stored.id,
        bookingId: stored.id,
        status: "received",
        notificationStatus: "queued",
        message: "Your consultation request has been received. Our team will verify calendar availability and confirm your booking.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Booking API Error]", err);
    return NextResponse.json(
      { success: false, message: "Could not schedule the consultation. Please try again." },
      { status: 500 }
    );
  }
}
