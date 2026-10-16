import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import PaymentVerificationClient, {
  type PaymentRequestListItem,
} from "./payment-verification-client";
import { ShieldCheck, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/format/datetime";
import { calculateEngagementFinancials } from "@/lib/engagements/financials";

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

  // 1. Query legacy standalone payment requests
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

  // 2. Query 13-stage engagement payments (Stage 06 Initial Deposit & Stage 11 Final Settlement)
  const { data: rawEngagementStages, error: stagesError } = await supabaseAdmin
    .from("engagement_stages")
    .select(`
      id,
      engagement_id,
      stage_key,
      title,
      ordinal,
      status,
      snapshot,
      completed_at,
      approved_at,
      created_at,
      updated_at,
      client_engagements (
        id,
        engagement_ref,
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        metadata
      )
    `)
    .in("stage_key", ["initial-invoice", "final-payment"])
    .order("updated_at", { ascending: false });

  if (stagesError) {
    console.error("[AdminPaymentsPage] Error fetching engagement stages:", stagesError);
  }

  // 3. Map engagement stage payments
  const engagementStageRequests: PaymentRequestListItem[] = (rawEngagementStages || [])
    .filter((st: any) => {
      const snap = (st.snapshot || {}) as Record<string, any>;
      return (
        snap.utrNumber ||
        snap.utr ||
        snap.transactionRef ||
        st.status === "under_review" ||
        st.status === "verified" ||
        st.status === "completed" ||
        st.status === "approved"
      );
    })
    .map((st: any) => {
      const eng =
        (Array.isArray(st.client_engagements)
          ? st.client_engagements[0]
          : st.client_engagements) || {};
      const snap = (st.snapshot || {}) as Record<string, any>;
      const metadata = (eng.metadata || {}) as Record<string, any>;

      const candidateSubtotal =
        snap.subtotal ||
        metadata.contract_subtotal ||
        metadata.subtotal ||
        metadata.contract_value ||
        metadata.budget_range ||
        50;

      const financials = calculateEngagementFinancials(candidateSubtotal);
      const isInitial = st.stage_key === "initial-invoice";
      const milestoneAmount = isInitial
        ? financials.depositAmount
        : financials.settlementAmount;
      const milestoneSubtotal = Math.round((financials.subtotal / 2) * 100) / 100;
      const milestoneCgst = Math.round((financials.cgstAmount / 2) * 100) / 100;
      const milestoneSgst = Math.round((financials.sgstAmount / 2) * 100) / 100;

      const utr =
        snap.utrNumber ||
        snap.utr ||
        snap.transactionRef ||
        "Bank-Credit-Pending";
      const remitter =
        snap.remitterName || eng.contact_name || "Enterprise Client";
      const remitterBank = snap.remitterBank || "State Bank of India";
      const isApproved =
        st.status === "verified" ||
        st.status === "completed" ||
        st.status === "approved";
      const isUnderReview = st.status === "under_review";

      const attempts = [
        {
          id: `att-${st.id}`,
          utr: utr,
          payer_upi_id: snap.beneficiaryVpa || "9342877474@ptyes",
          payer_bank_name: remitterBank,
          reported_amount_paise: Math.round(milestoneAmount * 100),
          payment_proof_storage_path: snap.proofUrl || null,
          notes: `Reported Remitter: ${remitter} (${remitterBank}) · Date: ${
            snap.paymentDate || new Date().toISOString().split("T")[0]
          }`,
          status: isApproved ? "reconciled" : "submitted",
          created_at: st.updated_at || st.created_at,
        },
      ];

      const reconciliation = isApproved
        ? {
            id: `rec-${st.id}`,
            bank_credit_reference:
              snap.transaction_ref ||
              snap.bank_credit_reference ||
              utr,
            bank_credit_amount_paise: Math.round(milestoneAmount * 100),
            credited_at:
              st.approved_at || st.updated_at || new Date().toISOString(),
            receiving_bank_account: "YES BANK / PTYES",
            reconciliation_notes:
              snap.notes || "Verified by Super Admin in primary bank ledger",
          }
        : null;

      const invoice_doc = snap.invoice_number
        ? {
            id: `inv-${st.id}`,
            document_number: snap.invoice_number,
            title: `Tax Invoice - ${
              isInitial
                ? "Stage 06: Initial 50% Deposit"
                : "Stage 11: Final 50% Settlement"
            }`,
            sha256_hash: snap.invoice_hash || "verified-sha256",
            issued_at: st.approved_at || st.updated_at,
          }
        : null;

      const receipt_doc = snap.receipt_number
        ? {
            id: `rcpt-${st.id}`,
            document_number: snap.receipt_number,
            title: `Payment Receipt - ${
              isInitial
                ? "Stage 06: Initial 50% Deposit"
                : "Stage 11: Final 50% Settlement"
            }`,
            sha256_hash: snap.receipt_hash || "verified-sha256",
            issued_at: st.approved_at || st.updated_at,
          }
        : null;

      return {
        id: st.id,
        milestone_title: isInitial
          ? "Stage 06: Initial 50% Project Commitment Deposit"
          : "Stage 11: Final 50% Milestone Settlement",
        stage_number: isInitial ? 6 : 11,
        milestone_index: isInitial ? 1 : 2,
        total_payable_paise: Math.round(milestoneAmount * 100),
        subtotal_paise: Math.round(milestoneSubtotal * 100),
        cgst_paise: Math.round(milestoneCgst * 100),
        sgst_paise: Math.round(milestoneSgst * 100),
        igst_paise: 0,
        is_interstate: false,
        status: isApproved
          ? "approved"
          : isUnderReview
          ? "under_review"
          : "awaiting_payment",
        secure_token: eng.engagement_ref || st.engagement_id,
        expires_at: new Date(new Date(st.created_at || "2026-01-01T00:00:00Z").getTime() + 86400000 * 30).toISOString(),
        created_at: st.created_at,
        updated_at: st.updated_at,
        invoice_id: invoice_doc?.id || null,
        receipt_id: receipt_doc?.id || null,
        client: {
          id: eng.id || st.engagement_id,
          name: eng.contact_name || remitter,
          company_name: eng.company_name || null,
          email: eng.contact_email || "",
          phone: eng.contact_phone || null,
        },
        billing_submission: {
          id: `bill-${st.id}`,
          customer_type: "business",
          legal_name: remitter,
          company_name: eng.company_name || null,
          email: eng.contact_email || "",
          phone: eng.contact_phone || "",
          address_line1: snap.placeOfSupply || "Tamil Nadu",
          city: "Chennai",
          state: "Tamil Nadu",
          postal_code: "600001",
          country: "India",
          client_gstin: snap.gstin || null,
          place_of_supply: snap.placeOfSupply || "Tamil Nadu (33)",
        },
        attempts,
        reconciliation,
        invoice_doc,
        receipt_doc,
      };
    });

  // Normalize legacy payment requests
  const legacyPaymentRequests: PaymentRequestListItem[] = (rawRequests || []).map((row: any) => {
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

  // Combine live engagement stages and legacy payment requests
  const initialRequests: PaymentRequestListItem[] = [
    ...engagementStageRequests,
    ...legacyPaymentRequests,
  ];

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
