import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedTransition, nextStatuses, capabilityForTransition } from "@/lib/documents/lifecycle";

test("the allowed-transition table matches the SQL function", () => {
  assert.ok(isAllowedTransition("draft", "in_review"));
  assert.ok(isAllowedTransition("in_review", "approved"));
  assert.ok(isAllowedTransition("approved", "issued"));
  assert.ok(isAllowedTransition("issued", "superseded"));
  assert.ok(isAllowedTransition("draft", "void"));
  // illegal jumps
  assert.ok(!isAllowedTransition("draft", "issued"));
  assert.ok(!isAllowedTransition("draft", "approved"));
  assert.ok(!isAllowedTransition("void", "draft"));
  assert.ok(!isAllowedTransition("superseded", "issued"));
});

test("nextStatuses lists the moves a document may make", () => {
  assert.deepEqual(nextStatuses("draft").sort(), ["in_review", "void"].sort());
  assert.deepEqual(nextStatuses("void"), []);
});

test("approve and issue require their own capabilities", () => {
  assert.equal(capabilityForTransition("approved"), "documents.approve");
  assert.equal(capabilityForTransition("issued"), "documents.issue");
  assert.equal(capabilityForTransition("in_review"), "documents.review");
});
