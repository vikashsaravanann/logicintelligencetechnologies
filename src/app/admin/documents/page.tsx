import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { DOCUMENT_TYPES, getDocumentType } from "@/config/documents";

export const metadata: Metadata = { title: "Documents | Admin" };
export const dynamic = "force-dynamic";

const DOC_TONE: Record<string, string> = {
  draft: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  in_review: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  issued: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  superseded: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  void: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

const JOB_TONE: Record<string, string> = {
  queued: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  claimed: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  rendering: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  succeeded: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  failed: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  dead_letter: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default async function DocumentsPage() {
  await requireCapabilityPage("documents.read", "/admin/documents");

  const [docsRes, jobsRes] = await Promise.all([
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("document_render_jobs")
      .select("id, status, attempts, error, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const docs = docsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="mt-1 text-sm text-neutral-400">Document registry, issued documents, and render jobs.</p>
      </div>

      {/* Registry */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Document registry</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(DOCUMENT_TYPES).map((t) => (
            <div key={t.key} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
              <h3 className="text-sm font-bold text-white">{t.name}</h3>
              <p className="mt-1 font-mono text-[11px] text-neutral-500">{t.referencePrefix}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                  {t.masterStatus}
                </span>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                  {t.templateStatus}
                </span>
              </div>
              <p className="mt-3 text-[11px] text-neutral-500">
                Signature required: {t.requiresSignature ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Documents table */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Documents</h2>
        {docsRes.error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
            Could not load documents. The database query failed.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-900/40">
                    <td className="px-4 py-3 text-neutral-300">{getDocumentType(d.doc_type)?.name ?? d.doc_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">{d.reference}</td>
                    <td className="px-4 py-3 text-neutral-200">
                      <Link href={`/admin/documents/${d.id}`} className="font-medium text-white hover:text-primary">
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${DOC_TONE[d.status] ?? DOC_TONE.draft}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{formatIST(d.created_at, "date")}</td>
                  </tr>
                ))}
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No documents yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Render jobs */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Render jobs</h2>
        {jobsRes.error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
            Could not load render jobs. The database query failed.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Attempts</th>
                  <th className="px-4 py-3 font-semibold">Error</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${JOB_TONE[j.status] ?? JOB_TONE.queued}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{j.attempts}</td>
                    <td className="px-4 py-3 text-neutral-400">{j.error ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-400">{formatIST(j.created_at, "datetime")}</td>
                  </tr>
                ))}
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">No render jobs.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
