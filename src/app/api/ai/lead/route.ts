import { NextResponse } from "next/server";
import { captureLead, emailAlreadyCaptured } from "@/lib/ai/tools";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`lead:${clientIp(request)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (body.check) {
      if (!email.includes("@")) return NextResponse.json({ ok: true, exists: false });
      return NextResponse.json({ ok: true, exists: await emailAlreadyCaptured(email) });
    }
    const name = String(body.name || "").trim();
    if (!name || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Name and a valid email are required." }, { status: 400 });
    }
    const chatId = typeof body.chat_id === "string" && /^[0-9a-f-]{36}$/i.test(body.chat_id) ? body.chat_id : null;
    const source = body.source === "chat_widget" ? "chat_widget" : "ai_page";
    const result = await captureLead({
      name,
      email,
      phone: body.phone ? String(body.phone) : undefined,
      company: body.company ? String(body.company) : undefined,
      interest: body.interest ? String(body.interest).slice(0, 500) : "Pricing conversation on Logic AI",
      source,
      chatId,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    console.error("[api/ai/lead]", err);
    return NextResponse.json({ ok: false, error: "Could not save details." }, { status: 500 });
  }
}
