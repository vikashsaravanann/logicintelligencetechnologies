/**
 * Automated Verification Test Suite: SEO Inspection, Live Edge Probes & Truthful Status Contract
 * Verifies QA-50 compliance, OAuth2 RSA requirements, API key rejection, and edge telemetry.
 *
 * Execution: node --import tsx --test tests/automation/seo-inspection.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  CANONICAL_GSC_SITES,
  resolveGscCredentials,
  assertIndexingApiEligibility,
  extractEdgeDirectives,
  isCanonicalSelfReferential,
  isPathRobotsAllowed,
  inspectUrl,
  getRemainingDailyQuota,
} = require("../../src/lib/seo/gsc-client");
/* eslint-enable @typescript-eslint/no-require-imports */

test("SEO Credential Resolver: handles missing credentials truthfully", () => {
  const origEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const origKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  try {
    delete process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
    delete process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;

    const creds = resolveGscCredentials();
    assert.strictEqual(creds.configured, false);
    assert.ok(creds.reason?.includes("unconfigured"));
  } finally {
    if (origEmail !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = origEmail;
    if (origKey !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = origKey;
  }
});

test("SEO Credential Resolver: rejects simple API key (AIza...) per Google API requirements", () => {
  const origEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const origKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  try {
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = "lit-gsc-test@lit-ops.iam.gserviceaccount.com";
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = "AIzaSyFakeGoogleApiKey1234567890abcdef";

    const creds = resolveGscCredentials();
    assert.strictEqual(creds.configured, false);
    assert.ok(creds.reason?.includes("API_KEY_UNSUPPORTED"));
    assert.ok(creds.reason?.includes("OAuth2 Service Account RSA private key"));
  } finally {
    if (origEmail !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = origEmail;
    if (origKey !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = origKey;
  }
});

test("SEO Credential Resolver: accepts valid RSA private key format", () => {
  const origEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const origKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  try {
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = "lit-gsc-test@lit-ops.iam.gserviceaccount.com";
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n";

    const creds = resolveGscCredentials();
    assert.strictEqual(creds.configured, true);
    assert.strictEqual(creds.clientEmail, "lit-***@***");
  } finally {
    if (origEmail !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = origEmail;
    if (origKey !== undefined) process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = origKey;
  }
});

test("QA-50 / Section 10.3 Compliance: Google Indexing API restricted to JobPosting and BroadcastEvent", () => {
  // Ordinary pages must throw
  assert.throws(
    () => {
      assertIndexingApiEligibility("WebPage", "https://www.logicintelligencetechnologies.in/");
    },
    /CRITICAL_POLICY_VIOLATION/
  );

  assert.throws(
    () => {
      assertIndexingApiEligibility("AboutPage", "https://www.logicintelligencetechnologies.in/about");
    },
    /strictly forbidden for standard page types/
  );

  // JobPosting and BroadcastEvent are permitted
  assert.doesNotThrow(() => {
    assertIndexingApiEligibility("JobPosting", "https://www.logicintelligencetechnologies.in/careers/engineer");
  });

  assert.doesNotThrow(() => {
    assertIndexingApiEligibility("BroadcastEvent", "https://www.logicintelligencetechnologies.in/events/live-demo");
  });
});

test("Edge Directives Extraction: parses canonical, meta robots, and verification tags", () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Logic Intelligence Technologies</title>
        <link rel="canonical" href="https://www.logicintelligencetechnologies.in" />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="37m02DgA2U-ZJ40jbzGhSw3l4UluW2B-Y_0g5b069K8" />
      </head>
      <body>
        <h1>LIT</h1>
      </body>
    </html>
  `;

  const headers = new Headers();
  headers.set("x-robots-tag", "noarchive");

  const directives = extractEdgeDirectives(sampleHtml, headers);
  assert.strictEqual(directives.userCanonical, "https://www.logicintelligencetechnologies.in");
  assert.strictEqual(directives.metaRobots, "index, follow");
  assert.strictEqual(directives.googleSiteVerification, "37m02DgA2U-ZJ40jbzGhSw3l4UluW2B-Y_0g5b069K8");
  assert.strictEqual(directives.xRobotsTag, "noarchive");
});

test("Edge Canonical Validation: verifies self-referential URLs correctly", () => {
  // Matching with/without trailing slash
  assert.strictEqual(
    isCanonicalSelfReferential(
      "https://www.logicintelligencetechnologies.in",
      "https://www.logicintelligencetechnologies.in/"
    ),
    true
  );

  assert.strictEqual(
    isCanonicalSelfReferential(
      "https://www.logicintelligencetechnologies.in/about/",
      "https://www.logicintelligencetechnologies.in/about"
    ),
    true
  );

  // Divergent paths
  assert.strictEqual(
    isCanonicalSelfReferential(
      "https://www.logicintelligencetechnologies.in/about",
      "https://www.logicintelligencetechnologies.in/services"
    ),
    false
  );

  // Cross-domain mismatch
  assert.strictEqual(
    isCanonicalSelfReferential(
      "https://otherdomain.com/about",
      "https://www.logicintelligencetechnologies.in/about"
    ),
    false
  );
});

test("Robots.txt Path Allowance: blocks admin and api routes while allowing public pages", () => {
  assert.strictEqual(isPathRobotsAllowed("/"), true);
  assert.strictEqual(isPathRobotsAllowed("/about"), true);
  assert.strictEqual(isPathRobotsAllowed("/services"), true);
  assert.strictEqual(isPathRobotsAllowed("/contact"), true);
  assert.strictEqual(isPathRobotsAllowed("https://www.logicintelligencetechnologies.in/"), true);

  assert.strictEqual(isPathRobotsAllowed("/admin"), false);
  assert.strictEqual(isPathRobotsAllowed("/admin/seo"), false);
  assert.strictEqual(isPathRobotsAllowed("/api"), false);
  assert.strictEqual(isPathRobotsAllowed("/api/search-console"), false);
  assert.strictEqual(isPathRobotsAllowed("https://www.logicintelligencetechnologies.in/admin"), false);
});

test("URL Inspection: rejects non-allowlisted cross-domain URLs", async () => {
  const result = await inspectUrl("LIT-CORP", "https://google.com/search");
  assert.strictEqual(result.ok, false);
  assert.ok(result.error?.includes("does not match canonical site prefix"));
});

test("URL Inspection: runs truthful Direct Edge Inspection on canonical route", async () => {
  const result = await inspectUrl(
    "LIT-CORP",
    "https://www.logicintelligencetechnologies.in/"
  );

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.result?.verdict, "PASS");
  assert.strictEqual(result.result?.source, "DIRECT_EDGE_INSPECTION");
  assert.strictEqual(result.result?.crawledAs, "EDGE_INSPECTOR");
  assert.strictEqual(result.result?.indexingState, "INDEXING_ALLOWED");
  assert.ok(result.result?.edgeDetails !== undefined);
  assert.strictEqual(result.result?.edgeDetails?.httpStatus, 200);
  assert.strictEqual(result.result?.edgeDetails?.isRobotsAllowed, true);
  assert.strictEqual(result.result?.edgeDetails?.isCanonicalSelfReferential, true);
  assert.strictEqual(
    result.result?.edgeDetails?.googleSiteVerification,
    "37m02DgA2U-ZJ40jbzGhSw3l4UluW2B-Y_0g5b069K8"
  );
  assert.strictEqual(result.result?.gscStatus?.configured, false);
});
