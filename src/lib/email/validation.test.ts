import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  containsHeaderInjection,
  sanitizeHeaderValue,
  sanitizeSubject,
  isValidEmail,
  parseRecipientList,
  sanitizeFilename,
  isSafeHttpUrl,
} from "./validation.ts";

describe("email header injection", () => {
  it("rejects CR/LF in subjects and addresses", () => {
    assert.equal(containsHeaderInjection("hello\r\nBcc: attacker@evil.com"), true);
    assert.equal(containsHeaderInjection("hello%0aBcc: attacker@evil.com"), true);
    assert.equal(containsHeaderInjection("Normal subject"), false);
  });

  it("strips breaks from header values", () => {
    assert.equal(
      sanitizeHeaderValue("Lead from Jane\r\nBcc: attacker@evil.com"),
      "Lead from Jane Bcc: attacker@evil.com"
    );
  });

  it("never returns an empty subject", () => {
    assert.equal(sanitizeSubject("\n\r"), "Message from Logic Intelligence Technologies");
  });
});

describe("recipient validation", () => {
  it("accepts ordinary addresses", () => {
    assert.equal(isValidEmail("vikash@logicintelligencetechnologies.in"), true);
  });

  it("rejects injected and example addresses", () => {
    assert.equal(isValidEmail("jane@example.com"), true);
    assert.deepEqual(parseRecipientList("jane@example.com"), []);
    assert.deepEqual(parseRecipientList("not-an-email"), []);
    assert.deepEqual(parseRecipientList("a@b.com\nbcc:x@y.com"), []);
  });

  it("deduplicates", () => {
    assert.deepEqual(
      parseRecipientList(["a@lit.dev", "A@lit.dev"]),
      ["a@lit.dev"]
    );
  });
});

describe("url and filename safety", () => {
  it("allows https only-ish http(s)", () => {
    assert.equal(isSafeHttpUrl("https://www.logicintelligencetechnologies.in/work"), true);
    assert.equal(isSafeHttpUrl("javascript:alert(1)"), false);
    assert.equal(isSafeHttpUrl("data:text/html,hi"), false);
  });

  it("sanitizes filenames", () => {
    assert.equal(sanitizeFilename("../../etc/passwd"), "passwd");
    assert.equal(sanitizeFilename("CV Name (final).pdf"), "CV_Name_final_.pdf");
  });
});
