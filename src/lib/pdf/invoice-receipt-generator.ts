import { PDFDocument, rgb, RGB, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Verified LIT Corporate Credentials
export const LIT_CREDENTIALS = {
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

export interface InvoiceLineItem {
  description: string;
  subDescription?: string;
  quantity: number;
  unitPrice: number; // in INR
  taxRatePercent?: number; // default 18
  amount?: number; // quantity * unitPrice
}

export interface TaxInvoiceData {
  invoiceNumber: string; // e.g. "LIT-INV-2026-0001"
  dateIssued: string; // e.g. "October 14, 2026"
  dueDate: string; // e.g. "October 21, 2026"
  placeOfSupply?: string; // e.g. "Tamil Nadu (Code 33)"
  milestoneRef?: string; // e.g. "Stage 6: Initial Project Milestone"
  hsnSacCode?: string; // default "998315"
  
  issuer?: {
    legalName?: string;
    msmeUdyam?: string;
    msmeCategory?: string;
    registeredAddress?: string;
    officialEmail?: string;
    officialWebsite?: string;
    gstin?: string;
    signatoryName?: string;
  };

  client: {
    legalName: string;
    attentionName?: string;
    billingAddress: string | string[];
    cityStatePin?: string;
    email: string;
    phone?: string;
    gstin?: string;
  };

  items: InvoiceLineItem[];

  taxType?: "INTRA_STATE" | "INTER_STATE" | "EXEMPT"; // INTRA_STATE = CGST 9% + SGST 9%; INTER_STATE = IGST 18%
  taxRatePercent?: number; // default 18
  subtotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTaxAmount?: number;
  totalPayable: number;
  totalInWords?: string;

  status?: "pending" | "paid" | "partially_paid";
  amountPaid?: number;
  amountDue?: number;
  notes?: string;
}

export interface PaymentHistoryRecord {
  paymentMethod: string; // e.g. "UPI Manual Transfer"
  paymentDate: string; // e.g. "October 14, 2026"
  utrReference: string; // e.g. "428910398471"
  receivingBankRef?: string; // e.g. "YES BANK / PTYES"
  amountPaid: number;
  receiptNumber: string;
}

export interface PaymentReceiptData {
  receiptNumber: string; // e.g. "LIT-REC-2026-0001"
  invoiceNumber: string; // e.g. "LIT-INV-2026-0001"
  datePaid: string; // e.g. "October 14, 2026"
  placeOfSupply?: string;
  milestoneRef?: string;
  hsnSacCode?: string;

  issuer?: {
    legalName?: string;
    msmeUdyam?: string;
    msmeCategory?: string;
    registeredAddress?: string;
    officialEmail?: string;
    officialWebsite?: string;
    gstin?: string;
    signatoryName?: string;
  };

  client: {
    legalName: string;
    attentionName?: string;
    billingAddress: string | string[];
    cityStatePin?: string;
    email: string;
    phone?: string;
    gstin?: string;
  };

  items: InvoiceLineItem[];

  taxType?: "INTRA_STATE" | "INTER_STATE" | "EXEMPT";
  taxRatePercent?: number;
  subtotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTaxAmount?: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance?: number;
  totalInWords?: string;

  paymentHistory: PaymentHistoryRecord[];
  notes?: string;
}

export interface GeneratedPdfResult {
  buffer: Buffer;
  bytes: Uint8Array;
  sha256: string;
  pageCount: number;
}

/**
 * Format a number as Indian Currency (INR) string with 2 decimal places and the ₹ symbol.
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(Number(amount || 0) * 100) / 100;
  return "₹" + rounded.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Convert numerical amount to Indian Rupees words.
 */
export function numberToIndianRupeesWords(num: number): string {
  if (!num || num === 0) return "Rupees Zero Only";
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

  const rounded = Math.round(num * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let remaining = integerPart;
  const parts: string[] = [];

  const crores = Math.floor(remaining / 10000000);
  if (crores > 0) {
    parts.push(numberToIndianRupeesWords(crores).replace("Rupees ", "").replace(" Only", "") + " Crore");
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

  let result = "Rupees " + parts.join(" ");
  if (decimalPart > 0) {
    result += " and Paise " + convertTwoDigits(decimalPart);
  }
  return result.trim() + " Only";
}

/** Compute SHA-256 hex digest of bytes */
export function computeSha256(data: Uint8Array | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function sanitizeWinAnsi(str: string): string {
  if (!str) return "";
  return str
    .replace(/₹/g, "Rs. ")
    .replace(/\u20B9/g, "Rs. ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/\u2022/g, "-");
}

/**
 * Word-wraps text within a maximum width given a font and size.
 */
export function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return [];
  const isStd = font?.name?.includes("Helvetica");
  const sanitized = isStd ? sanitizeWinAnsi(text) : text;
  const words = sanitized.split(/\s+/);
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
  return lines.length > 0 ? lines : [sanitized];
}

function resolveAssetPath(relativePath: string): string | null {
  const baseName = path.basename(relativePath);
  const candidates = [
    path.join(__dirname, relativePath),
    path.join(__dirname, "../pdf", relativePath),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public/fonts", baseName),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", relativePath),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src/lib/pdf", relativePath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

interface LoadedAssets {
  fontBold: any;
  fontMedium: any;
  fontRegular: any;
  logoImage: any | null;
  isStandardFont: boolean;
}

async function loadAssets(doc: PDFDocument): Promise<LoadedAssets> {
  doc.registerFontkit(fontkit);

  let fontBold: any;
  let fontMedium: any;
  let fontRegular: any;
  let isStandardFont = false;

  try {
    const boldPath = resolveAssetPath("fonts/Poppins-Bold.ttf") || resolveAssetPath("fonts/Poppins-Bold.ttf");
    const medPath = resolveAssetPath("fonts/Poppins-Medium.ttf") || resolveAssetPath("fonts/Poppins-Medium.ttf");
    const regPath = resolveAssetPath("fonts/Poppins-Regular.ttf") || resolveAssetPath("fonts/Poppins-Regular.ttf");

    if (boldPath && medPath && regPath) {
      fontBold = await doc.embedFont(fs.readFileSync(boldPath));
      fontMedium = await doc.embedFont(fs.readFileSync(medPath));
      fontRegular = await doc.embedFont(fs.readFileSync(regPath));
    } else {
      throw new Error("Poppins fonts not found");
    }
  } catch (err) {
    console.warn("Falling back to standard fonts:", err);
    isStandardFont = true;
    fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    fontMedium = await doc.embedFont(StandardFonts.Helvetica);
    fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  }

  let logoImage: any = null;
  try {
    const circleLogoPath =
      resolveAssetPath("assets/lit_logo_circle.png") ||
      resolveAssetPath("assets/lit_logo_full.png") ||
      resolveAssetPath("public/assets/logo-icon.jpg");

    if (circleLogoPath) {
      const bytes = fs.readFileSync(circleLogoPath);
      if (circleLogoPath.endsWith(".png")) {
        logoImage = await doc.embedPng(bytes);
      } else {
        logoImage = await doc.embedJpg(bytes);
      }
    }
  } catch (err) {
    console.warn("Could not embed logo image:", err);
  }

  return { fontBold, fontMedium, fontRegular, logoImage, isStandardFont };
}

/**
 * Generate a single-page A4 Tax Invoice PDF matching Claude reference structure.
 */
export async function generateTaxInvoicePdf(invoiceData: TaxInvoiceData): Promise<GeneratedPdfResult> {
  const doc = await PDFDocument.create();
  const assets = await loadAssets(doc);

  // A4 dimensions: 595.28 pt x 841.89 pt
  const page = doc.addPage([595.28, 841.89]);
  const origDrawText = page.drawText.bind(page);
  page.drawText = (text: string, options?: any) => {
    const isStd = assets.isStandardFont || options?.font?.name?.includes("Helvetica");
    const clean = isStd ? sanitizeWinAnsi(text) : text;
    return origDrawText(clean, options);
  };
  const { width, height } = page.getSize();

  // Color Palette
  const colorDark = rgb(17 / 255, 24 / 255, 39 / 255); // #111827
  const colorMuted = rgb(107 / 255, 114 / 255, 128 / 255); // #6B7280
  const colorLightBorder = rgb(229 / 255, 231 / 255, 235 / 255); // #E5E7EB
  const colorDarkBorder = rgb(17 / 255, 24 / 255, 39 / 255); // #111827
  const colorPrimary = rgb(14 / 255, 116 / 255, 144 / 255); // #0E7490 (Tech Cyan/Blue)

  const leftMargin = 40;
  const rightMargin = width - 40;
  const contentWidth = rightMargin - leftMargin; // 515.28

  // 1. TOP HEADER ROW
  let cursorY = height - 42; // ~800pt

  // Top Left: "Invoice" in bold 24pt clean sans
  page.drawText("Invoice", {
    x: leftMargin,
    y: cursorY,
    size: 24,
    font: assets.fontBold,
    color: colorDark,
  });

  // Top Right: Official LIT Logo
  if (assets.logoImage) {
    const logoSize = 60;
    page.drawImage(assets.logoImage, {
      x: rightMargin - logoSize,
      y: cursorY - 35,
      width: logoSize,
      height: logoSize,
    });
  }

  // 2. DOCUMENT METADATA GRID (Directly below Title)
  cursorY -= 28; // ~772pt
  const metaLabelX = leftMargin;
  const metaValueX = leftMargin + 105;
  const metaRowHeight = 13;

  const metadata: [string, string][] = [
    ["Invoice number", invoiceData.invoiceNumber],
    ["Date of issue", invoiceData.dateIssued],
    ["Date due", invoiceData.dueDate],
    ["Place of supply", invoiceData.placeOfSupply || "Tamil Nadu (Code 33)"],
    [
      "VAT / GST Notice",
      invoiceData.issuer?.gstin && invoiceData.issuer.gstin !== "Pending"
        ? `GSTIN: ${invoiceData.issuer.gstin}`
        : "Unregistered (Composition / Threshold)",
    ],
  ];

  for (const [label, val] of metadata) {
    page.drawText(label, {
      x: metaLabelX,
      y: cursorY,
      size: 8.5,
      font: assets.fontMedium,
      color: colorDark,
    });
    page.drawText(val, {
      x: metaValueX,
      y: cursorY,
      size: 8.5,
      font: assets.fontBold,
      color: colorDark,
    });
    cursorY -= metaRowHeight;
  }

  // 3. TWO-COLUMN ISSUER & BILL TO BLOCK
  cursorY -= 12; // ~695pt
  const colLeftX = leftMargin;
  const colRightX = leftMargin + 250;

  // Left Column: Issuer (Verified LIT Credentials)
  const issuer = {
    name: LIT_CREDENTIALS.legalEntity,
    msme: `MSME / Udyam: ${LIT_CREDENTIALS.msmeUdyamNumber}`,
    category: LIT_CREDENTIALS.msmeCategory,
    address: LIT_CREDENTIALS.registeredAddress,
    email: LIT_CREDENTIALS.officialEmail,
    website: LIT_CREDENTIALS.officialWebsite,
    signatory: LIT_CREDENTIALS.founderSignatory,
    ...invoiceData.issuer,
  };

  page.drawText(issuer.name, {
    x: colLeftX,
    y: cursorY,
    size: 9.5,
    font: assets.fontBold,
    color: colorDark,
  });

  // Right Column: Bill To
  page.drawText("Bill to", {
    x: colRightX,
    y: cursorY,
    size: 9.5,
    font: assets.fontBold,
    color: colorDark,
  });

  cursorY -= 14;

  // Render Issuer details (left) & Client details (right)
  const issuerLines = [
    issuer.msme,
    `Eachanari, Coimbatore`,
    `Tamil Nadu 641021, India`,
    issuer.email,
    issuer.website,
    issuer.gstin ? `GSTIN: ${issuer.gstin}` : LIT_CREDENTIALS.unregisteredGstinNotice,
  ];

  const clientAddressLines = Array.isArray(invoiceData.client.billingAddress)
    ? invoiceData.client.billingAddress
    : invoiceData.client.billingAddress.split("\n").filter(Boolean);

  const clientLines = [
    invoiceData.client.legalName,
    ...(invoiceData.client.attentionName ? [`Attn: ${invoiceData.client.attentionName}`] : []),
    ...clientAddressLines,
    ...(invoiceData.client.cityStatePin ? [invoiceData.client.cityStatePin] : []),
    invoiceData.client.email,
    ...(invoiceData.client.phone ? [invoiceData.client.phone] : []),
    invoiceData.client.gstin ? `GSTIN: ${invoiceData.client.gstin}` : `GSTIN: Unregistered / Consumer`,
  ];

  const maxLines = Math.max(issuerLines.length, clientLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (i < issuerLines.length) {
      page.drawText(issuerLines[i], {
        x: colLeftX,
        y: cursorY - i * 12,
        size: 8,
        font: assets.fontRegular,
        color: colorMuted,
      });
    }
    if (i < clientLines.length) {
      page.drawText(clientLines[i], {
        x: colRightX,
        y: cursorY - i * 12,
        size: 8,
        font: i === 0 ? assets.fontBold : assets.fontRegular,
        color: i === 0 ? colorDark : colorMuted,
      });
    }
  }

  cursorY -= maxLines * 12 + 18; // ~590pt

  // 4. PROMINENT AMOUNT / STATUS CALLOUT
  const isPaid = invoiceData.status === "paid" || (invoiceData.amountDue !== undefined && invoiceData.amountDue <= 0);
  const statusBannerText = isPaid
    ? `${formatINR(invoiceData.totalPayable)} paid in full`
    : `${formatINR(invoiceData.amountDue ?? invoiceData.totalPayable)} due ${invoiceData.dueDate}`;

  page.drawText(statusBannerText, {
    x: leftMargin,
    y: cursorY,
    size: 16,
    font: assets.fontBold,
    color: colorDark,
  });

  cursorY -= 20;

  // 5. ITEMIZED DELIVERABLES TABLE
  // Table columns: Description (240), Qty (35), Unit price (75), Tax (60), Amount (100)
  const colDescX = leftMargin;
  const colQtyX = leftMargin + 255;
  const colUnitPriceX = leftMargin + 310;
  const colTaxX = leftMargin + 395;
  const colAmountX = rightMargin;

  // Top Table Rule
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 6 },
    end: { x: rightMargin, y: cursorY + 6 },
    thickness: 0.75,
    color: colorDarkBorder,
  });

  // Table Headers
  page.drawText("Description", { x: colDescX, y: cursorY - 4, size: 8.5, font: assets.fontMedium, color: colorDark });
  page.drawText("Qty", {
    x: colQtyX - assets.fontMedium.widthOfTextAtSize("Qty", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Unit price", {
    x: colUnitPriceX + 35 - assets.fontMedium.widthOfTextAtSize("Unit price", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Tax", {
    x: colTaxX + 20 - assets.fontMedium.widthOfTextAtSize("Tax", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Amount", {
    x: colAmountX - assets.fontMedium.widthOfTextAtSize("Amount", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });

  cursorY -= 14;

  // Header bottom divider
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 2 },
    end: { x: rightMargin, y: cursorY + 2 },
    thickness: 0.5,
    color: colorLightBorder,
  });

  cursorY -= 12;

  // Render Table Line Items
  let calculatedSubtotal = 0;
  for (const item of invoiceData.items) {
    const itemAmount = item.amount ?? item.quantity * item.unitPrice;
    calculatedSubtotal += itemAmount;

    // Wrap description if text exceeds table column width (~240pt)
    const descLines = wrapText(item.description, 235, assets.fontBold, 8.5);

    // Line 1: First line of Description Title
    page.drawText(descLines[0], {
      x: colDescX,
      y: cursorY,
      size: 8.5,
      font: assets.fontBold,
      color: colorDark,
    });

    // Qty (aligned with top line)
    const qtyStr = String(item.quantity);
    page.drawText(qtyStr, {
      x: colQtyX - assets.fontRegular.widthOfTextAtSize(qtyStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Unit price
    const unitPriceStr = formatINR(item.unitPrice);
    page.drawText(unitPriceStr, {
      x: colUnitPriceX + 35 - assets.fontRegular.widthOfTextAtSize(unitPriceStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Tax rate
    const taxRateStr = `${item.taxRatePercent ?? 18}%`;
    page.drawText(taxRateStr, {
      x: colTaxX + 20 - assets.fontRegular.widthOfTextAtSize(taxRateStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Line Amount
    const amountStr = formatINR(itemAmount);
    page.drawText(amountStr, {
      x: colAmountX - assets.fontRegular.widthOfTextAtSize(amountStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Additional wrapped lines of Description (if any)
    for (let i = 1; i < descLines.length; i++) {
      cursorY -= 11;
      page.drawText(descLines[i], {
        x: colDescX,
        y: cursorY,
        size: 8.5,
        font: assets.fontBold,
        color: colorDark,
      });
    }

    cursorY -= 11;

    // Sub Description (if present)
    if (item.subDescription) {
      const subLines = wrapText(item.subDescription, 235, assets.fontRegular, 7.5);
      for (const subLine of subLines) {
        page.drawText(subLine, {
          x: colDescX,
          y: cursorY,
          size: 7.5,
          font: assets.fontRegular,
          color: colorMuted,
        });
        cursorY -= 10;
      }
      cursorY -= 2;
    } else {
      cursorY -= 2;
    }
  }

  // Divider after items
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 4 },
    end: { x: rightMargin, y: cursorY + 4 },
    thickness: 0.5,
    color: colorLightBorder,
  });

  cursorY -= 12;

  // 6. TOTALS BREAKDOWN (Right Aligned)
  const subtotal = invoiceData.subtotal ?? calculatedSubtotal;
  const taxRate = invoiceData.taxRatePercent ?? 18;
  const isIntraState = invoiceData.taxType === "INTRA_STATE" || !invoiceData.taxType; // Default intra-state TN

  const totalsColLabelX = rightMargin - 220;
  const totalsRowHeight = 13;

  const totalsRows: [string, string, boolean][] = [
    ["Subtotal", formatINR(subtotal), false],
    ["Total excluding tax", formatINR(subtotal), false],
  ];

  if (isIntraState) {
    const cgst = invoiceData.cgstAmount ?? Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = invoiceData.sgstAmount ?? Math.round(subtotal * 0.09 * 100) / 100;
    totalsRows.push([`CGST (9% on ${formatINR(subtotal)})`, formatINR(cgst), false]);
    totalsRows.push([`SGST (9% on ${formatINR(subtotal)})`, formatINR(sgst), false]);
  } else if (invoiceData.taxType === "INTER_STATE") {
    const igst = invoiceData.igstAmount ?? Math.round(subtotal * 0.18 * 100) / 100;
    totalsRows.push([`GST - India (18% on ${formatINR(subtotal)})`, formatINR(igst), false]);
  } else {
    totalsRows.push(["GST (Exempt / Nil)", "₹0.00", false]);
  }

  totalsRows.push(["Total", formatINR(invoiceData.totalPayable), true]);
  totalsRows.push([
    isPaid ? "Amount paid" : "Amount due",
    formatINR(isPaid ? invoiceData.totalPayable : (invoiceData.amountDue ?? invoiceData.totalPayable)),
    true,
  ]);

  for (const [label, val, isBold] of totalsRows) {
    page.drawText(label, {
      x: totalsColLabelX,
      y: cursorY,
      size: 8.5,
      font: isBold ? assets.fontBold : assets.fontRegular,
      color: colorDark,
    });
    const valWidth = (isBold ? assets.fontBold : assets.fontRegular).widthOfTextAtSize(val, 8.5);
    page.drawText(val, {
      x: rightMargin - valWidth,
      y: cursorY,
      size: 8.5,
      font: isBold ? assets.fontBold : assets.fontRegular,
      color: colorDark,
    });
    cursorY -= totalsRowHeight;
  }

  // 7. STATUTORY & WORDS BLOCK (Left / Bottom of Table)
  cursorY -= 8;
  const inWords = invoiceData.totalInWords || numberToIndianRupeesWords(invoiceData.totalPayable);

  // Box for Total in Words
  page.drawRectangle({
    x: leftMargin,
    y: cursorY - 18,
    width: contentWidth,
    height: 24,
    color: rgb(249 / 255, 250 / 255, 251 / 255), // light gray tint
    borderColor: colorLightBorder,
    borderWidth: 0.5,
  });

  page.drawText(`Amount in Words: ${inWords}`, {
    x: leftMargin + 8,
    y: cursorY - 11,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });

  cursorY -= 36;

  // HSN & Classification lines
  const hsnCode = invoiceData.hsnSacCode || LIT_CREDENTIALS.sacCode;
  page.drawText(`HSN / SAC Code: ${hsnCode} (${LIT_CREDENTIALS.sacDescription})`, {
    x: leftMargin,
    y: cursorY,
    size: 8,
    font: assets.fontRegular,
    color: colorMuted,
  });

  page.drawText("Tax Invoice", {
    x: leftMargin,
    y: cursorY - 12,
    size: 9,
    font: assets.fontBold,
    color: colorDark,
  });

  // Signatory block (Right bottom)
  page.drawText("For LOGIC INTELLIGENCE TECHNOLOGIES", {
    x: rightMargin - 190,
    y: cursorY,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText(LIT_CREDENTIALS.founderSignatory, {
    x: rightMargin - 190,
    y: cursorY - 12,
    size: 8,
    font: assets.fontBold,
    color: colorDark,
  });
  page.drawText("Authorised Signatory", {
    x: rightMargin - 190,
    y: cursorY - 22,
    size: 7.5,
    font: assets.fontRegular,
    color: colorMuted,
  });

  // 8. PROFESSIONAL STATUTORY FOOTER
  const footerLineY = 52;
  page.drawLine({
    start: { x: leftMargin, y: footerLineY },
    end: { x: rightMargin, y: footerLineY },
    thickness: 0.5,
    color: colorLightBorder,
  });

  // Left Footer Notice
  page.drawText(
    `MSME Registration: ${LIT_CREDENTIALS.msmeUdyamNumber} (${LIT_CREDENTIALS.msmeCategory}) · ${LIT_CREDENTIALS.officialEmail}`,
    {
      x: leftMargin,
      y: footerLineY - 12,
      size: 7,
      font: assets.fontRegular,
      color: colorMuted,
    },
  );
  page.drawText(
    `Registered Location: ${LIT_CREDENTIALS.registeredAddress} · Thank you for your partnership.`,
    {
      x: leftMargin,
      y: footerLineY - 21,
      size: 6.5,
      font: assets.fontRegular,
      color: colorMuted,
    },
  );

  // Right Footer: Page 1 of 1
  page.drawText("Page 1 of 1", {
    x: rightMargin - assets.fontRegular.widthOfTextAtSize("Page 1 of 1", 7.5),
    y: footerLineY - 12,
    size: 7.5,
    font: assets.fontRegular,
    color: colorMuted,
  });

  // Serialize and calculate SHA-256
  const bytes = await doc.save();
  const buffer = Buffer.from(bytes);
  const sha256 = computeSha256(bytes);

  return { buffer, bytes, sha256, pageCount: doc.getPageCount() };
}

/**
 * Generate a single-page A4 Payment Receipt PDF strictly matching Claude reference structure.
 */
export async function generatePaymentReceiptPdf(receiptData: PaymentReceiptData): Promise<GeneratedPdfResult> {
  const doc = await PDFDocument.create();
  const assets = await loadAssets(doc);

  // A4 dimensions: 595.28 pt x 841.89 pt
  const page = doc.addPage([595.28, 841.89]);
  const origDrawText = page.drawText.bind(page);
  page.drawText = (text: string, options?: any) => {
    const isStd = assets.isStandardFont || options?.font?.name?.includes("Helvetica");
    const clean = isStd ? sanitizeWinAnsi(text) : text;
    return origDrawText(clean, options);
  };
  const { width, height } = page.getSize();

  // Color Palette
  const colorDark = rgb(17 / 255, 24 / 255, 39 / 255); // #111827
  const colorMuted = rgb(107 / 255, 114 / 255, 128 / 255); // #6B7280
  const colorLightBorder = rgb(229 / 255, 231 / 255, 235 / 255); // #E5E7EB
  const colorDarkBorder = rgb(17 / 255, 24 / 255, 39 / 255); // #111827
  const emeraldBg = rgb(220 / 255, 252 / 255, 231 / 255); // #DCFCE7
  const emeraldText = rgb(22 / 255, 101 / 255, 52 / 255); // #166534

  const leftMargin = 40;
  const rightMargin = width - 40;
  const contentWidth = rightMargin - leftMargin;

  // 1. TOP HEADER ROW
  let cursorY = height - 42; // ~800pt

  // Top Left: "Receipt" in bold 24pt clean sans
  page.drawText("Receipt", {
    x: leftMargin,
    y: cursorY,
    size: 24,
    font: assets.fontBold,
    color: colorDark,
  });

  // Top Right: Official LIT Logo
  if (assets.logoImage) {
    const logoSize = 60;
    page.drawImage(assets.logoImage, {
      x: rightMargin - logoSize,
      y: cursorY - 35,
      width: logoSize,
      height: logoSize,
    });
  }

  // 2. DOCUMENT METADATA GRID (Directly below Title)
  cursorY -= 28; // ~772pt
  const metaLabelX = leftMargin;
  const metaValueX = leftMargin + 105;
  const metaRowHeight = 13;

  const metadata: [string, string][] = [
    ["Invoice number", receiptData.invoiceNumber],
    ["Receipt number", receiptData.receiptNumber],
    ["Date paid", receiptData.datePaid],
    ["Place of supply", receiptData.placeOfSupply || "Tamil Nadu (Code 33)"],
    [
      "VAT / GST Notice",
      receiptData.issuer?.gstin && receiptData.issuer.gstin !== "Pending"
        ? `GSTIN: ${receiptData.issuer.gstin}`
        : "Unregistered (Composition / Threshold)",
    ],
  ];

  for (const [label, val] of metadata) {
    page.drawText(label, {
      x: metaLabelX,
      y: cursorY,
      size: 8.5,
      font: assets.fontMedium,
      color: colorDark,
    });
    page.drawText(val, {
      x: metaValueX,
      y: cursorY,
      size: 8.5,
      font: assets.fontBold,
      color: colorDark,
    });
    cursorY -= metaRowHeight;
  }

  // 3. TWO-COLUMN ISSUER & BILL TO BLOCK
  cursorY -= 12; // ~695pt
  const colLeftX = leftMargin;
  const colRightX = leftMargin + 250;

  // Left Column: Issuer (Verified LIT Credentials)
  const issuer = {
    name: LIT_CREDENTIALS.legalEntity,
    msme: `MSME / Udyam: ${LIT_CREDENTIALS.msmeUdyamNumber}`,
    category: LIT_CREDENTIALS.msmeCategory,
    address: LIT_CREDENTIALS.registeredAddress,
    email: LIT_CREDENTIALS.officialEmail,
    website: LIT_CREDENTIALS.officialWebsite,
    signatory: LIT_CREDENTIALS.founderSignatory,
    ...receiptData.issuer,
  };

  page.drawText(issuer.name, {
    x: colLeftX,
    y: cursorY,
    size: 9.5,
    font: assets.fontBold,
    color: colorDark,
  });

  // Right Column: Bill To
  page.drawText("Bill to", {
    x: colRightX,
    y: cursorY,
    size: 9.5,
    font: assets.fontBold,
    color: colorDark,
  });

  cursorY -= 14;

  const issuerLines = [
    issuer.msme,
    `Eachanari, Coimbatore`,
    `Tamil Nadu 641021, India`,
    issuer.email,
    issuer.website,
    issuer.gstin ? `GSTIN: ${issuer.gstin}` : LIT_CREDENTIALS.unregisteredGstinNotice,
  ];

  const clientAddressLines = Array.isArray(receiptData.client.billingAddress)
    ? receiptData.client.billingAddress
    : receiptData.client.billingAddress.split("\n").filter(Boolean);

  const clientLines = [
    receiptData.client.legalName,
    ...(receiptData.client.attentionName ? [`Attn: ${receiptData.client.attentionName}`] : []),
    ...clientAddressLines,
    ...(receiptData.client.cityStatePin ? [receiptData.client.cityStatePin] : []),
    receiptData.client.email,
    ...(receiptData.client.phone ? [receiptData.client.phone] : []),
    receiptData.client.gstin ? `GSTIN: ${receiptData.client.gstin}` : `GSTIN: Unregistered / Consumer`,
  ];

  const maxLines = Math.max(issuerLines.length, clientLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (i < issuerLines.length) {
      page.drawText(issuerLines[i], {
        x: colLeftX,
        y: cursorY - i * 12,
        size: 8,
        font: assets.fontRegular,
        color: colorMuted,
      });
    }
    if (i < clientLines.length) {
      page.drawText(clientLines[i], {
        x: colRightX,
        y: cursorY - i * 12,
        size: 8,
        font: i === 0 ? assets.fontBold : assets.fontRegular,
        color: i === 0 ? colorDark : colorMuted,
      });
    }
  }

  cursorY -= maxLines * 12 + 18; // ~590pt

  // 4. PROMINENT AMOUNT PAID BANNER + PROMINENT PAID BADGE
  const paidBannerText = `${formatINR(receiptData.amountPaid)} paid on ${receiptData.datePaid}`;
  page.drawText(paidBannerText, {
    x: leftMargin,
    y: cursorY,
    size: 16,
    font: assets.fontBold,
    color: colorDark,
  });

  // Prominent Green PAID Badge (Matching receipt standard)
  const badgeWidth = 62;
  const badgeHeight = 20;
  const badgeX = leftMargin + assets.fontBold.widthOfTextAtSize(paidBannerText, 16) + 16;
  const badgeY = cursorY - 3;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: emeraldBg,
    borderColor: emeraldText,
    borderWidth: 1,
  });

  page.drawText("PAID", {
    x: badgeX + 16,
    y: badgeY + 5,
    size: 10,
    font: assets.fontBold,
    color: emeraldText,
  });

  cursorY -= 20;

  // 5. ITEMIZED DELIVERABLES TABLE
  const colDescX = leftMargin;
  const colQtyX = leftMargin + 255;
  const colUnitPriceX = leftMargin + 310;
  const colTaxX = leftMargin + 395;
  const colAmountX = rightMargin;

  // Top Table Rule
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 6 },
    end: { x: rightMargin, y: cursorY + 6 },
    thickness: 0.75,
    color: colorDarkBorder,
  });

  // Table Headers
  page.drawText("Description", { x: colDescX, y: cursorY - 4, size: 8.5, font: assets.fontMedium, color: colorDark });
  page.drawText("Qty", {
    x: colQtyX - assets.fontMedium.widthOfTextAtSize("Qty", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Unit price", {
    x: colUnitPriceX + 35 - assets.fontMedium.widthOfTextAtSize("Unit price", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Tax", {
    x: colTaxX + 20 - assets.fontMedium.widthOfTextAtSize("Tax", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Amount", {
    x: colAmountX - assets.fontMedium.widthOfTextAtSize("Amount", 8.5),
    y: cursorY - 4,
    size: 8.5,
    font: assets.fontMedium,
    color: colorDark,
  });

  cursorY -= 14;

  // Header bottom divider
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 2 },
    end: { x: rightMargin, y: cursorY + 2 },
    thickness: 0.5,
    color: colorLightBorder,
  });

  cursorY -= 12;

  // Render Table Line Items
  let calculatedSubtotal = 0;
  for (const item of receiptData.items) {
    const itemAmount = item.amount ?? item.quantity * item.unitPrice;
    calculatedSubtotal += itemAmount;

    // Wrap description if text exceeds table column width (~240pt)
    const descLines = wrapText(item.description, 235, assets.fontBold, 8.5);

    // Line 1: First line of Description Title
    page.drawText(descLines[0], {
      x: colDescX,
      y: cursorY,
      size: 8.5,
      font: assets.fontBold,
      color: colorDark,
    });

    // Qty (aligned with top line)
    const qtyStr = String(item.quantity);
    page.drawText(qtyStr, {
      x: colQtyX - assets.fontRegular.widthOfTextAtSize(qtyStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Unit price
    const unitPriceStr = formatINR(item.unitPrice);
    page.drawText(unitPriceStr, {
      x: colUnitPriceX + 35 - assets.fontRegular.widthOfTextAtSize(unitPriceStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Tax rate
    const taxRateStr = `${item.taxRatePercent ?? 18}%`;
    page.drawText(taxRateStr, {
      x: colTaxX + 20 - assets.fontRegular.widthOfTextAtSize(taxRateStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Line Amount
    const amountStr = formatINR(itemAmount);
    page.drawText(amountStr, {
      x: colAmountX - assets.fontRegular.widthOfTextAtSize(amountStr, 8.5),
      y: cursorY,
      size: 8.5,
      font: assets.fontRegular,
      color: colorDark,
    });

    // Additional wrapped lines of Description (if any)
    for (let i = 1; i < descLines.length; i++) {
      cursorY -= 11;
      page.drawText(descLines[i], {
        x: colDescX,
        y: cursorY,
        size: 8.5,
        font: assets.fontBold,
        color: colorDark,
      });
    }

    cursorY -= 11;

    // Sub Description (if present)
    if (item.subDescription) {
      const subLines = wrapText(item.subDescription, 235, assets.fontRegular, 7.5);
      for (const subLine of subLines) {
        page.drawText(subLine, {
          x: colDescX,
          y: cursorY,
          size: 7.5,
          font: assets.fontRegular,
          color: colorMuted,
        });
        cursorY -= 10;
      }
      cursorY -= 2;
    } else {
      cursorY -= 2;
    }
  }

  // Divider after items
  page.drawLine({
    start: { x: leftMargin, y: cursorY + 4 },
    end: { x: rightMargin, y: cursorY + 4 },
    thickness: 0.5,
    color: colorLightBorder,
  });

  cursorY -= 12;

  // 6. TOTALS BREAKDOWN (Right Aligned)
  const subtotal = receiptData.subtotal ?? calculatedSubtotal;
  const isIntraState = receiptData.taxType === "INTRA_STATE" || !receiptData.taxType;

  const totalsColLabelX = rightMargin - 220;
  const totalsRowHeight = 13;

  const totalsRows: [string, string, boolean][] = [
    ["Subtotal", formatINR(subtotal), false],
    ["Total excluding tax", formatINR(subtotal), false],
  ];

  if (isIntraState) {
    const cgst = receiptData.cgstAmount ?? Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = receiptData.sgstAmount ?? Math.round(subtotal * 0.09 * 100) / 100;
    totalsRows.push([`CGST (9% on ${formatINR(subtotal)})`, formatINR(cgst), false]);
    totalsRows.push([`SGST (9% on ${formatINR(subtotal)})`, formatINR(sgst), false]);
  } else if (receiptData.taxType === "INTER_STATE") {
    const igst = receiptData.igstAmount ?? Math.round(subtotal * 0.18 * 100) / 100;
    totalsRows.push([`GST - India (18% on ${formatINR(subtotal)})`, formatINR(igst), false]);
  } else {
    totalsRows.push(["GST (Exempt / Nil)", "₹0.00", false]);
  }

  totalsRows.push(["Total", formatINR(receiptData.totalAmount), true]);
  totalsRows.push(["Amount paid", formatINR(receiptData.amountPaid), true]);

  for (const [label, val, isBold] of totalsRows) {
    page.drawText(label, {
      x: totalsColLabelX,
      y: cursorY,
      size: 8.5,
      font: isBold ? assets.fontBold : assets.fontRegular,
      color: colorDark,
    });
    const valWidth = (isBold ? assets.fontBold : assets.fontRegular).widthOfTextAtSize(val, 8.5);
    page.drawText(val, {
      x: rightMargin - valWidth,
      y: cursorY,
      size: 8.5,
      font: isBold ? assets.fontBold : assets.fontRegular,
      color: colorDark,
    });
    cursorY -= totalsRowHeight;
  }

  // 7. PAYMENT HISTORY SECTION (Crucial Claude Reference Element)
  cursorY -= 8;
  page.drawText("Payment history", {
    x: leftMargin,
    y: cursorY,
    size: 13,
    font: assets.fontBold,
    color: colorDark,
  });

  cursorY -= 14;

  // Payment History Table Header
  const phMethodX = leftMargin;
  const phDateX = leftMargin + 200;
  const phAmountX = leftMargin + 340;
  const phReceiptX = rightMargin;

  page.drawLine({
    start: { x: leftMargin, y: cursorY + 6 },
    end: { x: rightMargin, y: cursorY + 6 },
    thickness: 0.5,
    color: colorDarkBorder,
  });

  page.drawText("Payment method", { x: phMethodX, y: cursorY - 4, size: 8, font: assets.fontMedium, color: colorDark });
  page.drawText("Date", { x: phDateX, y: cursorY - 4, size: 8, font: assets.fontMedium, color: colorDark });
  page.drawText("Amount paid", {
    x: phAmountX - assets.fontMedium.widthOfTextAtSize("Amount paid", 8),
    y: cursorY - 4,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText("Receipt number", {
    x: phReceiptX - assets.fontMedium.widthOfTextAtSize("Receipt number", 8),
    y: cursorY - 4,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });

  cursorY -= 14;

  page.drawLine({
    start: { x: leftMargin, y: cursorY + 2 },
    end: { x: rightMargin, y: cursorY + 2 },
    thickness: 0.5,
    color: colorLightBorder,
  });

  cursorY -= 10;

  // Render Payment History Rows
  for (const ph of receiptData.paymentHistory) {
    const methodLine = `${ph.paymentMethod}${ph.utrReference ? ` (UTR: ${ph.utrReference})` : ""}`;
    page.drawText(methodLine, {
      x: phMethodX,
      y: cursorY,
      size: 8,
      font: assets.fontBold,
      color: colorDark,
    });

    page.drawText(ph.paymentDate, {
      x: phDateX,
      y: cursorY,
      size: 8,
      font: assets.fontRegular,
      color: colorDark,
    });

    const paidStr = formatINR(ph.amountPaid);
    page.drawText(paidStr, {
      x: phAmountX - assets.fontRegular.widthOfTextAtSize(paidStr, 8),
      y: cursorY,
      size: 8,
      font: assets.fontRegular,
      color: colorDark,
    });

    page.drawText(ph.receiptNumber, {
      x: phReceiptX - assets.fontRegular.widthOfTextAtSize(ph.receiptNumber, 8),
      y: cursorY,
      size: 8,
      font: assets.fontRegular,
      color: colorDark,
    });

    cursorY -= 10;
    if (ph.receivingBankRef) {
      page.drawText(`Receiving Account: ${ph.receivingBankRef}`, {
        x: phMethodX,
        y: cursorY,
        size: 7,
        font: assets.fontRegular,
        color: colorMuted,
      });
      cursorY -= 10;
    }
  }

  // 8. STATUTORY & WORDS BLOCK
  cursorY -= 6;
  const inWords = receiptData.totalInWords || numberToIndianRupeesWords(receiptData.amountPaid);

  // Box for Total in Words
  page.drawRectangle({
    x: leftMargin,
    y: cursorY - 18,
    width: contentWidth,
    height: 24,
    color: rgb(249 / 255, 250 / 255, 251 / 255),
    borderColor: colorLightBorder,
    borderWidth: 0.5,
  });

  page.drawText(`Amount in Words: ${inWords}`, {
    x: leftMargin + 8,
    y: cursorY - 11,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });

  cursorY -= 32;

  // HSN & Classification lines
  const hsnCode = receiptData.hsnSacCode || LIT_CREDENTIALS.sacCode;
  page.drawText(`HSN / SAC Code: ${hsnCode} (${LIT_CREDENTIALS.sacDescription})`, {
    x: leftMargin,
    y: cursorY,
    size: 8,
    font: assets.fontRegular,
    color: colorMuted,
  });

  page.drawText("Tax Invoice · Payment Receipt Voucher", {
    x: leftMargin,
    y: cursorY - 12,
    size: 9,
    font: assets.fontBold,
    color: colorDark,
  });

  // Remaining Balance Note
  const remaining = receiptData.remainingBalance ?? 0;
  page.drawText(`Remaining Balance: ${formatINR(remaining)}`, {
    x: leftMargin,
    y: cursorY - 24,
    size: 8,
    font: assets.fontMedium,
    color: remaining === 0 ? emeraldText : colorDark,
  });

  // Signatory block (Right bottom)
  page.drawText("For LOGIC INTELLIGENCE TECHNOLOGIES", {
    x: rightMargin - 190,
    y: cursorY,
    size: 8,
    font: assets.fontMedium,
    color: colorDark,
  });
  page.drawText(LIT_CREDENTIALS.founderSignatory, {
    x: rightMargin - 190,
    y: cursorY - 12,
    size: 8,
    font: assets.fontBold,
    color: colorDark,
  });
  page.drawText("Authorised Signatory", {
    x: rightMargin - 190,
    y: cursorY - 22,
    size: 7.5,
    font: assets.fontRegular,
    color: colorMuted,
  });

  // 9. PROFESSIONAL STATUTORY FOOTER
  const footerLineY = 52;
  page.drawLine({
    start: { x: leftMargin, y: footerLineY },
    end: { x: rightMargin, y: footerLineY },
    thickness: 0.5,
    color: colorLightBorder,
  });

  // Left Footer Notice
  page.drawText(
    `MSME Registration: ${LIT_CREDENTIALS.msmeUdyamNumber} (${LIT_CREDENTIALS.msmeCategory}) · ${LIT_CREDENTIALS.officialEmail}`,
    {
      x: leftMargin,
      y: footerLineY - 12,
      size: 7,
      font: assets.fontRegular,
      color: colorMuted,
    },
  );
  page.drawText(
    `Registered Location: ${LIT_CREDENTIALS.registeredAddress} · Manually Reconciled & Confirmed via UPI.`,
    {
      x: leftMargin,
      y: footerLineY - 21,
      size: 6.5,
      font: assets.fontRegular,
      color: colorMuted,
    },
  );

  // Right Footer: Page 1 of 1
  page.drawText("Page 1 of 1", {
    x: rightMargin - assets.fontRegular.widthOfTextAtSize("Page 1 of 1", 7.5),
    y: footerLineY - 12,
    size: 7.5,
    font: assets.fontRegular,
    color: colorMuted,
  });

  // Serialize and calculate SHA-256
  const bytes = await doc.save();
  const buffer = Buffer.from(bytes);
  const sha256 = computeSha256(bytes);

  return { buffer, bytes, sha256, pageCount: doc.getPageCount() };
}
