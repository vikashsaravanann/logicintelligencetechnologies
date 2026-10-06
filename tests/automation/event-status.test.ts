import { test } from "node:test";
import assert from "node:assert/strict";
import { rollupStatus, needsAttention, type StepStatus } from "@/lib/automation/event-status";

test("empty set is pending", () => {
  assert.equal(rollupStatus([]), "pending");
});

test("all terminal-ok is complete", () => {
  assert.equal(rollupStatus(["succeeded", "skipped", "not_configured"]), "complete");
  assert.equal(rollupStatus(["succeeded", "succeeded"]), "complete");
});

test("anything running is running", () => {
  assert.equal(rollupStatus(["succeeded", "running", "pending"]), "running");
  assert.equal(rollupStatus(["failed", "running"]), "running");
});

test("failure with remaining work is running, not failed", () => {
  assert.equal(rollupStatus(["failed", "pending"]), "running");
});

test("all failed with no successes is failed", () => {
  assert.equal(rollupStatus(["failed", "failed"]), "failed");
});

test("some done + some failed, nothing left, is partial", () => {
  assert.equal(rollupStatus(["succeeded", "failed"]), "partial");
  assert.equal(rollupStatus(["skipped", "failed", "not_configured"]), "partial");
});

test("needsAttention only for failed/partial/dead_letter", () => {
  const attn: Array<[Parameters<typeof needsAttention>[0], boolean]> = [
    ["pending", false],
    ["running", false],
    ["complete", false],
    ["partial", true],
    ["failed", true],
    ["dead_letter", true],
  ];
  for (const [s, expected] of attn) assert.equal(needsAttention(s), expected, s);
});

test("pending-only steps stay pending", () => {
  const steps: StepStatus[] = ["pending", "pending"];
  assert.equal(rollupStatus(steps), "pending");
});
