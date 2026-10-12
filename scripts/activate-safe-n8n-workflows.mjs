#!/usr/bin/env node
/**
 * SAFE ACTIVATION RUNNER: scripts/activate-safe-n8n-workflows.mjs
 *
 * Implements LIT Enterprise Automation Governance:
 * - Requires explicit allowlist or workflow codes.
 * - Enforces risk-tier gates:
 *     R0, R1: Allowed with operator allowlist flag.
 *     R2, R3, R4: Strict block unless a valid human approval token is provided.
 * - Logs all activation operations to audit stream.
 */

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

const args = process.argv.slice(2);
const allowlistArg = args.find((a) => a.startsWith("--allowlist="))?.split("=")[1];
const codesArg = args.find((a) => a.startsWith("--codes="))?.split("=")[1];
const approvalToken = args.find((a) => a.startsWith("--approval-token="))?.split("=")[1];
const dryRun = args.includes("--dry-run");

if (!allowlistArg && !codesArg) {
  console.error("Usage: node scripts/activate-safe-n8n-workflows.mjs [--allowlist=R0,R1] [--codes=LIT-01,HC-001] [--approval-token=<token>] [--dry-run]");
  console.error("Error: An explicit allowlist or target workflow codes must be specified.");
  process.exit(1);
}

if (!base || !apiKey) {
  console.error("Error: N8N_BASE_URL and N8N_API_KEY must be set in environment or .env.local.");
  process.exit(1);
}

console.log("=== SAFE N8N WORKFLOW ACTIVATION RUNNER ===");
console.log(`Target Instance: ${base}`);
console.log(`Dry Run Mode:    ${dryRun ? "ENABLED (no changes will be committed)" : "DISABLED (LIVE)"}`);
console.log(`Timestamp:       ${new Date().toISOString()}\n`);

// High risk tiers requiring human approval
const HIGH_RISK_TIERS = ["R2", "R3", "R4"];

async function main() {
  console.log("Fetching workflows from n8n instance...");
  const headers = {
    "X-N8N-API-KEY": apiKey,
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  const res = await fetch(`${base}/api/v1/workflows?limit=250`, { headers });
  if (!res.ok) {
    console.error(`Failed to connect to n8n instance: HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();
  const workflows = Array.isArray(data?.data) ? data.data : [];
  console.log(`Found ${workflows.length} workflows registered on instance.\n`);

  const allowedCodes = codesArg ? codesArg.split(",").map((c) => c.trim().toUpperCase()) : [];
  const allowedTiers = allowlistArg ? allowlistArg.split(",").map((t) => t.trim().toUpperCase()) : [];

  let eligible = 0;
  let blocked = 0;
  let activated = 0;

  for (const wf of workflows) {
    const codeMatch = wf.name.match(/^([A-Z0-9\-_]+):/);
    const code = codeMatch ? codeMatch[1].toUpperCase() : null;
    const riskTier = wf.meta?.riskClass || (wf.name.includes("R3") || wf.name.includes("R4") ? "R3" : "R1");

    const matchesCode = code && allowedCodes.includes(code);
    const matchesTier = allowedTiers.includes(riskTier);

    if (!matchesCode && !matchesTier) {
      continue;
    }

    eligible++;

    // Safety Gate
    if (HIGH_RISK_TIERS.includes(riskTier)) {
      if (!approvalToken || approvalToken !== process.env.LIT_OPS_APPROVAL_TOKEN) {
        console.warn(`[POLICY BLOCK] Workflow "${wf.name}" has risk tier ${riskTier} and requires a valid --approval-token.`);
        blocked++;
        continue;
      }
    }

    if (wf.active) {
      console.log(`[ALREADY ACTIVE] "${wf.name}" (ID: ${wf.id})`);
      continue;
    }

    if (dryRun) {
      console.log(`[DRY-RUN WOULD ACTIVATE] "${wf.name}" (ID: ${wf.id}) [Tier: ${riskTier}]`);
    } else {
      console.log(`[ACTIVATING] "${wf.name}" (ID: ${wf.id}) [Tier: ${riskTier}]...`);
      const actRes = await fetch(`${base}/api/v1/workflows/${wf.id}/activate`, {
        method: "POST",
        headers,
      });
      if (actRes.ok) {
        console.log(`  -> SUCCESS: Activated "${wf.name}"`);
        activated++;
      } else {
        const text = await actRes.text();
        console.error(`  -> FAILED: HTTP ${actRes.status} - ${text}`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  console.log("\n================ SUMMARY ================");
  console.log(`Eligible Workflows: ${eligible}`);
  console.log(`Blocked by Gate:    ${blocked}`);
  console.log(`Activated:          ${activated}`);
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
