import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ADMIN = path.join(process.cwd(), "src/app/admin");
const read = (p: string) => fs.readFileSync(p, "utf8");

function walk(dir: string, pred: (p: string) => boolean): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, pred));
    else if (pred(full)) out.push(full);
  }
  return out;
}

// Pages that legitimately have no capability guard of their own.
const PAGE_NO_GUARD = new Set([
  path.join(ADMIN, "page.tsx"),          // redirects to command-center
  path.join(ADMIN, "forbidden/page.tsx"), // the forbidden page itself
]);

test("every admin page.tsx declares a capability guard", () => {
  const pages = walk(ADMIN, (p) => p.endsWith("page.tsx"));
  for (const p of pages) {
    if (PAGE_NO_GUARD.has(p)) continue;
    assert.ok(read(p).includes("requireCapabilityPage("), `${p} missing requireCapabilityPage`);
  }
});

test("admin server actions require a capability and record an audit entry", () => {
  const actionFiles = walk(ADMIN, (p) => p.endsWith("actions.ts"));
  assert.ok(actionFiles.length > 0, "expected admin actions.ts files");
  for (const p of actionFiles) {
    const code = read(p);
    assert.ok(code.includes('"use server"'), `${p} not a server module`);
    assert.ok(code.includes("requireCapabilityAction("), `${p} missing requireCapabilityAction`);
    assert.ok(code.includes("recordAdminAction(") || code.includes("admin_set_role"),
      `${p} missing audit (recordAdminAction or admin_set_role RPC)`);
  }
});

test("middleware gates company-only paths by staff role, not email suffix", () => {
  const mw = read("src/middleware.ts");
  assert.ok(mw.includes("isStaffRole("), "middleware must use isStaffRole");
  assert.ok(!mw.includes('endsWith("@logic'), "middleware must not use an email-suffix check");
});

test("admin layout requires a staff session", () => {
  assert.ok(read("src/app/admin/layout.tsx").includes("requireStaffPage("));
});
