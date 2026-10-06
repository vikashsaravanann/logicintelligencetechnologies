import { NextResponse } from "next/server";
import crypto from "crypto";
import { processRenderJobs } from "@/lib/documents/render-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/**
 * Processes queued document render jobs. Scheduled every 5 minutes. When the
 * PDF service is not configured, jobs are left queued and the response reports
 * notConfigured — no fake renders.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (!secret || !authHeader.startsWith("Bearer ") || !timingEqual(authHeader.slice(7), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processRenderJobs(5);
  return NextResponse.json({ ok: true, ...result });
}
