import test from "node:test";
import assert from "node:assert/strict";
import { APP_ROUTES, ROUTE_MIGRATION_MAP } from "../../src/config/routes.ts";

test("BackButton fallback mappings are all valid registered routes", () => {
  const registeredPaths = new Set(Object.values(APP_ROUTES).map((r) => r.path));

  for (const [key, route] of Object.entries(APP_ROUTES)) {
    if (route.backTarget) {
      assert.ok(
        registeredPaths.has(route.backTarget.href),
        `Route ${key} has invalid backTarget href: ${route.backTarget.href}`
      );
      assert.ok(
        route.backTarget.label.length > 0,
        `Route ${key} has empty backTarget label`
      );
    }
  }
});

test("Route migration map points legacy routes to canonical destinations", () => {
  assert.equal(ROUTE_MIGRATION_MAP["/client/profile"], "/profile");
  assert.equal(ROUTE_MIGRATION_MAP["/client/login"], "/login");
});
