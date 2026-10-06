/**
 * Date/number formatting for the Command Center. Server components render in the
 * server timezone (UTC on Vercel) unless a timezone is pinned, so every admin
 * date goes through these helpers to show Indian Standard Time. Pure module.
 */

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const IST = "Asia/Kolkata";

/** Format a timestamp in IST. Returns "—" for a null/invalid input. */
export function formatIST(value: DateInput, mode: "date" | "datetime" | "time" = "datetime"): string {
  const d = toDate(value);
  if (!d) return "—";
  const base: Intl.DateTimeFormatOptions =
    mode === "date"
      ? { year: "numeric", month: "short", day: "2-digit" }
      : mode === "time"
        ? { hour: "2-digit", minute: "2-digit", hour12: true }
        : { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true };
  const s = new Intl.DateTimeFormat("en-IN", { ...base, timeZone: IST }).format(d);
  return mode === "date" ? s : `${s} IST`;
}

/** Format a number as INR (or another ISO currency). Returns "—" for null. */
export function formatMoney(amount: number | string | null | undefined, currency = "INR"): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

/** INR convenience wrapper. */
export function formatINR(amount: number | string | null | undefined): string {
  return formatMoney(amount, "INR");
}
