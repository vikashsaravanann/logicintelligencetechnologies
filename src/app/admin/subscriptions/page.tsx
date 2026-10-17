import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import SubscriptionsAdminClient from "./SubscriptionsAdminClient";
import { ShieldCheck, RefreshCw, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance Subscriptions & Free Trial Refunds | Admin | Logic Intelligence Technologies",
  description: "Super Admin management portal for maintenance subscriptions, payment verification, and ₹20 trial refunds.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
  await requireCapabilityPage("payment.verify", "/admin/subscriptions");

  const [ordersRes, subsRes, refundRes] = await Promise.all([
    supabaseAdmin
      .from("maintenance_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("maintenance_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("maintenance_subscriptions")
      .select("*")
      .eq("plan_id", "FREE_TRIAL")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider font-mono">
              <Layers className="w-3 h-3" />
              Subscriptions & Care
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
              5-Tier Catalog
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Maintenance Plans & Subscriptions
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Super Admin ledger for verifying incoming care plan payments, activating subscriptions, and dispatching ₹20 free trial verification refunds.
          </p>
        </div>
      </div>

      <SubscriptionsAdminClient
        initialOrders={ordersRes.data || []}
        initialSubscriptions={subsRes.data || []}
        initialRefundQueue={refundRes.data || []}
      />
    </div>
  );
}
