import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { WORKFLOWS } from "../../src/config/automation";

const N8N_DIR = path.join(process.cwd(), "src/lib/automation/n8n");

interface Connection {
  node: string;
  type: string;
  index: number;
}
type Connections = Record<string, { main?: Connection[][] }>;
interface Workflow {
  name: string;
  nodes: { name: string }[];
  connections: Connections;
  active?: boolean;
}

for (const wf of WORKFLOWS) {
  test(`${wf.file} is a valid n8n workflow for ${wf.name}`, () => {
    const filePath = path.join(N8N_DIR, wf.file);
    const raw = readFileSync(filePath, "utf8");

    // Valid JSON.
    let parsed: Workflow;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(raw) as Workflow;
    });
    parsed = JSON.parse(raw) as Workflow;

    // Name matches the config exactly.
    assert.equal(parsed.name, wf.name);

    // Never shipped active.
    assert.notEqual(parsed.active, true);

    // Nodes and a connections object.
    assert.ok(Array.isArray(parsed.nodes) && parsed.nodes.length > 0, "nodes array non-empty");
    assert.equal(typeof parsed.connections, "object");
    assert.ok(parsed.connections !== null);

    // Secrets/URLs come only from $env.
    assert.ok(raw.includes("$env.N8N_WEBHOOK_SECRET"), "references $env.N8N_WEBHOOK_SECRET");
    assert.ok(raw.includes("$env.LIT_CALLBACK_URL"), "references $env.LIT_CALLBACK_URL");

    // No hardcoded URLs, hostnames, or API key references.
    assert.ok(!/https?:\/\//.test(raw), "contains no literal http(s) URL");
    assert.ok(!raw.includes("N8N_API_KEY"), "contains no N8N_API_KEY reference");

    // A verify node exists.
    const verifyNode = parsed.nodes.find((n) => n.name.includes("Verify"));
    assert.ok(verifyNode, "a node whose name includes 'Verify' exists");

    // The verify node is upstream of the callback: it is a connection source key,
    // and the callback node is not a source that reaches the verify node.
    const verifyName = verifyNode!.name;
    assert.ok(Object.prototype.hasOwnProperty.call(parsed.connections, verifyName), "verify node is a connection source");

    const callbackNode = parsed.nodes.find((n) => n.name === "Callback");
    assert.ok(callbackNode, "a Callback node exists");

    const targetsOf = (source: string): string[] => {
      const main = parsed.connections[source]?.main ?? [];
      return main.flat().map((c) => c.node);
    };
    // The callback must not point back at the verify node (verify is strictly upstream).
    assert.ok(!targetsOf("Callback").includes(verifyName), "Callback does not connect back to Verify");
  });
}
