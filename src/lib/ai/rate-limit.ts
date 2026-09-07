const buckets = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return fwd.split(",")[0]?.trim() || "unknown";
}

/** Sliding window. Returns true if the request is allowed. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const next = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (next.length >= limit) {
    buckets.set(key, next);
    return false;
  }
  next.push(now);
  buckets.set(key, next);
  return true;
}
