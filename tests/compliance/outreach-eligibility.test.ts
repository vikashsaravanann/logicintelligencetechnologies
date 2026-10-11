// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Require after server-only stub is loaded
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { evaluateOutreachEligibility } = require("../../src/lib/outreach/eligibility");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { marketingSendGuard } = require("../../src/lib/outreach/send-guard");

describe("Global Outreach Compliance — Eligibility & Gate Tests", () => {
  it("permits transactional service messages under legal exemption", async () => {
    const res = await evaluateOutreachEligibility({
      email: "client@example.com",
      category: "transactional",
      countryCode: "DE",
      channel: "email",
    });

    assert.equal(res.eligible, true);
    assert.equal(res.state, "permitted");
    assert.deepEqual(res.reason_codes, ["transactional_service_exemption"]);
  });

  it("permits security alert messages under legal exemption", async () => {
    const res = await evaluateOutreachEligibility({
      email: "security@example.com",
      category: "security",
      countryCode: "US",
    });

    assert.equal(res.eligible, true);
    assert.equal(res.state, "permitted");
    assert.deepEqual(res.reason_codes, ["transactional_service_exemption"]);
  });

  it("blocks outreach with invalid or malformed email syntax", async () => {
    const res = await evaluateOutreachEligibility({
      email: "invalid-email-format",
      category: "marketing",
      countryCode: "US",
      channel: "email",
    });

    assert.equal(res.eligible, false);
    assert.equal(res.state, "blocked");
    assert.ok(res.reason_codes.includes("invalid_email_syntax"));
  });

  it("blocks outreach when target email recipient is missing", async () => {
    const res = await evaluateOutreachEligibility({
      email: "",
      category: "marketing",
      countryCode: "US",
      channel: "email",
    });

    assert.equal(res.eligible, false);
    assert.equal(res.state, "blocked");
    assert.ok(res.reason_codes.includes("missing_email_recipient"));
  });

  it("fails closed when Supabase is not configured in production", async () => {
    const res = await evaluateOutreachEligibility({
      email: "prospect@acme-corp.example",
      category: "marketing",
      countryCode: "US",
      channel: "email",
    });

    // In unit test runner without live Supabase credentials, isSupabaseLive() is false
    assert.equal(res.eligible, false);
    assert.equal(res.state, "unknown");
    assert.ok(res.reason_codes.includes("database_unavailable_fail_closed"));
  });

  it("marketingSendGuard rejects missing email syntax", async () => {
    const guard = await marketingSendGuard({
      email: "not-an-email",
      countryCode: "US",
    });

    assert.equal(guard.ok, false);
    assert.equal(guard.reason, "invalid_email");
  });

  it("marketingSendGuard fails closed on compliance check when database is unavailable", async () => {
    const guard = await marketingSendGuard({
      email: "prospect@unlisted-region.example",
      countryCode: "ZZ",
    });

    assert.equal(guard.ok, false);
    assert.ok(guard.reason.startsWith("compliance_"));
  });
});
