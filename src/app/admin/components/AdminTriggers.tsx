"use client";

import { useState } from "react";
import { Send, Loader2, FileText, CheckCircle, Rocket, CheckSquare, FileCheck } from "lucide-react";

export function AdminTriggers() {
  const [activeTab, setActiveTab] = useState("invoice");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    paymentLink: "",
    projectName: "",
    liveUrl: "",
    proposalUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/send-trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          type: activeTab,
          email: formData.email,
          fullName: formData.fullName,
          data: formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const bits = [
          data.error || "Failed to send",
          data.errorCategory ? `[${data.errorCategory}]` : "",
          data.errorCode ? `(${data.errorCode})` : "",
        ].filter(Boolean);
        throw new Error(bits.join(" "));
      }

      const status = data.status || "queued";
      const skipNote = data.skipped
        ? " — not delivered to provider (dry-run / preview / suppressed)"
        : "";
      setSuccessMsg(`Email ${status} to ${formData.email} (${activeTab})${skipNote}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Manual Email Triggers</h2>
        <p className="text-sm text-neutral-400">
          Dispatch transactional emails. Failures show SMTP/config reasons (e.g. 535 auth) — not silent.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(
          [
            ["invoice", "Send Invoice", FileText, "indigo"],
            ["payment", "Payment Received", CheckCircle, "emerald"],
            ["kickoff", "Project Kickoff", Rocket, "blue"],
            ["delivered", "Delivered", CheckSquare, "fuchsia"],
            ["proposal", "Proposal", FileCheck, "amber"],
          ] as const
        ).map(([id, label, Icon, color]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                : "bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Recipient email
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              placeholder="Client name"
            />
          </div>
        </div>

        {(activeTab === "invoice" || activeTab === "payment") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="Invoice #"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
            />
            <input
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
            />
            <input
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              placeholder="Due date"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
            />
          </div>
        )}

        {activeTab === "invoice" && (
          <input
            name="paymentLink"
            value={formData.paymentLink}
            onChange={handleChange}
            placeholder="Payment link (https://...)"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
          />
        )}

        {(activeTab === "kickoff" || activeTab === "delivered") && (
          <input
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Project name"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
          />
        )}

        {activeTab === "delivered" && (
          <input
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            placeholder="Live URL"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
          />
        )}

        {activeTab === "proposal" && (
          <input
            name="proposalUrl"
            value={formData.proposalUrl}
            onChange={handleChange}
            placeholder="Proposal URL"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white"
          />
        )}

        {errorMsg && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending…" : "Send email"}
        </button>
      </form>
    </div>
  );
}
