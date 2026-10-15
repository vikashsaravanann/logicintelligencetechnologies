import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { listClientActionItems, updateActionItemStatus } from "@/lib/client-portal/v4-actions";

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
    console.warn("[api/client/actions] Session extraction failed:", err);
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

    const { searchParams } = new URL(req.url);
    const engagementRef = searchParams.get("ref") || undefined;

    const actionItems = await listClientActionItems(clientEmail, engagementRef);
    return NextResponse.json({
      success: true,
      clientEmail,
      actionItems,
    });
  } catch (err) {
    console.error("[api/client/actions] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching action items" },
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
    const actionId = body?.actionId;
    const status = body?.status || "completed";

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "Action item ID is required" },
        { status: 400 }
      );
    }

    const ok = await updateActionItemStatus(clientEmail, actionId, status, clientEmail);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error("[api/client/actions] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating action item" },
      { status: 500 }
    );
  }
}
