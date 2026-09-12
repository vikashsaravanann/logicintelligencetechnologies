import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EMAIL_MAX_ATTEMPTS, isExhausted, nextAttemptAt } from "./retry.ts";
import { classifyEmailError } from "./errors.ts";

describe("retry policy", () => {
  it("caps attempts", () => {
    assert.equal(EMAIL_MAX_ATTEMPTS, 5);
    assert.equal(isExhausted(5), true);
    assert.equal(isExhausted(1), false);
  });

  it("backs off", () => {
    const first = nextAttemptAt(1, 0).getTime();
    const later = nextAttemptAt(4, 0).getTime();
    assert.equal(first >= 60_000, true);
    assert.equal(later > first, true);
  });
});

describe("error classification", () => {
  it("treats timeouts as retryable", () => {
    const result = classifyEmailError({ code: "ETIMEDOUT", message: "timeout" });
    assert.equal(result.retryable, true);
    assert.equal(result.category, "temporary");
  });

  it("does not retry auth failures", () => {
    const result = classifyEmailError({ code: "EAUTH", message: "Invalid login" });
    assert.equal(result.retryable, false);
    assert.equal(result.category, "configuration");
  });

  it("does not retry 550", () => {
    const result = classifyEmailError({ responseCode: 550, message: "user unknown" });
    assert.equal(result.retryable, false);
    assert.equal(result.category, "permanent");
  });
});
