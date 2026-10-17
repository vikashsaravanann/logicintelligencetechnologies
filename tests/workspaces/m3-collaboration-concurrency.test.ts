/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

const { supabaseAdmin } = require("../../src/lib/supabase/admin");
const { acceptProjectInvitation } = require("../../src/lib/collaboration/project-collaboration-service");

describe("Empirical Challenger: Workspace Assignments & Collaboration Concurrency", () => {

  /**
   * Helper to create a thread-safe / concurrency-aware in-memory Supabase mock
   */
  function createConcurrentMockDatabase(config?: {
    failInviteUpdateForId?: string;
    artificialDelayMs?: number;
  }) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const artificialDelayMs = config?.artificialDelayMs ?? 5;

    let assignments: any[] = [];
    let invitations: any[] = [];
    let profiles: any[] = [];
    let engagements: any[] = [];
    const updateCalls: Array<{ table: string; updates: any; filters: Record<string, any> }> = [];
    const deleteCalls: Array<{ table: string; filters: Record<string, any> }> = [];

    const mockFrom = (table: string) => {
      const filters: Record<string, any> = {};

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          filters[col] = val;
          return builder;
        },
        order: () => builder,
        maybeSingle: async () => {
          await delay(artificialDelayMs);
          if (table === "client_engagements") {
            const eng = engagements.find((e) => e.id === filters.id);
            return { data: eng ? { client_id: eng.client_id } : null, error: null };
          }
          return { data: null, error: null };
        },
        single: async () => {
          await delay(artificialDelayMs);
          if (table === "project_staff_invitations") {
            const row = invitations.find((i) => i.token_hash === filters.token_hash || i.id === filters.id);
            return row ? { data: { ...row }, error: null } : { data: null, error: { message: "Invitation not found" } };
          }
          if (table === "profiles") {
            const prof = profiles.find((p) => p.id === filters.id);
            return prof ? { data: { ...prof }, error: null } : { data: null, error: { message: "Profile not found" } };
          }
          return { data: null, error: { message: `Unknown table: ${table}` } };
        },
        upsert: async (record: any, options?: { onConflict?: string }) => {
          await delay(artificialDelayMs);
          if (table === "staff_client_assignments") {
            // Check conflict on staff_user_id,engagement_id
            const existingIdx = assignments.findIndex(
              (a) => a.staff_user_id === record.staff_user_id && a.engagement_id === record.engagement_id
            );
            if (existingIdx >= 0) {
              assignments[existingIdx] = { ...assignments[existingIdx], ...record };
            } else {
              assignments.push({ id: `assign-${assignments.length + 1}`, ...record });
            }
            return { error: null };
          }
          return { error: null };
        },
        update: (updates: any) => {
          const updateBuilder: any = {
            eq: async (col: string, val: any) => {
              filters[col] = val;
              updateCalls.push({ table, updates, filters: { ...filters } });
              await delay(artificialDelayMs);

              if (table === "project_staff_invitations") {
                if (config?.failInviteUpdateForId && filters.id === config.failInviteUpdateForId) {
                  return { error: { message: "Simulated PostgREST database update error" } };
                }
                const target = invitations.find((i) => i[col] === val);
                if (target) {
                  Object.assign(target, updates);
                  return { error: null };
                }
                return { error: { message: "Row not found for update" } };
              }
              return { error: null };
            },
          };
          return updateBuilder;
        },
        delete: () => {
          const deleteFilters: Record<string, any> = {};
          const deleteBuilder: any = {
            eq: (col: string, val: any) => {
              deleteFilters[col] = val;
              return deleteBuilder;
            },
            then: async (resolve: any) => {
              await delay(artificialDelayMs);
              deleteCalls.push({ table, filters: { ...deleteFilters } });
              if (table === "staff_client_assignments") {
                assignments = assignments.filter((a) => {
                  const matchStaff = deleteFilters.staff_user_id ? a.staff_user_id === deleteFilters.staff_user_id : true;
                  const matchEng = deleteFilters.engagement_id ? a.engagement_id === deleteFilters.engagement_id : true;
                  return !(matchStaff && matchEng);
                });
              }
              resolve({ error: null });
            },
          };
          return deleteBuilder;
        },
      };

      return builder;
    };

    return {
      mockFrom,
      getAssignments: () => [...assignments],
      getInvitations: () => [...invitations],
      getUpdateCalls: () => [...updateCalls],
      getDeleteCalls: () => [...deleteCalls],
      setInvitations: (invs: any[]) => { invitations = [...invs]; },
      setProfiles: (profs: any[]) => { profiles = [...profs]; },
      setEngagements: (engs: any[]) => { engagements = [...engs]; },
    };
  }

  test("Stress Test 1: 20 concurrent calls to acceptProjectInvitation for the same user and invite execute cleanly and idempotently", async () => {
    const rawToken = "concurrent-token-test-secret-123456789";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const callerId = "user-uuid-lead-001";
    const callerEmail = "lead.engineer@logicintelligencetechnologies.in";
    const inviteId = "invite-uuid-concurrent-001";
    const engagementId = "eng-uuid-corp-100";
    const clientId = "client-uuid-corp-200";

    const db = createConcurrentMockDatabase({ artificialDelayMs: 2 });
    db.setProfiles([{ id: callerId, email: callerEmail }]);
    db.setEngagements([{ id: engagementId, client_id: clientId }]);
    db.setInvitations([
      {
        id: inviteId,
        token_hash: tokenHash,
        recipient_email: callerEmail,
        engagement_id: engagementId,
        requested_role: "delivery_engineer",
        status: "pending",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-uuid-999",
        accepted_by_user_id: null,
      },
    ]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      // Launch 20 concurrent acceptance calls
      const concurrency = 20;
      const promises = Array.from({ length: concurrency }).map(() =>
        acceptProjectInvitation(rawToken, callerId)
      );

      const results = await Promise.all(promises);

      // Verify all 20 succeeded
      assert.strictEqual(results.length, concurrency);
      for (const res of results) {
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.engagementId, engagementId);
        assert.strictEqual(res.role, "delivery_engineer");
      }

      // Invariants: exactly 1 assignment row created (upsert deduplication)
      const assignments = db.getAssignments();
      assert.strictEqual(assignments.length, 1, "Must contain exactly 1 assignment row, no duplicates");
      assert.strictEqual(assignments[0].staff_user_id, callerId);
      assert.strictEqual(assignments[0].engagement_id, engagementId);
      assert.strictEqual(assignments[0].client_id, clientId);
      assert.strictEqual(assignments[0].status, "active");

      // Invariants: invitation status marked accepted by caller
      const invitations = db.getInvitations();
      assert.strictEqual(invitations[0].status, "accepted");
      assert.strictEqual(invitations[0].accepted_by_user_id, callerId);
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });

  test("Stress Test 2: Atomic rollback on invitation update failure leaves zero orphaned assignments", async () => {
    const rawToken = "token-rollback-failure-test-777";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const callerId = "user-uuid-staff-002";
    const callerEmail = "staff.fail@logicintelligencetechnologies.in";
    const inviteId = "invite-uuid-fail-002";
    const engagementId = "eng-uuid-fail-002";
    const clientId = "client-uuid-fail-002";

    const db = createConcurrentMockDatabase({
      failInviteUpdateForId: inviteId,
      artificialDelayMs: 2,
    });
    db.setProfiles([{ id: callerId, email: callerEmail }]);
    db.setEngagements([{ id: engagementId, client_id: clientId }]);
    db.setInvitations([
      {
        id: inviteId,
        token_hash: tokenHash,
        recipient_email: callerEmail,
        engagement_id: engagementId,
        requested_role: "delivery_engineer",
        status: "pending",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-uuid-999",
        accepted_by_user_id: null,
      },
    ]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      await assert.rejects(
        async () => {
          await acceptProjectInvitation(rawToken, callerId);
        },
        /Failed to update invitation status: Simulated PostgREST database update error/
      );

      // Verify compensating rollback: assignments must be empty!
      const assignments = db.getAssignments();
      assert.strictEqual(assignments.length, 0, "Compensating rollback must delete the created assignment");

      // Verify invitation was not corrupted
      const invitations = db.getInvitations();
      assert.strictEqual(invitations[0].status, "pending");
      assert.strictEqual(invitations[0].accepted_by_user_id, null);

      // Verify that delete was called with both staff_user_id and engagement_id
      const deleteCalls = db.getDeleteCalls();
      assert.strictEqual(deleteCalls.length, 1);
      assert.strictEqual(deleteCalls[0].table, "staff_client_assignments");
      assert.strictEqual(deleteCalls[0].filters.staff_user_id, callerId);
      assert.strictEqual(deleteCalls[0].filters.engagement_id, engagementId);
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });

  test("Stress Test 3: Multiple invitations exist — verify .eq('id', invite.id) isolates update to only target invitation", async () => {
    const rawToken = "token-multi-invite-isolation-test";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const callerId = "user-target-003";
    const callerEmail = "target@logicintelligencetechnologies.in";

    const invite1 = {
      id: "invite-row-1",
      token_hash: "hash-other-1",
      recipient_email: "other1@lit.in",
      engagement_id: "eng-1",
      requested_role: "qa_engineer",
      status: "pending",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      inviter_user_id: "founder-999",
      accepted_by_user_id: null,
    };
    const invite2Target = {
      id: "invite-row-2-target",
      token_hash: tokenHash,
      recipient_email: callerEmail,
      engagement_id: "eng-2",
      requested_role: "delivery_engineer",
      status: "pending",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      inviter_user_id: "founder-999",
      accepted_by_user_id: null,
    };
    const invite3 = {
      id: "invite-row-3",
      token_hash: "hash-other-3",
      recipient_email: "other3@lit.in",
      engagement_id: "eng-3",
      requested_role: "operations",
      status: "pending",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      inviter_user_id: "founder-999",
      accepted_by_user_id: null,
    };

    const db = createConcurrentMockDatabase({ artificialDelayMs: 1 });
    db.setProfiles([{ id: callerId, email: callerEmail }]);
    db.setEngagements([{ id: "eng-2", client_id: "client-2" }]);
    db.setInvitations([invite1, invite2Target, invite3]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      const result = await acceptProjectInvitation(rawToken, callerId);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.engagementId, "eng-2");

      const invitations = db.getInvitations();
      // Target invite must be accepted
      const updatedTarget = invitations.find((i) => i.id === "invite-row-2-target");
      assert.strictEqual(updatedTarget.status, "accepted");
      assert.strictEqual(updatedTarget.accepted_by_user_id, callerId);

      // Other invites must remain strictly pending and untouched!
      const other1 = invitations.find((i) => i.id === "invite-row-1");
      assert.strictEqual(other1.status, "pending", "Invite 1 must NOT be affected");
      assert.strictEqual(other1.accepted_by_user_id, null);

      const other3 = invitations.find((i) => i.id === "invite-row-3");
      assert.strictEqual(other3.status, "pending", "Invite 3 must NOT be affected");
      assert.strictEqual(other3.accepted_by_user_id, null);

      // Verify the update call executed .eq('id', 'invite-row-2-target')
      const updateCalls = db.getUpdateCalls();
      const targetUpdate = updateCalls.find((u) => u.table === "project_staff_invitations");
      assert.ok(targetUpdate, "Must call update on project_staff_invitations");
      assert.strictEqual(targetUpdate.filters.id, "invite-row-2-target", "Must filter strictly by target invite ID");
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });

  test("Stress Test 4: Concurrent hijack attempt by unauthorized caller is rejected without state mutation", async () => {
    const rawToken = "token-hijack-attempt-444";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const legitimateId = "user-legitimate-004";
    const legitimateEmail = "legit@logicintelligencetechnologies.in";
    const attackerId = "user-attacker-666";
    const attackerEmail = "attacker@evil.com";
    const inviteId = "invite-uuid-hijack-004";
    const engagementId = "eng-uuid-hijack-004";

    const db = createConcurrentMockDatabase({ artificialDelayMs: 2 });
    db.setProfiles([
      { id: legitimateId, email: legitimateEmail },
      { id: attackerId, email: attackerEmail },
    ]);
    db.setEngagements([{ id: engagementId, client_id: "client-444" }]);
    db.setInvitations([
      {
        id: inviteId,
        token_hash: tokenHash,
        recipient_email: legitimateEmail,
        engagement_id: engagementId,
        requested_role: "delivery_engineer",
        status: "pending",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-999",
        accepted_by_user_id: null,
      },
    ]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      // Attacker and legitimate user accept concurrently
      const [legitResult, attackerResult] = await Promise.allSettled([
        acceptProjectInvitation(rawToken, legitimateId),
        acceptProjectInvitation(rawToken, attackerId),
      ]);

      // Legitimate user succeeded
      assert.strictEqual(legitResult.status, "fulfilled");
      if (legitResult.status === "fulfilled") {
        assert.strictEqual(legitResult.value.success, true);
      }

      // Attacker failed with ACCOUNT_MISMATCH
      assert.strictEqual(attackerResult.status, "rejected");
      if (attackerResult.status === "rejected") {
        assert.match(attackerResult.reason.message, /ACCOUNT_MISMATCH/);
      }

      // Verify assignments: only legitimate user is assigned
      const assignments = db.getAssignments();
      assert.strictEqual(assignments.length, 1);
      assert.strictEqual(assignments[0].staff_user_id, legitimateId);
      assert.strictEqual(assignments[0].engagement_id, engagementId);
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });

  test("Stress Test 5: Same staff member concurrently accepting invitations for two different projects", async () => {
    const token1 = "token-project-alpha";
    const hash1 = crypto.createHash("sha256").update(token1).digest("hex");
    const token2 = "token-project-beta";
    const hash2 = crypto.createHash("sha256").update(token2).digest("hex");

    const staffId = "user-multi-project-005";
    const staffEmail = "multi.project@logicintelligencetechnologies.in";

    const db = createConcurrentMockDatabase({ artificialDelayMs: 2 });
    db.setProfiles([{ id: staffId, email: staffEmail }]);
    db.setEngagements([
      { id: "eng-alpha", client_id: "client-alpha" },
      { id: "eng-beta", client_id: "client-beta" },
    ]);
    db.setInvitations([
      {
        id: "invite-alpha",
        token_hash: hash1,
        recipient_email: staffEmail,
        engagement_id: "eng-alpha",
        requested_role: "primary_lead",
        status: "pending",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-999",
        accepted_by_user_id: null,
      },
      {
        id: "invite-beta",
        token_hash: hash2,
        recipient_email: staffEmail,
        engagement_id: "eng-beta",
        requested_role: "delivery_engineer",
        status: "pending",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-999",
        accepted_by_user_id: null,
      },
    ]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      const [res1, res2] = await Promise.all([
        acceptProjectInvitation(token1, staffId),
        acceptProjectInvitation(token2, staffId),
      ]);

      assert.strictEqual(res1.success, true);
      assert.strictEqual(res1.engagementId, "eng-alpha");
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.engagementId, "eng-beta");

      // Verify both assignments exist
      const assignments = db.getAssignments();
      assert.strictEqual(assignments.length, 2, "Staff member must have assignments on both distinct projects");
      const alphaAssign = assignments.find((a) => a.engagement_id === "eng-alpha");
      const betaAssign = assignments.find((a) => a.engagement_id === "eng-beta");

      assert.ok(alphaAssign);
      assert.strictEqual(alphaAssign.staff_user_id, staffId);
      assert.strictEqual(alphaAssign.is_primary_lead, true);

      assert.ok(betaAssign);
      assert.strictEqual(betaAssign.staff_user_id, staffId);
      assert.strictEqual(betaAssign.is_primary_lead, false);
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });

  test("Stress Test 6: Expired or Revoked invitations under concurrency are rejected with zero mutations", async () => {
    const expiredToken = "token-expired-invitation";
    const expiredHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
    const revokedToken = "token-revoked-invitation";
    const revokedHash = crypto.createHash("sha256").update(revokedToken).digest("hex");

    const callerId = "user-expired-006";
    const callerEmail = "caller.test@lit.in";

    const db = createConcurrentMockDatabase({ artificialDelayMs: 1 });
    db.setProfiles([{ id: callerId, email: callerEmail }]);
    db.setEngagements([{ id: "eng-common", client_id: "client-common" }]);
    db.setInvitations([
      {
        id: "invite-expired",
        token_hash: expiredHash,
        recipient_email: callerEmail,
        engagement_id: "eng-common",
        requested_role: "delivery_engineer",
        status: "pending",
        expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour in the past
        inviter_user_id: "founder-999",
        accepted_by_user_id: null,
      },
      {
        id: "invite-revoked",
        token_hash: revokedHash,
        recipient_email: callerEmail,
        engagement_id: "eng-common",
        requested_role: "delivery_engineer",
        status: "revoked",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        inviter_user_id: "founder-999",
        accepted_by_user_id: null,
      },
    ]);

    const originalFrom = supabaseAdmin.from;
    supabaseAdmin.from = db.mockFrom;

    try {
      // Concurrently attempt expired and revoked
      const expiredAttempts = Array.from({ length: 5 }).map(() =>
        assert.rejects(
          async () => {
            await acceptProjectInvitation(expiredToken, callerId);
          },
          /EXPIRED/
        )
      );

      const revokedAttempts = Array.from({ length: 5 }).map(() =>
        assert.rejects(
          async () => {
            await acceptProjectInvitation(revokedToken, callerId);
          },
          /REVOKED/
        )
      );

      await Promise.all([...expiredAttempts, ...revokedAttempts]);

      // Zero assignments created
      assert.strictEqual(db.getAssignments().length, 0);
    } finally {
      supabaseAdmin.from = originalFrom;
    }
  });
});
