import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import {
  listStaffInbox,
  getStaffThread,
  staffReplyToThread,
} from "@/lib/staff/messages";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const threadId = req.nextUrl.searchParams.get("threadId");
    if (threadId) {
      const thread = await getStaffThread(session.userId, threadId);
      if (!thread) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({ success: true, thread });
    }

    const inbox = await listStaffInbox(session.userId);
    return NextResponse.json({ success: true, threads: inbox });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "LIST_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const threadId = typeof body.threadId === "string" ? body.threadId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!threadId || !content) {
      return NextResponse.json({ error: "threadId and content required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const { data: emp } = await supabaseAdmin
      .from("staff_employees")
      .select("full_name, job_title")
      .eq("auth_user_id", session.userId)
      .maybeSingle();

    const message = await staffReplyToThread({
      staffUserId: session.userId,
      staffEmail: session.email || "staff@logicintelligencetechnologies.in",
      staffName: emp?.full_name || session.email || "LIT Staff",
      staffRole: emp?.job_title || session.role,
      threadId,
      content,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "REPLY_FAILED";
    if (message === "FORBIDDEN_OR_NOT_FOUND") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
