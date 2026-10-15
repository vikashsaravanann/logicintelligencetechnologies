import { PDFDocument, rgb, RGB, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Verified LIT Corporate Credentials
export const LIT_QUOTATION_ISSUER = {
  legalEntity: "LOGIC INTELLIGENCE TECHNOLOGIES",
  msmeUdyamNumber: "UDYAM-TN-03-0345274",
  msmeCategory: "Micro Enterprise · Services",
  registeredAddress: "Eachanari, Coimbatore, Tamil Nadu 641021, India",
  officialEmail: "hello@logicintelligencetechnologies.in",
  officialWebsite: "https://www.logicintelligencetechnologies.in",
  founderSignatory: "Vikash Saravanan, Founder",
  unregisteredGstinNotice: "GSTIN: Unregistered (Composition / Threshold)",
  sacCode: "998315",
  sacDescription: "Information Technology & Software Services",
} as const;

export interface QuotationPdfLineItem {
  itemNumber: number;
  serviceCode: string;
  categoryName: string;
  title: string;
  scopeSummary: string;
  deliverables?: string[];
  unit: string;
  quantity: number;
  unitPricePaise: number;
  extendedAmountPaise: number;
  isIncludedNoCharge?: boolean;
}

export interface QuotationPdfData {
  quotationRef: string; // e.g. "LIT-QT-2026-0001"
  versionNumber: number; // e.g. 1
  dateIssued: string; // e.g. "October 15, 2026"
  validUntil: string; // e.g. "November 14, 2026"
  projectTitle: string;
  projectBrief?: string;
  timelineEstimate?: string; // e.g. "2 to 4 weeks"
  currency?: string; // "INR"

  issuer?: {
    legalName?: string;
    msmeUdyam?: string;
    msmeCategory?: string;
    registeredAddress?: string;
    officialEmail?: string;
    officialWebsite?: string;
    founderSignatory?: string;
    gstin?: string;
  };

  client: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    billingAddress?: string | string[];
    cityStatePin?: string;
  };

  items: QuotationPdfLineItem[];

  subtotalPaise: number;
  discountPaise: number;
  discountLabel?: string;
  taxPaise: number;
  taxLabel?: string;
  totalPayablePaise: number;

  milestone1Paise: number;
  milestone2Paise: number;

  terms?: string[];
  notes?: string;
}

export interface GeneratedQuotationPdfResult {
  buffer: Buffer;
  bytes: Uint8Array;
  sha256: string;
  pageCount: number;
}

/**
 * Format integer paise into Indian Currency string (INR)
 */
export function formatPaiseToINR(paise: number): string {
  const rupees = Number(paise || 0) / 100;
  return "₹" + rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Convert numerical amount in paise to Indian Rupees words.
 */
export function paiseToIndianRupeesWords(paise: number): string {
  const num = Math.floor(Number(paise || 0) / 100);
  const decimalPart = Number(paise || 0) % 100;
  if (!num && !decimalPart) return "Rupees Zero Only";

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit > 0 ? "-" + units[unit] : "");
  }

  function convertThreeDigits(n: number): string {
    if (n === 0) return "";
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += units[Math.floor(n / 100)] + " Hundred";
      if (n % 100 > 0) str += " ";
    }
    if (n % 100 > 0) {
      str += convertTwoDigits(n % 100);
    }
    return str;
  }

  let remaining = num;
  const parts: string[] = [];

  const crores = Math.floor(remaining / 10000000);
  if (crores > 0) {
    parts.push(convertThreeDigits(crores) + " Crore");
    remaining %= 10000000;
  }

  const lakhs = Math.floor(remaining / 100000);
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + " Lakh");
    remaining %= 100000;
  }

  const thousands = Math.floor(remaining / 1000);
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + " Thousand");
    remaining %= 1000;
  }

  if (remaining > 0) {
    parts.push(convertThreeDigits(remaining));
  }

  let result = "Rupees " + parts.join(" ").trim();
  if (decimalPart > 0) {
    result += " and Paise " + convertTwoDigits(decimalPart);
  }
  return result.trim() + " Only";
}

/** Word wrap utility */
export function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [text];
}

function resolveAssetPath(relativePath: string): string | null {
  const candidates = [
    path.join(__dirname, relativePath),
    path.join(__dirname, "../pdf", relativePath),
    path.join(process.cwd(), "src/lib/pdf", relativePath),
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), "logicintelligencetechnologies/src/lib/pdf", relativePath),
    "/Users/vikash/lit-infrastructure/logicintelligencetechnologies/src/lib/pdf/" + relativePath,
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

interface LoadedFontsAndLogo {
  fontBold: any;
  fontMedium: any;
  fontRegular: any;
  logoImage: any | null;
}

async function loadAssets(doc: PDFDocument): Promise<LoadedFontsAndLogo> {
  doc.registerFontkit(fontkit);

  let fontBold: any;
  let fontMedium: any;
  let fontRegular: any;

  try {
    const boldPath = resolveAssetPath("fonts/Poppins-Bold.ttf");
    const medPath = resolveAssetPath("fonts/Poppins-Medium.ttf");
    const regPath = resolveAssetPath("fonts/Poppins-Regular.ttf");

    if (boldPath && medPath && regPath) {
      fontBold = await doc.embedFont(fs.readFileSync(boldPath));
      fontMedium = await doc.embedFont(fs.readFileSync(medPath));
      fontRegular = await doc.embedFont(fs.readFileSync(regPath));
    } else {
      throw new Error("Poppins fonts not found");
    }
  } catch {
    fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    fontMedium = await doc.embedFont(StandardFonts.Helvetica);
    fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  }

  let logoImage: any = null;
  try {
    const logoPath =
      resolveAssetPath("assets/lit_logo_circle.png") ||
      resolveAssetPath("assets/lit_logo_full.png") ||
      resolveAssetPath("public/assets/logo-icon.jpg");

    if (logoPath) {
      const fileBytes = fs.readFileSync(logoPath);
      if (logoPath.endsWith(".png")) {
        logoImage = await doc.embedPng(fileBytes);
      } else {
        logoImage = await doc.embedJpg(fileBytes);
      }
    }
  } catch (err) {
    console.warn("Logo loading warning:", err);
  }

  return { fontBold, fontMedium, fontRegular, logoImage };
}

/**
 * Generates an authoritative, beautifully designed multi-page A4 PDF quotation.
 */
export async function generateQuotationPdf(data: QuotationPdfData): Promise<GeneratedQuotationPdfResult> {
  const doc = await PDFDocument.create();
  const assets = await loadAssets(doc);

  // Geometry: A4 dimensions (595.28 x 841.89 points)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const navy: RGB = rgb(0.043, 0.145, 0.271); // #0B2545
  const slate: RGB = rgb(0.2, 0.25, 0.32);
  const muted: RGB = rgb(0.45, 0.5, 0.58);
  const borderGrey: RGB = rgb(0.85, 0.88, 0.92);
  const tableHeaderBg: RGB = rgb(0.96, 0.975, 0.99);
  const accentTeal: RGB = rgb(0.12, 0.66, 0.63); // #1FA9A2
  const accentBlue: RGB = rgb(0.08, 0.39, 0.75); // #1565C0
  const white: RGB = rgb(1, 1, 1);

  // Create initial page
  let currentPage = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header helper
  const drawHeader = (isFirstPage: boolean) => {
    // Top banner
    currentPage.drawRectangle({
      x: margin,
      y: y - 2,
      width: contentWidth,
      height: 3,
      color: navy,
    });
    y -= 14;

    if (isFirstPage) {
      // Main title
      currentPage.drawText("PROJECT QUOTATION", {
        x: margin,
        y: y - 18,
        size: 20,
        font: assets.fontBold,
        color: navy,
      });

      currentPage.drawText(`REF: ${data.quotationRef} · Version ${data.versionNumber}`, {
        x: margin,
        y: y - 32,
        size: 9,
        font: assets.fontMedium,
        color: accentBlue,
      });

      // Right logo or brand text
      if (assets.logoImage) {
        const logoSize = 36;
        currentPage.drawImage(assets.logoImage, {
          x: pageWidth - margin - logoSize,
          y: y - 36,
          width: logoSize,
          height: logoSize,
        });

        currentPage.drawText("LOGIC INTELLIGENCE", {
          x: pageWidth - margin - logoSize - 130,
          y: y - 18,
          size: 10,
          font: assets.fontBold,
          color: navy,
        });
        currentPage.drawText("TECHNOLOGIES", {
          x: pageWidth - margin - logoSize - 130,
          y: y - 29,
          size: 8,
          font: assets.fontMedium,
          color: accentTeal,
        });
      } else {
        currentPage.drawText("LOGIC INTELLIGENCE TECHNOLOGIES", {
          x: pageWidth - margin - 200,
          y: y - 20,
          size: 11,
          font: assets.fontBold,
          color: navy,
        });
      }
      y -= 50;
    } else {
      // Continuation page header
      currentPage.drawText(`PROJECT QUOTATION · ${data.quotationRef} (v${data.versionNumber})`, {
        x: margin,
        y: y - 10,
        size: 10,
        font: assets.fontBold,
        color: navy,
      });
      currentPage.drawText(`Project: ${data.projectTitle}`, {
        x: pageWidth - margin - 220,
        y: y - 10,
        size: 9,
        font: assets.fontRegular,
        color: muted,
      });
      y -= 25;
    }
  };

  drawHeader(true);

  // Metadata cards
  const boxHeight = 75;
  const colWidth = (contentWidth - 10) / 2;

  // Client Box (Prepared For)
  currentPage.drawRectangle({
    x: margin,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: rgb(0.985, 0.99, 1),
    borderColor: borderGrey,
    borderWidth: 0.8,
  });

  currentPage.drawText("PREPARED FOR", {
    x: margin + 12,
    y: y - 16,
    size: 7.5,
    font: assets.fontBold,
    color: accentBlue,
  });
  currentPage.drawText(data.client.companyName || data.client.contactName, {
    x: margin + 12,
    y: y - 30,
    size: 10.5,
    font: assets.fontBold,
    color: navy,
  });
  currentPage.drawText(`Contact: ${data.client.contactName}`, {
    x: margin + 12,
    y: y - 44,
    size: 8,
    font: assets.fontRegular,
    color: slate,
  });
  currentPage.drawText(`Email: ${data.client.contactEmail}`, {
    x: margin + 12,
    y: y - 56,
    size: 8,
    font: assets.fontRegular,
    color: slate,
  });
  if (data.client.contactPhone) {
    currentPage.drawText(`Phone: ${data.client.contactPhone}`, {
      x: margin + 12,
      y: y - 68,
      size: 8,
      font: assets.fontRegular,
      color: slate,
    });
  }

  // Issuer Box (Issued By)
  const rightX = margin + colWidth + 10;
  currentPage.drawRectangle({
    x: rightX,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: rgb(0.985, 0.99, 1),
    borderColor: borderGrey,
    borderWidth: 0.8,
  });

  const issuer = data.issuer || {};
  currentPage.drawText("ISSUED BY", {
    x: rightX + 12,
    y: y - 16,
    size: 7.5,
    font: assets.fontBold,
    color: accentTeal,
  });
  currentPage.drawText(issuer.legalName || LIT_QUOTATION_ISSUER.legalEntity, {
    x: rightX + 12,
    y: y - 30,
    size: 9.5,
    font: assets.fontBold,
    color: navy,
  });
  currentPage.drawText(`MSME / Udyam: ${issuer.msmeUdyam || LIT_QUOTATION_ISSUER.msmeUdyamNumber}`, {
    x: rightX + 12,
    y: y - 44,
    size: 8,
    font: assets.fontMedium,
    color: slate,
  });
  currentPage.drawText(issuer.registeredAddress || LIT_QUOTATION_ISSUER.registeredAddress, {
    x: rightX + 12,
    y: y - 56,
    size: 7.5,
    font: assets.fontRegular,
    color: slate,
  });
  currentPage.drawText(`Email: ${issuer.officialEmail || LIT_QUOTATION_ISSUER.officialEmail}`, {
    x: rightX + 12,
    y: y - 68,
    size: 7.5,
    font: assets.fontRegular,
    color: slate,
  });

  y -= boxHeight + 14;

  // Project Summary Banner
  currentPage.drawRectangle({
    x: margin,
    y: y - 42,
    width: contentWidth,
    height: 42,
    color: rgb(0.95, 0.965, 0.985),
    borderColor: borderGrey,
    borderWidth: 0.5,
  });

  currentPage.drawText("PROJECT:", {
    x: margin + 12,
    y: y - 18,
    size: 7.5,
    font: assets.fontBold,
    color: muted,
  });
  currentPage.drawText(data.projectTitle, {
    x: margin + 65,
    y: y - 18,
    size: 9.5,
    font: assets.fontBold,
    color: navy,
  });

  currentPage.drawText(`Issue Date: ${data.dateIssued}   |   Valid Until: ${data.validUntil}   |   Estimated Duration: ${data.timelineEstimate || "2 to 4 weeks"}`, {
    x: margin + 12,
    y: y - 32,
    size: 8,
    font: assets.fontRegular,
    color: slate,
  });

  y -= 54;

  // Section Header: Approved Scope & Itemized Services
  currentPage.drawText("APPROVED SERVICE SPECIFICATION & PRICING", {
    x: margin,
    y: y,
    size: 9.5,
    font: assets.fontBold,
    color: navy,
  });
  y -= 14;

  // Table Header
  const tableHeaderHeight = 22;
  currentPage.drawRectangle({
    x: margin,
    y: y - tableHeaderHeight,
    width: contentWidth,
    height: tableHeaderHeight,
    color: tableHeaderBg,
    borderColor: borderGrey,
    borderWidth: 0.5,
  });

  const colItem = margin + 10;
  const colDesc = margin + 40;
  const colQty = margin + 355;
  const colUnit = margin + 400;
  const colTotal = margin + 465;

  currentPage.drawText("#", { x: colItem, y: y - 15, size: 8, font: assets.fontBold, color: slate });
  currentPage.drawText("SERVICE & APPROVED SCOPE", { x: colDesc, y: y - 15, size: 8, font: assets.fontBold, color: slate });
  currentPage.drawText("QTY", { x: colQty, y: y - 15, size: 8, font: assets.fontBold, color: slate });
  currentPage.drawText("RATE (INR)", { x: colUnit, y: y - 15, size: 8, font: assets.fontBold, color: slate });
  currentPage.drawText("AMOUNT (INR)", { x: colTotal, y: y - 15, size: 8, font: assets.fontBold, color: slate });

  y -= tableHeaderHeight;

  // Render Table Rows (Strictly selected & priced services only)
  const items = data.items || [];
  let itemIndex = 1;

  for (const item of items) {
    // Check if space remains on page, else break to new page
    if (y < 120) {
      currentPage = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      drawHeader(false);

      // Repeat table header
      currentPage.drawRectangle({
        x: margin,
        y: y - tableHeaderHeight,
        width: contentWidth,
        height: tableHeaderHeight,
        color: tableHeaderBg,
        borderColor: borderGrey,
        borderWidth: 0.5,
      });
      currentPage.drawText("#", { x: colItem, y: y - 15, size: 8, font: assets.fontBold, color: slate });
      currentPage.drawText("SERVICE & APPROVED SCOPE (CONT.)", { x: colDesc, y: y - 15, size: 8, font: assets.fontBold, color: slate });
      currentPage.drawText("QTY", { x: colQty, y: y - 15, size: 8, font: assets.fontBold, color: slate });
      currentPage.drawText("RATE (INR)", { x: colUnit, y: y - 15, size: 8, font: assets.fontBold, color: slate });
      currentPage.drawText("AMOUNT (INR)", { x: colTotal, y: y - 15, size: 8, font: assets.fontBold, color: slate });
      y -= tableHeaderHeight;
    }

    // Wrap scope summary text
    const wrappedScope = wrapText(item.scopeSummary || "", 300, assets.fontRegular, 7.5);
    const rowHeight = Math.max(32, 20 + wrappedScope.length * 10);

    currentPage.drawRectangle({
      x: margin,
      y: y - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: itemIndex % 2 === 0 ? rgb(0.99, 0.995, 1) : white,
      borderColor: borderGrey,
      borderWidth: 0.4,
    });

    // Item Number
    currentPage.drawText(String(itemIndex), {
      x: colItem,
      y: y - 16,
      size: 8.5,
      font: assets.fontBold,
      color: navy,
    });

    // Service Code & Title
    currentPage.drawText(`[${item.serviceCode}] ${item.title}`, {
      x: colDesc,
      y: y - 14,
      size: 8.5,
      font: assets.fontBold,
      color: navy,
    });

    // Scope Summary lines
    let textY = y - 24;
    for (const line of wrappedScope.slice(0, 3)) {
      currentPage.drawText(line, {
        x: colDesc,
        y: textY,
        size: 7.5,
        font: assets.fontRegular,
        color: slate,
      });
      textY -= 10;
    }

    // Qty
    currentPage.drawText(String(item.quantity || 1), {
      x: colQty + 5,
      y: y - 16,
      size: 8.5,
      font: assets.fontMedium,
      color: slate,
    });

    // Rate
    const rateText = item.isIncludedNoCharge
      ? "Included"
      : formatPaiseToINR(item.unitPricePaise);
    currentPage.drawText(rateText, {
      x: colUnit,
      y: y - 16,
      size: 8,
      font: assets.fontMedium,
      color: slate,
    });

    // Extended Amount
    const amountText = item.isIncludedNoCharge
      ? "Included"
      : formatPaiseToINR(item.extendedAmountPaise);
    currentPage.drawText(amountText, {
      x: colTotal,
      y: y - 16,
      size: 8.5,
      font: assets.fontBold,
      color: navy,
    });

    y -= rowHeight;
    itemIndex++;
  }

  y -= 10;

  // Commercial Summary Block (Check space)
  if (y < 220) {
    currentPage = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    drawHeader(false);
  }

  const summaryWidth = 240;
  const summaryX = pageWidth - margin - summaryWidth;

  // Subtotal
  currentPage.drawText("Subtotal:", { x: summaryX, y: y, size: 8.5, font: assets.fontRegular, color: slate });
  currentPage.drawText(formatPaiseToINR(data.subtotalPaise), {
    x: pageWidth - margin - 80,
    y: y,
    size: 8.5,
    font: assets.fontMedium,
    color: navy,
  });
  y -= 15;

  // Discount (if any)
  if (data.discountPaise > 0) {
    currentPage.drawText(`Discount (${data.discountLabel || "Approved"}):`, {
      x: summaryX,
      y: y,
      size: 8.5,
      font: assets.fontRegular,
      color: accentTeal,
    });
    currentPage.drawText(`- ${formatPaiseToINR(data.discountPaise)}`, {
      x: pageWidth - margin - 80,
      y: y,
      size: 8.5,
      font: assets.fontBold,
      color: accentTeal,
    });
    y -= 15;
  }

  // Tax treatment (honest, verified)
  if (data.taxPaise > 0) {
    currentPage.drawText(data.taxLabel || "Tax (GST):", { x: summaryX, y: y, size: 8.5, font: assets.fontRegular, color: slate });
    currentPage.drawText(formatPaiseToINR(data.taxPaise), {
      x: pageWidth - margin - 80,
      y: y,
      size: 8.5,
      font: assets.fontMedium,
      color: navy,
    });
    y -= 15;
  } else {
    currentPage.drawText("Tax Treatment:", { x: summaryX, y: y, size: 8, font: assets.fontRegular, color: muted });
    currentPage.drawText("Exempt / MSME Threshold", {
      x: pageWidth - margin - 120,
      y: y,
      size: 8,
      font: assets.fontRegular,
      color: muted,
    });
    y -= 15;
  }

  // Final Approved Total Box
  currentPage.drawRectangle({
    x: summaryX - 8,
    y: y - 22,
    width: summaryWidth + 8,
    height: 26,
    color: rgb(0.94, 0.97, 1),
    borderColor: accentBlue,
    borderWidth: 1,
  });

  currentPage.drawText("TOTAL PAYABLE:", {
    x: summaryX,
    y: y - 14,
    size: 9.5,
    font: assets.fontBold,
    color: navy,
  });
  currentPage.drawText(formatPaiseToINR(data.totalPayablePaise), {
    x: pageWidth - margin - 85,
    y: y - 14,
    size: 11,
    font: assets.fontBold,
    color: accentBlue,
  });

  y -= 34;

  // Total in words
  currentPage.drawText(`Amount in words: ${paiseToIndianRupeesWords(data.totalPayablePaise)}`, {
    x: summaryX - 8,
    y: y,
    size: 7.5,
    font: assets.fontMedium,
    color: slate,
  });

  y -= 25;

  // TWO CONTRACTUAL PAYMENT MILESTONES (Section 12 requirement)
  const milestoneBoxHeight = 72;
  currentPage.drawRectangle({
    x: margin,
    y: y - milestoneBoxHeight,
    width: contentWidth,
    height: milestoneBoxHeight,
    color: rgb(0.975, 0.985, 0.995),
    borderColor: borderGrey,
    borderWidth: 0.8,
  });

  currentPage.drawText("CONTRACTUAL PAYMENT SCHEDULE (EXACTLY TWO 50% MILESTONES)", {
    x: margin + 12,
    y: y - 16,
    size: 8.5,
    font: assets.fontBold,
    color: navy,
  });

  // Milestone 1
  currentPage.drawText("Milestone 1 — Initial Project Commitment (50%):", {
    x: margin + 12,
    y: y - 32,
    size: 8,
    font: assets.fontBold,
    color: slate,
  });
  currentPage.drawText(formatPaiseToINR(data.milestone1Paise), {
    x: margin + 255,
    y: y - 32,
    size: 8.5,
    font: assets.fontBold,
    color: navy,
  });
  currentPage.drawText("Due after executed SOW and before active project work commences (Stage 6).", {
    x: margin + 12,
    y: y - 44,
    size: 7.5,
    font: assets.fontRegular,
    color: muted,
  });

  // Milestone 2
  currentPage.drawText("Milestone 2 — Final Project Settlement (50%):", {
    x: margin + 12,
    y: y - 56,
    size: 8,
    font: assets.fontBold,
    color: slate,
  });
  currentPage.drawText(formatPaiseToINR(data.milestone2Paise), {
    x: margin + 255,
    y: y - 56,
    size: 8.5,
    font: assets.fontBold,
    color: navy,
  });
  currentPage.drawText("Due after agreed delivery acceptance and before final handover & IP access transfer (Stage 11).", {
    x: margin + 12,
    y: y - 66,
    size: 7.5,
    font: assets.fontRegular,
    color: muted,
  });

  y -= milestoneBoxHeight + 16;

  // Terms & Commercial Conditions
  if (y < 90) {
    currentPage = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    drawHeader(false);
  }

  currentPage.drawText("COMMERCIAL CONDITIONS & ACCEPTANCE PROCEDURE", {
    x: margin,
    y: y,
    size: 8.5,
    font: assets.fontBold,
    color: navy,
  });
  y -= 12;

  const defaultTerms = [
    "1. Quotation Acceptance: Acceptance confirms the approved service scope, deliverables, and price. It does not constitute payment.",
    "2. Scope Boundary: Only explicitly itemized and priced services above are included. Third-party cloud subscriptions or domain fees are separate.",
    "3. SOW Requirement: Project commencement is contingent upon mutual execution of the Statement of Work (SOW) at Stage 5.",
    "4. Payment Verification: Milestone payments are conducted via authorized UPI transfer and verified manually by LIT administration.",
  ];

  for (const term of defaultTerms) {
    currentPage.drawText(term, {
      x: margin,
      y: y,
      size: 7,
      font: assets.fontRegular,
      color: slate,
    });
    y -= 10;
  }

  y -= 12;

  // Footer & MSME Notice on every page
  const totalPages = doc.getPageCount();
  const pages = doc.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    // Bottom border
    page.drawRectangle({
      x: margin,
      y: margin + 18,
      width: contentWidth,
      height: 0.5,
      color: borderGrey,
    });

    page.drawText(
      `Logic Intelligence Technologies · MSME Udyam: ${LIT_QUOTATION_ISSUER.msmeUdyamNumber} (${LIT_QUOTATION_ISSUER.msmeCategory}) · ${LIT_QUOTATION_ISSUER.officialWebsite}`,
      {
        x: margin,
        y: margin + 6,
        size: 6.8,
        font: assets.fontRegular,
        color: muted,
      }
    );

    page.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: pageWidth - margin - 50,
      y: margin + 6,
      size: 6.8,
      font: assets.fontMedium,
      color: slate,
    });
  }

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    buffer,
    bytes: pdfBytes,
    sha256,
    pageCount: totalPages,
  };
}
