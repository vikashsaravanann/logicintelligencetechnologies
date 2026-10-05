import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      console.error("[health/storage]", error);
      return NextResponse.json(
        { status: "error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "operational",
      bucketsCount: buckets?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[health/storage]", err);
    return NextResponse.json(
      { status: "down" },
      { status: 500 }
    );
  }
}
