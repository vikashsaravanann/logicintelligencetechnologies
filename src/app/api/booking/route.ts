import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enqueueEmail } from "@/lib/email/outbox";

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
    const body = await req.json();
    const validated = bookingSchema.parse(body);

    // 1. Insert into bookings table
    const { data: booking, error: dbError } = await supabaseAdmin
      .from("bookings")
      .insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        company: validated.company || null,
        consultation_type: validated.consultationType,
        slot_time: validated.slotTime,
        timezone: validated.timezone,
        notes: validated.notes || null,
        status: "Scheduled",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[Booking API Error]", dbError);
      return NextResponse.json(
        { error: "Failed to store booking reservation." },
        { status: 500 }
      );
    }

    // 2. Queue Email Confirmation via Atomic Outbox
    try {
      await enqueueEmail({
        recipient: validated.email,
        subject: `Consultation Confirmed: ${validated.consultationType} with Logic Intelligence Technologies`,
        templateId: "consultation_confirmed",
        metadata: {
          bookingId: booking.id,
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
      { success: true, bookingId: booking.id },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid booking inputs", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
