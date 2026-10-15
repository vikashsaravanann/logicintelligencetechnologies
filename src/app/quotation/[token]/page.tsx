import { Metadata } from "next";
import Link from "next/link";
import { getQuotationByToken, getQuotationLineItems } from "@/lib/quotations/db";
import { projectPublicQuotation } from "@/lib/quotations/pricing";
import { ClientQuotationView } from "./client-quotation-view";
import { ShieldAlert, Mail, ArrowLeft } from "lucide-react";

interface QuotationPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: QuotationPageProps): Promise<Metadata> {
  const { token } = await params;
  const quote = await getQuotationByToken(token);

  if (!quote) {
    return {
      title: "Quotation Not Found | Logic Intelligence Technologies",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Quotation ${quote.quotation_ref} — ${quote.project_title} | Logic Intelligence Technologies`,
    description: `Official technical services quotation for ${quote.company_name}. Scope, deliverables, commercial milestones, and digital acceptance.`,
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function ClientQuotationPage({ params }: QuotationPageProps) {
  const { token } = await params;

  if (!token || !token.trim()) {
    return renderNotFound("Missing or invalid quotation access token.");
  }

  const quote = await getQuotationByToken(token);

  if (!quote) {
    return renderNotFound(
      "The quotation link you accessed is invalid, has expired, or has been revoked. Please check the link or contact our team."
    );
  }

  // Revoked guard
  if (quote.status === "revoked") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-rose-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Quotation Revoked</h1>
          <p className="text-sm text-slate-600 mb-6">
            Quotation <span className="font-mono font-semibold">{quote.quotation_ref}</span> was revoked
            by Logic Intelligence Technologies engineering. A revised quotation will be issued.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-6">
            If you have questions, please reach out directly to{" "}
            <a
              href="mailto:hello@logicintelligencetechnologies.in"
              className="text-blue-600 font-semibold underline"
            >
              hello@logicintelligencetechnologies.in
            </a>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const lines = await getQuotationLineItems(quote.id);
  const projection = projectPublicQuotation(quote, lines);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ClientQuotationView
        token={token}
        quotation={quote}
        initialProjection={projection}
      />
    </div>
  );
}

function renderNotFound(message: string) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Quotation Not Found</h1>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1 font-semibold text-slate-700">
            <Mail className="w-4 h-4 text-slate-400" />
            Support Assistance
          </div>
          Contact us at{" "}
          <a
            href="mailto:hello@logicintelligencetechnologies.in"
            className="text-blue-600 font-semibold underline"
          >
            hello@logicintelligencetechnologies.in
          </a>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
