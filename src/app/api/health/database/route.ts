import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const start = Date.now();
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", error: error.message, latencyMs: Date.now() - start },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "connected",
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "down", error: err?.message, latencyMs: Date.now() - start },
      { status: 500 }
    );
  }
}
