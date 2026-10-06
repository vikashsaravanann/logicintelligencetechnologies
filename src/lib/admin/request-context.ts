import "server-only";
import { headers } from "next/headers";
import crypto from "crypto";

export interface RequestContext {
  requestId: string;
  ipHash: string | null;
  userAgent: string | null;
}

function hashIp(ip: string): string | null {
  const secret = process.env.AUDIT_HASH_SECRET;
  if (!secret || !ip || ip === "unknown") return null;
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * Request metadata for an audit record. The client IP is stored only as an HMAC
 * keyed by AUDIT_HASH_SECRET; without that secret the hash is null (and
 * /admin/status reports it NOT CONFIGURED). Raw IPs are never persisted.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const requestId =
    h.get("x-request-id") || h.get("x-vercel-id") || crypto.randomUUID();
  const fwd = h.get("x-forwarded-for") || h.get("x-real-ip") || "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  const ua = h.get("user-agent");
  return {
    requestId,
    ipHash: hashIp(ip),
    userAgent: ua ? ua.slice(0, 300) : null,
  };
}

/** Build a RequestContext from a Request (API routes). */
export function requestContextFromRequest(req: Request): RequestContext {
  const requestId =
    req.headers.get("x-request-id") || req.headers.get("x-vercel-id") || crypto.randomUUID();
  const fwd = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent");
  return {
    requestId,
    ipHash: hashIp(ip),
    userAgent: ua ? ua.slice(0, 300) : null,
  };
}
