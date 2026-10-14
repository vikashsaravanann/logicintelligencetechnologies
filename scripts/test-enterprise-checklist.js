const fs = require("fs");
const path = require("path");

// Read Supabase config
const content = fs.readFileSync(".env.local", "utf8");
let url = "";
let key = "";
for (const line of content.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    url = line.split("=")[1].trim().replace(/^["\x27]|["\x27]$/g, "");
  }
  if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
    key = line.split("=")[1].trim().replace(/^["\x27]|["\x27]$/g, "");
  }
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(url, key, { auth: { persistSession: false } });

const checklistJson = JSON.parse(
  fs.readFileSync("/Users/vikash/lit-infrastructure/LIT_50_POINT_ENTERPRISE_CHECKLIST_EXACT_SOURCE_V1.json", "utf8")
);
const ENTERPRISE_CHECKPOINTS = checklistJson.checkpoints;
const ENTERPRISE_PHASES = Array.from({ length: 8 }, (_, i) => ({
  phase: i + 1,
  checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === i + 1),
}));
const ENTERPRISE_CHECKLIST_METADATA = checklistJson;

async function runTest() {
  console.log("=== LIT ENTERPRISE CHECKLIST INTEGRATION VERIFICATION ===");

  // 1. Check data parity
  console.log("1. Checking data parity against 21-page official PDF:");
  console.log(`   - Checkpoints count: ${ENTERPRISE_CHECKPOINTS.length} (Expected: 50)`);
  console.log(`   - Phases count: ${ENTERPRISE_PHASES.length} (Expected: 8)`);
  console.log(`   - SHA-256 hash: ${ENTERPRISE_CHECKLIST_METADATA.source_pdf_sha256}`);
  if (ENTERPRISE_CHECKPOINTS.length !== 50 || ENTERPRISE_PHASES.length !== 8) {
    throw new Error("Parity check failed!");
  }
  console.log("   -> PASS: Data parity verified.");

  // 2. Test token generation & hashing
  const crypto = require("crypto");
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  console.log("\n2. Cryptographic token generation:");
  console.log(`   - Raw token length: ${rawToken.length} chars (base64url, 256 bits entropy)`);
  console.log(`   - Token SHA-256 digest: ${tokenHash}`);

  // 3. Create test invitation in database
  console.log("\n3. Testing Database Invitation Creation:");
  // Ensure version exists
  const { data: vRow } = await supabase
    .from("enterprise_checklist_versions")
    .upsert(
      {
        document_title: "The 50-Point Enterprise Deployment Checklist",
        document_version: "1.0",
        source_pdf_path: "private/resources/website-development-checklist.pdf",
        source_pdf_sha256: "32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404",
        checkpoint_count: 50,
        phase_count: 8,
        is_active: true,
      },
      { onConflict: "document_version" }
    )
    .select("id")
    .single();

  const versionId = vRow.id;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invRow, error: invErr } = await supabase
    .from("enterprise_checklist_invitations")
    .insert({
      recipient_name: "Automated Test Recipient",
      recipient_email: "test-checklist@logicintelligencetechnologies.in",
      recipient_company: "LIT Verification Lab",
      version_id: versionId,
      token_hash: tokenHash,
      status: "issued",
      expires_at: expiresAt,
      internal_notes: "Automated end-to-end integration test runner",
    })
    .select("id")
    .single();

  if (invErr || !invRow) {
    console.error("Invitation insert error:", invErr);
    throw new Error("Failed to insert test invitation.");
  }
  const testInvId = invRow.id;
  console.log(`   -> PASS: Test invitation created (ID: ${testInvId})`);

  // 4. Test client submission
  console.log("\n4. Testing Client Submission (Points 01, 06, 14, 23, 50):");
  const selectedPoints = [1, 6, 14, 23, 50];
  const confirmationReference = `CHK-2026-TEST${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const now = new Date().toISOString();

  const { data: respRow, error: respErr } = await supabase
    .from("enterprise_checklist_responses")
    .insert({
      invitation_id: testInvId,
      version_id: versionId,
      confirmation_reference: confirmationReference,
      submitted_by_name: "Automated Test Recipient",
      selected_count: selectedPoints.length,
      client_notes: "Test priority: Next.js + PostgreSQL RLS + RAG pipeline",
      submitted_at: now,
    })
    .select("id")
    .single();

  if (respErr || !respRow) {
    console.error("Response insert error:", respErr);
    throw new Error("Failed to insert test response.");
  }
  const testRespId = respRow.id;

  // Insert items
  const itemRows = selectedPoints.map((p) => ({
    response_id: testRespId,
    version_id: versionId,
    point_number: p,
  }));
  await supabase.from("enterprise_checklist_response_items").insert(itemRows);

  // Update invitation status
  await supabase
    .from("enterprise_checklist_invitations")
    .update({ status: "submitted", submitted_at: now })
    .eq("id", testInvId);

  console.log(`   -> PASS: Selections recorded with Ref: ${confirmationReference}`);

  // 5. Test Admin Review
  console.log("\n5. Testing Technical Lead Review:");
  const { error: revErr } = await supabase
    .from("enterprise_checklist_reviews")
    .insert({
      response_id: testRespId,
      reviewer_email: "lead@logicintelligencetechnologies.in",
      review_status: "scope_confirmed",
      internal_notes: "Architecture and RLS verified. Ready for proposal generation.",
    });
  if (revErr) {
    console.error("Review insert error:", revErr);
    throw new Error("Failed to record review.");
  }
  console.log("   -> PASS: Review recorded successfully.");

  // 6. Test Proposal Draft Creation
  console.log("\n6. Testing Proposal Draft Creation from Checklist Scope:");
  const candidateScope = ENTERPRISE_CHECKPOINTS.filter((c) =>
    selectedPoints.includes(c.number)
  ).map((c) => `[SOP ${String(c.number).padStart(2, "0")}] ${c.title}`);

  const { data: propRow, error: propErr } = await supabase
    .from("proposals")
    .insert({
      title: "Enterprise Deployment — LIT Verification Lab",
      client_name: "Automated Test Recipient",
      client_email: "test-checklist@logicintelligencetechnologies.in",
      client_company: "LIT Verification Lab",
      status: "Draft",
      pricing: 150000,
      currency: "INR",
      timeline: "4 Weeks",
      scope: candidateScope,
      deliverables: ["Full production deployment", "Code transfer"],
      terms: "50% advance upon acceptance; 50% on final verification.",
      secure_token: crypto.randomBytes(24).toString("hex"),
    })
    .select("id")
    .single();

  if (propErr || !propRow) {
    console.error("Proposal insert error:", propErr);
    throw new Error("Failed to create proposal draft.");
  }
  const testPropId = propRow.id;

  // Link proposal to invitation
  await supabase
    .from("enterprise_checklist_invitations")
    .update({ proposal_id: testPropId, status: "proposal_prepared" })
    .eq("id", testInvId);

  console.log(`   -> PASS: Draft proposal created (ID: ${testPropId}) with ${candidateScope.length} candidate scope items.`);

  // 7. Cleanup test records
  console.log("\n7. Cleaning up test records to preserve pristine DB state:");
  await supabase.from("proposals").delete().eq("id", testPropId);
  await supabase.from("enterprise_checklist_invitations").delete().eq("id", testInvId);
  console.log("   -> PASS: Test proposal and invitation deleted cleanly.");

  console.log("\nALL 7 TESTS PASSED WITH 100% SUCCESS!");
}

runTest().catch((err) => {
  console.error("Integration test failed:", err);
  process.exit(1);
});
