import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .select("id", { head: true })
      .limit(1);

    if (error) {
      console.error("[health/calendar]", error);
      return NextResponse.json({ status: "degraded" }, { status: 500 });
    }

    return NextResponse.json({
      status: "operational",
      provider: "native_calendar_engine",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[health/calendar]", err);
    return NextResponse.json({ status: "down" }, { status: 500 });
  }
}
