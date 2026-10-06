import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { recordSignature } from "../../actions";

export const metadata: Metadata = { title: "Record Signature | Admin" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecordSignaturePage({ params }: Props) {
  await requireCapabilityPage("contracts.record_signature", "/admin/contracts");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data: contract } = await supabaseAdmin
    .from("client_contracts")
    .select("id, client_id, reference, contract_type, status, provenance, signatory_name, signatory_email, signed_at")
    .eq("id", id)
    .maybeSingle();

  if (!contract) notFound();

  const alreadySigned = contract.status === "signed";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {contract.client_id ? (
        <Link href={`/admin/clients/${contract.client_id}`} className="text-xs font-semibold text-neutral-400 hover:text-white">
          &larr; Back to client
        </Link>
      ) : null}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
            {contract.contract_type} · {contract.reference}
          </span>
          <h1 className="text-2xl font-bold text-white">Record contract signature</h1>
        </div>

        {alreadySigned ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <p className="font-semibold">This contract is already signed.</p>
            <p className="mt-2 text-emerald-300/90">
              {contract.provenance === "manual_upload" ? "Manually recorded" : contract.provenance ?? "—"} · signed by{" "}
              {contract.signatory_name ?? "—"} ({contract.signatory_email ?? "—"}) on {formatIST(contract.signed_at, "datetime")}.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200" role="note">
              Manually recorded — not provider-verified. Only upload a PDF you have confirmed is the genuine
              signed agreement.
            </div>

            <form action={recordSignature} className="space-y-4">
              <input type="hidden" name="contractId" value={contract.id} />

              <div>
                <label htmlFor="signatoryName" className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Signatory name
                </label>
                <input
                  id="signatoryName"
                  name="signatoryName"
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="signatoryEmail" className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Signatory email
                </label>
                <input
                  id="signatoryEmail"
                  name="signatoryEmail"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="file" className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Signed PDF
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  required
                  className="mt-1 w-full text-xs text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-primary/90"
              >
                Record signature
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
