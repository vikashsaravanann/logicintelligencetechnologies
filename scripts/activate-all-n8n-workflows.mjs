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

console.log("=== N8N WORKFLOW BATCH ACTIVATION ===");
console.log(`Target Instance: ${base}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

const headers = {
  "X-N8N-API-KEY": apiKey,
  "Authorization": `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "accept": "application/json"
};

async function run() {
  console.log("Fetching workflows from n8n instance...");
  const listRes = await fetch(`${base}/api/v1/workflows?limit=250`, { headers });
  if (!listRes.ok) {
    console.error(`Failed to list workflows: HTTP ${listRes.status} ${listRes.statusText}`);
    process.exit(1);
  }

  const listData = await listRes.json();
  const workflows = Array.isArray(listData?.data) ? listData.data : [];
  console.log(`Found ${workflows.length} total workflows on instance.\n`);

  let alreadyActiveCount = 0;
  let newlyActivatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < workflows.length; i++) {
    const wf = workflows[i];
    const prefix = `[${String(i + 1).padStart(2, "0")}/${workflows.length}]`;

    if (wf.active) {
      console.log(`${prefix} ALREADY ACTIVE: "${wf.name}" (ID: ${wf.id})`);
      alreadyActiveCount++;
      continue;
    }

    try {
      const activateRes = await fetch(`${base}/api/v1/workflows/${wf.id}/activate`, {
        method: "POST",
        headers
      });

      if (activateRes.ok) {
        console.log(`${prefix} ACTIVATED:      "${wf.name}" (ID: ${wf.id})`);
        newlyActivatedCount++;
      } else {
        const errText = await activateRes.text();
        console.error(`${prefix} FAILED:         "${wf.name}" (ID: ${wf.id}) HTTP ${activateRes.status} - ${errText}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`${prefix} NETWORK ERROR:  "${wf.name}" (ID: ${wf.id}) - ${err.message}`);
      errorCount++;
    }

    // Small delay between activation calls to ensure engine stability
    await new Promise(r => setTimeout(r, 100));
  }

  console.log("\n================ VERIFICATION ================");
  console.log("Re-querying instance to verify all active states...");
  const verifyRes = await fetch(`${base}/api/v1/workflows?limit=250`, { headers });
  const verifyData = await verifyRes.json();
  const verifyList = Array.isArray(verifyData?.data) ? verifyData.data : [];

  let totalActive = 0;
  let totalInactive = 0;

  verifyList.forEach((w, idx) => {
    if (w.active) {
      totalActive++;
    } else {
      totalInactive++;
    }
  });

  console.log(`\nVerification Results:`);
  console.log(`  Total Workflows:   ${verifyList.length}`);
  console.log(`  Active Workflows:   ${totalActive}`);
  console.log(`  Inactive Workflows: ${totalInactive}`);
  console.log(`  Newly Activated:    ${newlyActivatedCount}`);
  console.log(`  Already Active:     ${alreadyActiveCount}`);
  console.log(`  Errors:             ${errorCount}`);
  console.log("==============================================\n");

  if (totalInactive > 0 || errorCount > 0) {
    console.warn(`Warning: ${totalInactive} workflows remain inactive.`);
    process.exit(1);
  } else {
    console.log("All workflows are confirmed ACTIVE (active: true) on n8n!");
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
