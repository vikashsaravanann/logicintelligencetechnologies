import { test } from "node:test";
import assert from "node:assert/strict";
import { paidRevenue, outstandingRevenue, leadScoreLabel } from "@/lib/admin/kpis";

test("paidRevenue sums only Paid invoices", () => {
  const rows = [
    { amount: 100, status: "Paid" },
    { amount: "250.50", status: "Paid" },
    { amount: 999, status: "Pending" },
    { amount: 50, status: "Overdue" },
  ];
  assert.equal(paidRevenue(rows), 350.5);
});

test("outstandingRevenue sums Pending and Overdue only", () => {
  const rows = [
    { amount: 100, status: "Paid" },
    { amount: 999, status: "Pending" },
    { amount: 50, status: "Overdue" },
    { amount: 10, status: "Cancelled" },
  ];
  assert.equal(outstandingRevenue(rows), 1049);
});

test("revenue helpers ignore non-numeric amounts", () => {
  assert.equal(paidRevenue([{ amount: null, status: "Paid" }, { amount: "abc", status: "Paid" }]), 0);
});

test("leadScoreLabel shows the value or Unscored, never a fabricated default", () => {
  assert.equal(leadScoreLabel(0), "0");
  assert.equal(leadScoreLabel(72), "72");
  assert.equal(leadScoreLabel(null), "Unscored");
  assert.equal(leadScoreLabel(undefined), "Unscored");
  // The old code fabricated 35 for a missing score; make sure that is gone.
  assert.notEqual(leadScoreLabel(null), "35");
});
