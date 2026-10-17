import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import {
  listClientNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/client-portal/v4-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const ref = req.nextUrl.searchParams.get("ref")?.trim() || null;

    const [notifications, unreadCount] = await Promise.all([
      listClientNotifications(client.email, ref || undefined),
      getUnreadNotificationCount(client.email, ref || undefined),
    ]);

    return NextResponse.json({
      success: true,
      clientEmail: client.email,
      engagementRef: ref,
      unreadCount,
      notifications,
    });
  } catch (err) {
    console.error("[api/client/notifications] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action || "mark_read";

    if (action === "mark_all_read") {
      const ok = await markAllNotificationsAsRead(client.email);
      return NextResponse.json({ success: ok });
    }

    const notificationId = body?.notificationId;
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const ok = await markNotificationAsRead(client.email, notificationId);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error("[api/client/notifications] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating notification" },
      { status: 500 }
    );
  }
}
