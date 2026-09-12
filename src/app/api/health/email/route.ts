import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { count: pendingCount, error } = await supabaseAdmin
      .from("email_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      return NextResponse.json(
        { status: "degraded", error: error.message },
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
    return NextResponse.json(
      { status: "down", error: err?.message },
      { status: 500 }
    );
  }
}
