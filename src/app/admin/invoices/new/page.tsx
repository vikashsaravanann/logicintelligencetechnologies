import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import { CreateInvoiceForm } from "../../components/CreateInvoiceForm";

export const metadata: Metadata = {
  title: "New Invoice | Admin | Logic Intelligence Technologies",
  description: "Generate and dispatch a new itemized client invoice.",
};

export default async function NewInvoicePage() {
  await requireCapabilityPage("invoices.write", "/admin/invoices/new");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <AdminBackLink href="/admin/invoices" label="Back to Invoices" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
            New Invoice
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            The invoice number is generated sequentially on the server (<span className="font-mono text-xs font-semibold">LIT-INV-YYYY-XXXX</span>). The invoice record is saved even if the email cannot be sent immediately — the outcome indicates real email delivery status.
          </p>
        </div>
      </div>

      <CreateInvoiceForm />
    </div>
  );
}

