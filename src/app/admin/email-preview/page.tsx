import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { EmailNavTabs } from "../emails/components/EmailNavTabs";
import {
  EMAIL_TEMPLATE_REGISTRY,
  renderTemplatePreview,
} from "@/lib/email/template-registry";
import { EmailPreviewGallery } from "./EmailPreviewGallery";

export const metadata: Metadata = {
  title: "Enterprise Email Template Preview | Admin | Logic Intelligence Technologies",
  description: "Live preview and link audit harness for all 28 approved enterprise email templates.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EmailPreviewPage() {
  await requireCapabilityPage("emails.read", "/admin/email-preview");

  const initialTemplates = Object.values(EMAIL_TEMPLATE_REGISTRY).map((t) => ({
    key: t.key,
    name: t.name,
    category: t.category,
    description: t.description,
    subject: t.subject,
    defaultSender: t.defaultSender,
    replyTo: t.replyTo,
  }));

  const initialPreview = await renderTemplatePreview("enterprise-checklist-invitation");

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <AdminBackLink href="/admin/emails" label="Back to Emails" />
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200 mb-2">
                LIT EMAIL v2 Design System
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] tracking-tight">
                Enterprise Email Template Gallery & QA Preview
              </h1>
              <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
                Authoritative visual inspection, responsive frame testing, and absolute link validation for all approved corporate communications.
              </p>
            </div>
          </div>
        </div>

        <EmailNavTabs />

        <EmailPreviewGallery
          initialTemplates={initialTemplates}
          initialPreview={initialPreview}
        />
      </div>
    </div>
  );
}
