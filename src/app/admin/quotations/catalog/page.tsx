import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { CatalogViewerClient } from "./catalog-viewer-client";
import { BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "77 Canonical Services Catalog | Admin | Logic Intelligence Technologies",
  description: "Browse the authoritative 77 professional IT services catalog across Categories A through H.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function CatalogPage() {
  await requireCapabilityPage("proposals.read", "/admin/quotations/catalog");

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/quotations" label="Quotation Registry" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <BookOpen className="w-3 h-3" />
              Service Catalog Registry
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
              <ShieldCheck className="w-3 h-3" />
              Strict Single Default Pricing
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            77 Canonical Technical Services
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative service catalog across 8 categories (A through H). Only FE-01 holds a default baseline; all other 76 remain unpriced until quoted.
          </p>
        </div>
      </div>

      <CatalogViewerClient />
    </div>
  );
}
