import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { recordSignature } from "../../actions";
import { AdminBackLink } from "../../../components/AdminBackLink";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  Mail,
  ShieldCheck,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Record Signature | Admin | Logic Intelligence Technologies",
  description: "Record and attest executed client contract signatures into the immutable registry.",
  robots: {
    index: false,
    follow: false,
  },
};

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

  let clientDisplayName = null;
  if (contract.client_id) {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("display_name, legal_name, client_code")
      .eq("id", contract.client_id)
      .maybeSingle();
    clientDisplayName = client?.display_name || client?.legal_name || client?.client_code;
  }

  const alreadySigned = contract.status === "signed";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Navigation & Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        {contract.client_id ? (
          <AdminBackLink
            href={`/admin/clients/${contract.client_id}`}
            label={clientDisplayName ? `Client: ${clientDisplayName}` : "Back to Client"}
          />
        ) : (
          <AdminBackLink href="/admin/command-center" label="Command Center" />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <FileCheck2 className="w-3 h-3" />
            {contract.contract_type ?? "Contract"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            Ref: {contract.reference}
          </span>
          {alreadySigned ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Signed & Attested
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider font-mono">
              Awaiting Signature
            </span>
          )}
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Record Contract Signature
        </h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
          Record verified offline or provider-attested signatures and store the executed PDF agreement immutably.
        </p>
      </div>

      {alreadySigned ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
              Contract Executed & Recorded
            </h2>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            This contract has already been signed and recorded in the immutable contract registry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-200/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block mb-0.5">
                Signatory Name
              </span>
              <span className="font-semibold text-emerald-950">{contract.signatory_name ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block mb-0.5">
                Signatory Email
              </span>
              <span className="font-mono text-emerald-950">{contract.signatory_email ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block mb-0.5">
                Execution Timestamp
              </span>
              <span className="font-mono text-emerald-950">{formatIST(contract.signed_at, "datetime")}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-emerald-800 font-mono">
            Provenance:{" "}
            <span className="font-semibold">
              {contract.provenance === "manual_upload"
                ? "Manual Operator Attestation"
                : contract.provenance ?? "Standard"}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Attestation Warning */}
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-2xs flex items-start gap-3.5"
            role="note"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold text-amber-950 block mb-0.5">
                Manual Operator Attestation Protocol
              </strong>
              This signature is operator-attested and not provider-verified. Ensure that you have thoroughly verified the
              genuine executed agreement prior to recording. Uploaded files are SHA-256 hashed and stored immutably.
            </div>
          </div>

          {/* Form */}
          <form action={recordSignature} className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-6">
            <input type="hidden" name="contractId" value={contract.id} />

            <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
              <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Signatory & Document Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signatoryName"
                  className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5"
                >
                  Signatory Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signatoryName"
                    name="signatoryName"
                    type="text"
                    required
                    placeholder="e.g. Dr. Eleanor Vance"
                    className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signatoryEmail"
                  className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5"
                >
                  Signatory Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="signatoryEmail"
                  name="signatoryEmail"
                  type="email"
                  required
                  placeholder="e.g. eleanor@clientorg.com"
                  className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="file"
                className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5"
              >
                Executed Signed PDF Agreement <span className="text-rose-500">*</span>
              </label>
              <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 p-4">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  required
                  className="w-full text-xs text-[var(--lit-navy,#0B2545)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--lit-navy,#0B2545)] file:text-white hover:file:bg-[var(--lit-navy,#0B2545)]/90 cursor-pointer"
                />
                <p className="mt-2 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  Maximum file size: 4 MB. Must be a valid PDF document with genuine signatory attestation.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Record Executed Signature</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
