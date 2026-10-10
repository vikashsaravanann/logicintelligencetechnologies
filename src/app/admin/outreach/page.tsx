import { Metadata } from "next";
import { Send } from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { OutreachNav } from "./components/OutreachNav";
import { OutreachClient } from "./OutreachClient";

export const metadata: Metadata = {
  title: "Outreach Pipeline | Admin Command Center",
  robots: { index: false, follow: false },
};

export default async function AdminOutreachPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Navigation & Clinical Header */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Send className="w-3 h-3" />
              Outbound Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Sequenced Marketing
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Client Outreach Pipeline
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            Compliant campaigns with suppression, dry-run safety modes, human activation gates,
            and sequenced follow-ups. Marketing sends use the centralized email system.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="overview" />
      </div>

      <OutreachClient />
    </div>
  );
}
