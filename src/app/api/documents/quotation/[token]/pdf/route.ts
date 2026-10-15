import { NextRequest, NextResponse } from "next/server";
import { getQuotationByToken, getQuotationById, getQuotationLineItems } from "@/lib/quotations/db";
import { projectPublicQuotation } from "@/lib/quotations/pricing";
import {
  generateQuotationPdf,
  LIT_QUOTATION_ISSUER,
  type QuotationPdfData,
} from "@/lib/pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const isInline = request.nextUrl.searchParams.get("inline") === "true";
    const disposition = isInline ? "inline" : "attachment";

    if (!token || token.trim().length === 0) {
      return NextResponse.json({ error: "Missing quotation token or identifier" }, { status: 400 });
    }

    const trimmed = token.trim();

    // Sample/test shortcut for rapid testing and visual smoke validation
    if (trimmed === "sample" || trimmed === "test") {
      const samplePdfData: QuotationPdfData = {
        quotationRef: "LIT-QT-2026-0001",
        versionNumber: 1,
        dateIssued: formatDate(new Date()),
        validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        projectTitle: "Next.js 16 Web Platform & Responsive Frontend Experience",
        projectBrief:
          "Production engineering for the client web presence featuring Next.js 16 App Router, Tailwind CSS, TypeScript, and high-performance Core Web Vitals.",
        timelineEstimate: "2 to 4 weeks",
        currency: "INR",
        issuer: {
          legalName: LIT_QUOTATION_ISSUER.legalEntity,
          msmeUdyam: LIT_QUOTATION_ISSUER.msmeUdyamNumber,
          msmeCategory: LIT_QUOTATION_ISSUER.msmeCategory,
          registeredAddress: LIT_QUOTATION_ISSUER.registeredAddress,
          officialEmail: LIT_QUOTATION_ISSUER.officialEmail,
          officialWebsite: LIT_QUOTATION_ISSUER.officialWebsite,
          founderSignatory: LIT_QUOTATION_ISSUER.founderSignatory,
          gstin: LIT_QUOTATION_ISSUER.unregisteredGstinNotice,
        },
        client: {
          companyName: "Acme Healthcare Systems Pvt Ltd",
          contactName: "Dr. Rajesh Sundaram",
          contactEmail: "accounts@acmehealthcare.com",
          contactPhone: "+91 98421 55678",
          billingAddress: "42 Cyber Tech Park, Mill Road, Peelamedu",
          cityStatePin: "Coimbatore, Tamil Nadu 641004, India",
        },
        items: [
          {
            itemNumber: 1,
            serviceCode: "FE-01",
            categoryName: "Frontend Web Development",
            title: "Next.js 16 App Router & Responsive Web Experience",
            scopeSummary:
              "Full responsive frontend engineering with Next.js 16 App Router, Tailwind CSS, TypeScript, and modern UI components.",
            deliverables: [
              "Next.js 16 production codebase",
              "Tailwind styling & theme tokens",
              "Responsive UI layouts",
              "SEO & Core Web Vitals optimization",
            ],
            unit: "project",
            quantity: 1,
            unitPricePaise: 5000000,
            extendedAmountPaise: 5000000,
            isIncludedNoCharge: false,
          },
        ],
        subtotalPaise: 5000000,
        discountPaise: 0,
        taxPaise: 0,
        totalPayablePaise: 5000000,
        milestone1Paise: 2500000,
        milestone2Paise: 2500000,
        terms: [
          "This quotation is valid for 30 calendar days from the date of issue.",
          "Project execution requires an executed Statement of Work (SOW) prior to active engineering commencement.",
          "Payment structure comprises exactly two 50% milestones: Milestone 1 upon SOW execution prior to active development, and Milestone 2 upon formal delivery acceptance prior to source code and IP access transfer.",
          "Quotation acceptance confirms agreed scope and pricing, but does not constitute a payment receipt or executed contract.",
        ],
      };

      const res = await generateQuotationPdf(samplePdfData);
      return new NextResponse(Buffer.from(res.bytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${disposition}; filename="Quotation-Sample-FE-01.pdf"`,
          "Content-Length": res.bytes.length.toString(),
          "x-document-sha256": res.sha256,
          "X-Content-Sha256": res.sha256,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
    }

    // 1. Resolve quotation by token (or fallback to UUID if passed by admin)
    let quotation = await getQuotationByToken(trimmed);
    if (!quotation && UUID_REGEX.test(trimmed)) {
      quotation = await getQuotationById(trimmed);
    }

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found for the provided token" },
        { status: 404 }
      );
    }

    // 2. Enforce access restrictions: revoked quotations cannot be viewed
    if (quotation.status === "revoked") {
      return NextResponse.json(
        { error: "This quotation has been revoked and is no longer accessible." },
        { status: 410 }
      );
    }

    // 3. Fetch line items for this quotation
    const rawLines = await getQuotationLineItems(
      quotation.id,
      quotation.latest_version_id || undefined
    );

    // 4. Project public, client-safe quotation (strictly enforces zero-unpriced leakage rule)
    const projection = projectPublicQuotation(quotation, rawLines);

    // If there are zero eligible priced lines, reject rendering client document
    if (projection.items.length === 0) {
      return NextResponse.json(
        { error: "This quotation has no priced, selected line items available for document generation." },
        { status: 422 }
      );
    }

    // 5. Construct PDF Data from sanitized client projection
    const pdfData: QuotationPdfData = {
      quotationRef: projection.quotation_ref,
      versionNumber: projection.version_number,
      dateIssued: formatDate(projection.date_issued),
      validUntil: formatDate(projection.valid_until),
      projectTitle: projection.project_title,
      projectBrief: projection.project_brief,
      timelineEstimate: projection.timeline_estimate || "2 to 4 weeks",
      currency: projection.currency || "INR",
      issuer: {
        legalName: projection.issuer.legal_name || LIT_QUOTATION_ISSUER.legalEntity,
        msmeUdyam: projection.issuer.msme_udyam || LIT_QUOTATION_ISSUER.msmeUdyamNumber,
        msmeCategory: projection.issuer.msme_category || LIT_QUOTATION_ISSUER.msmeCategory,
        registeredAddress: projection.issuer.registered_address || LIT_QUOTATION_ISSUER.registeredAddress,
        officialEmail: projection.issuer.official_email || LIT_QUOTATION_ISSUER.officialEmail,
        officialWebsite: projection.issuer.official_website || LIT_QUOTATION_ISSUER.officialWebsite,
        founderSignatory: projection.issuer.founder_signatory || LIT_QUOTATION_ISSUER.founderSignatory,
        gstin: projection.issuer.gstin_notice || LIT_QUOTATION_ISSUER.unregisteredGstinNotice,
      },
      client: {
        companyName: projection.client.company_name || projection.client.contact_name,
        contactName: projection.client.contact_name,
        contactEmail: projection.client.contact_email,
        contactPhone: projection.client.contact_phone,
        billingAddress: projection.client.billing_address,
        cityStatePin: projection.client.city_state_pin,
      },
      items: projection.items.map((line) => ({
        itemNumber: line.item_number,
        serviceCode: line.service_code,
        categoryName: line.category_name,
        title: line.title,
        scopeSummary: line.scope_summary,
        deliverables: line.deliverables ? [...line.deliverables] : undefined,
        unit: line.unit,
        quantity: line.quantity,
        unitPricePaise: line.quoted_unit_price_paise,
        extendedAmountPaise: line.extended_amount_paise,
        isIncludedNoCharge: line.included_at_no_additional_charge,
      })),
      subtotalPaise: projection.subtotal_paise,
      discountPaise: projection.discount_paise,
      discountLabel: projection.discount_label,
      taxPaise: projection.tax_paise,
      taxLabel: projection.tax_label,
      totalPayablePaise: projection.total_payable_paise,
      milestone1Paise: projection.milestone_1_paise,
      milestone2Paise: projection.milestone_2_paise,
      terms: projection.terms,
      // Strictly exclude any internal notes to avoid leakage
      notes: undefined,
    };

    // 6. Generate the high-fidelity vector PDF
    const pdfResult = await generateQuotationPdf(pdfData);

    const safeFilename = `Quotation-${projection.quotation_ref.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    return new NextResponse(Buffer.from(pdfResult.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${safeFilename}"`,
        "Content-Length": pdfResult.bytes.length.toString(),
        "x-document-sha256": pdfResult.sha256,
        "X-Content-Sha256": pdfResult.sha256,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("[quotation-pdf-route] Unexpected error rendering quotation PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate quotation document", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
