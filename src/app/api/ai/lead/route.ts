import { NextResponse } from "next/server";
import { captureLead } from "@/lib/ai/tools";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";
import { isValidEmail } from "@/lib/email/validation";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).refine(isValidEmail),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  interest: z.string().max(500).optional(),
  source: z.enum(["chat_widget", "ai_page"]).optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Shared server-controlled ceiling: spoofing IP headers cannot bypass this.
  if (!(await rateLimit("ai:enquiry:global:day", 200, 24 * 60 * 60_000)) ||
      !(await rateLimit(`lead:${clientIp(request)}`, 8, 10 * 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }
  try {
    // No public email existence probe; unknown fields never set ownership.
    const parsed = leadSchema.safeParse(await readBoundedAiJson(request));
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid enquiry." }, { status: 400 });
    const body = parsed.data;
    const result = await captureLead({
      ...body,
      email: body.email.toLowerCase(),
      source: body.source || "ai_page",
      userId: null,
      chatId: null,
    });
    return NextResponse.json(result.ok
      ? { ok: true, message: "Your enquiry has been received." }
      : { ok: false, error: "Could not save details." }, { status: result.ok ? 200 : 500 });
  } catch (err) {
    if (err instanceof InvalidAiRequest) return NextResponse.json({ ok: false, error: "Invalid enquiry." }, { status: 400 });
    console.error("[api/ai/lead] request failed");
    return NextResponse.json({ ok: false, error: "Could not save details." }, { status: 500 });
  }
}
