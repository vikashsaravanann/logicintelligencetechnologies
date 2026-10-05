import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isPublicPath } from "../../src/lib/routing/public-paths.ts";

const MARKETING_DIR = path.join(process.cwd(), "src/app/(marketing)");

function hasPage(dir: string): boolean {
  if (fs.existsSync(path.join(dir, "page.tsx"))) return true;
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .some((e) => e.isDirectory() && hasPage(path.join(dir, e.name)));
}

test("every page in the (marketing) route group is public", () => {
  const routes = fs
    .readdirSync(MARKETING_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[[(_]/.test(e.name))
    .filter((e) => hasPage(path.join(MARKETING_DIR, e.name)))
    .map((e) => `/${e.name}`);

  assert.ok(routes.length > 20, `expected many marketing routes, found ${routes.length}`);
  const locked = routes.filter((r) => !isPublicPath(r));
  assert.deepEqual(locked, [], `marketing routes redirected to /login: ${locked.join(", ")}`);
});

test("public pages outside the (marketing) group stay reachable", () => {
  for (const p of ["/", "/pricing", "/security", "/voice-shield", "/voice-shield/request", "/company/facts", "/ai"]) {
    assert.equal(isPublicPath(p), true, `${p} should be public`);
  }
});

test("authenticated areas stay behind login", () => {
  for (const p of ["/admin", "/admin/leads", "/dashboard", "/client/dashboard", "/profile", "/omni"]) {
    assert.equal(isPublicPath(p), false, `${p} must not be public`);
  }
});

test("prefix matching does not leak lookalike paths", () => {
  assert.equal(isPublicPath("/aboutx"), false);
  assert.equal(isPublicPath("/pricing-admin"), false);
});
