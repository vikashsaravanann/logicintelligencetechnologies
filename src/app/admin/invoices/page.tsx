import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Invoices & Billing | Admin",
};

export default async function InvoicesPage() {
  await requireCapabilityPage("invoices.read", "/admin/invoices");
  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-6">Invoices & Billing</h1>
      <p className="text-zinc-400">Manage client invoices, payments, and financial records.</p>
      
      <div className="mt-8 p-12 border border-dashed border-neutral-800 rounded-2xl text-center">
        <p className="text-zinc-500 mb-4">Invoice management coming soon.</p>
      </div>
    </div>
  );
}
