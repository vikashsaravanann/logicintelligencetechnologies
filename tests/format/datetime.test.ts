import test from "node:test";
import assert from "node:assert/strict";
import { formatIST, formatINR } from "../../src/lib/format/datetime.ts";

test("formats a UTC instant in IST (+5:30) with suffix", () => {
  // 2026-01-01T00:00:00Z → 05:30 IST on 01 Jan
  const s = formatIST("2026-01-01T00:00:00Z", "datetime");
  assert.match(s, /01 Jan 2026/);
  assert.match(s, /05:30\s*AM IST/i);
});

test("crosses midnight correctly (UTC 20:00 → next-day IST 01:30)", () => {
  const s = formatIST("2026-01-01T20:00:00Z", "datetime");
  assert.match(s, /02 Jan 2026/);
  assert.match(s, /01:30\s*AM IST/i);
});

test("date mode has no IST suffix; time mode does", () => {
  assert.doesNotMatch(formatIST("2026-01-01T00:00:00Z", "date"), /IST/);
  assert.match(formatIST("2026-01-01T00:00:00Z", "time"), /IST/);
});

test("null/invalid → em dash", () => {
  assert.equal(formatIST(null), "—");
  assert.equal(formatIST("not-a-date"), "—");
});

test("formatINR renders rupees, null → em dash", () => {
  assert.match(formatINR(160000), /₹|INR/);
  assert.equal(formatINR(null), "—");
});
