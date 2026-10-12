import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { EmailNavTabs } from "../components/EmailNavTabs";
import { Mail, ShieldCheck, Server, KeySquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Connected Mailboxes | Emails | Admin",
  robots: { index: false, follow: false },
};

export default async function MailboxesPage() {
  await requireCapabilityPage("emails.read", "/admin/emails/mailboxes");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2">
        <AdminBackLink />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Mailboxes & Identity
            </h1>
            <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)]">
              Live status for the two canonical verified company mailboxes.
            </p>
          </div>
        </div>
      </div>

      <EmailNavTabs />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HELLO Mailbox */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--lit-navy,#0B2545)]">Business Inquiries (HELLO)</h3>
                <p className="text-xs text-slate-500 font-mono">hello@logicintelligencetechnologies.in</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              SMTP Authorized
            </span>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Server className="w-4 h-4" />
                <span>Provider</span>
              </div>
              <span className="font-semibold">Zoho Mail (smtp.zoho.in)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Auth Protocol</span>
              </div>
              <span className="font-semibold text-emerald-700">App Password / TLS</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <KeySquare className="w-4 h-4" />
                <span>n8n Credential</span>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">LIT_ZOHO_HELLO_SMTP</span>
            </div>
          </div>
        </div>

        {/* NOREPLY Mailbox */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--lit-navy,#0B2545)]">Transactional (NOREPLY)</h3>
                <p className="text-xs text-slate-500 font-mono">no-reply@logicintelligencetechnologies.in</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              SMTP Authorized
            </span>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Server className="w-4 h-4" />
                <span>Provider</span>
              </div>
              <span className="font-semibold">Zoho Mail (smtp.zoho.in)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Auth Protocol</span>
              </div>
              <span className="font-semibold text-emerald-700">App Password / TLS</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <KeySquare className="w-4 h-4" />
                <span>n8n Credential</span>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">LIT_ZOHO_NOREPLY_SMTP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
