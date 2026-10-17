import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import { listClientMessages, postClientMessage } from "@/lib/client-portal/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access client stream" },
        { status: 401 }
      );
    }

    const thread = await listClientMessages(client.email);
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
    const client = await getVerifiedClientUser();
    if (!client) {
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
    const message = await postClientMessage(client.email, content, senderName);

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
