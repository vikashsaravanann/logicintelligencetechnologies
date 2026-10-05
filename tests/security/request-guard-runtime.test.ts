import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// Isolated process: real modules, no production credentials/provider/email calls.
function run(code: string, production = false) {
  const result = spawnSync(process.execPath,
    ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", code], {
      cwd: process.cwd(), encoding: "utf8", timeout: 20000,
      env: { ...process.env, NODE_ENV: production ? "production" : "test",
        UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "",
        NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
    });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
}

const imports = `import assert from 'node:assert/strict';
import {readBoundedAiJson, InvalidAiRequest, AI_MAX_BODY_BYTES, guardAiRequest} from './src/lib/ai/request-guard.ts';`;

test("runtime: body parser accepts valid chunked UTF-8 JSON", () => run(imports + `
  const bytes = new TextEncoder().encode(JSON.stringify({text:'Tamil தமிழ்'}));
  const body = new ReadableStream({start(c){for (const b of bytes) c.enqueue(new Uint8Array([b]));c.close();}});
  const request = new Request('http://localhost',{method:'POST',body,duplex:'half'});
  assert.deepEqual(await readBoundedAiJson(request),{text:'Tamil தமிழ்'});
`));

test("runtime: oversized declared body rejected before read", () => run(imports + `
  await assert.rejects(readBoundedAiJson(new Request('http://localhost',{
    method:'POST',body:'{}',headers:{'content-length':String(AI_MAX_BODY_BYTES+1)}
  })),InvalidAiRequest);
`));

test("runtime: oversized chunked body cancels stream", () => run(imports + `
  let cancelled=false;
  const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(AI_MAX_BODY_BYTES+1));},cancel(){cancelled=true;}});
  await assert.rejects(readBoundedAiJson(new Request('http://localhost',{method:'POST',body,duplex:'half'})),InvalidAiRequest);
  assert.equal(cancelled,true);
`));

test("runtime: malformed or missing JSON body rejected", () => run(imports + `
  for(const body of ['{',undefined]) await assert.rejects(readBoundedAiJson(new Request('http://localhost',{method:'POST',body})),InvalidAiRequest);
`));

test("runtime: missing auth configuration denies AI without body/provider work", () => run(imports + `
  const result=await guardAiRequest();assert.equal(result.ok,false);assert.equal(result.status,401);
`));

test("runtime: dev limiter enforces exact count across concurrent requests", () => run(`
  import assert from 'node:assert/strict';
  import {rateLimit} from './src/lib/ai/rate-limit.ts';
  const results=await Promise.all(Array.from({length:20},()=>rateLimit('test:concurrent',6,60000)));
  assert.equal(results.filter(Boolean).length,6);
  assert.equal(await rateLimit('test:other-user',6,60000),true);
`));

test("runtime: production rate limiter fails closed without Redis", () => run(`
  import assert from 'node:assert/strict';
  import {rateLimit} from './src/lib/ai/rate-limit.ts';
  assert.equal(await rateLimit('test:production',6,60000),false);
`, true));