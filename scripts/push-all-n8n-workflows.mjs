import fs from "fs";
import path from "path";

// 1. Resolve environment variables from .env.local if not already in process.env
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const base = (process.env.N8N_BASE_URL || "").trim().replace(/\/+$/, "");
const apiKey = (process.env.N8N_API_KEY || "").trim();

if (!base || !apiKey) {
  console.error("Error: N8N_BASE_URL and N8N_API_KEY must be set.");
  process.exit(1);
}

console.log("=== N8N WORKFLOW DEPLOYMENT & SYNCHRONIZATION ===");
console.log(`Target Instance: ${base}`);
console.log(`Timestamp: ${new Date().toISOString()}`);

// 2. Read WORKFLOWS catalog from src/config/automation.ts
const configPath = path.join(process.cwd(), "src/config/automation.ts");
const configContent = fs.readFileSync(configPath, "utf8");

// Parse WORKFLOWS array entries
const workflowMatches = [...configContent.matchAll(/key:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*webhookPath:\s*"([^"]+)",\s*eventType:\s*"([^"]+)",\s*file:\s*"([^"]+)"/g)];

const workflowsToSync = workflowMatches.map(m => ({
  key: m[1],
  name: m[2],
  webhookPath: m[3],
  eventType: m[4],
  file: m[5],
}));

console.log(`Found ${workflowsToSync.length} workflows defined in src/config/automation.ts\n`);

async function run() {
  const headers = {
    "X-N8N-API-KEY": apiKey,
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "accept": "application/json"
  };

  // 3. Fetch current workflows on n8n
  console.log("Querying existing workflows on n8n instance...");
  const listRes = await fetch(`${base}/api/v1/workflows?limit=250`, { headers });
  if (!listRes.ok) {
    console.error(`Failed to list workflows: HTTP ${listRes.status} ${listRes.statusText}`);
    const errText = await listRes.text();
    console.error(errText);
    process.exit(1);
  }

  const listData = await listRes.json();
  const remoteWorkflows = Array.isArray(listData?.data) ? listData.data : [];
  console.log(`Found ${remoteWorkflows.length} existing workflows on remote n8n instance.\n`);

  const remoteByName = new Map();
  for (const rw of remoteWorkflows) {
    remoteByName.set(rw.name, rw);
  }

  let createdCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  for (let i = 0; i < workflowsToSync.length; i++) {
    const wf = workflowsToSync[i];
    const indexStr = `[${String(i + 1).padStart(2, "0")}/${workflowsToSync.length}]`;

    if (remoteByName.has(wf.name)) {
      const existing = remoteByName.get(wf.name);
      console.log(`${indexStr} EXISTS:  "${wf.name}" (ID: ${existing.id}, Active: ${existing.active})`);
      existingCount++;
      continue;
    }

    const filePath = path.join(process.cwd(), "src/lib/automation/n8n", wf.file);
    if (!fs.existsSync(filePath)) {
      console.error(`${indexStr} MISSING: Local file not found: ${filePath}`);
      errorCount++;
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error(`${indexStr} ERROR: Invalid JSON in ${wf.file}:`, parseErr.message);
      errorCount++;
      continue;
    }

    const payload = {
      name: wf.name,
      nodes: parsed.nodes ?? [],
      connections: parsed.connections ?? {},
      settings: parsed.settings ?? {},
    };

    try {
      const createRes = await fetch(`${base}/api/v1/workflows`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!createRes.ok) {
        const bodyText = await createRes.text();
        console.error(`${indexStr} FAILED:  "${wf.name}" HTTP ${createRes.status} - ${bodyText}`);
        errorCount++;
      } else {
        const createdData = await createRes.json();
        console.log(`${indexStr} CREATED: "${wf.name}" (ID: ${createdData.id}, Active: ${createdData.active})`);
        createdCount++;
      }
    } catch (reqErr) {
      console.error(`${indexStr} NETWORK ERROR: "${wf.name}"`, reqErr.message);
      errorCount++;
    }

    // Small delay to be polite to the n8n API server
    await new Promise(r => setTimeout(r, 120));
  }

  console.log("\n================ SUMMARY ================");
  console.log(`Total configured: ${workflowsToSync.length}`);
  console.log(`Already existed:  ${existingCount}`);
  console.log(`Newly created:    ${createdCount}`);
  console.log(`Errors / Failed:  ${errorCount}`);
  console.log("=========================================\n");

  if (errorCount > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Fatal execution error:", err);
  process.exit(1);
});
