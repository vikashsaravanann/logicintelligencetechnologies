import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// The limiter fails closed in production without Upstash (see
// request-guard-runtime.test.ts), so a missing config blocks every limited
// route. Admin status must say so instead of failing silently.
test("admin status reports whether Upstash is configured", () => {
  const checks = fs.readFileSync("src/lib/status/config-checks.ts", "utf8");
  assert.ok(checks.includes("checks.rateLimit"));
  for (const name of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) {
    assert.ok(checks.includes(name), `status check ignores ${name}`);
  }
});

test("the Redis client accepts the Vercel integration's KV_ variable names", () => {
  const redis = fs.readFileSync("src/lib/ai/redis.ts", "utf8");
  assert.ok(redis.includes("process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL"));
  assert.ok(redis.includes("process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN"));
});
