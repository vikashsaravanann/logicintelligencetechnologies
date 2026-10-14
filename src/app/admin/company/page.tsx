import { Metadata } from "next";
import { requireCapabilityPage, getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import CompanySettingsForm from "./company-settings-form";
import { DEFAULT_COMPANY_CREDENTIALS, DEFAULT_BENEFICIARY_PROFILE } from "@/lib/payments/calculations";
import {
  Building2,
  Award,
  MapPin,
  Mail,
  Globe,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Hash,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Company Profile & Statutory Registrations | Admin | Logic Intelligence Technologies",
  description: "Statutory company registration credentials, MSME Udyam classification, and tax configuration.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
  await requireCapabilityPage("dashboard.view", "/admin/company");
  const session = await getStaffSession();
  const isSuperAdmin = session?.role === "super_admin";

  // Fetch company credentials
  const { data: dbCredentials } = await supabaseAdmin
    .from("company_credentials")
    .select("*")
    .limit(1)
    .maybeSingle();

  const creds = dbCredentials || DEFAULT_COMPANY_CREDENTIALS;

  // Fetch active beneficiary profile
  const { data: dbBeneficiary } = await supabaseAdmin
    .from("payment_beneficiary_profiles")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const beneficiary = dbBeneficiary || DEFAULT_BENEFICIARY_PROFILE;

  return (
    <div className="space-y-6">
      <AdminBackLink />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Company Profile & Statutory Registrations
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative enterprise credentials, MSME / Udyam registration, and statutory tax settings
            used across invoices, payment receipts, contracts, and legal agreements.
          </p>
        </div>
      </div>

      {/* Authoritative MSME Credential Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {creds.enterprise_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <Award className="w-3.5 h-3.5" />
                  {creds.msme_category} · {creds.major_activity}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  State Code: 33 (Tamil Nadu)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Government of India MSME
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MSME Udyam Number */}
          <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>MSME / Udyam Registration Number</span>
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 pt-1">
              {creds.msme_udyam_number}
            </div>
            <p className="text-xs text-slate-500">
              Authoritative registration under the Ministry of Micro, Small and Medium Enterprises, Government of India.
            </p>
          </div>

          {/* Registered Address */}
          <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered Office Address</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 pt-1">
              {creds.registered_address}
            </div>
            <p className="text-xs text-slate-500">
              Primary establishment jurisdiction in Coimbatore, Tamil Nadu, India.
            </p>
          </div>

          {/* Official Email */}
          <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Correspondence Email</span>
            </div>
            <div className="text-sm font-medium text-slate-900 pt-1 flex items-center gap-1.5">
              <a
                href={`mailto:${creds.official_email}`}
                className="text-blue-600 hover:underline"
              >
                {creds.official_email}
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Authoritative email for billing dispatches and corporate notices.
            </p>
          </div>

          {/* Official Website */}
          <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Web Domain</span>
            </div>
            <div className="text-sm font-medium text-slate-900 pt-1 flex items-center gap-1.5">
              <a
                href={creds.official_website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                {creds.official_website}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Primary digital presence and client portal root.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Identifiers Form (GSTIN & PAN) */}
      <CompanySettingsForm
        initialGstin={creds.gstin}
        initialPan={creds.pan}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Primary Payment Beneficiary Profile Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authoritative Receiving UPI Account
              </h3>
              <p className="text-xs text-slate-500">
                Centrally verified banking destination used for client milestone QR codes and VPA routing.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Routing
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Beneficiary VPA / UPI ID</div>
            <div className="text-base font-mono font-bold text-slate-900 mt-1">
              {beneficiary.upi_id}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Account Holder Name</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {beneficiary.account_holder_name}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Display Brand</div>
            <div className="text-base font-medium text-slate-900 mt-1">
              {beneficiary.display_brand_name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
