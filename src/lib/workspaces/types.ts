import { z } from "zod";
import type { StaffRole, Capability } from "@/config/roles";
export type { StaffRole } from "@/config/roles";

export const STAFF_SYSTEM_ROLES = [
  "admin",
  "operations",
  "support",
  "developer",
  "viewer",
] as const;

export type StaffSystemRole = (typeof STAFF_SYSTEM_ROLES)[number];

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contractor",
  "intern",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORKSPACE_STATUSES = [
  "pending_email_verification",
  "initial_password_change_required",
  "active",
  "suspended",
  "revoked",
  "archived",
] as const;

export type StaffWorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export const INVITATION_STATUSES = [
  "queued",
  "sending",
  "provider_accepted",
  "delivered",
  "bounced",
  "failed",
] as const;

export type StaffInvitationStatus = (typeof INVITATION_STATUSES)[number];

export const DEPARTMENTS = [
  "Engineering",
  "Design & Creative",
  "Operations & Delivery",
  "Sales & Growth",
  "Client Success",
  "QA & Security",
  "Technical Support",
  "Executive Management",
] as const;

export const MODULE_CAPABILITIES: { id: string; label: string; description: string; defaultRoles: StaffSystemRole[] }[] = [
  {
    id: "tasks.manage",
    label: "My Assigned Tasks",
    description: "Manage own assigned development and operational tasks",
    defaultRoles: ["admin", "operations", "support", "developer", "viewer"],
  },
  {
    id: "projects.assigned.read",
    label: "Assigned Projects",
    description: "View technical milestone status and timelines for assigned engagements",
    defaultRoles: ["admin", "operations", "support", "developer"],
  },
  {
    id: "quotation.technical_draft.create",
    label: "Technical Quotation Preparation",
    description: "Prepare technical architecture scope drafts (commercial pricing strictly reserved for Super Admin)",
    defaultRoles: ["admin", "operations", "developer"],
  },
  {
    id: "invoice.preparation.create",
    label: "Invoice Preparation Requests",
    description: "Draft technical milestone completion notes for invoicing (issuance strictly reserved for Super Admin)",
    defaultRoles: ["admin", "operations"],
  },
  {
    id: "support.assigned_client.assist",
    label: "Assigned Client Support",
    description: "View non-impersonating, financially redacted technical assistance for explicitly assigned clients",
    defaultRoles: ["admin", "operations", "support", "developer"],
  },
  {
    id: "documents.review",
    label: "Technical Documents",
    description: "Review engineering specifications, architecture diagrams, and QA verification evidence",
    defaultRoles: ["admin", "operations", "developer", "support"],
  },
  {
    id: "automations.read",
    label: "Operational Automations",
    description: "Monitor health and execution of system workflows without commercial privileges",
    defaultRoles: ["admin", "operations"],
  },
  {
    id: "leads.read",
    label: "Leads & Intake Inquiries",
    description: "View website and intake inquiries within assigned scope",
    defaultRoles: ["admin", "operations", "support"],
  },
  {
    id: "support.read",
    label: "Support Tickets",
    description: "View support tickets for assigned clients",
    defaultRoles: ["admin", "operations", "support"],
  },
  {
    id: "support.reply",
    label: "Support Responses",
    description: "Reply to support tickets for assigned clients",
    defaultRoles: ["admin", "operations", "support"],
  },
  {
    id: "documents.read",
    label: "Technical Documents",
    description: "Read authorized technical documents",
    defaultRoles: ["admin", "operations", "developer", "support"],
  },
  {
    id: "documents.upload",
    label: "Document Upload",
    description: "Upload technical documents for assigned projects",
    defaultRoles: ["admin", "operations", "developer"],
  },
  {
    id: "seo.read",
    label: "SEO & Analytics",
    description: "View SEO and analytics monitoring data",
    defaultRoles: ["admin", "operations"],
  },

];

export const createStaffWorkspaceSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(120, "Full name cannot exceed 120 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("A valid official email is required"),
    phone: z
      .string()
      .trim()
      .min(8, "Phone number is too short")
      .max(20, "Phone number is too long"),
    department: z
      .string()
      .trim()
      .min(2, "Department is required"),
    jobTitle: z
      .string()
      .trim()
      .min(2, "Working job title is required")
      .max(80, "Job title cannot exceed 80 characters"),
    employmentType: z.enum(EMPLOYMENT_TYPES).default("full_time"),
    employeeCode: z
      .string()
      .trim()
      .max(32, "Employee code cannot exceed 32 characters")
      .regex(/^$|^[A-Za-z0-9._\-\/]+$/, "Employee code contains invalid characters")
      .optional(),
    systemRole: z.enum(STAFF_SYSTEM_ROLES),
    temporaryPassword: z
      .string()
      .min(12, "Temporary password must be at least 12 characters"),
    confirmPassword: z.string(),
    allowedModules: z.array(z.string()).default([]),
    clientAssignments: z.array(z.string().uuid()).default([]),
    managerUserId: z.string().uuid().nullable().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.temporaryPassword === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

export type CreateStaffWorkspaceInput = z.infer<typeof createStaffWorkspaceSchema>;

export interface StaffWorkspaceRecord {
  id: string;
  owner_user_id: string;
  name: string;
  status: StaffWorkspaceStatus;
  role_snapshot: StaffRole;
  created_by: string | null;
  activated_at: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  last_access_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffEmployeeRecord {
  id: string;
  auth_user_id: string;
  full_name: string;
  employee_code: string | null;
  email_normalized: string;
  phone_e164: string;
  department: string;
  job_title: string;
  employment_type: EmploymentType;
  manager_user_id: string | null;
  employment_status: "active" | "suspended" | "offboarded";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffWorkspaceSummaryDTO {
  id: string;
  ownerUserId: string;
  name: string;
  status: StaffWorkspaceStatus;
  role: StaffRole;
  employee: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    jobTitle: string;
    employmentType: EmploymentType;
    employmentStatus: string;
  };
  invitationStatus: StaffInvitationStatus;
  taskCount: number;
  assignedProjectCount: number;
  createdAt: string;
  lastAccessAt: string | null;
}

export interface StaffTaskDTO {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  state: "todo" | "in_progress" | "review" | "completed" | "blocked" | "cancelled";
  dueAt: string | null;
  projectId: string | null;
}

export interface StaffWorkspaceCreatedResult {
  success: boolean;
  workspaceId: string;
  workspaceUrl: string;
  loginRedirectUrl: string;
  invitationStatus: StaffInvitationStatus;
  employee: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    jobTitle: string;
    systemRole: string;
  };
}

export interface SafeEmployeeWorkspaceDTO {
  workspaceId: string;
  ownerUserId: string;
  name: string;
  status: StaffWorkspaceStatus;
  role: StaffRole;
  jobTitle: string;
  department: string;
  fullName: string;
  email: string;
  capabilities: string[];
  tasks: StaffTaskDTO[];
  assignedEngagements: Array<{
    assignmentId: string;
    engagementId: string;
    clientName: string;
    assignmentRole: string;
    canViewTechnicalStages: boolean;
    canPrepareTechnicalQuotation: boolean;
    canPrepareInvoiceRequest: boolean;
  }>;
  isSuperAdminManagementView?: boolean;
}
