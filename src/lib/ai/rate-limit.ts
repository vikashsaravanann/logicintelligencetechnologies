import { redis } from './redis';

const buckets = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return fwd.split(",")[0]?.trim() || "unknown";
}

/**
 * Atomic Redis sliding window. Production fails closed when unavailable.
 * Development-only memory fallback is not a distributed spend protection.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  
  // Redis path
  if (redis) {
    try {
      const allowed = await redis.eval(`
        redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1] - ARGV[2])
        if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[3]) then return 0 end
        redis.call('ZADD', KEYS[1], ARGV[1], ARGV[4])
        redis.call('PEXPIRE', KEYS[1], ARGV[2])
        return 1
      `, [key], [now, windowMs, limit, crypto.randomUUID()]);
      return Number(allowed) === 1;
    } catch (error) {
      console.warn("Redis rate limit unavailable");
      return false;
    }
  }

  if (process.env.NODE_ENV === "production") return false;
  // Bound development memory growth and discard expired keys.
  if (buckets.size > 10000) buckets.clear();
  // In-memory fallback
  const next = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (next.length >= limit) {
    buckets.set(key, next);
    return false;
  }
  next.push(now);
  buckets.set(key, next);
  return true;
}
