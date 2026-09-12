import { Metadata } from "next";
import { Download, FileText, Lock, ShieldCheck, Upload } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Documents Vault | Client Portal",
};

export const revalidate = 0;

export default async function ClientDocumentsPage() {
  const { data: files } = await supabaseAdmin
    .from("client_files")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Encrypted Documents Vault
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Secure client storage for contracts, architectural blueprints, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AES-256 Cloud Vault</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Document Name</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {files && files.length > 0 ? (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-white">{file.file_name}</span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-primary text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-zinc-500 text-xs">
                    No custom documents uploaded yet. Delivered assets will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
