"use client";

import { useState, useTransition } from "react";
import { saveCompanyTaxIdentifiersAction, type SaveTaxIdentifiersResult } from "./actions";
import { ShieldCheck, Save, Loader2, CheckCircle2, AlertCircle, Info, Lock } from "lucide-react";

interface Props {
  initialGstin: string | null;
  initialPan: string | null;
  isSuperAdmin: boolean;
}

export default function CompanySettingsForm({
  initialGstin,
  initialPan,
  isSuperAdmin,
}: Props) {
  const [gstin, setGstin] = useState(initialGstin || "");
  const [pan, setPan] = useState(initialPan || "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<SaveTaxIdentifiersResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setFeedback(null);

    const formData = new FormData();
    formData.append("gstin", gstin.trim().toUpperCase());
    formData.append("pan", pan.trim().toUpperCase());

    startTransition(async () => {
      try {
        const res = await saveCompanyTaxIdentifiersAction(formData);
        setFeedback(res);
      } catch (err: any) {
        setFeedback({
          ok: false,
          error: err.message || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Tax Identifiers & Fiscal Registrations
            </h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Super Admin Mutation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure statutory GSTIN and PAN numbers for official Tax Invoice and Payment Receipt PDF generation.
          </p>
        </div>

        {!isSuperAdmin && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Read-Only (Super Admin restricted)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
              feedback.ok
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{feedback.ok ? "Success" : "Update Failed"}</p>
              <p className="mt-0.5 text-xs">
                {feedback.ok ? feedback.message : feedback.error}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* GSTIN Field */}
          <div className="space-y-2">
            <label htmlFor="gstin" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Goods & Services Tax ID (GSTIN)
            </label>
            <input
              id="gstin"
              type="text"
              disabled={!isSuperAdmin || isPending}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 33AAAAA0000A1Z5"
              maxLength={15}
              className="w-full font-mono text-sm uppercase px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-500">
              15-character alphanumerical GST identification number for Tamil Nadu (State Code 33).
            </p>
          </div>

          {/* PAN Field */}
          <div className="space-y-2">
            <label htmlFor="pan" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Permanent Account Number (PAN)
            </label>
            <input
              id="pan"
              type="text"
              disabled={!isSuperAdmin || isPending}
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              className="w-full font-mono text-sm uppercase px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-500">
              10-character alphanumerical Income Tax PAN of the enterprise entity.
            </p>
          </div>
        </div>

        {/* Exemption Policy Banner */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Statutory Exemption Notice:</p>
            <p className="text-blue-800 leading-relaxed">
              If operating under the threshold limit prior to mandatory GST registration, leave GSTIN empty.
              The automated PDF generator will clearly display the official MSME Udyam registration
              (<strong>UDYAM-TN-03-0345274</strong>) with standard Micro Enterprise services exemption wording.
              Never enter placeholder strings or paste the MSME number into the GSTIN field.
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Tax Identifiers...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
