import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/client-portal/v4-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveClientEmail(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return session.user.email.toLowerCase();
    }
  } catch (err) {
    console.warn("[api/client/notification-preferences] Session extraction failed:", err);
  }

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
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const preferences = await getNotificationPreferences(clientEmail);
    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (err) {
    console.error("[api/client/notification-preferences] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientEmail = await resolveClientEmail(req);
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const ok = await updateNotificationPreferences(clientEmail, {
      emailCriticalAlerts: typeof body.emailCriticalAlerts === "boolean" ? body.emailCriticalAlerts : undefined,
      emailStageMilestones: typeof body.emailStageMilestones === "boolean" ? body.emailStageMilestones : undefined,
      emailMessages: typeof body.emailMessages === "boolean" ? body.emailMessages : undefined,
      emailWeeklyDigest: typeof body.emailWeeklyDigest === "boolean" ? body.emailWeeklyDigest : undefined,
    });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to update notification preferences" },
        { status: 500 }
      );
    }

    const updated = await getNotificationPreferences(clientEmail);
    return NextResponse.json({
      success: true,
      preferences: updated,
    });
  } catch (err) {
    console.error("[api/client/notification-preferences] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
