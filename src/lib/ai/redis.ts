import { Redis } from '@upstash/redis';

/**
 * Upstash REST credentials. UPSTASH_REDIS_REST_* is the name Upstash's own
 * console uses; KV_REST_API_* is what the Vercel "Upstash for Redis"
 * integration creates with its default "KV" prefix. Either pair works.
 */
export function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

const credentials = redisCredentials();

// Only initialize if the URL and token are present, otherwise fallback gracefully
export const redis = credentials ? new Redis(credentials) : null;
