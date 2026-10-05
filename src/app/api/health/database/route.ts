import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const start = Date.now();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[health/database]", error);
      return NextResponse.json(
        { status: "error", latencyMs: Date.now() - start },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "connected",
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[health/database]", err);
    return NextResponse.json(
      { status: "down", latencyMs: Date.now() - start },
      { status: 500 }
    );
  }
}
