/**
 * SSRF protection tests for isSafeHttpUrl.
 * Verifies that private, loopback, link-local, and metadata addresses are blocked.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSafeHttpUrl } from "./validation.ts";

describe("SSRF protection — blocked addresses", () => {
  const blocked = [
    // Loopback
    "http://localhost/admin",
    "http://127.0.0.1/secret",
    "http://127.0.0.255/",
    "https://localhost:8080/",
    // IPv6 loopback
    "http://[::1]/admin",
    // RFC-1918 private
    "http://10.0.0.1/",
    "http://10.255.255.255/path",
    "http://172.16.0.1/",
    "http://172.31.255.254/",
    "http://192.168.1.1/",
    "http://192.168.0.0/",
    // Link-local / AWS metadata
    "http://169.254.169.254/latest/meta-data/",
    "http://169.254.0.1/",
    // Non-http schemes
    "ftp://example.com/file",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    // IPv6 link-local
    "http://[fe80::1]/",
  ];

  for (const url of blocked) {
    it(`blocks: ${url}`, () => {
      assert.equal(isSafeHttpUrl(url), false, `Expected ${url} to be blocked`);
    });
  }
});

describe("SSRF protection — allowed addresses", () => {
  const allowed = [
    "https://www.logicintelligencetechnologies.in/work",
    "https://stripe.com/checkout",
    "http://example.com/page",
    "https://api.zoho.in/mail",
    "https://fonts.gstatic.com/woff2/inter.woff2",
  ];

  for (const url of allowed) {
    it(`allows: ${url}`, () => {
      assert.equal(isSafeHttpUrl(url), true, `Expected ${url} to be allowed`);
    });
  }
});

describe("SSRF protection — malformed input", () => {
  it("rejects empty string", () => assert.equal(isSafeHttpUrl(""), false));
  it("rejects plain hostname", () => assert.equal(isSafeHttpUrl("example.com"), false));
  it("rejects null-ish", () => assert.equal(isSafeHttpUrl("null"), false));
});
