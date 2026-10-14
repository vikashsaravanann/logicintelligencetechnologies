import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Convert number to Indian Rupees words
export function numberToIndianRupeesWords(num) {
  if (num === 0) return "Rupees Zero Only";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n) {
    if (n < 20) return units[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit > 0 ? "-" + units[unit] : "");
  }

  function convertThreeDigits(n) {
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
  const parts = [];

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

export function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function computeSha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

console.log("PDF Generator helper loaded successfully.");
