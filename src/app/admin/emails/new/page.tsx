import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { BroadcastForm } from "./broadcast-form";
import { AdminTriggers } from "../../components/AdminTriggers";
import { AdminBackLink } from "../../components/AdminBackLink";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Compose Message | Admin | Logic Intelligence Technologies",
  description: "Compose single-recipient transactional emails or dispatch operational email triggers via SMTP.",
};

export default async function NewEmailPage() {
  await requireCapabilityPage("emails.send", "/admin/emails/new");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Navigation & Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/emails" label="Email Activity" />
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Mail className="w-3 h-3" />
            Outbox Dispatcher
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            SMTP & Operational Audit
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Compose Message
        </h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
          Single-recipient transactional email via SMTP outbox with cryptographic session audit. Not a mass-marketing blast.
        </p>
      </div>

      {/* Broadcast Form Section */}
      <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs rounded-2xl p-6 sm:p-8">
        <BroadcastForm />
      </div>

      {/* Manual Triggers Section */}
      <AdminTriggers />
    </div>
  );
}
