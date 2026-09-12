const BACKOFF_MS = [0, 60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000];
export const EMAIL_MAX_ATTEMPTS = 5;

export function nextAttemptAt(attemptCount: number, now = Date.now()): Date {
  const index = Math.min(Math.max(attemptCount, 0), BACKOFF_MS.length - 1);
  const jitter = Math.floor(Math.random() * 5_000);
  return new Date(now + BACKOFF_MS[index] + jitter);
}

export function isExhausted(attemptCount: number): boolean {
  return attemptCount >= EMAIL_MAX_ATTEMPTS;
}
