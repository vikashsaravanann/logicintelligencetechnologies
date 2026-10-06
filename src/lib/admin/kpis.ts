/**
 * Pure KPI helpers for the Command Center. No Supabase/import side effects — the
 * page fetches rows with the admin client, these functions derive the numbers so
 * they are unit-testable and the status literals live in exactly one place.
 */

/** Invoice statuses, matching the invoices_status_check constraint. */
export const INVOICE_STATUSES = ["Pending", "Paid", "Overdue", "Cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Project statuses that count as "in flight" for the active-projects KPI. */
export const TERMINAL_PROJECT_STATUSES = ["Completed", "Cancelled", "Archived"] as const;

export interface InvoiceAmountRow {
  amount: number | string | null;
  status: string | null;
}

function toNumber(v: number | string | null): number {
  const n = typeof v === "string" ? Number(v) : v ?? 0;
  return Number.isFinite(n) ? (n as number) : 0;
}

/** Sum of amounts on invoices marked Paid. */
export function paidRevenue(invoices: InvoiceAmountRow[]): number {
  return invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + toNumber(i.amount), 0);
}

/** Sum of amounts still owed (Pending or Overdue). */
export function outstandingRevenue(invoices: InvoiceAmountRow[]): number {
  return invoices
    .filter((i) => i.status === "Pending" || i.status === "Overdue")
    .reduce((sum, i) => sum + toNumber(i.amount), 0);
}

/** A lead score for display: the stored value, or "Unscored" when absent. */
export function leadScoreLabel(score: number | null | undefined): string {
  return typeof score === "number" && Number.isFinite(score) ? String(score) : "Unscored";
}
