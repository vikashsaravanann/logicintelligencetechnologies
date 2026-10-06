import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeN8nBase, toWorkflowSummary } from "@/lib/automations/n8n-core";

test("normalizeN8nBase handles a bare origin", () => {
  const e = normalizeN8nBase("https://n8n.example.com", true);
  assert.equal(e.origin, "https://n8n.example.com");
  assert.equal(e.apiRoot, "https://n8n.example.com/api/v1");
  assert.equal(e.healthUrl, "https://n8n.example.com/healthz");
});

test("normalizeN8nBase strips a trailing /api/v1 and trailing slashes", () => {
  const e = normalizeN8nBase("https://n8n.example.com/api/v1/", true);
  assert.equal(e.apiRoot, "https://n8n.example.com/api/v1");
  assert.equal(e.origin, "https://n8n.example.com");
});

test("normalizeN8nBase keeps a subpath mount", () => {
  const e = normalizeN8nBase("https://host.example.com/n8n", true);
  assert.equal(e.apiRoot, "https://host.example.com/n8n/api/v1");
  assert.equal(e.healthUrl, "https://host.example.com/n8n/healthz");
});

test("normalizeN8nBase rejects http in production, allows it otherwise", () => {
  assert.throws(() => normalizeN8nBase("http://n8n.example.com", true), /https in production/);
  assert.doesNotThrow(() => normalizeN8nBase("http://localhost:5678", false));
});

test("normalizeN8nBase rejects empty or invalid input", () => {
  assert.throws(() => normalizeN8nBase("", true));
  assert.throws(() => normalizeN8nBase("not a url", true));
});

test("toWorkflowSummary keeps only id/name/active, drops execution fields", () => {
  const s = toWorkflowSummary({ id: 12, name: "Pipeline", active: true, nodes: [1, 2], data: { secret: 1 } });
  assert.deepEqual(s, { id: "12", name: "Pipeline", active: true });
  assert.equal(toWorkflowSummary({ id: 1 }), null);
  assert.equal(toWorkflowSummary(null), null);
});
