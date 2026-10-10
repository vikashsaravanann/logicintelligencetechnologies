"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/format/datetime";

interface LineItem {
  id: string;
  description: string;
  quantity: number | "";
  unitPrice: number | "";
}

export function CreateInvoiceForm() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [createdInvoiceCode, setCreatedInvoiceCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    description: "",
    dueDate: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "item-1",
      description: "Full-Stack Development & Architecture Retainer",
      quantity: 1,
      unitPrice: 1500,
    },
  ]);

  const [taxRate, setTaxRate] = useState<number>(18);

  const subtotal = lineItems.reduce((acc, item) => {
    const qty = typeof item.quantity === "number" ? item.quantity : 0;
    const price = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    return acc + qty * price;
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      setLineItems([
        {
          id: `item-${Date.now()}`,
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]);
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: string
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "quantity" || field === "unitPrice") {
          if (val === "") {
            return { ...item, [field]: "" };
          }
          const parsed = parseFloat(val);
          return { ...item, [field]: isNaN(parsed) ? "" : Math.max(0, parsed) };
        }
        return { ...item, [field]: val };
      })
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (grandTotal <= 0) {
      setErrorMsg("Invoice grand total must be greater than ₹0.00.");
      return;
    }

    const finalDescription = (
      formData.description.trim() ||
      lineItems
        .map((i) => i.description.trim())
        .filter(Boolean)
        .join("; ") ||
      "Professional Technology Services"
    ).slice(0, 300);

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    setCreatedInvoiceCode(null);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          amount: Number(grandTotal.toFixed(2)),
          description: finalDescription,
          dueDate: formData.dueDate,
          status: "Pending",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      let statusMsg = "Invoice created";
      if (data.emailStatus === "sent") statusMsg += " and email dispatched successfully";
      else if (data.emailStatus === "queued" || data.emailStatus === "retrying")
        statusMsg += " and email queued";
      else if (data.emailStatus === "skipped") statusMsg += " (email skipped)";
      else statusMsg += ", but client email failed to send";

      setSuccessMsg(`${statusMsg} to ${formData.clientEmail.trim()}`);
      if (data.invoice?.invoice_code) {
        setCreatedInvoiceCode(data.invoice.invoice_code);
      }

      setFormData({
        clientName: "",
        clientEmail: "",
        description: "",
        dueDate: "",
      });
      setLineItems([
        {
          id: `item-${Date.now()}`,
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving the invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-blue-50/60 text-blue-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--lit-navy,#0B2545)]">
              Invoice Details
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Specify recipient client credentials, delivery schedule, and itemized billing lines.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Status: Pending
          </span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        {/* Client & Payment Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1.5">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-2xs"
              placeholder="e.g. Apex Health Systems"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1.5">
              Client Email <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-2xs"
              placeholder="billing@client.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1.5">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm font-mono shadow-2xs"
            />
          </div>
        </div>

        {/* Invoice Scope / Description */}
        <div>
          <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1.5">
            Invoice Scope / Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            maxLength={300}
            className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-2xs"
            placeholder="e.g. Full-Stack Development & Cloud Architecture Retainer - Milestone Deliverables"
          />
          <div className="flex justify-between items-center mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            <span>Appears on digital invoice header and automated payment receipts.</span>
            <span className="font-mono">{formData.description.length}/300</span>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Itemized Line Items
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                Add deliverables, tasks, or service units.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] hover:text-blue-600 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-4 py-3">Description / Item</th>
                  <th className="px-4 py-3 w-28 text-center">Qty</th>
                  <th className="px-4 py-3 w-36 text-right">Unit Rate (₹)</th>
                  <th className="px-4 py-3 w-36 text-right">Total (₹)</th>
                  <th className="px-3 py-3 w-12 text-center" aria-label="Action"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {lineItems.map((item, idx) => {
                  const itemQty = typeof item.quantity === "number" ? item.quantity : 0;
                  const itemPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
                  const lineTotal = itemQty * itemPrice;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateLineItem(item.id, "description", e.target.value)
                          }
                          placeholder={`Item #${idx + 1} scope or deliverable`}
                          className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateLineItem(item.id, "quantity", e.target.value)
                          }
                          className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-mono text-center focus:outline-none focus:border-blue-500 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateLineItem(item.id, "unitPrice", e.target.value)
                          }
                          className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-mono text-right focus:outline-none focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3 text-right font-mono text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                        {formatINR(lineTotal)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Financial Summary & Totals in JetBrains Mono */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          <div className="w-full sm:max-w-xs space-y-2">
            <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
              Applicable Tax / GST
            </label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-2xs"
            >
              <option value={0}>0% — Exempt / Non-Taxable</option>
              <option value={5}>5% — Lower Tier Goods / Services</option>
              <option value={12}>12% — Standard Concessional GST</option>
              <option value={18}>18% — Standard GST (IT &amp; Tech Services)</option>
              <option value={28}>28% — Higher Rate Slab</option>
            </select>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Standard Indian GST for IT, software engineering, and consulting services is 18%.
            </p>
          </div>

          <div className="w-full sm:max-w-sm rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
              <span>
                Subtotal ({lineItems.length} {lineItems.length === 1 ? "item" : "items"})
              </span>
              <span className="font-mono text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                {formatINR(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
              <span>Tax ({taxRate}% GST)</span>
              <span className="font-mono text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                {formatINR(taxAmount)}
              </span>
            </div>

            <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Grand Total
                </span>
                <span className="block text-[10px] uppercase font-mono text-[var(--lit-text-muted,#52677C)]">
                  INR (₹)
                </span>
              </div>
              <span className="font-mono text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800 text-sm flex items-start gap-3 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{successMsg}</p>
              {createdInvoiceCode && (
                <p className="text-xs text-emerald-700">
                  Allocated invoice code:{" "}
                  <span className="font-mono font-bold">{createdInvoiceCode}</span>.
                </p>
              )}
              <div className="pt-2">
                <Link
                  href="/admin/invoices"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <span>View in invoices ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Invoice code generated sequentially (<span className="font-mono">LIT-INV-YYYY-XXXX</span>). Status defaults to{" "}
            <span className="font-semibold text-[var(--lit-navy,#0B2545)]">Pending</span>.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/invoices"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 text-sm font-medium transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || grandTotal <= 0}
              className="w-full sm:w-auto bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-navy,#0B2545)]/90 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Invoice...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create &amp; Issue Invoice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

