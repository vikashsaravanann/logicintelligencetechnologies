import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { listQuotations } from "@/lib/quotations/service";
import { QuotationRegistryClient } from "./quotation-registry-client";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Quotation Registry | Admin | Logic Intelligence Technologies",
  description: "Manage professional IT services quotations, service catalog pricing, dual-milestone splits, and client sign-offs.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminQuotationsPage() {
  await requireCapabilityPage("proposals.read", "/admin/quotations");

  const quotations = await listQuotations();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <FileSpreadsheet className="w-3 h-3" />
              Professional Web Services
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
              <ShieldCheck className="w-3 h-3" />
              MSME UDYAM-TN-03-0345274
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Quotation Management Suite
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative 77-service pricing registry, coupon discounts, dual 50% milestone billing, and secure client sign-off.
          </p>
        </div>
      </div>

      {/* Main Registry Client View */}
      <QuotationRegistryClient initialQuotations={quotations} />
    </div>
  );
}
