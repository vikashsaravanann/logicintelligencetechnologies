import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { count: pendingCount, error } = await supabaseAdmin
      .from("email_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("[health/email]", error);
      return NextResponse.json(
        { status: "degraded" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "operational",
      worker: "active",
      pendingQueueSize: pendingCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[health/email]", err);
    return NextResponse.json(
      { status: "down" },
      { status: 500 }
    );
  }
}
