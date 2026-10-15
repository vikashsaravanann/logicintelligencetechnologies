import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getQuotationById } from "@/lib/quotations/service";
import { QuotationDetailClient } from "./quotation-detail-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const data = await getQuotationById(id);

  if (!data) {
    return {
      title: "Quotation Not Found | Admin | Logic Intelligence Technologies",
    };
  }

  return {
    title: `${data.quotation.quotation_ref} — ${data.quotation.company_name} | Admin Quotation Suite`,
    description: `Inspect and manage ${data.quotation.quotation_ref} for ${data.quotation.company_name}. Dual 50% milestone billing, PDF generation, and client sign-off.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminQuotationDetailPage(props: PageProps) {
  await requireCapabilityPage("proposals.read", "/admin/quotations");

  const { id } = await props.params;
  const data = await getQuotationById(id);

  if (!data) {
    notFound();
  }

  return <QuotationDetailClient initialData={data} />;
}
