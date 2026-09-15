import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

const routes = [
  "src/app/api/contact/route.ts",
  "src/app/api/free-demo/route.ts",
  "src/app/api/checklist/route.ts",
  "src/app/api/jobs/apply/route.ts",
  "src/app/api/newsletter/route.ts",
  "src/app/api/booking/route.ts",
  "src/app/api/support/route.ts",
];

describe("form APIs refuse fake success", () => {
  for (const file of routes) {
    it(`${file} uses persist helper and 503 on db failure`, () => {
      const src = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      assert.match(src, /insertLead|requireDatabase/);
      assert.match(src, /503/);
      assert.match(src, /success: false/);
    });
  }
});
