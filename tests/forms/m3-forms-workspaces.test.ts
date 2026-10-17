// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Require services under test after server-only stub is loaded
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createStaffClientAssignment,
  updateStaffClientAssignment,
  listStaffClientAssignments,
  addStaffSupportNote,
  createStaffSupportActionRequest,
  createCanonicalSupportTicket,
  listCanonicalSupportTickets,
  getRedactedStaffSupportContext,
} = require("../../src/lib/support/staff-support");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createQuotationTechnicalDraft,
  updateQuotationTechnicalDraft,
  getQuotationTechnicalDraftById,
  submitQuotationTechnicalDraftForApproval,
  listQuotationTechnicalDrafts,
} = require("../../src/lib/quotations/technical-drafts");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createProjectInvitation,
  acceptProjectInvitation,
  getProjectTeamMembers,
} = require("../../src/lib/collaboration/project-collaboration-service");

describe("Milestone 3 (FORMS01 - FORMS06 & WS01 - WS05) Forms, Workspaces & Communications", () => {
  const rootDir = process.cwd();
  const migrationPath = path.join(
    rootDir,
    "supabase/migrations/20261017090000_forms_workspaces_governance.sql"
  );

  // ---------------------------------------------------------------------------
  // Migration & Governance Schema Tests
  // ---------------------------------------------------------------------------
  describe("Migration Governance & Schema Integrity", () => {
    test("Migration 20261017090000 exists and contains all required DDL and RLS", () => {
      assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
      const sql = fs.readFileSync(migrationPath, "utf8");

      // WS02: Unique index & deduplication
      assert.ok(
        sql.includes("uq_staff_client_assignments_pair"),
        "Must define unique index uq_staff_client_assignments_pair"
      );
      assert.ok(
        sql.includes("ON public.staff_client_assignments (staff_user_id, engagement_id)"),
        "Unique index must be on (staff_user_id, engagement_id)"
      );

      // FORMS05: staff_support_notes table
      assert.ok(
        sql.includes("CREATE TABLE IF NOT EXISTS public.staff_support_notes"),
        "Must create staff_support_notes table"
      );
      assert.ok(
        sql.includes("ENABLE ROW LEVEL SECURITY"),
        "Must enable RLS on notes and escalations"
      );

      // FORMS05: staff_escalations table
      assert.ok(
        sql.includes("CREATE TABLE IF NOT EXISTS public.staff_escalations"),
        "Must create staff_escalations table"
      );

      // FORMS03: canonical support_tickets table additions
      assert.ok(
        sql.includes("ticket_ref"),
        "Must support ticket_ref on support_tickets"
      );
      assert.ok(
        sql.includes("sla_target_hours"),
        "Must support sla_target_hours on support_tickets"
      );
      assert.ok(
        sql.includes("assigned_staff_id"),
        "Must support assigned_staff_id on support_tickets"
      );

      // FORMS04: checklist_leads answers JSONB
      assert.ok(
        sql.includes("checklist_leads") && sql.includes("answers JSONB"),
        "Must add answers JSONB column to checklist_leads"
      );

      // FORMS02: Assigned staff conversation policies
      assert.ok(
        sql.includes("ct_staff_assigned"),
        "Must grant assigned staff thread view access"
      );
      assert.ok(
        sql.includes("cm_staff_assigned"),
        "Must grant assigned staff message insertion access"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // FORMS01 & WS01: Database-First Assignment Persistence & Error Bubbling
  // ---------------------------------------------------------------------------
  describe("FORMS01 & WS01: DB-First Assignments without False Success", () => {
    test("createStaffClientAssignment rejects unauthorized actor", async () => {
      await assert.rejects(
        async () => {
          await createStaffClientAssignment({
            actorUserId: "unauthorized-user-id",
            actorEmail: "viewer@example.com",
            actorRole: "viewer",
            staffUserId: "target-staff-id",
            clientId: "test-client-id",
            assignmentRole: "delivery_engineer",
            assignmentReason: "Invalid creation attempt",
          });
        },
        /Forbidden: Only Super Admin may create staff-client assignments/
      );
    });

    test("createStaffClientAssignment requires minimum 5 character reason", async () => {
      await assert.rejects(
        async () => {
          await createStaffClientAssignment({
            actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
            actorEmail: "createwithvikash@gmail.com",
            actorRole: "super_admin",
            staffUserId: "target-staff-id",
            clientId: "test-client-id",
            assignmentRole: "delivery_engineer",
            assignmentReason: "bad",
          });
        },
        /A clear assignment reason/
      );
    });

    test("createStaffClientAssignment persists valid assignment with capability flags", async () => {
      const assignment = await createStaffClientAssignment({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        staffUserId: "staff-worker-uuid-1",
        staffEmail: "worker1@lit.in",
        clientId: "client-corp-uuid-1",
        engagementId: "eng-uuid-101",
        assignmentRole: "delivery_engineer",
        canViewTechnicalStages: true,
        canPrepareTechnicalQuotation: true,
        canPrepareInvoiceRequest: true,
        canInviteCollaborators: true,
        assignmentReason: "Primary implementation lead for Core Engine",
      });

      assert.ok(assignment.id, "Assignment must have a valid ID");
      assert.equal(assignment.staff_user_id, "staff-worker-uuid-1");
      assert.equal(assignment.engagement_id, "eng-uuid-101");
      assert.equal(assignment.can_view_technical_stages, true);
      assert.equal(assignment.can_prepare_technical_quotation, true);
      assert.equal(assignment.can_prepare_invoice_request, true);
      assert.equal(assignment.can_invite_collaborators, true);
      assert.equal(assignment.status, "active");
    });

    test("updateStaffClientAssignment updates permissions and can revoke assignment", async () => {
      const created = await createStaffClientAssignment({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        staffUserId: "staff-worker-uuid-2",
        clientId: "client-corp-uuid-2",
        engagementId: "eng-uuid-202",
        assignmentRole: "technical_support",
        assignmentReason: "SLA Tier 1 representative",
      });

      const updated = await updateStaffClientAssignment({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        assignmentId: created.id,
        canPrepareInvoiceRequest: true,
        status: "revoked",
      });

      assert.equal(updated.id, created.id);
      assert.equal(updated.status, "revoked");
      assert.equal(updated.can_prepare_invoice_request, true);
      assert.ok(updated.revoked_at, "Revocation timestamp must be populated");
    });
  });

  // ---------------------------------------------------------------------------
  // FORMS03: Canonical Support Tickets
  // ---------------------------------------------------------------------------
  describe("FORMS03: Canonical Support Tickets Linked to Client, Project, Staff", () => {
    test("createCanonicalSupportTicket creates ticket with SLA targets and ticket ref", async () => {
      const res = await createCanonicalSupportTicket({
        clientId: "client-alpha-uuid",
        engagementId: "eng-alpha-uuid",
        assignedStaffId: "staff-alpha-uuid",
        customerEmail: "ops@clientalpha.com",
        subject: "Latency degradation on data ingestion gateway",
        message: "Observed 450ms p99 spike following stage 3 migration.",
        component: "ingestion-pipeline",
        severity: "high",
        slaTargetHours: 4,
      });

      assert.ok(res.ok, "Creation must succeed");
      assert.ok(res.ticket.id, "Ticket must have unique ID");
      assert.ok(res.ticket.ticket_ref.startsWith("TKT-"), "Ticket ref must start with TKT-");
      assert.equal(res.ticket.severity, "high");
      assert.equal(res.ticket.sla_target_hours, 4);
      assert.equal(res.ticket.status, "open");
      assert.equal(res.ticket.assigned_staff_id, "staff-alpha-uuid");
    });

    test("listCanonicalSupportTickets filters by assigned staff or engagement", async () => {
      const staffId = "staff-filter-test-1";
      await createCanonicalSupportTicket({
        clientId: "client-filter-1",
        engagementId: "eng-filter-1",
        assignedStaffId: staffId,
        customerEmail: "filter1@client.com",
        subject: "Ticket for staff 1",
        message: "Details regarding ticket 1",
        severity: "medium",
      });

      const tickets = await listCanonicalSupportTickets({ assignedStaffId: staffId });
      assert.ok(tickets.length >= 1, "Must find at least 1 ticket for assigned staff");
      assert.ok(
        tickets.every((t: any) => t.assigned_staff_id === staffId),
        "All returned tickets must match staffId filter"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // FORMS04: Checklist Discovery Full 40 Answers Persistence
  // ---------------------------------------------------------------------------
  describe("FORMS04: Checklist Discovery All 40 Answers Persisted", () => {
    test("Checklist route file contains persistence logic for all 40 answers", () => {
      const routePath = path.join(rootDir, "src/app/api/checklist/route.ts");
      assert.ok(fs.existsSync(routePath), "Checklist route must exist");
      const content = fs.readFileSync(routePath, "utf8");

      assert.ok(
        content.includes("answers,") && content.includes("checklist_leads"),
        "Must persist answers array in checklist_leads"
      );
      assert.ok(
        content.includes("answer_count: answers.length"),
        "Must record answer_count in metadata"
      );
      assert.ok(
        content.includes("export async function GET"),
        "Must expose GET endpoint to allow authorized retrieval of full discovery answers"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // FORMS05: Database Persistence for Staff Notes & Escalations
  // ---------------------------------------------------------------------------
  describe("FORMS05: DB-Backed Staff Support Notes and Escalations", () => {
    test("addStaffSupportNote creates note linked to client and staff author", async () => {
      const res = await addStaffSupportNote({
        staffUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        staffEmail: "createwithvikash@gmail.com",
        staffRole: "super_admin",
        clientId: "client-note-1",
        note: "Completed initial review of client ingress endpoints.",
        route: "/admin/support",
      });

      assert.ok(res.ok, "Note creation must succeed");
      assert.ok(res.note.id, "Note must have unique ID");
      assert.equal(res.note.author_user_id, "05991d42-44b3-4fbb-baaa-c6db030844c7");
      assert.ok(res.note.created_at, "Created at timestamp must exist");
    });

    test("createStaffSupportActionRequest persists escalation with urgency and reason", async () => {
      const res = await createStaffSupportActionRequest({
        staffUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        staffEmail: "createwithvikash@gmail.com",
        staffRole: "super_admin",
        clientId: "client-esc-1",
        requestType: "stage_review",
        summary: "Client requests custom firewall rule on production database port.",
        route: "/admin/support",
      });

      assert.ok(res.ok, "Escalation creation must succeed");
      assert.ok(res.request.id, "Escalation must have unique ID");
      assert.equal(res.request.requested_by, "05991d42-44b3-4fbb-baaa-c6db030844c7");
      assert.equal(res.request.status, "pending_super_admin");
    });
  });

  // ---------------------------------------------------------------------------
  // FORMS06: Technical Drafts Database Persistence
  // ---------------------------------------------------------------------------
  describe("FORMS06: Technical Drafts DB Persistence & Non-Monetary Integrity", () => {
    test("createQuotationTechnicalDraft persists technical draft with non-monetary items", async () => {
      const res = await createQuotationTechnicalDraft({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        clientId: "client-draft-uuid-1",
        engagementId: "eng-draft-uuid-1",
        rawPayload: {
          title: "Distributed Pipeline Architecture Scope v1",
          scopeSummary: "Technical architecture plan for distributed BigQuery data pipeline.",
          technicalLineItems: [
            {
              title: "Dataform Migration",
              description: "Migrate 25 legacy SQL scripts to idempotent Dataform models.",
              quantity: 1,
            },
            {
              title: "Airflow DAG Orchestration",
              description: "Orchestrate scheduled pipelines via Cloud Composer 2.",
              quantity: 1,
            },
          ],
        },
      });

      assert.ok(res.ok, "Draft creation must succeed");
      assert.ok(res.draft.id, "Draft must have unique ID");
      assert.equal(res.draft.status, "technical_draft");
      assert.equal(res.draft.technical_line_items.length, 2);

      // Verify DB-first reading
      const fetched = await getQuotationTechnicalDraftById({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorRole: "super_admin",
        draftId: res.draft.id,
      });
      assert.ok(fetched.ok, "Must find created draft by ID");
      assert.equal(fetched.draft.id, res.draft.id);
    });

    test("updateQuotationTechnicalDraft updates draft and submit marks submitted_for_commercial_review", async () => {
      const created = await createQuotationTechnicalDraft({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        clientId: "client-draft-uuid-2",
        rawPayload: {
          scopeSummary: "Initial version",
          technicalLineItems: [
            {
              title: "IAM & VPC Configuration",
              description: "Configure least-privilege service accounts and private endpoints.",
              quantity: 1,
            },
          ],
        },
      });
      assert.ok(created.ok, "Creation must succeed");

      const updated = await updateQuotationTechnicalDraft({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        draftId: created.draft.id,
        rawPayload: {
          scopeSummary: "Refined architecture specs",
        },
      });
      assert.ok(updated.ok, "Update must succeed");
      assert.equal(updated.draft.scope_summary, "Refined architecture specs");

      const submitted = await submitQuotationTechnicalDraftForApproval({
        actorUserId: "05991d42-44b3-4fbb-baaa-c6db030844c7",
        actorEmail: "createwithvikash@gmail.com",
        actorRole: "super_admin",
        draftId: created.draft.id,
      });
      assert.ok(submitted.ok, "Submission must succeed");
      assert.equal(submitted.draft.status, "submitted_for_commercial_review");
      assert.ok(submitted.draft.submitted_at);
    });
  });

  // ---------------------------------------------------------------------------
  // WS02: Unique Index on Assignments & Atomic Invitation Rollback
  // ---------------------------------------------------------------------------
  describe("WS02: Unique Staff-Engagement Index & Atomic Invitation Acceptance", () => {
    test("Migration enforces unique index on (staff_user_id, engagement_id)", () => {
      const sql = fs.readFileSync(migrationPath, "utf8");
      assert.ok(
        sql.includes("uq_staff_client_assignments_pair"),
        "Must declare uq_staff_client_assignments_pair index"
      );
      assert.ok(
        sql.includes("DELETE FROM public.staff_client_assignments") &&
          sql.includes("a.staff_user_id = b.staff_user_id"),
        "Must include deduplication logic before unique index creation"
      );
    });

    test("acceptProjectInvitation executes state mutation and enforces atomic rollback on update failure", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require("node:crypto");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabaseAdmin } = require("../../src/lib/supabase/admin");
      const originalFrom = supabaseAdmin.from;

      try {
        const rawToken = "test-raw-token-1234567890abcdef";
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const callerUserId = "user-uuid-111";
        const callerEmail = "colleague@lit.in";
        const otherUserId = "user-uuid-222";
        const otherEmail = "other@lit.in";
        const inviteId = "invite-uuid-999";
        const engagementId = "eng-uuid-888";
        const clientId = "client-uuid-777";

        let assignments: any[] = [];
        const invitations: any[] = [
          {
            id: inviteId,
            token_hash: tokenHash,
            recipient_email: callerEmail,
            engagement_id: engagementId,
            requested_role: "delivery_engineer",
            status: "pending",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            inviter_user_id: "founder-uuid-000",
            accepted_by_user_id: null,
          },
        ];
        let failInviteUpdate = false;
        let eqFilterCalled = false;

        supabaseAdmin.from = (table: string) => {
          const filters: Record<string, any> = {};
          const builder: any = {
            select: () => builder,
            eq: (col: string, val: any) => {
              filters[col] = val;
              return builder;
            },
            maybeSingle: async () => {
              if (table === "client_engagements") {
                return { data: { client_id: clientId }, error: null };
              }
              return { data: null, error: null };
            },
            single: async () => {
              if (table === "project_staff_invitations") {
                const row = invitations.find((i: any) => i.token_hash === filters.token_hash);
                return row ? { data: { ...row }, error: null } : { data: null, error: { message: "Not found" } };
              }
              if (table === "profiles") {
                if (filters.id === callerUserId) {
                  return { data: { id: callerUserId, email: callerEmail }, error: null };
                }
                if (filters.id === otherUserId) {
                  return { data: { id: otherUserId, email: otherEmail }, error: null };
                }
                return { data: null, error: { message: "Profile not found" } };
              }
              return { data: null, error: { message: "Unknown table" } };
            },
            upsert: async (record: any) => {
              if (table === "staff_client_assignments") {
                assignments.push({ ...record, id: "assignment-uuid-123" });
                return { error: null };
              }
              return { error: null };
            },
            update: (updates: any) => {
              const updateBuilder: any = {
                eq: (col: string, val: any) => {
                  if (table === "project_staff_invitations" && col === "id") {
                    eqFilterCalled = true;
                    if (failInviteUpdate) {
                      return Promise.resolve({ error: { message: "Simulated PostgREST error" } });
                    }
                    const target = invitations.find((i: any) => i.id === val);
                    if (target) Object.assign(target, updates);
                    return Promise.resolve({ error: null });
                  }
                  return Promise.resolve({ error: null });
                },
              };
              return updateBuilder;
            },
            delete: () => {
              const deleteFilters: Record<string, any> = {};
              const deleteBuilder: any = {
                eq: (col: string, val: any) => {
                  deleteFilters[col] = val;
                  if (deleteFilters.staff_user_id && deleteFilters.engagement_id) {
                    assignments = assignments.filter(
                      (a) =>
                        !(
                          a.staff_user_id === deleteFilters.staff_user_id &&
                          a.engagement_id === deleteFilters.engagement_id
                        )
                    );
                  }
                  return deleteBuilder;
                },
                then: (resolve: any) => resolve({ error: null }),
              };
              return deleteBuilder;
            },
          };
          return builder;
        };

        // 1. Rejection on account mismatch
        await assert.rejects(
          async () => {
            await acceptProjectInvitation(rawToken, otherUserId);
          },
          /ACCOUNT_MISMATCH/
        );
        assert.equal(assignments.length, 0, "No assignment created on account mismatch");

        // 2. Genuine execution & state mutation
        const result = await acceptProjectInvitation(rawToken, callerUserId);
        assert.equal(result.success, true);
        assert.equal(result.engagementId, engagementId);
        assert.equal(result.role, "delivery_engineer");
        assert.equal(assignments.length, 1);
        assert.equal(assignments[0].staff_user_id, callerUserId);
        assert.equal(assignments[0].engagement_id, engagementId);
        assert.equal(assignments[0].client_id, clientId);
        assert.equal(assignments[0].status, "active");
        assert.equal(invitations[0].status, "accepted");
        assert.equal(invitations[0].accepted_by_user_id, callerUserId);
        assert.equal(eqFilterCalled, true, "Must execute .eq('id', invite.id) on update");

        // 3. Idempotent re-acceptance
        const idempotent = await acceptProjectInvitation(rawToken, callerUserId);
        assert.equal(idempotent.success, true);

        // 4. Atomic compensating rollback on update failure
        assignments = [];
        invitations[0].status = "pending";
        invitations[0].accepted_by_user_id = null;
        failInviteUpdate = true;
        eqFilterCalled = false;

        await assert.rejects(
          async () => {
            await acceptProjectInvitation(rawToken, callerUserId);
          },
          /Failed to update invitation status: Simulated PostgREST error/
        );
        assert.equal(assignments.length, 0, "Created assignment must be deleted on rollback");
        assert.equal(eqFilterCalled, true, "Must still call .eq('id', invite.id)");
      } finally {
        supabaseAdmin.from = originalFrom;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // WS03: Founder-Only Assign Projects Modal
  // ---------------------------------------------------------------------------
  describe("WS03: Accessible Founder-Only Assign Projects Modal", () => {
    test("AssignProjectsModal component file exists and satisfies accessibility requirements", () => {
      const modalPath = path.join(
        rootDir,
        "src/components/workspaces/AssignProjectsModal.tsx"
      );
      assert.ok(fs.existsSync(modalPath), "AssignProjectsModal component must exist");
      const content = fs.readFileSync(modalPath, "utf8");

      // ARIA and accessibility
      assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
      assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
      assert.ok(content.includes("aria-labelledby="), "Must have aria-labelledby");
      assert.ok(content.includes('key === "Escape"'), "Must handle Escape key to close dialog");
      assert.ok(content.includes("focusableElements"), "Must manage keyboard focus trap");

      // Permission toggles
      assert.ok(content.includes("canViewTechnicalStages"), "Must toggle can_view_technical_stages");
      assert.ok(content.includes("canPrepareTechnicalQuotation"), "Must toggle can_prepare_technical_quotation");
      assert.ok(content.includes("canPrepareInvoiceRequest"), "Must toggle can_prepare_invoice_request");
      assert.ok(content.includes("canInviteCollaborators"), "Must toggle can_invite_collaborators");

      // Actions
      assert.ok(content.includes("activeAction === \"add\""), "Must support Add action");
      assert.ok(content.includes("activeAction === \"edit\""), "Must support Edit action");
      assert.ok(content.includes("activeAction === \"reassign\""), "Must support Reassign action");
      assert.ok(content.includes("activeAction === \"revoke\""), "Must support Revoke action");
    });
  });

  // ---------------------------------------------------------------------------
  // WS04: Null-Safe Engagement Handling
  // ---------------------------------------------------------------------------
  describe("WS04: Null-Safe Handling for Client-Wide Assignments", () => {
    test("projects/page.tsx safely renders client assignments with null engagementId", () => {
      const pagePath = path.join(
        rootDir,
        "src/app/admin/workspaces/[id]/projects/page.tsx"
      );
      assert.ok(fs.existsSync(pagePath), "Workspace projects page must exist");
      const content = fs.readFileSync(pagePath, "utf8");

      assert.ok(
        content.includes("eng.engagementId ?"),
        "Must check eng.engagementId before slicing or linking"
      );
      assert.ok(
        content.includes("Client-wide Assignment"),
        "Must display Client-wide Assignment label when engagementId is null"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // WS05: Live Schema Column Projections Aligned
  // ---------------------------------------------------------------------------
  describe("WS05: Schema Projections Aligned to Live Database", () => {
    test("getRedactedStaffSupportContext uses legal_name, company_name, and ordinal/title", () => {
      const staffSupportPath = path.join(rootDir, "src/lib/support/staff-support.ts");
      const content = fs.readFileSync(staffSupportPath, "utf8");

      assert.ok(
        content.includes(".from('clients')") && content.includes("legal_name"),
        "Must query clients.legal_name instead of display_name"
      );
      assert.ok(
        content.includes(".from('client_engagements')") && content.includes("company_name"),
        "Must query client_engagements.company_name"
      );
      assert.ok(
        content.includes(".from('engagement_stages')") && content.includes("ordinal"),
        "Must query engagement_stages(ordinal, stage_key, title)"
      );
      assert.ok(
        content.includes(".from('support_tickets')") && content.includes("ticket_ref"),
        "Must query real canonical support_tickets table"
      );
    });
  });
});
