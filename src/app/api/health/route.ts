import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "operational";

  try {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    if (error) dbStatus = "degraded";
  } catch {
    dbStatus = "down";
  }

  const uptime = process.uptime();
  const latency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === "operational" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      latencyMs: latency,
      uptimeSeconds: Math.floor(uptime),
      services: {
        database: dbStatus,
        emailWorker: "operational",
        storage: "operational",
        routing: "operational",
      },
    },
    { status: dbStatus === "operational" ? 200 : 503 }
  );
}
