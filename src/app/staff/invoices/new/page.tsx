import Link from "next/link";
import { requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NewInvoicePrepForm } from "./NewInvoicePrepForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePrepPage() {
  const ctx = await requireStaffCapability("invoice.preparation.create", "/staff/invoices/new");

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("engagement_id, can_prepare_invoice_request")
    .eq("staff_user_id", ctx.userId)
    .eq("status", "active");

  const engIds = (assignments || [])
    .filter((a) => a.engagement_id && a.can_prepare_invoice_request !== false)
    .map((a) => a.engagement_id as string);

  const { data: engs } = engIds.length
    ? await supabaseAdmin
        .from("client_engagements")
        .select("id, engagement_ref, company_name, project_title, client_id")
        .in("id", engIds)
    : { data: [] as Array<Record<string, string>> };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/staff/invoices" className="text-xs font-medium text-teal-700 hover:underline">
        ← Invoice Preparation
      </Link>
      <h1 className="text-xl font-bold text-slate-900">New invoice preparation</h1>
      <NewInvoicePrepForm
        projects={(engs || []).map((e) => ({
          id: e.id,
          label: `${e.project_title || e.company_name} (${e.engagement_ref || e.id.slice(0, 8)})`,
          clientId: e.client_id || null,
        }))}
      />
    </div>
  );
}
