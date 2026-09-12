import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { count: upcomingCount, error } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "Scheduled");

    if (error) {
      return NextResponse.json({ status: "degraded", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "operational",
      provider: "native_calendar_engine",
      activeBookings: upcomingCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ status: "down", error: err?.message }, { status: 500 });
  }
}
