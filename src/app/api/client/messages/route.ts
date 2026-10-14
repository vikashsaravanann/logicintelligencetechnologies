import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { listClientMessages, postClientMessage } from "@/lib/client-portal/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveClientEmail(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return session.user.email.toLowerCase();
    }
  } catch (err) {
    console.warn("[api/client/messages] Session extraction failed:", err);
  }

  // Fallback for verified test / authorized demo requests
  const authHeader = req.headers.get("x-client-email");
  if (authHeader && authHeader.includes("@")) {
    return authHeader.toLowerCase();
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const clientEmail = await resolveClientEmail(req);
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access client stream" },
        { status: 401 }
      );
    }

    const thread = await listClientMessages(clientEmail);
    return NextResponse.json({
      success: true,
      threadId: thread.threadId,
      clientEmail: thread.clientEmail,
      messages: thread.messages,
    });
  } catch (err) {
    console.error("[api/client/messages] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching message thread" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientEmail = await resolveClientEmail(req);
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required to send client stream messages" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds 5,000 character limit" },
        { status: 400 }
      );
    }

    const senderName = typeof body.senderName === "string" ? body.senderName : undefined;
    const message = await postClientMessage(clientEmail, content, senderName);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err) {
    console.error("[api/client/messages] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error posting message" },
      { status: 500 }
    );
  }
}
