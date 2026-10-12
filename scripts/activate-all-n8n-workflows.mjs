#!/usr/bin/env node
/**
 * BLOCKED EXECUTION GUARD: scripts/activate-all-n8n-workflows.mjs
 *
 * CRITICAL_POLICY_VIOLATION PREVENTED:
 * Blind mass-activation of n8n workflows violates LIT Enterprise Governance:
 * 1. High-risk workflows (R3, R4) that touch external recipients, payments,
 *    or data erasure must NOT be activated without signed human operator approval.
 * 2. Unverified workflows or staging workflows must remain inactive (fail-safe).
 * 3. Workflows with sensitive data classes (Class 3, Class 4) require tenant authorization.
 *
 * USE INSTEAD:
 * node scripts/activate-safe-n8n-workflows.mjs --allowlist=<file_or_codes> --token=<approval_token>
 */

console.error("\n================================================================================");
console.error("FATAL GOVERNANCE ERROR: BLIND MASS-ACTIVATION SCRIPT IS PERMANENTLY DISABLED");
console.error("================================================================================");
console.error("Direct execution of 'activate-all-n8n-workflows.mjs' is prohibited by policy.");
console.error("Reason: Blind mass-activation bypasses R3/R4 risk tier gates and human approvals.");
console.error("Reference: LIT Master Automation Governance Section 4 & QA-03 Policy Matrix.");
console.error("");
console.error("To safely activate approved low-risk workflows, use:");
console.error("  node scripts/activate-safe-n8n-workflows.mjs --allowlist=R0,R1");
console.error("================================================================================\n");

process.exit(1);
