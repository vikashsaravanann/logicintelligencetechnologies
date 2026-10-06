import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p: string) => fs.readFileSync(p, "utf8");

test("voice-shield routes return 501 and no fabricated results", () => {
  for (const r of ["async", "realtime"]) {
    const code = read(`src/app/api/voice-shield/${r}/route.ts`);
    assert.ok(code.includes("status: 501"), `${r} must return 501`);
    assert.ok(code.includes("NOT_IMPLEMENTED"), `${r} must say NOT_IMPLEMENTED`);
    assert.ok(!code.includes("vs_async_12345"), `${r} must not fabricate a job id`);
    assert.ok(!/score:\s*0\.05/.test(code), `${r} must not fabricate a score`);
    assert.ok(code.includes("await requireAdminApi(req)"), `${r} must keep the admin guard`);
  }
});
