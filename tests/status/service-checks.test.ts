import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyResponse,
  overallState,
  PUBLIC_SERVICES,
  SLOW_RESPONSE_MS,
  type ServiceCheckResult,
  type ServiceState,
} from "../../src/lib/status/service-checks.ts";

function result(state: ServiceState): ServiceCheckResult {
  return { id: state, name: state, description: "", state, httpStatus: null, latencyMs: null, checkedAt: "", detail: "" };
}

test("operational only after a successful, fast, healthy response", () => {
  assert.equal(classifyResponse("page", 200, 120, null).state, "OPERATIONAL");
  assert.equal(classifyResponse("health", 200, 120, "ok").state, "OPERATIONAL");
  assert.equal(classifyResponse("health", 200, 120, "healthy").state, "OPERATIONAL");
});

test("health endpoints must report a healthy status in the body", () => {
  assert.equal(classifyResponse("health", 200, 120, null).state, "DEGRADED");
  assert.equal(classifyResponse("health", 200, 120, "degraded").state, "DEGRADED");
});

test("errors and slow responses are never operational", () => {
  assert.equal(classifyResponse("page", 500, 100, null).state, "OUTAGE");
  assert.equal(classifyResponse("health", 503, 100, "degraded").state, "DEGRADED");
  assert.equal(classifyResponse("page", 404, 100, null).state, "DEGRADED");
  assert.equal(classifyResponse("page", 200, SLOW_RESPONSE_MS + 1, null).state, "DEGRADED");
});

test("overall summary reflects the worst service and never defaults to operational", () => {
  assert.equal(overallState([]).state, "UNKNOWN");
  assert.equal(overallState([result("OPERATIONAL"), result("OPERATIONAL")]).state, "OPERATIONAL");
  assert.equal(overallState([result("OPERATIONAL"), result("DEGRADED")]).state, "DEGRADED");
  assert.equal(overallState([result("OPERATIONAL"), result("OUTAGE")]).label, "Partial outage");
  assert.equal(overallState([result("OUTAGE"), result("OUTAGE")]).label, "Major outage");
  assert.equal(overallState([result("OPERATIONAL"), result("UNKNOWN")]).state, "UNKNOWN");
});

test("only https endpoints are probed", () => {
  for (const s of PUBLIC_SERVICES) assert.match(s.url, /^https:\/\//, s.id);
});
