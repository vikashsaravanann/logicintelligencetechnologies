import "server-only";
import { timingSafeEqual } from "node:crypto";

/** True only when AGENT_METRICS_SECRET is set and the request presents it. */
export async function isAgentSecretValid(request: Request): Promise<boolean> {
  const secret = process.env.AGENT_METRICS_SECRET;
  const header = request.headers.get("x-agent-metrics-secret");
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
