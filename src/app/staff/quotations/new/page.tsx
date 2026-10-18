import Link from "next/link";
import { requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NewTechnicalDraftForm } from "./NewTechnicalDraftForm";

export const dynamic = "force-dynamic";

export default async function NewTechnicalDraftPage() {
  const ctx = await requireStaffCapability("quotation.technical_draft.create", "/staff/quotations/new");

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("engagement_id, assignment_role, can_prepare_technical_quotation")
    .eq("staff_user_id", ctx.userId)
    .eq("status", "active");

  const engIds = (assignments || [])
    .filter((a) => a.engagement_id && a.can_prepare_technical_quotation !== false)
    .map((a) => a.engagement_id as string);

  const { data: engs } = engIds.length
    ? await supabaseAdmin
        .from("client_engagements")
        .select("id, engagement_ref, company_name, project_title, client_id, contact_name, contact_email")
        .in("id", engIds)
    : { data: [] as Array<Record<string, string>> };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/staff/quotations" className="text-xs font-medium text-teal-700 hover:underline">
        ← Technical Quotations
      </Link>
      <h1 className="text-xl font-bold text-slate-900">New technical draft</h1>
      <NewTechnicalDraftForm
        projects={(engs || []).map((e) => ({
          id: e.id,
          label: `${e.project_title || e.company_name || e.engagement_ref} (${e.engagement_ref || e.id.slice(0, 8)})`,
          clientId: e.client_id || null,
          companyName: e.company_name || "",
          contactName: e.contact_name || "",
          contactEmail: e.contact_email || "",
          projectTitle: e.project_title || "",
        }))}
      />
    </div>
  );
}
