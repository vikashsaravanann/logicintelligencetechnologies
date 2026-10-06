import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { CreateInvoiceForm } from "../../components/CreateInvoiceForm";

export const metadata: Metadata = {
  title: "New Invoice | Admin",
};

export default async function NewInvoicePage() {
  await requireCapabilityPage("invoices.write", "/admin/invoices/new");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to invoices
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">New Invoice</h1>
        <p className="mt-1 text-sm text-neutral-400">
          The invoice number is generated on the server. The invoice is saved even if the email cannot be sent — the
          result tells you the real email status.
        </p>
      </div>
      <CreateInvoiceForm />
    </div>
  );
}
