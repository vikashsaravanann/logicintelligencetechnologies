import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
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

    const preferences = await getNotificationPreferences(client.email);
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
    const client = await getVerifiedClientUser();
    if (!client) {
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

    const ok = await updateNotificationPreferences(client.email, {
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

    const updated = await getNotificationPreferences(client.email);
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
