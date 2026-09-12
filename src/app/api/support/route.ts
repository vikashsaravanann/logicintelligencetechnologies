import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ticketSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ticketSchema.parse(body);

    // Look up or create guest user_id placeholder or insert with admin bypass
    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        subject: `[${validated.priority}] ${validated.subject}`,
        message: `From: ${validated.name} (${validated.email})\n\n${validated.message}`,
        status: "Open",
      })
      .select()
      .single();

    if (error) {
      console.error("[Support API Error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ticketId: ticket.id }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
