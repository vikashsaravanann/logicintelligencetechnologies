import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import PaymentVerificationClient, {
  type PaymentRequestListItem,
} from "./payment-verification-client";
import { ShieldCheck, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Payment Verification & Reconciliation | Admin | Logic Intelligence Technologies",
  description:
    "Super Admin portal for verifying client-reported UPI transactions, bank ledger reconciliation, and dual-document generation.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireCapabilityPage("payment.verify", "/admin/payments");

  const { data: rawRequests, error } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select(`
      id,
      milestone_title,
      stage_number,
      milestone_index,
      total_payable_paise,
      subtotal_paise,
      cgst_paise,
      sgst_paise,
      igst_paise,
      is_interstate,
      status,
      secure_token,
      expires_at,
      created_at,
      updated_at,
      invoice_id,
      receipt_id,
      clients (
        id,
        legal_name,
        display_name,
        contact_email
      ),
      payment_billing_submissions (
        id,
        customer_type,
        legal_name,
        company_name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        client_gstin,
        place_of_supply
      ),
      payment_attempts (
        id,
        utr,
        payer_upi_id,
        payer_bank_name,
        reported_amount_paise,
        payment_proof_storage_path,
        notes,
        status,
        created_at
      ),
      payment_reconciliations (
        id,
        bank_credit_reference,
        bank_credit_amount_paise,
        credited_at,
        receiving_bank_account,
        reconciliation_notes
      ),
      financial_documents (
        id,
        doc_type,
        document_number,
        title,
        sha256_hash,
        issued_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminPaymentsPage] Error fetching payment requests:", error);
  }

  // Normalize data for client component
  const initialRequests: PaymentRequestListItem[] = (rawRequests || []).map((row: any) => {
    // 1. Client
    const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const client = clientData
      ? {
          id: clientData.id,
          name: clientData.display_name || clientData.legal_name || "Client",
          company_name: clientData.legal_name || null,
          email: clientData.contact_email || "",
          phone: null,
        }
      : null;

    // 2. Billing submission
    const billingRaw = Array.isArray(row.payment_billing_submissions)
      ? row.payment_billing_submissions[0]
      : row.payment_billing_submissions;
    const billing_submission = billingRaw
      ? {
          id: billingRaw.id,
          customer_type: billingRaw.customer_type,
          legal_name: billingRaw.legal_name,
          company_name: billingRaw.company_name,
          email: billingRaw.email,
          phone: billingRaw.phone,
          address_line1: billingRaw.address_line1,
          address_line2: billingRaw.address_line2,
          city: billingRaw.city,
          state: billingRaw.state,
          postal_code: billingRaw.postal_code,
          country: billingRaw.country,
          client_gstin: billingRaw.client_gstin,
          place_of_supply: billingRaw.place_of_supply,
        }
      : null;

    // 3. Payment attempts (sorted latest first)
    const attemptsRaw = Array.isArray(row.payment_attempts) ? row.payment_attempts : [];
    const attempts = attemptsRaw
      .map((att: any) => ({
        id: att.id,
        utr: att.utr,
        payer_upi_id: att.payer_upi_id,
        payer_bank_name: att.payer_bank_name,
        reported_amount_paise: att.reported_amount_paise,
        payment_proof_storage_path: att.payment_proof_storage_path,
        notes: att.notes,
        status: att.status,
        created_at: att.created_at,
      }))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 4. Reconciliation
    const recRaw = Array.isArray(row.payment_reconciliations)
      ? row.payment_reconciliations[0]
      : row.payment_reconciliations;
    const reconciliation = recRaw
      ? {
          id: recRaw.id,
          bank_credit_reference: recRaw.bank_credit_reference,
          bank_credit_amount_paise: recRaw.bank_credit_amount_paise,
          credited_at: recRaw.credited_at,
          receiving_bank_account: recRaw.receiving_bank_account,
          reconciliation_notes: recRaw.reconciliation_notes,
        }
      : null;

    // 5. Financial documents
    const docsRaw = Array.isArray(row.financial_documents) ? row.financial_documents : [];
    const invoiceDocRaw = docsRaw.find((d: any) => d.doc_type === "invoice");
    const receiptDocRaw = docsRaw.find((d: any) => d.doc_type === "receipt");

    const invoice_doc = invoiceDocRaw
      ? {
          id: invoiceDocRaw.id,
          document_number: invoiceDocRaw.document_number,
          title: invoiceDocRaw.title,
          sha256_hash: invoiceDocRaw.sha256_hash,
          issued_at: invoiceDocRaw.issued_at,
        }
      : null;

    const receipt_doc = receiptDocRaw
      ? {
          id: receiptDocRaw.id,
          document_number: receiptDocRaw.document_number,
          title: receiptDocRaw.title,
          sha256_hash: receiptDocRaw.sha256_hash,
          issued_at: receiptDocRaw.issued_at,
        }
      : null;

    return {
      id: row.id,
      milestone_title: row.milestone_title,
      stage_number: row.stage_number,
      milestone_index: row.milestone_index,
      total_payable_paise: row.total_payable_paise,
      subtotal_paise: row.subtotal_paise,
      cgst_paise: row.cgst_paise,
      sgst_paise: row.sgst_paise,
      igst_paise: row.igst_paise,
      is_interstate: row.is_interstate,
      status: row.status,
      secure_token: row.secure_token,
      expires_at: row.expires_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      invoice_id: row.invoice_id,
      receipt_id: row.receipt_id,
      client,
      billing_submission,
      attempts,
      reconciliation,
      invoice_doc,
      receipt_doc,
    };
  });

  // Calculate high-level metrics
  const totalUnderReview = initialRequests.filter(
    (r) => r.status === "under_review" || r.status === "payment_reported"
  ).length;
  const totalApproved = initialRequests.filter((r) => r.status === "approved").length;
  const totalSettledPaise = initialRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.total_payable_paise, 0);

  return (
    <div className="space-y-6">
      <AdminBackLink />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Payment Verification & Reconciliation
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Super Admin Audit Gate
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Verify client-reported UPI transactions against authoritative bank credit records,
            issue legally binding Tax Invoices and Payment Receipts, and advance lifecycle stages.
          </p>
        </div>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-900">{totalUnderReview}</div>
            <div className="text-xs font-medium text-amber-700">Awaiting Reconciliation</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-900">{totalApproved}</div>
            <div className="text-xs font-medium text-emerald-700">Verified & Reconciled</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {formatINR(totalSettledPaise / 100)}
            </div>
            <div className="text-xs font-medium text-slate-500">Total Settled Volume</div>
          </div>
        </div>
      </div>

      {/* Client Interactive Table & Modal */}
      <PaymentVerificationClient initialRequests={initialRequests} />
    </div>
  );
}
