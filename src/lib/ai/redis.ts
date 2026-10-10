import { Redis } from '@upstash/redis';

/**
 * Upstash REST credentials. UPSTASH_REDIS_REST_* is the name Upstash's own
 * console uses; KV_REST_API_* is what the Vercel "Upstash for Redis"
 * integration creates with its default "KV" prefix. Either pair works.
 */
export function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const trimmedUrl = url.trim();
  // Upstash REST client requires an https:// endpoint
  if (!trimmedUrl.startsWith('https://')) {
    // If protocol was omitted, try prefixing https://
    if (!trimmedUrl.includes('://')) {
      return { url: `https://${trimmedUrl}`, token: token.trim() };
    }
    // TCP Redis URLs (redis://, rediss://) or plain http in production are invalid for Upstash REST
    if (trimmedUrl.startsWith('http://') && process.env.NODE_ENV !== 'production') {
      return { url: trimmedUrl, token: token.trim() };
    }
    return null;
  }

  return { url: trimmedUrl, token: token.trim() };
}

function initRedis(): Redis | null {
  try {
    const credentials = redisCredentials();
    return credentials ? new Redis(credentials) : null;
  } catch (error) {
    console.warn('[Upstash Redis] Client initialization failed:', error);
    return null;
  }
}

// Only initialize if the URL and token are present and valid, otherwise fallback gracefully
export const redis = initRedis();

