import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DocumentWalletClient } from "./DocumentWalletClient";

export const dynamic = "force-dynamic";

export default async function StaffDocumentsPage() {
  const ctx = await requireStaffPortal("/staff/documents");

  const { data: docs, error } = await supabaseAdmin
    .from("staff_document_wallet")
    .select("id, file_name, file_size_bytes, mime_type, category, description, created_at, storage_path")
    .eq("owner_user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[staff/documents] query error:", error.message);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Document Wallet</h1>
        <p className="mt-1 text-sm text-slate-600">
          Private documents for your staff workspace. Only you and authorized administrators can access these files.
        </p>
      </div>
      <DocumentWalletClient
        initialDocs={(docs || []).map((d) => ({
          id: d.id,
          fileName: d.file_name,
          sizeBytes: d.file_size_bytes,
          mimeType: d.mime_type,
          category: d.category,
          description: d.description,
          createdAt: d.created_at,
        }))}
      />
    </div>
  );
}
