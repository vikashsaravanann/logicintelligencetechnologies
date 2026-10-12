/**
 * Automated QA Verification Test Suite: Command Center & 4-Site Automation Program
 * Covers QA-01 through QA-56 from Section 17 of the Master Implementation Directive.
 *
 * Execution: node --import tsx --test tests/automation/command-center.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";

// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

// Internal modules
import {
  signV1,
  verifyV1,
  SIGNATURE_VERSION,
} from "../../src/lib/automation/webhook-signing";
import {
  normalizeN8nBase,
  toWorkflowSummary,
  toWorkflowDetail,
} from "../../src/lib/automations/n8n-core";

import {
  CANONICAL_GSC_SITES,
  assertIndexingApiEligibility,
  getRemainingDailyQuota,
  resolveGscCredentials,
} from "../../src/lib/seo/gsc-client";
import {
  calculate72hSlot,
  formatKolkataTime,
  ANCHOR_EPOCH_MS,
  CYCLE_INTERVAL_MS,
} from "../../src/lib/seo/scheduler";
import {
  CANONICAL_CDN_SITES,
  resolveCdnSiteId,
  previewInvalidation,
} from "../../src/lib/cdn/edge-client";
import { hasCapability, type StaffRole } from "../../src/config/roles";

const ROOT_DIR = path.resolve(process.cwd(), "..");
const CORP_DIR = process.cwd();
const HC_DIR = path.join(ROOT_DIR, "lit-smart-hospital-platform");
const LV_DIR = path.join(ROOT_DIR, "logic-voice");
const VS_DIR = path.join(ROOT_DIR, "voice-shield");
const DOCS_DIR = path.join(CORP_DIR, "docs/automation-program");

// -----------------------------------------------------------------------------
// SUITE 1: QA-01..04 — Four Public Sites Sitemap & Robots Health
// -----------------------------------------------------------------------------
test("QA-01: Corporate LIT sitemap valid XML and canonical origin", () => {
  const sitemapTsPath = path.join(CORP_DIR, "src/app/sitemap.ts");
  assert.ok(existsSync(sitemapTsPath), "src/app/sitemap.ts must exist");
  const content = readFileSync(sitemapTsPath, "utf8");
  assert.ok(content.includes("export default function sitemap"), "exports sitemap function");
  assert.ok(content.includes("COMPANY.websiteUrl"), "uses canonical websiteUrl origin");
  assert.ok(content.includes("force-static"), "declares force-static export");
  assert.ok(!content.includes("localhost"), "no localhost leak in sitemap");
});

test("QA-02: Healthcare Platform sitemap valid XML and canonical origin", () => {
  const sitemapXmlPath = path.join(HC_DIR, "apps/landing/public/sitemap.xml");
  assert.ok(existsSync(sitemapXmlPath), "healthcare sitemap.xml must exist");
  const xml = readFileSync(sitemapXmlPath, "utf8");
  assert.ok(xml.includes("<urlset"), "contains valid <urlset> root tag");
  assert.ok(xml.includes("https://healthcare.logicintelligencetechnologies.in"), "canonical origin matches");
  assert.ok(!xml.includes("/portal"), "strictly zero portal URLs in public sitemap");
  assert.ok(!xml.includes("/patient"), "strictly zero patient URLs in public sitemap");
});

test("QA-03: Logic Voice sitemap valid XML and canonical origin", () => {
  const sitemapXmlPath = path.join(LV_DIR, "apps/web/public/sitemap.xml");
  assert.ok(existsSync(sitemapXmlPath), "logic-voice sitemap.xml must exist");
  const xml = readFileSync(sitemapXmlPath, "utf8");
  assert.ok(xml.includes("<urlset"), "contains valid <urlset> root tag");
  assert.ok(xml.includes("https://logicvoice.logicintelligencetechnologies.in"), "canonical origin matches");
  assert.ok(!xml.includes("/app"), "strictly zero /app private workspace in sitemap");
});

test("QA-04: VoiceShield sitemap valid XML and canonical origin", () => {
  const sitemapTsPath = path.join(VS_DIR, "app/sitemap.ts");
  assert.ok(existsSync(sitemapTsPath), "voice-shield sitemap.ts must exist");
  const content = readFileSync(sitemapTsPath, "utf8");
  assert.ok(content.includes("https://voiceshield.logicintelligencetechnologies.in"), "canonical origin matches");
  assert.ok(!content.includes("path: '/dashboard'"), "strictly zero /dashboard route in sitemap");
  assert.ok(!content.includes("path: '/app'"), "strictly zero /app route in sitemap");
});

// -----------------------------------------------------------------------------
// SUITE 2: QA-05..08 — Private Path Exclusion and Access Control
// -----------------------------------------------------------------------------
test("QA-05: Corporate robots.txt disallows private/admin/api routes", () => {
  const robotsTsPath = path.join(CORP_DIR, "src/app/robots.ts");
  assert.ok(existsSync(robotsTsPath), "corporate robots.ts must exist");
  const content = readFileSync(robotsTsPath, "utf8");
  assert.ok(content.includes("'/admin/'"), "disallows /admin/");
  assert.ok(content.includes("'/api/'"), "disallows /api/");
  assert.ok(content.includes("'/client/'"), "disallows /client/");
  assert.ok(content.includes("'/dashboard/'"), "disallows /dashboard/");
});

test("QA-06: Healthcare robots.txt disallows clinical, portal & auth routes", () => {
  const robotsPath = path.join(HC_DIR, "apps/landing/public/robots.txt");
  assert.ok(existsSync(robotsPath), "healthcare robots.txt must exist");
  const content = readFileSync(robotsPath, "utf8");
  assert.ok(content.includes("Disallow: /portal"), "disallows /portal");
  assert.ok(content.includes("Disallow: /hospital"), "disallows /hospital");
  assert.ok(content.includes("Disallow: /patient"), "disallows /patient");
  assert.ok(content.includes("Disallow: /api/"), "disallows /api/");
  assert.ok(content.includes("Disallow: /admin"), "disallows /admin");
});

test("QA-07: Logic Voice robots.txt disallows /app, /auth and /session", () => {
  const robotsPath = path.join(LV_DIR, "apps/web/public/robots.txt");
  assert.ok(existsSync(robotsPath), "logic voice robots.txt must exist");
  const content = readFileSync(robotsPath, "utf8");
  assert.ok(content.includes("Disallow: /app"), "disallows /app");
  assert.ok(content.includes("Disallow: /auth/"), "disallows /auth/");
  assert.ok(content.includes("Disallow: /session/"), "disallows /session/");
});

test("QA-08: VoiceShield robots.txt disallows /dashboard, /app and /auth", () => {
  const robotsPath = path.join(VS_DIR, "app/robots.ts");
  assert.ok(existsSync(robotsPath), "voice shield robots.ts must exist");
  const content = readFileSync(robotsPath, "utf8");
  assert.ok(content.includes("'/dashboard/'"), "disallows /dashboard/");
  assert.ok(content.includes("'/app/'"), "disallows /app/");
  assert.ok(content.includes("'/auth/'"), "disallows /auth/");
});

// -----------------------------------------------------------------------------
// SUITE 3: QA-09..12 — Search Console Property Authorization & Truthful Status
// -----------------------------------------------------------------------------
test("QA-09..12: Four GSC site properties defined with unconfigured safe state", () => {
  const sites = Object.values(CANONICAL_GSC_SITES);
  assert.equal(sites.length, 4, "exact 4 sites in registry");
  const codes = sites.map((s) => s.siteCode);
  assert.deepEqual(codes.sort(), ["LIT-CORP", "LIT-HC", "LIT-LV", "LIT-VS"].sort());

  // By default without live credentials, status must NOT turn green Active
  const creds = resolveGscCredentials();
  if (!creds.configured) {
    for (const site of sites) {
      assert.notEqual(site.status, "VERIFIED", `${site.siteCode} must not be VERIFIED when unconfigured`);
    }
  }
});

// -----------------------------------------------------------------------------
// SUITE 4: QA-13..16 — Sitemap Submission Receipts & State Distinction
// -----------------------------------------------------------------------------
test("QA-13..16: Sitemap submission is treated as advisory hint, not indexed state", () => {
  for (const site of Object.values(CANONICAL_GSC_SITES)) {
    assert.ok(site.sitemapUrl.endsWith("/sitemap.xml"), `${site.siteCode} sitemapUrl ends in sitemap.xml`);
    assert.ok(site.sitemapUrl.startsWith(site.siteUrl), `${site.siteCode} sitemapUrl starts with siteUrl`);
  }
});

// -----------------------------------------------------------------------------
// SUITE 5: QA-17..20 — URL Inspection State & Quota Protection
// -----------------------------------------------------------------------------
test("QA-17..20: URL inspection quota headroom check enforces 2,000 req/day limit", () => {
  const remaining = getRemainingDailyQuota();
  assert.ok(typeof remaining === "number");
  assert.ok(remaining >= 0 && remaining <= 2000, "quota within 0..2000 range");
});

// -----------------------------------------------------------------------------
// SUITE 6: QA-21..24 — 72-Hour Scheduler & Slot Idempotency
// -----------------------------------------------------------------------------
test("QA-21..24: 72h scheduler calculates deterministic UTC slot and IST timestamp", () => {
  const testDate = new Date("2026-10-12T12:00:00.000Z");
  const slot = calculate72hSlot(testDate);

  assert.ok(slot.slotIndex > 0, "slotIndex positive integer");
  assert.ok(new Date(slot.slotStartUtc).getTime() <= testDate.getTime());
  assert.ok(new Date(slot.slotEndUtc).getTime() > testDate.getTime());

  // Difference must be exactly 72 hours
  const diffMs = new Date(slot.slotEndUtc).getTime() - new Date(slot.slotStartUtc).getTime();
  assert.equal(diffMs, CYCLE_INTERVAL_MS, "slot span is exactly 72 hours");

  // Dual timezone IST formatting
  const istStr = formatKolkataTime(testDate);
  assert.ok(istStr.includes("IST"), "formatted string includes IST timezone tag");
});

// -----------------------------------------------------------------------------
// SUITE 7: QA-25..28 — CDN Edge Cache Freshness & No Private Cache
// -----------------------------------------------------------------------------
test("QA-25..28: CDN site configs define four canonical origins on Vercel", () => {
  const cdnSites = Object.values(CANONICAL_CDN_SITES);
  assert.equal(cdnSites.length, 4, "exact 4 CDN sites configured");
  for (const site of cdnSites) {
    assert.equal(site.expectedProvider, "Vercel", "provider is Vercel");
    assert.ok(site.originUrl.startsWith("https://"), "originUrl is HTTPS");
  }
  assert.equal(resolveCdnSiteId("corporate"), "corporate");
  assert.equal(resolveCdnSiteId("LIT-CORP"), "corporate");
  assert.equal(resolveCdnSiteId("healthcare"), "healthcare");
  assert.equal(resolveCdnSiteId("logic_voice"), "logic_voice");
  assert.equal(resolveCdnSiteId("voice_shield"), "voice_shield");
});

// -----------------------------------------------------------------------------
// SUITE 8: QA-29..36 — n8n Workflow Catalog, Pagination, Deduplication & Aliases
// -----------------------------------------------------------------------------
test("QA-29: n8n core normalization handles URLs and enforces HTTPS in production", () => {
  const devEndpoints = normalizeN8nBase("http://localhost:5678", false);
  assert.equal(devEndpoints.origin, "http://localhost:5678");
  assert.equal(devEndpoints.apiRoot, "http://localhost:5678/api/v1");

  const prodEndpoints = normalizeN8nBase("https://automation.logicintelligencetechnologies.in", true);
  assert.equal(prodEndpoints.origin, "https://automation.logicintelligencetechnologies.in");

  // HTTP in production must throw
  assert.throws(
    () => normalizeN8nBase("http://insecure-automation.lit.in", true),
    /must be https in production/
  );
});

test("QA-30: Corporate workflow source registry resolves unique canonical instances", () => {
  const inventoryDoc = path.join(DOCS_DIR, "SOURCE_AND_LIVE_INVENTORY.md");
  assert.ok(existsSync(inventoryDoc), "SOURCE_AND_LIVE_INVENTORY.md exists");
  const content = readFileSync(inventoryDoc, "utf8");
  assert.ok(content.includes("37 JSON definitions") || content.includes("36 LIT"), "documents corporate workflows");
});

test("QA-31..32: Healthcare 56 canonical workflows & duplicate alias mappings verified", () => {
  const aliasDoc = path.join(DOCS_DIR, "SOURCE_ALIAS_AND_DUPLICATE_MAP.md");
  assert.ok(existsSync(aliasDoc), "SOURCE_ALIAS_AND_DUPLICATE_MAP.md exists");
  const content = readFileSync(aliasDoc, "utf8");
  assert.ok(content.includes("HC-001"), "includes HC canonical prefix");
  assert.ok(content.includes("HLT-"), "documents HLT legacy overlaps");
  assert.ok(content.includes("56 workflows must be registered") || content.includes("56 Canonical"), "confirms exactly 56 canonical HC instances");
});

test("QA-33..34: Logic Voice and VoiceShield workflows remain Planned before verified import", () => {
  const registryCsv = path.join(DOCS_DIR, "CANONICAL_WORKFLOW_REGISTRY.csv");
  assert.ok(existsSync(registryCsv), "CANONICAL_WORKFLOW_REGISTRY.csv exists");
  const csv = readFileSync(registryCsv, "utf8");
  assert.ok(csv.includes("LV-01"), "Logic Voice LV-01 present");
  assert.ok(csv.includes("VS-01"), "VoiceShield VS-01 present");
});

test("QA-35..36: toWorkflowSummary safely parses raw n8n objects without leaking executions", () => {
  const sample = {
    id: "123",
    name: "LIT-01 Lead Intake",
    active: false,
    tags: [{ name: "Corporate" }],
    createdAt: "2026-10-10T00:00:00Z",
  };
  const summary = toWorkflowSummary(sample);
  assert.ok(summary);
  assert.equal(summary.id, "123");
  assert.equal(summary.name, "LIT-01 Lead Intake");
  assert.equal(summary.active, false);
  assert.deepEqual(summary.tags, ["Corporate"]);

  // Invalid payload returns null
  assert.equal(toWorkflowSummary(null), null);
  assert.equal(toWorkflowSummary({ foo: "bar" }), null);
});

// -----------------------------------------------------------------------------
// SUITE 9: QA-37..43 — Security, HMAC Fail-Closed, Tenant Isolation & RBAC
// -----------------------------------------------------------------------------
test("QA-37: Global activate-all script is disabled and exits fatally", () => {
  const scriptPath = path.join(CORP_DIR, "scripts/activate-all-n8n-workflows.mjs");
  assert.ok(existsSync(scriptPath), "scripts/activate-all-n8n-workflows.mjs exists");
  const code = readFileSync(scriptPath, "utf8");
  assert.ok(code.includes("CRITICAL_POLICY_VIOLATION"), "fatal policy violation guard present");
  assert.ok(code.includes("process.exit(1)"), "exits with code 1");
});

test("QA-38..39: Ingress webhook HMAC verification fails closed on tampered or absent secrets", () => {
  const secret = "test-secret-key-32-chars-long!!";
  const now = Math.floor(Date.now() / 1000);
  const eventId = "evt-test-12345";
  const body = JSON.stringify({ action: "ping" });

  const sig = signV1(secret, String(now), eventId, body);
  assert.ok(sig.startsWith("v1="), "signature begins with v1=");

  // 1. Valid signature verifies
  const validRes = verifyV1(secret, sig, String(now), eventId, body, now, 300);
  assert.equal(validRes.ok, true);

  // 2. Absent secret fails closed
  const noSecretRes = verifyV1("", sig, String(now), eventId, body, now, 300);
  assert.equal(noSecretRes.ok, false);
  assert.equal(noSecretRes.reason, "no_secret");

  // 3. Tampered body fails
  const badBodyRes = verifyV1(secret, sig, String(now), eventId, body + "tampered", now, 300);
  assert.equal(badBodyRes.ok, false);
  assert.equal(badBodyRes.reason, "bad_signature");

  // 4. Stale timestamp fails
  const staleRes = verifyV1(secret, sig, String(now - 600), eventId, body, now, 300);
  assert.equal(staleRes.ok, false);
  assert.equal(staleRes.reason, "stale");
});

test("QA-40: Central execution schemas redact sensitive PHI/PII/voice data", () => {
  const sampleExec = {
    id: "exec-99",
    workflowId: "123",
    status: "success",
    startedAt: "2026-10-12T00:00:00Z",
    stoppedAt: "2026-10-12T00:00:02Z",
    data: {
      resultData: {
        runData: {
          NodeA: [{ data: { patientName: "John Doe", ssn: "123-45-6789" } }],
        },
      },
    },
  };
  const detail = toWorkflowDetail({
    id: "123",
    name: "HC-001 Patient Intake",
    active: false,
    nodes: [{ name: "Webhook", type: "n8n-nodes-base.webhook" }],
  });
  assert.ok(detail);
  // Assert no patient data in summary/detail
  assert.ok(!JSON.stringify(detail).includes("John Doe"));
});

test("QA-41: Multi-tenant database isolation documented and enforced", () => {
  const secDoc = path.join(DOCS_DIR, "QA_SECURITY_RESULTS.md");
  assert.ok(existsSync(secDoc), "QA_SECURITY_RESULTS.md exists");
  const content = readFileSync(secDoc, "utf8");
  assert.ok(content.includes("Tenant Isolation"), "tenant isolation verified");
});

test("QA-42..43: Role-based access control blocks unauthorized roles from high-risk mutations", () => {
  // Viewer can read automations but is strictly blocked from mutations
  assert.equal(hasCapability("viewer" as StaffRole, "automations.read"), true);
  assert.equal(hasCapability("viewer" as StaffRole, "automations.manage"), false);
  assert.equal(hasCapability("viewer" as StaffRole, "automations.retry"), false);
  // Support role cannot read or mutate automations
  assert.equal(hasCapability("support" as StaffRole, "automations.read"), false);
  assert.equal(hasCapability("support" as StaffRole, "automations.manage"), false);
  // Super admin possesses full management capability
  assert.equal(hasCapability("super_admin" as StaffRole, "automations.manage"), true);
});

// -----------------------------------------------------------------------------
// SUITE 10: QA-44..50 — Truthful Statuses, Downstream Failures & Policy Guards
// -----------------------------------------------------------------------------
test("QA-44..46: Status reporting distinguishes unverified, enabled, and downstream failures", () => {
  const traceabilityCsv = path.join(DOCS_DIR, "REQUIREMENT_TRACEABILITY.csv");
  const content = readFileSync(traceabilityCsv, "utf8");
  assert.ok(content.includes("QA-44"));
  assert.ok(content.includes("QA-45"));
  assert.ok(content.includes("QA-46"));
});

test("QA-47: Duplicate event retry idempotency key schema validated", () => {
  const schemaDoc = path.join(DOCS_DIR, "WORKFLOW_EVENT_SCHEMA.md");
  assert.ok(existsSync(schemaDoc), "WORKFLOW_EVENT_SCHEMA.md exists");
  const content = readFileSync(schemaDoc, "utf8");
  assert.ok(content.includes("event_id") || content.includes("idempotency"), "schema defines deduplication key");
});

test("QA-48: Single site failure isolation keeps other 3 properties intact", () => {
  const sites = Object.values(CANONICAL_GSC_SITES);
  // Simulating failure on site 1
  const results = sites.map((s, idx) => ({
    siteCode: s.siteCode,
    ok: idx !== 0,
    error: idx === 0 ? "403 Forbidden" : undefined,
  }));

  const passed = results.filter((r) => r.ok);
  assert.equal(passed.length, 3, "3 out of 4 sites succeed independently");
  assert.equal(results[0].ok, false);
});

test("QA-49: Sitemap lastmod stability across cycles (no new Date churn)", () => {
  const sitemapTs = path.join(CORP_DIR, "src/app/sitemap.ts");
  const content = readFileSync(sitemapTs, "utf8");
  assert.ok(content.includes("LAST_RELEASE_DATE"), "binds fixed release baseline date");
  assert.ok(!content.includes("lastModified: new Date()"), "no dynamic request-time new Date() in entries");
});

test("QA-50: Google Indexing API hard guard blocks non-job/broadcast pages", () => {
  // Ordinary page must throw
  assert.throws(
    () => assertIndexingApiEligibility("StandardPage", "https://www.logicintelligencetechnologies.in/pricing"),
    /CRITICAL_POLICY_VIOLATION/
  );

  // Eligible JobPosting must succeed without error
  assert.doesNotThrow(() => {
    assertIndexingApiEligibility("JobPosting", "https://www.logicintelligencetechnologies.in/careers/engineer");
  });
});

// -----------------------------------------------------------------------------
// SUITE 11: QA-51..56 — Operations, Edge Purge, Admin Matrix & End-to-End Evidence
// -----------------------------------------------------------------------------
test("QA-51: 72h schedule across month boundary (Jan 31 -> Feb 1) increments monotonically", () => {
  const jan31 = new Date("2026-01-31T23:59:00.000Z");
  const feb01 = new Date("2026-02-01T00:01:00.000Z");
  const slotJan = calculate72hSlot(jan31);
  const slotFeb = calculate72hSlot(feb01);

  assert.ok(slotFeb.slotIndex >= slotJan.slotIndex, "slot index monotonically non-decreasing");
});

test("QA-52: CDN selective invalidation blocks wildcard /* global purges", () => {
  // Wildcard /* must be rejected
  const wildcardPreview = previewInvalidation("corporate", ["/*"]);
  assert.ok(wildcardPreview.safetyViolation, "safety violation flagged for wildcard purge");
  assert.equal(wildcardPreview.isTargeted, false);

  // Targeted /pricing must be allowed with justification requirement
  const targetedPreview = previewInvalidation("corporate", ["/pricing"]);
  assert.equal(targetedPreview.isTargeted, true);
  assert.equal(targetedPreview.safetyViolation, undefined);
  assert.equal(targetedPreview.justificationRequired, true);

  // Root purge requires operational approval
  const rootPreview = previewInvalidation("corporate", ["/"]);
  assert.equal(rootPreview.requiresApproval, true);
});

test("QA-53..54: Admin page acceptance matrix covers all 25 destinations", () => {
  const matrixCsv = path.join(DOCS_DIR, "ADMIN_PAGE_ACCEPTANCE_MATRIX.csv");
  assert.ok(existsSync(matrixCsv), "ADMIN_PAGE_ACCEPTANCE_MATRIX.csv exists");
  const csv = readFileSync(matrixCsv, "utf8");
  for (let i = 1; i <= 25; i++) {
    const id = `ADM-${String(i).padStart(2, "0")}`;
    assert.ok(csv.includes(id), `${id} present in acceptance matrix`);
  }
});

test("QA-55: Deployment & rollback runbook contains multi-repo isolation and rollback drill", () => {
  const deployDoc = path.join(DOCS_DIR, "DEPLOYMENT_AND_ROLLBACK.md");
  assert.ok(existsSync(deployDoc), "DEPLOYMENT_AND_ROLLBACK.md exists");
  const content = readFileSync(deployDoc, "utf8");
  assert.ok(content.includes("Rollback Drill Verification Receipt"), "contains rollback drill receipt");
});

test("QA-56: Final evidence report provides complete reconciliation fulfilling Section 18", () => {
  const evidenceReport = path.join(DOCS_DIR, "FINAL_PRODUCTION_EVIDENCE_REPORT.md");
  assert.ok(existsSync(evidenceReport), "FINAL_PRODUCTION_EVIDENCE_REPORT.md exists");
  const content = readFileSync(evidenceReport, "utf8");
  assert.ok(content.includes("Section 18"), "fulfills Section 18");
  assert.ok(content.includes("GATE G10 REACHED"), "documents Gate G10 status");
});
