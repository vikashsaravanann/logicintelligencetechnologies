import { redis } from './redis';

const buckets = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return fwd.split(",")[0]?.trim() || "unknown";
}

/**
 * Distributed sliding window rate limiter using Redis.
 * Falls back to an in-memory map if Redis is not configured or fails.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  
  // Redis path
  if (redis) {
    try {
      const windowStart = now - windowMs;
      
      // Remove older events
      await redis.zremrangebyscore(key, 0, windowStart);
      
      // Count remaining events
      const count = await redis.zcard(key);
      
      if (count >= limit) {
        return false;
      }
      
      // Add new event
      await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      await redis.pexpire(key, windowMs);
      
      return true;
    } catch (error) {
      console.warn("Redis rate limit failed, falling back to memory:", error);
      // Fall through to in-memory on error
    }
  }

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
