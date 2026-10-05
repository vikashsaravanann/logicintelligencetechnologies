"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

export function CreateInvoiceForm() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          amount: Number(formData.amount),
          description: formData.description,
          dueDate: formData.dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      
      let statusMsg = "Invoice created";
      if (data.emailStatus === "sent") statusMsg += " and email sent";
      else if (data.emailStatus === "queued" || data.emailStatus === "retrying") statusMsg += " and email queued";
      else if (data.emailStatus === "skipped") statusMsg += " (email skipped)";
      else statusMsg += ", but email failed to send";

      setSuccessMsg(`${statusMsg} to ${formData.clientEmail}`);
      setFormData({
        clientName: "",
        clientEmail: "",
        amount: "",
        description: "",
        dueDate: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Create Invoice</h2>
        <p className="text-sm text-neutral-400">Generate a new invoice and email it to the client.</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Client Name *</label>
            <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Client Email *</label>
            <input required type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="client@example.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Amount (INR) *</label>
            <input required type="number" min="1" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="1500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Due Date *</label>
            <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Description *</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Web Development Services" />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create & Send Invoice
          </button>
          {successMsg && <span className="text-emerald-400 text-sm">{successMsg}</span>}
          {errorMsg && <span className="text-rose-400 text-sm">{errorMsg}</span>}
        </div>
      </form>
    </div>
  );
}
