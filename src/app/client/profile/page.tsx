import { Metadata } from "next";
import { User, ShieldCheck, Mail, Building2, Phone } from "lucide-react";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Account Profile & Preferences | Client Portal",
};

export default function ClientProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Client Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your enterprise contact information and security preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Enterprise Account</h2>
            <p className="text-xs text-zinc-400">Authenticated via Supabase Auth</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5 text-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Assigned Engineering Team
            </span>
            <p className="text-white font-medium">{COMPANY.displayName} Core Architecture Team</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Primary Headquarters
            </span>
            <p className="text-white font-medium">{COMPANY.address}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Emergency Escalation Phone
            </span>
            <p className="text-white font-medium">{COMPANY.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
