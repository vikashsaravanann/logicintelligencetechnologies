import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST, formatINR } from "@/lib/format/datetime";
import { getDocumentType } from "@/config/documents";

export const metadata: Metadata = { title: "Client | Admin" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CLIENT_TONE: Record<string, string> = {
  prospect: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  closed: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
};

const CONTRACT_TONE: Record<string, string> = {
  draft: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  sent: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  signed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  void: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

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

export default async function ClientDetailPage({ params }: Props) {
  await requireCapabilityPage("clients.read", "/admin/clients");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [clientRes, contractsRes, documentsRes, projectRes, eventsRes] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, client_code, legal_name, display_name, contact_name, contact_email, status, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("client_contracts")
      .select("id, reference, contract_type, status, provenance, signatory_name, signatory_email, signed_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, classification, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("projects")
      .select("id, project_code, name, status, value")
      .eq("client_id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("automation_events")
      .select("id, event_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const client = clientRes.data;
  if (!client) notFound();

  const contracts = contractsRes.data ?? [];
  const documents = documentsRes.data ?? [];
  const project = projectRes.data;
  const events = eventsRes.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/clients" className="text-xs font-semibold text-neutral-400 hover:text-white">
        &larr; Back to Clients
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">{client.client_code}</span>
            <h1 className="text-2xl font-bold text-white">{client.legal_name}</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {client.contact_name ? `${client.contact_name} · ` : ""}
              {client.contact_email ?? "No contact email"}
            </p>
          </div>
          <span className={`self-start rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${CLIENT_TONE[client.status] ?? CLIENT_TONE.closed}`}>
            {client.status}
          </span>
        </div>
      </div>

      {/* Contracts */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Contracts</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-neutral-500">No contracts.</p>
        ) : (
          <ul className="space-y-3">
            {contracts.map((c) => (
              <li key={c.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-neutral-200">{c.reference}</span>
                    <span className="ml-2 text-xs text-neutral-500">{c.contract_type}</span>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${CONTRACT_TONE[c.status] ?? CONTRACT_TONE.draft}`}>
                    {c.status}
                  </span>
                </div>
                {c.status === "signed" ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    Signed by {c.signatory_name ?? "—"} ({c.signatory_email ?? "—"}) ·{" "}
                    {c.provenance === "manual_upload" ? "Manually recorded" : c.provenance ?? "—"} ·{" "}
                    {formatIST(c.signed_at, "datetime")}
                  </p>
                ) : (
                  <Link
                    href={`/admin/contracts/${c.id}/record-signature`}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Record signature
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-neutral-500">No documents.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {documents.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/admin/documents/${d.id}`} className="text-sm font-medium text-white hover:text-primary">
                    {d.title}
                  </Link>
                  <p className="text-[11px] text-neutral-500">
                    {getDocumentType(d.doc_type)?.name ?? d.doc_type} · <span className="font-mono">{d.reference}</span>
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${DOC_TONE[d.status] ?? DOC_TONE.draft}`}>
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Project */}
      {project ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Project</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-mono text-xs text-neutral-400">{project.project_code}</span>
              <p className="font-medium text-white">{project.name}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-200">{formatINR(project.value)}</p>
              <p className="text-[11px] text-neutral-500">{project.status}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Events */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Recent automation events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">No recent events.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-xs">
                <span className="text-neutral-200">{e.event_type}</span>
                <span className="text-neutral-500">
                  {e.status} · {formatIST(e.created_at, "datetime")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
