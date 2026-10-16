import test from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_CAPABILITIES,
  CAPABILITIES,
  SUPER_ADMIN_ONLY_CAPABILITIES,
  STAFF_ROLES,
  hasCapability,
  isStaffRole,
} from "../../src/config/roles.ts";

test("super_admin holds every capability", () => {
  for (const c of CAPABILITIES) assert.ok(ROLE_CAPABILITIES.super_admin.includes(c), `missing ${c}`);
});

test("only super_admin holds commercial, pricing, coupon, issuance, payment verification, and team management capabilities", () => {
  for (const c of SUPER_ADMIN_ONLY_CAPABILITIES) {
    for (const r of STAFF_ROLES) {
      assert.equal(hasCapability(r, c), r === "super_admin", `${r}/${c}`);
    }
  }
});

test("admin holds all operational/technical capabilities except SUPER_ADMIN_ONLY_CAPABILITIES", () => {
  const superOnlySet = new Set<string>(SUPER_ADMIN_ONLY_CAPABILITIES);
  for (const c of CAPABILITIES) {
    assert.equal(ROLE_CAPABILITIES.admin.includes(c), !superOnlySet.has(c), c);
  }
});

test("admin and operations can prepare technical quotation drafts and invoice preparation requests", () => {
  const prepCaps = [
    "quotation.technical_draft.read",
    "quotation.technical_draft.create",
    "quotation.technical_draft.update",
    "quotation.technical_draft.submit_for_approval",
    "invoice.preparation.read",
    "invoice.preparation.create",
    "invoice.preparation.update",
    "invoice.preparation.submit_for_approval",
  ] as const;
  for (const c of prepCaps) {
    assert.equal(hasCapability("super_admin", c), true, `super_admin/${c}`);
    assert.equal(hasCapability("admin", c), true, `admin/${c}`);
    assert.equal(hasCapability("operations", c), true, `operations/${c}`);
    assert.equal(hasCapability("support", c), false, `support/${c}`);
    assert.equal(hasCapability("developer", c), false, `developer/${c}`);
    assert.equal(hasCapability("viewer", c), false, `viewer/${c}`);
  }
});

test("assigned client support capabilities are held by super_admin, admin, operations, and support only", () => {
  for (const c of ["support.assigned_client.read", "support.assigned_client.assist"] as const) {
    assert.equal(hasCapability("super_admin", c), true, `super_admin/${c}`);
    assert.equal(hasCapability("admin", c), true, `admin/${c}`);
    assert.equal(hasCapability("operations", c), true, `operations/${c}`);
    assert.equal(hasCapability("support", c), true, `support/${c}`);
    assert.equal(hasCapability("developer", c), false, `developer/${c}`);
    assert.equal(hasCapability("viewer", c), false, `viewer/${c}`);
  }
});

test("viewer has no write/approve/issue capability and cannot download", () => {
  const forbidden = CAPABILITIES.filter((c) =>
    /\.(write|manage|approve|issue|send|retry|sync|record_signature|upload|review|create|update|submit_for_approval|activate|apply|revoke|assist)$/.test(c) || c === "documents.download");
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

