import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import {
  listClientNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/client-portal/v4-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getEngagementByRef } from "@/lib/engagements/db";

async function resolveClientEmail(req: NextRequest): Promise<{ email: string | null; ref: string | null }> {
  const ref = req.nextUrl.searchParams.get("ref")?.trim() || null;

  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      return { email: user.email.toLowerCase(), ref };
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return { email: session.user.email.toLowerCase(), ref };
    }
  } catch (err) {
    console.warn("[api/client/notifications] Session extraction failed:", err);
  }

  const authHeader = req.headers.get("x-client-email");
  if (authHeader && authHeader.includes("@")) {
    return { email: authHeader.toLowerCase(), ref };
  }

  if (ref) {
    try {
      const eng = await getEngagementByRef(ref);
      if (eng && eng.contact_email) {
        return { email: eng.contact_email.toLowerCase(), ref };
      }
    } catch (err) {
      console.warn("[api/client/notifications] Engagement ref lookup failed:", err);
    }
  }

  return { email: null, ref };
}

export async function GET(req: NextRequest) {
  try {
    const { email: clientEmail, ref } = await resolveClientEmail(req);
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      listClientNotifications(clientEmail, ref),
      getUnreadNotificationCount(clientEmail, ref),
    ]);

    return NextResponse.json({
      success: true,
      clientEmail,
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
    const { email: clientEmail } = await resolveClientEmail(req);
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action || "mark_read";

    if (action === "mark_all_read") {
      const ok = await markAllNotificationsAsRead(clientEmail);
      return NextResponse.json({ success: ok });
    }

    const notificationId = body?.notificationId;
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const ok = await markNotificationAsRead(clientEmail, notificationId);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error("[api/client/notifications] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating notification" },
      { status: 500 }
    );
  }
}
