import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enqueueEmail } from "@/lib/email/outbox";
import { COMPANY } from "@/config/company";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  signerName: z.string().trim().min(1).max(160),
});

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // non-browser clients send no Origin
  try {
    const host = new URL(origin).host;
    const allowed = new Set<string>();
    try {
      allowed.add(new URL(COMPANY.websiteUrl).host);
    } catch {
      /* ignore malformed config */
    }
    if (process.env.NODE_ENV !== "production") {
      allowed.add("localhost:3000");
      allowed.add("127.0.0.1:3000");
    }
    return allowed.has(host);
  } catch {
    return false;
  }
}

function hashIp(ip: string): string | null {
  const secret = process.env.AUDIT_HASH_SECRET;
  if (!secret || !ip || ip === "unknown") return null;
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!allowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!token || token.length < 8 || token.length > 64) {
    return NextResponse.json({ error: "Invalid proposal link" }, { status: 400 });
  }

  const ip = clientIp(req);
  // Fails closed in production without Redis.
  const ok = await rateLimit(`proposal-approve:${ip}:${token}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  let signerName: string;
  try {
    ({ signerName } = bodySchema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: "A signatory name is required." }, { status: 400 });
  }

  const userAgent = (req.headers.get("user-agent") || "").slice(0, 300);

  const { data: result, error } = await supabaseAdmin.rpc("approve_proposal", {
    p_token: token,
    p_signer_name: signerName,
    p_ip_hash: hashIp(ip),
    p_user_agent: userAgent,
  });

  if (error) {
    console.error("[proposals/approve] rpc", error.message);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }

  const r = (result ?? {}) as { ok?: boolean; reason?: string; reference?: string };

  if (!r.ok) {
    // Generic for not_found/expired/not_acceptable — do not leak proposal state.
    const status = r.reason === "not_found" ? 404 : 409;
    const message =
      r.reason === "expired"
        ? "This proposal has expired. Please contact us for an updated version."
        : r.reason === "not_found"
          ? "Proposal not found or invalid link."
          : "This proposal can no longer be accepted.";
    return NextResponse.json({ error: message }, { status });
  }

  // Notify internally only on a fresh acceptance (not on an idempotent repeat).
  if (r.reason === "approved") {
    try {
      await enqueueEmail({
        recipient: COMPANY.adminEmail,
        subject: `Proposal accepted: ${r.reference ?? token}`,
        templateId: "proposal_approved_notification",
        metadata: { reference: r.reference ?? null, signerName },
      });
    } catch (emailErr) {
      console.warn("[proposals/approve] notify", emailErr);
    }
  }

  return NextResponse.json({ success: true, reference: r.reference ?? null });
}
