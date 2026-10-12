// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { signV1, verifyV1 } from "../../src/lib/automation/webhook-signing";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { evaluateOutreachEligibility } = require("../../src/lib/outreach/eligibility");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabaseAdmin } = require("../../src/lib/supabase/admin");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST: preflightPOST } = require("../../src/app/api/admin/outreach/preflight/route");

describe("Phase 9: Comprehensive Outreach Compliance & Gate Reconciliation Tests", () => {
  const originalFrom = supabaseAdmin.from;
  const originalEnv = { ...process.env };
  const TEST_SECRET = "test_n8n_webhook_secret_99887766";

  // Mock table store for deterministic testing
  let mockTables: Record<string, any[]> = {};

  before(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock_service_role_key";
    process.env.N8N_WEBHOOK_SECRET = TEST_SECRET;
  });

  after(() => {
    supabaseAdmin.from = originalFrom;
    process.env = originalEnv;
  });

  beforeEach(() => {
    mockTables = {
      email_suppressions: [],
      lead_suppressions: [],
      lead_jurisdictions: [],
      outreach_policy_rules: [],
      outreach_policy_approvals: [],
      outreach_consent_evidence: [],
      outreach_eligibility_decisions: [],
      lead_businesses: [],
      contact_leads: [],
    };

    // Install mock query builder on supabaseAdmin.from
    supabaseAdmin.from = (table: string) => {
      const filters: Array<(row: any) => boolean> = [];
      let limitCount: number | null = null;
      let orderFn: ((a: any, b: any) => number) | null = null;

      const builder: any = {
        select: (_columns?: string) => builder,
        eq: (col: string, val: any) => {
          filters.push((r) => r[col] === val);
          return builder;
        },
        neq: (col: string, val: any) => {
          filters.push((r) => r[col] !== val);
          return builder;
        },
        is: (col: string, val: any) => {
          filters.push((r) => r[col] === val);
          return builder;
        },
        gt: (col: string, val: any) => {
          filters.push((r) => r[col] > val);
          return builder;
        },
        order: (col: string, opts?: { ascending?: boolean }) => {
          const asc = opts?.ascending !== false;
          orderFn = (a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          };
          return builder;
        },
        limit: (n: number) => {
          limitCount = n;
          return builder;
        },
        maybeSingle: async () => {
          const rows = (mockTables[table] || []).filter((r) => filters.every((f) => f(r)));
          return { data: rows[0] || null, error: null };
        },
        single: async () => {
          const rows = (mockTables[table] || []).filter((r) => filters.every((f) => f(r)));
          if (rows.length === 0) return { data: null, error: { message: "Row not found" } };
          return { data: rows[0], error: null };
        },
        insert: async (data: any) => {
          const items = Array.isArray(data) ? data : [data];
          if (!mockTables[table]) mockTables[table] = [];
          mockTables[table].push(...items);
          return { data: items, error: null };
        },
        then: (resolve: any, reject: any) => {
          let rows = (mockTables[table] || []).filter((r) => filters.every((f) => f(r)));
          if (orderFn) {
            rows = [...rows].sort(orderFn);
          }
          if (limitCount !== null) {
            rows = rows.slice(0, limitCount);
          }
          return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
        },
      };

      return builder;
    };
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Specific-Over-Broad Precedence                                          */
  /* -------------------------------------------------------------------------- */
  describe("1. Specific-Over-Broad Precedence", () => {
    it("specific rule overrides broad country allowed status to restricted", async () => {
      // Broad country allowed
      mockTables.lead_jurisdictions = [
        { country_code: "DE", outreach_status: "allowed", requires_opt_in: false },
      ];

      // Specific rule for DE cold outreach is restricted
      mockTables.outreach_policy_rules = [
        {
          id: "rule-de-cold",
          country_code: "DE",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "restricted",
          requires_consent: true,
          rule_version: "1.0",
          rule_key: "DE-EMAIL-COLD",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "hans@example.de",
        countryCode: "DE",
        channel: "email",
        purpose: "cold_outreach",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "restricted");
      assert.deepEqual(res.reason_codes, ["rule_restricted"]);
      assert.equal(res.effective_rule_id, "rule-de-cold");
    });

    it("specific rule overrides broad country blocked status to permitted with valid approval", async () => {
      // Broad country blocked
      mockTables.lead_jurisdictions = [
        { country_code: "IN", outreach_status: "blocked", requires_opt_in: false },
      ];

      // Specific pilot rule for IN is permitted
      mockTables.outreach_policy_rules = [
        {
          id: "rule-in-pilot",
          country_code: "IN",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "b2b_pilot_demonstration",
          policy_status: "permitted",
          requires_consent: false,
          rule_version: "1.0",
          rule_key: "IN-EMAIL-PILOT",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      // Active legal approval
      mockTables.outreach_policy_approvals = [
        {
          id: "appr-in-pilot-01",
          rule_id: "rule-in-pilot",
          status: "active",
          decision_reason: "Legal Signoff Pilot Ref LIT-IN-2026",
          approval_time: "2026-10-01T00:00:00.000Z",
          expiry_time: "2028-01-01T00:00:00.000Z",
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "arun@partner.in",
        countryCode: "IN",
        channel: "email",
        purpose: "b2b_pilot_demonstration",
      });

      assert.equal(res.eligible, true);
      assert.equal(res.state, "permitted");
      assert.equal(res.effective_rule_id, "rule-in-pilot");
      assert.equal(res.effective_approval_id, "appr-in-pilot-01");
    });

    it("region-specific rule takes precedence over country-wide rule", async () => {
      mockTables.lead_jurisdictions = [
        { country_code: "US", outreach_status: "allowed", requires_opt_in: false },
      ];

      mockTables.outreach_policy_rules = [
        // Country-wide rule: permitted
        {
          id: "rule-us-national",
          country_code: "US",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted",
          requires_consent: false,
          rule_version: "1.0",
          rule_key: "US-EMAIL-NAT",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
        // California specific rule: restricted
        {
          id: "rule-us-ca-specific",
          country_code: "US",
          region: "CA",
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "restricted",
          requires_consent: true,
          rule_version: "1.0",
          rule_key: "US-CA-EMAIL",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "prospect@sf-tech.example",
        countryCode: "US",
        region: "CA",
        channel: "email",
        purpose: "cold_outreach",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "restricted");
      assert.equal(res.effective_rule_id, "rule-us-ca-specific");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Legal Approval Requirement & Expiry Enforcement                        */
  /* -------------------------------------------------------------------------- */
  describe("2. Legal Approval Requirement & Expiry Enforcement", () => {
    it("blocks permitted rule if legal approval is missing (legal_approval_missing)", async () => {
      mockTables.outreach_policy_rules = [
        {
          id: "rule-unapproved",
          country_code: "US",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted", // Flagged permitted but has no approval record!
          requires_consent: false,
          rule_version: "1.0",
          rule_key: "US-EMAIL-COLD",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      // No approvals in mockTables.outreach_policy_approvals

      const res = await evaluateOutreachEligibility({
        email: "ceo@acme.com",
        countryCode: "US",
        channel: "email",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "needs_review");
      assert.deepEqual(res.reason_codes, ["legal_approval_missing"]);
    });

    it("blocks permitted rule if legal approval was revoked (legal_approval_missing)", async () => {
      mockTables.outreach_policy_rules = [
        {
          id: "rule-revoked-appr",
          country_code: "US",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted",
          requires_consent: false,
          rule_version: "1.0",
          rule_key: "US-EMAIL-REV",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      mockTables.outreach_policy_approvals = [
        {
          id: "appr-revoked",
          rule_id: "rule-revoked-appr",
          status: "revoked", // Status revoked
          approval_time: "2026-01-01T00:00:00.000Z",
          expiry_time: "2028-01-01T00:00:00.000Z",
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "ceo@acme.com",
        countryCode: "US",
        channel: "email",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "needs_review");
      assert.deepEqual(res.reason_codes, ["legal_approval_missing"]);
    });

    it("blocks rule when rule expires_at has passed (legal_approval_expired)", async () => {
      mockTables.outreach_policy_rules = [
        {
          id: "rule-expired",
          country_code: "US",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted",
          requires_consent: false,
          rule_version: "1.0",
          rule_key: "US-EXPIRED",
          expires_at: "2025-01-01T00:00:00.000Z", // Expired in the past!
          is_current: true,
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "contact@acme.com",
        countryCode: "US",
        channel: "email",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "needs_review");
      assert.deepEqual(res.reason_codes, ["legal_approval_expired"]);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Dual-Database Suppression Enforcement                                  */
  /* -------------------------------------------------------------------------- */
  describe("3. Dual-Database Suppression Enforcement", () => {
    it("suppresses recipient if email is in email_suppressions", async () => {
      mockTables.email_suppressions = [{ email: "optout@example.com" }];

      const res = await evaluateOutreachEligibility({
        email: "optout@example.com",
        countryCode: "US",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "suppressed");
      assert.deepEqual(res.reason_codes, ["active_suppression_found"]);
    });

    it("suppresses recipient if email is in lead_suppressions", async () => {
      mockTables.lead_suppressions = [
        { id: "supp-01", active: true, email: "unsub@client.com" },
      ];

      const res = await evaluateOutreachEligibility({
        email: "unsub@client.com",
        countryCode: "US",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "suppressed");
      assert.deepEqual(res.reason_codes, ["active_suppression_found"]);
    });

    it("suppresses recipient if phone number is in lead_suppressions", async () => {
      mockTables.lead_suppressions = [
        { id: "supp-phone-01", active: true, phone: "+15551234567" },
      ];

      const res = await evaluateOutreachEligibility({
        email: "valid@client.com",
        phone: "+15551234567",
        countryCode: "US",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "suppressed");
      assert.deepEqual(res.reason_codes, ["active_suppression_found"]);
    });

    it("suppresses recipient if business_id is in lead_suppressions", async () => {
      mockTables.lead_suppressions = [
        { id: "supp-biz-01", active: true, business_id: "biz-do-not-contact" },
      ];

      const res = await evaluateOutreachEligibility({
        email: "info@dnc-corp.com",
        businessId: "biz-do-not-contact",
        countryCode: "US",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "suppressed");
      assert.deepEqual(res.reason_codes, ["active_suppression_found"]);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Mandatory Consent Evidence (CASL / GDPR / Opt-in)                      */
  /* -------------------------------------------------------------------------- */
  describe("4. Mandatory Consent Evidence Checks", () => {
    it("blocks Canada (CA) outreach when consent evidence is missing", async () => {
      // CA policy requires consent
      mockTables.outreach_policy_rules = [
        {
          id: "rule-ca-consent",
          country_code: "CA",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted",
          requires_consent: true,
          rule_version: "1.0",
          rule_key: "CA-EMAIL-CONSENT",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      mockTables.outreach_policy_approvals = [
        {
          id: "appr-ca-01",
          rule_id: "rule-ca-consent",
          status: "active",
          approval_time: "2026-10-01T00:00:00.000Z",
          expiry_time: "2028-01-01T00:00:00.000Z",
        },
      ];

      // No consent evidence provided
      const res = await evaluateOutreachEligibility({
        email: "buyer@toronto-biz.ca",
        countryCode: "CA",
        channel: "email",
      });

      assert.equal(res.eligible, false);
      assert.equal(res.state, "restricted");
      assert.deepEqual(res.reason_codes, ["mandatory_consent_evidence_missing"]);
      assert.equal(res.requires_consent, true);
    });

    it("permits Canada (CA) outreach when valid consent evidence is documented", async () => {
      mockTables.outreach_policy_rules = [
        {
          id: "rule-ca-consent-2",
          country_code: "CA",
          region: null,
          channel: "email",
          recipient_class: "corporate_subscriber",
          purpose: "cold_outreach",
          policy_status: "permitted",
          requires_consent: true,
          rule_version: "1.0",
          rule_key: "CA-EMAIL-CONSENT",
          expires_at: "2028-01-01T00:00:00.000Z",
          is_current: true,
        },
      ];

      mockTables.outreach_policy_approvals = [
        {
          id: "appr-ca-02",
          rule_id: "rule-ca-consent-2",
          status: "active",
          approval_time: "2026-10-01T00:00:00.000Z",
          expiry_time: "2028-01-01T00:00:00.000Z",
        },
      ];

      mockTables.outreach_consent_evidence = [
        {
          id: "evid-ca-01",
          email: "buyer@toronto-biz.ca",
          consent_type: "express_written",
          revoked_at: null,
          expires_at: "2028-01-01T00:00:00.000Z",
          obtained_at: "2026-09-01T00:00:00.000Z",
        },
      ];

      const res = await evaluateOutreachEligibility({
        email: "buyer@toronto-biz.ca",
        countryCode: "CA",
        channel: "email",
      });

      assert.equal(res.eligible, true);
      assert.equal(res.state, "permitted");
      assert.equal(res.requires_consent, true);
      assert.equal(res.effective_rule_id, "rule-ca-consent-2");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. HMAC-SHA256 Signature Verification & Preflight Route Validation        */
  /* -------------------------------------------------------------------------- */
  describe("5. HMAC-SHA256 Signature Verification & Preflight Gate API", () => {
    it("pure verifyV1 accepts valid signature with matching timestamp and eventId", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const timestamp = String(nowSec);
      const eventId = "evt-test-12345";
      const rawBody = JSON.stringify({ email: "prospect@example.com", countryCode: "US" });

      const sig = signV1(TEST_SECRET, timestamp, eventId, rawBody);
      const result = verifyV1(TEST_SECRET, sig, timestamp, eventId, rawBody, nowSec);

      assert.equal(result.ok, true);
    });

    it("pure verifyV1 rejects stale timestamp outside tolerance window", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const staleTimestamp = String(nowSec - 500); // 500s ago > 300s tolerance
      const eventId = "evt-stale";
      const rawBody = JSON.stringify({ test: 1 });

      const sig = signV1(TEST_SECRET, staleTimestamp, eventId, rawBody);
      const result = verifyV1(TEST_SECRET, sig, staleTimestamp, eventId, rawBody, nowSec);

      assert.equal(result.ok, false);
      assert.equal(result.reason, "stale");
    });

    it("pure verifyV1 rejects bad secret or tampered body", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const timestamp = String(nowSec);
      const eventId = "evt-tamper";
      const rawBody = JSON.stringify({ email: "prospect@example.com" });

      const sig = signV1("wrong_secret", timestamp, eventId, rawBody);
      const result = verifyV1(TEST_SECRET, sig, timestamp, eventId, rawBody, nowSec);

      assert.equal(result.ok, false);
      assert.equal(result.reason, "bad_signature");
    });

    it("preflight API route POST rejects unauthorized requests without valid HMAC signature or session", async () => {
      const req = new Request("http://localhost:3000/api/admin/outreach/preflight", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: "prospect@example.com" }),
      });

      const res = await preflightPOST(req);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Unauthorized/);
    });

    it("preflight API route POST processes authorized request with valid HMAC signature", async () => {
      // Setup approved rule for US transactional or cold outreach
      mockTables.lead_jurisdictions = [
        { country_code: "US", outreach_status: "allowed", requires_opt_in: false },
      ];

      const nowSec = Math.floor(Date.now() / 1000);
      const timestamp = String(nowSec);
      const eventId = "evt-n8n-dispatch-01";
      const rawBody = JSON.stringify({
        email: "enterprise-contact@partner.com",
        countryCode: "US",
        channel: "email",
        category: "transactional",
      });

      const signature = signV1(TEST_SECRET, timestamp, eventId, rawBody);

      const req = new Request("http://localhost:3000/api/admin/outreach/preflight", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-lit-timestamp": timestamp,
          "x-lit-event-id": eventId,
          "x-lit-signature": signature,
        },
        body: rawBody,
      });

      const res = await preflightPOST(req);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.ok, true);
      assert.equal(json.eligible, true);
      assert.equal(json.state, "permitted");
      assert.ok(json.decision_id);
    });

    it("preflight API route POST rejects malformed JSON payloads with HTTP 400", async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const timestamp = String(nowSec);
      const eventId = "evt-bad-json";
      const rawBody = "{ this is malformed json }";

      const signature = signV1(TEST_SECRET, timestamp, eventId, rawBody);

      const req = new Request("http://localhost:3000/api/admin/outreach/preflight", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-lit-timestamp": timestamp,
          "x-lit-event-id": eventId,
          "x-lit-signature": signature,
        },
        body: rawBody,
      });

      const res = await preflightPOST(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.error, "Malformed JSON body.");
    });
  });
});
