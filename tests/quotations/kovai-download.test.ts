// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  getQuotationByToken,
  getQuotationById,
  getQuotationLineItems,
} = require("../../src/lib/quotations/db");

import { projectPublicQuotation } from "../../src/lib/quotations/pricing";
import type { QuotationPdfData } from "../../src/lib/pdf";
const { generateQuotationPdf, LIT_QUOTATION_ISSUER } = require("../../src/lib/pdf");

describe("Kovai Quotation (qt-kovai-tok-77c3) Resolution & PDF Generation Tests", () => {
  it("resolves Kovai quotation record by secure token qt-kovai-tok-77c3", async () => {
    const quote = await getQuotationByToken("qt-kovai-tok-77c3");
    assert.ok(quote, "Quotation must be found for token qt-kovai-tok-77c3");
    assert.equal(quote.quotation_ref, "LIT-QT-2026-0003");
    assert.equal(quote.company_name, "Kovai Agro Mills");
    assert.equal(quote.recipient_name, "Muthu Kumar");
    assert.equal(quote.recipient_email, "muthu@kovaimills.com");
    assert.equal(quote.status, "accepted");
    assert.equal(quote.subtotal_paise, 6500000);
    assert.equal(quote.total_payable_paise, 6500000);
    assert.equal(quote.milestone_1_paise, 3250000);
    assert.equal(quote.milestone_2_paise, 3250000);
  });

  it("resolves line items for Kovai quotation with DS-02 and FE-01", async () => {
    const quote = await getQuotationByToken("qt-kovai-tok-77c3");
    assert.ok(quote);

    const lines = await getQuotationLineItems(quote.id);
    assert.ok(lines.length >= 2, "Must have at least 2 line items");

    const serviceCodes = lines.map((l) => l.service_code);
    assert.ok(serviceCodes.includes("DS-02"), "Must include DS-02 service");
    assert.ok(serviceCodes.includes("FE-01"), "Must include FE-01 service");

    const fe01 = lines.find((l) => l.service_code === "FE-01");
    assert.equal(fe01?.quoted_unit_price_paise, 5000000, "FE-01 unit price must be ₹50,000 (5,000,000 paise)");

    const ds02 = lines.find((l) => l.service_code === "DS-02");
    assert.equal(ds02?.quoted_unit_price_paise, 1500000, "DS-02 unit price must be ₹15,000 (1,500,000 paise)");
  });

  it("projects sanitized public quotation for Kovai without internal leaks", async () => {
    const quote = await getQuotationByToken("qt-kovai-tok-77c3");
    assert.ok(quote);

    const lines = await getQuotationLineItems(quote.id);
    const projection = projectPublicQuotation(quote, lines);

    assert.equal(projection.quotation_ref, "LIT-QT-2026-0003");
    assert.equal(projection.items.length, 2);
    assert.equal(projection.total_payable_paise, 6500000);
    assert.equal(projection.milestone_1_paise, 3250000);
    assert.equal(projection.milestone_2_paise, 3250000);
    assert.equal(projection.client.company_name, "Kovai Agro Mills");
    assert.equal(projection.client.contact_name, "Muthu Kumar");
    assert.equal(projection.client.contact_email, "muthu@kovaimills.com");
  });

  it("generates a high-fidelity vector PDF for Kovai quotation matching SHA-256", async () => {
    const quote = await getQuotationByToken("qt-kovai-tok-77c3");
    assert.ok(quote);

    const lines = await getQuotationLineItems(quote.id);
    const projection = projectPublicQuotation(quote, lines);

    const pdfData: QuotationPdfData = {
      quotationRef: projection.quotation_ref,
      versionNumber: projection.version_number,
      dateIssued: "October 15, 2026",
      validUntil: "November 14, 2026",
      projectTitle: projection.project_title,
      projectBrief: projection.project_brief,
      timelineEstimate: projection.timeline_estimate,
      currency: projection.currency,
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
        companyName: projection.client.company_name,
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
    };

    const pdfResult = await generateQuotationPdf(pdfData);

    assert.ok(pdfResult.bytes && pdfResult.bytes.length > 0, "PDF bytes must not be empty");
    const buffer = Buffer.from(pdfResult.bytes);
    const header = buffer.subarray(0, 5).toString("utf-8");
    assert.equal(header, "%PDF-", "Generated document must start with %PDF- header");

    const recomputedSha = crypto.createHash("sha256").update(buffer).digest("hex");
    assert.equal(
      pdfResult.sha256,
      recomputedSha,
      "Returned SHA-256 must match recomputed cryptographic hash"
    );
  });
});
