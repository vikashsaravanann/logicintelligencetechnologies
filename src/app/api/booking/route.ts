import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { insertLead } from "@/lib/forms/persist";
import { enqueueEmail } from "@/lib/email/outbox";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required").max(100),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  consultationType: z.string().min(2).max(100),
  slotTime: z.string().min(5),
  timezone: z.string().min(2).max(100).default("Asia/Kolkata"),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`booking:${clientIp(req)}`, 8, 15 * 60_000)) {
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
    const validated = parsed.data;

    const stored = await insertLead("bookings", {
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      company: validated.company || null,
      consultation_type: validated.consultationType,
      slot_time: validated.slotTime,
      timezone: validated.timezone,
      notes: validated.notes || null,
      status: "Scheduled",
    });

    if (!stored.ok) {
      return NextResponse.json({ success: false, message: stored.message }, { status: 503 });
    }

    try {
      await enqueueEmail({
        recipient: validated.email,
        subject: `Consultation Confirmed: ${validated.consultationType} with Logic Intelligence Technologies`,
        templateId: "consultation_confirmed",
        metadata: {
          bookingId: stored.id,
          name: validated.name,
          slotTime: validated.slotTime,
          timezone: validated.timezone,
          consultationType: validated.consultationType,
        },
      });
    } catch (emailErr) {
      console.warn("[Booking Outbox Warning]", emailErr);
    }

    return NextResponse.json(
      { success: true, bookingId: stored.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Booking API Error]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
