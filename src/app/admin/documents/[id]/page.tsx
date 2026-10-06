import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { getDocumentType } from "@/config/documents";
import { nextStatuses, type DocumentStatus } from "@/lib/documents/lifecycle";
import { DocumentActions } from "../document-actions";
import { uploadVersion, verifyLatest, downloadVersion } from "../actions";

export const metadata: Metadata = { title: "Document | Admin" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOC_TONE: Record<string, string> = {
  draft: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  in_review: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  issued: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  superseded: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  void: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: Props) {
  await requireCapabilityPage("documents.read", "/admin/documents");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [docRes, versionsRes] = await Promise.all([
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, classification, client_id")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("client_document_versions")
      .select("id, version_no, sha256, size_bytes, created_at, note")
      .eq("document_id", id)
      .order("version_no", { ascending: false }),
  ]);

  const doc = docRes.data;
  if (!doc) notFound();

  const versions = versionsRes.data ?? [];
  const docType = getDocumentType(doc.doc_type);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/documents" className="text-xs font-semibold text-neutral-400 hover:text-white">
        &larr; Back to Documents
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
              {docType?.name ?? doc.doc_type}
            </span>
            <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
            <p className="mt-1 font-mono text-xs text-neutral-400">{doc.reference}</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${DOC_TONE[doc.status] ?? DOC_TONE.draft}`}>
              {doc.status}
            </span>
            <span className="text-[11px] text-neutral-500">{doc.classification}</span>
          </div>
        </div>
      </div>

      {/* Transitions */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Lifecycle</h2>
        <DocumentActions
          documentId={doc.id}
          status={doc.status}
          nextStatuses={nextStatuses(doc.status as DocumentStatus)}
        />
      </div>

      {/* Versions */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Versions</h2>
        {versions.length === 0 ? (
          <p className="text-sm text-neutral-500">No versions uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <span className="text-sm font-semibold text-white">v{v.version_no}</span>
                  <span className="ml-3 font-mono text-[11px] text-neutral-500">{v.sha256.slice(0, 16)}…</span>
                  {v.note ? <span className="ml-3 text-[11px] text-neutral-500">{v.note}</span> : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-500">
                    {v.size_bytes} bytes · {formatIST(v.created_at, "datetime")}
                  </span>
                  <form action={downloadVersion}>
                    <input type="hidden" name="versionId" value={v.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-neutral-700 bg-white/5 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      Download
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upload + verify */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Upload signed / replacement version
          </h2>
          <form action={uploadVersion} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="documentId" value={doc.id} />
            <input
              type="file"
              name="file"
              accept="application/pdf"
              required
              className="text-xs text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-primary/90"
            >
              Upload
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">Integrity</h2>
          <form action={verifyLatest}>
            <input type="hidden" name="documentId" value={doc.id} />
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Verify latest version
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
