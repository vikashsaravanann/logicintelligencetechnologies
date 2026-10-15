import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { listCoupons } from "@/lib/quotations/db";
import { CouponsManagerClient } from "./coupons-manager-client";
import { Tag, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Discount Coupons Manager | Admin | Logic Intelligence Technologies",
  description: "Manage promotional discount codes, percentage and fixed reductions, campaign caps, and coupon status.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function CouponsManagerPage() {
  await requireCapabilityPage("proposals.read", "/admin/quotations/coupons");

  const coupons = await listCoupons();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/quotations" label="Quotation Registry" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Tag className="w-3 h-3" />
              Promotion & Discount Management
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
              <ShieldCheck className="w-3 h-3" />
              Founder Approval Required
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Quotation Discount Coupons
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Configure campaign codes, percentage-based or fixed discounts, minimum quotation thresholds, and redemption caps.
          </p>
        </div>
      </div>

      <CouponsManagerClient initialCoupons={coupons} />
    </div>
  );
}
