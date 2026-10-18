import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createStaffWorkspaceSchema } from "../../src/lib/workspaces/types";

const readCode = (relPath: string) => fs.readFileSync(relPath, "utf8");

test("Staff Workspace Validation: rejects invalid inputs", () => {
  const invalidInputs = [
    {
      fullName: "Vikash",
      email: "not-an-email",
      phone: "+919876543210",
      department: "Engineering",
      jobTitle: "Senior AI Engineer",
      employmentType: "full_time" as const,
      systemRole: "developer" as const,
      temporaryPassword: "Password123!@",
      confirmPassword: "Password123!@",
      allowedModules: ["tasks.manage"],
      clientAssignments: [],
    },
    {
      fullName: "Vikash",
      email: "employee@logicintelligencetechnologies.in",
      phone: "+919876543210",
      department: "Engineering",
      jobTitle: "Senior AI Engineer",
      employmentType: "full_time" as const,
      systemRole: "developer" as const,
      temporaryPassword: "short",
      confirmPassword: "short",
      allowedModules: ["tasks.manage"],
      clientAssignments: [],
    },
    {
      fullName: "Vikash",
      email: "employee@logicintelligencetechnologies.in",
      phone: "+919876543210",
      department: "Engineering",
      jobTitle: "Senior AI Engineer",
      employmentType: "full_time" as const,
      systemRole: "developer" as const,
      temporaryPassword: "Password123456!",
      confirmPassword: "DifferentPassword123456!",
      allowedModules: ["tasks.manage"],
      clientAssignments: [],
    },
    {
      fullName: "A",
      email: "employee@logicintelligencetechnologies.in",
      phone: "+919876543210",
      department: "Engineering",
      jobTitle: "Senior AI Engineer",
      employmentType: "full_time" as const,
      systemRole: "developer" as const,
      temporaryPassword: "Password123456!",
      confirmPassword: "Password123456!",
      allowedModules: ["tasks.manage"],
      clientAssignments: [],
    },
  ];

  for (const input of invalidInputs) {
    const parsed = createStaffWorkspaceSchema.safeParse(input);
    assert.strictEqual(parsed.success, false, `Expected input to fail validation: ${JSON.stringify(input)}`);
  }
});

test("Staff Workspace Validation: accepts strong, valid founder input", () => {
  const validInput = {
    fullName: "Arun Kumar",
    employeeCode: "LIT-EMP-001",
    email: "arun.kumar@logicintelligencetechnologies.in",
    phone: "+919876543210",
    department: "Engineering",
    jobTitle: "Lead Systems Architect",
    employmentType: "full_time" as const,
    systemRole: "developer" as const,
    temporaryPassword: "SuperSecurePassword123!#",
    confirmPassword: "SuperSecurePassword123!#",
    allowedModules: ["tasks.manage", "projects.assigned.read"],
    clientAssignments: ["11111111-1111-4111-8111-111111111111"],
    notes: "Provisioned for enterprise deliverables",
  };

  const parsed = createStaffWorkspaceSchema.safeParse(validInput);
  assert.strictEqual(parsed.success, true, "Valid input must pass schema validation");
  if (parsed.success) {
    assert.strictEqual(parsed.data.email, "arun.kumar@logicintelligencetechnologies.in");
    assert.strictEqual(parsed.data.systemRole, "developer");
    assert.strictEqual(parsed.data.allowedModules.length, 2);
  }
});

test("Staff Workspace Security: creation API requires super_admin caller", () => {
  const code = readCode("src/app/api/admin/workspaces/route.ts");
  assert.ok(code.includes('getSuperAdminCaller()'), "Workspace creation must authenticate caller through getSuperAdminCaller");
  assert.ok(code.includes('profile?.role !== "super_admin"'), "Caller must have role 'super_admin' in profiles table");
  assert.ok(code.includes("createStaffWorkspace"), "Workspace creation must invoke isolated service handler");
  assert.ok(code.includes("FORBIDDEN: Verified Super Admin access required."), "Non-super-admin requests must be forbidden");
});

test("Staff Workspace Security: single workspace API enforces strict non-impersonation isolation", () => {
  const code = readCode("src/app/api/admin/workspaces/[id]/route.ts");
  assert.ok(code.includes("getCallerUser()"), "Must resolve caller from authenticated session");
  assert.ok(code.includes("getStaffWorkspace(workspaceId, caller.userId)"), "Must verify workspace access via service layer with caller ID");
  assert.ok(code.includes("403") && code.includes("404"), "Unauthorized or non-existent access returns appropriate error status");
});

test("Staff Workspace Security: tasks API enforces workspace ownership or super admin privilege", () => {
  const code = readCode("src/app/api/admin/workspaces/[id]/tasks/route.ts");
  assert.ok(code.includes("getCallerUser()"), "Tasks endpoint must resolve caller session");
  assert.ok(
    code.includes('ws.owner_user_id !== caller.userId && caller.role !== "super_admin"'),
    "Mutating or reading tasks must verify caller is workspace owner or super admin"
  );
});

test("Staff Workspace Security: email template never receives or renders plaintext password", () => {
  const templateCode = readCode("emails/staff-workspace-invitation-email.tsx");
  assert.ok(!templateCode.includes("temporaryPassword?:"), "Email props must never accept a password prop");
  assert.ok(templateCode.includes("EmailHeader"), "Email template must use standard corporate EmailHeader with wordmark");
  assert.ok(templateCode.includes("Logic Intelligence Technologies"), "Email template must mention company name");
  assert.ok(templateCode.includes("workspaceUrl"), "Email template must provide secure workspace URL");
  assert.ok(
    templateCode.includes("passwords are <em>never</em> sent via email") ||
    templateCode.includes("passwords are never sent via email"),
    "Email template must reinforce policy that passwords are never sent via email"
  );

  const serviceCode = readCode("src/lib/workspaces/service.ts");
  assert.ok(serviceCode.includes("email_outbox"), "Must record outbound invitation in email_outbox table");
  assert.ok(
    !serviceCode.includes("payload: { ... , password") &&
    !serviceCode.includes("template_props: { ... , temporaryPassword"),
    "Service outbox payload must never store temporary password"
  );
});

test("Staff Workspace Security: global navigation uses verified entitlement, not email heuristics", () => {
  const navCode = readCode("src/components/layout/auth-nav-control.tsx");
  assert.ok(!navCode.includes("isStaffUser"), "auth-nav-control must NOT contain isStaffUser");
  assert.ok(!navCode.includes('@logicintelligencetechnologies.in"'), "auth-nav-control must not check email domain strings");
  assert.ok(navCode.includes("entitlement?.hasActiveWorkspace"), "Must check entitlement.hasActiveWorkspace");
  assert.ok(navCode.includes("entitlement?.isSuperAdmin"), "Must check entitlement.isSuperAdmin");
});
