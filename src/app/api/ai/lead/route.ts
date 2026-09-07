import { NextResponse } from "next/server";
import { captureLead } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Name and a valid email are required." }, { status: 400 });
    }
    const chatId = typeof body.chat_id === "string" && /^[0-9a-f-]{36}$/i.test(body.chat_id) ? body.chat_id : null;
    const result = await captureLead({
      name,
      email,
      phone: body.phone ? String(body.phone) : undefined,
      company: body.company ? String(body.company) : undefined,
      interest: body.interest ? String(body.interest).slice(0, 500) : "Pricing conversation on /ai",
      source: "ai_page",
      chatId,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    console.error("[api/ai/lead]", err);
    return NextResponse.json({ ok: false, error: "Could not save details." }, { status: 500 });
  }
}
