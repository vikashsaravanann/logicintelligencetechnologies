import type { ReactNode } from "react";
import { requireStaffPortal, requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffTasksPage() {
  const path = "/staff/tasks";
  const ctx = await requireStaffPortal(path);

  // Capability gates for optional modules
  const moduleCaps: Record<string, string | null> = {
    tasks: "tasks.manage",
    projects: "projects.assigned.read",
    documents: "documents.read",
    profile: null,
    activity: null,
    leads: "leads.read",
    support: "support.read",
    quotations: "quotation.technical_draft.create",
    invoices: "invoice.preparation.create",
    automations: "automations.read",
    seo: "seo.read",
  };
  const required = moduleCaps["tasks"];
  if (required) {
    await requireStaffCapability(required, path);
  }

  let body: ReactNode = null;

  if ("tasks" === "tasks") {
    const { data: tasks } = await supabaseAdmin
      .from("staff_tasks")
      .select("id, title, description_safe, priority, state, due_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false });
    body = tasks && tasks.length ? (
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {tasks.map((t) => (
          <li key={t.id} className="px-4 py-3">
            <p className="font-medium text-slate-900">{t.title}</p>
            <p className="text-xs text-slate-500">{t.state} · {t.priority}</p>
            {t.description_safe ? <p className="mt-1 text-sm text-slate-600">{t.description_safe}</p> : null}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-slate-500">No tasks assigned.</p>
    );
  } else if ("tasks" === "projects") {
    const { data: assignments } = await supabaseAdmin
      .from("staff_client_assignments")
      .select("id, assignment_role, status, expires_at, client_engagements(project_title, company_name, engagement_ref)")
      .eq("staff_user_id", ctx.userId)
      .eq("status", "active");
    const active = (assignments || []).filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now());
    body = active.length ? (
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {active.map((a: any) => (
          <li key={a.id} className="px-4 py-3">
            <p className="font-medium text-slate-900">{a.client_engagements?.project_title || a.client_engagements?.company_name || "Engagement"}</p>
            <p className="text-xs text-slate-500">{a.assignment_role} · {a.client_engagements?.engagement_ref || ""}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-slate-500">No projects have been assigned to your workspace.</p>
    );
  } else if ("tasks" === "profile") {
    body = (
      <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div><dt className="text-xs text-slate-500">Full legal name</dt><dd className="font-medium">{ctx.fullName}</dd></div>
        <div><dt className="text-xs text-slate-500">Employee code</dt><dd className="font-medium">{ctx.employeeCode || "—"}</dd></div>
        <div><dt className="text-xs text-slate-500">Official email</dt><dd className="font-medium">{ctx.email}</dd></div>
        <div><dt className="text-xs text-slate-500">Department</dt><dd className="font-medium">{ctx.department}</dd></div>
        <div><dt className="text-xs text-slate-500">Job title</dt><dd className="font-medium">{ctx.jobTitle}</dd></div>
        <div><dt className="text-xs text-slate-500">System role</dt><dd className="font-medium">{ctx.role}</dd></div>
      </dl>
    );
  } else if ("tasks" === "documents") {
    const { data: docs } = await supabaseAdmin
      .from("staff_document_wallet")
      .select("id, title, file_name, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(50);
    body = docs && docs.length ? (
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {docs.map((d: any) => (
          <li key={d.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{d.title || d.file_name}</p>
            <p className="text-xs text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleString() : ""}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-slate-500">No documents in your wallet.</p>
    );
  } else {
    body = (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        This module is authorized for your workspace. Operational records will appear here when available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">tasks</h1>
      {body}
    </div>
  );
}
