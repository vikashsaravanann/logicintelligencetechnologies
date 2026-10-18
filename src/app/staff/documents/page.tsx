import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffDocumentsPage() {
  const ctx = await requireStaffPortal("/staff/documents");

  const { data: docs } = await supabaseAdmin
    .from("staff_document_wallet")
    .select("id, title, file_name, created_at")
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Documents</h1>
      {docs && docs.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {docs.map((d) => (
            <li key={d.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{d.title || d.file_name}</p>
              <p className="text-xs text-slate-500">
                {d.created_at ? new Date(d.created_at).toLocaleString() : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No documents in your wallet.</p>
      )}
    </div>
  );
}
