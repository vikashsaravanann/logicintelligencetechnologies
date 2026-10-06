import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { navViewForRole, isActiveNav } from "../../src/config/admin-nav.ts";
import { STAFF_ROLES } from "../../src/config/roles.ts";

/**
 * Regression guard for a production 500: AdminShell is a Server Component and
 * passes the nav groups to Client Components (AdminNavLinks / AdminMobileNav).
 * React throws "Functions cannot be passed to Client Components" if any prop
 * carries a function, so the view handed across the boundary must be purely
 * serializable (label + href only) — never the `match` predicate.
 */

function hasFunction(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;
  if (typeof value === "function") return true;
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((v) => hasFunction(v, depth + 1));
  }
  return false;
}

test("navViewForRole output carries no functions (RSC-serializable)", () => {
  for (const role of STAFF_ROLES) {
    const groups = navViewForRole(role);
    assert.ok(!hasFunction(groups), `navViewForRole(${role}) must not contain functions`);
    // Round-trips through JSON unchanged — the real serialization constraint.
    assert.deepEqual(JSON.parse(JSON.stringify(groups)), groups);
    for (const g of groups) {
      for (const i of g.items) {
        assert.deepEqual(Object.keys(i).sort(), ["href", "label"]);
      }
    }
  }
});

test("super_admin sees items; viewer is a strict subset", () => {
  const sa = navViewForRole("super_admin").flatMap((g) => g.items.map((i) => i.href));
  const viewer = navViewForRole("viewer").flatMap((g) => g.items.map((i) => i.href));
  assert.ok(sa.length > 0);
  for (const h of viewer) assert.ok(sa.includes(h));
});

test("isActiveNav mirrors the nav match rules", () => {
  // Dashboard: active on /admin and the command-center path only.
  assert.ok(isActiveNav("/admin", "/admin/command-center"));
  assert.ok(isActiveNav("/admin/command-center", "/admin/command-center"));
  assert.ok(!isActiveNav("/admin/leads", "/admin/command-center"));
  // Prefix items: active on the href and any sub-path.
  assert.ok(isActiveNav("/admin/clients", "/admin/clients"));
  assert.ok(isActiveNav("/admin/clients/abc", "/admin/clients"));
  assert.ok(!isActiveNav("/admin/clientsX", "/admin/clients"));
  assert.ok(!isActiveNav("/admin/leads", "/admin/clients"));
});

test("AdminShell passes the serializable view, and client nav never calls match()", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
  const shell = read("src/app/admin/components/AdminShell.tsx");
  assert.ok(shell.includes("navViewForRole"), "AdminShell must use navViewForRole");
  assert.ok(!/\bnavForRole\(/.test(shell), "AdminShell must not pass navForRole() (carries functions)");
  for (const f of ["AdminNavLinks.tsx", "AdminMobileNav.tsx"]) {
    const src = read(`src/app/admin/components/${f}`);
    assert.ok(!/item\.match\(/.test(src), `${f} must not call item.match() across the boundary`);
  }
});
