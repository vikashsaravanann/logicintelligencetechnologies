import test from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_CAPABILITIES, CAPABILITIES, STAFF_ROLES, hasCapability, isStaffRole,
} from "../../src/config/roles.ts";

test("super_admin holds every capability", () => {
  for (const c of CAPABILITIES) assert.ok(ROLE_CAPABILITIES.super_admin.includes(c), `missing ${c}`);
});

test("only super_admin can manage the team", () => {
  for (const r of STAFF_ROLES) {
    assert.equal(hasCapability(r, "team.manage"), r === "super_admin", r);
  }
});

test("admin has everything except team.manage", () => {
  for (const c of CAPABILITIES) {
    assert.equal(ROLE_CAPABILITIES.admin.includes(c), c !== "team.manage", c);
  }
});

test("viewer has no write/approve/issue capability and cannot download", () => {
  const forbidden = CAPABILITIES.filter((c) =>
    /\.(write|manage|approve|issue|send|retry|sync|record_signature|upload|review)$/.test(c) || c === "documents.download");
  for (const c of forbidden) assert.equal(hasCapability("viewer", c), false, c);
});

test("every capability is reachable by at least one role", () => {
  for (const c of CAPABILITIES) {
    assert.ok(STAFF_ROLES.some((r) => ROLE_CAPABILITIES[r].includes(c)), `orphan capability ${c}`);
  }
});

test("unknown role has no capabilities", () => {
  assert.equal(isStaffRole("wizard"), false);
  assert.equal(hasCapability("wizard", "dashboard.view"), false);
  assert.equal(hasCapability(null, "dashboard.view"), false);
});

test("sensitive document capabilities belong to admin/super_admin only", () => {
  for (const c of ["documents.approve", "documents.issue", "contracts.record_signature"] as const) {
    for (const r of STAFF_ROLES) {
      const expected = r === "admin" || r === "super_admin";
      assert.equal(hasCapability(r, c), expected, `${r}/${c}`);
    }
  }
});
