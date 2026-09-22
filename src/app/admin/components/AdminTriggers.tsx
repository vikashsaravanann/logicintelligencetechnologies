"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  FileText,
  CheckCircle,
  Rocket,
  CheckSquare,
  FileCheck,
} from "lucide-react";

function formatDeliveryStatus(data: {
  status?: string;
  skipped?: boolean;
  messageId?: string | null;
  outboxId?: string | null;
}): string {
  const status = (data.status || "unknown").toLowerCase();
  if (data.skipped) {
    if (status === "skipped" || status === "suppressed") {
      return `Not delivered (${status}) — dry-run, preview isolation, or suppression`;
    }
    return `Not delivered to provider (${status})`;
  }
  switch (status) {
    case "sent":
      return data.messageId
        ? `Accepted by email provider (sent) · id ${data.messageId}`
        : "Accepted by email provider (sent)";
    case "queued":
    case "processing":
      return "Queued for delivery — not yet confirmed by provider";
    case "retrying":
      return "Retrying delivery — provider error; will retry";
    case "failed":
    case "dead_letter":
      return `Delivery ${status}`;
    default:
      return `Status: ${status}`;
  }
}

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
        headers: { "Content-Type": "application/json" },
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

      setSuccessMsg(
        `${formatDeliveryStatus(data)} → ${formData.email} (${activeTab})` +
          (data.outboxId ? ` · outbox ${data.outboxId}` : "")
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Manual Email Triggers</h2>
        <p className="text-sm text-neutral-400">
          Transactional dispatch via central pipeline. UI never claims “Sent”
          unless provider status is <code className="text-emerald-400/90">sent</code>.
          SMTP 535 = Zoho app password / env issue.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(
          [
            ["invoice", "Send Invoice", FileText],
            ["payment", "Payment Received", CheckCircle],
            ["kickoff", "Project Kickoff", Rocket],
            ["delivered", "Delivered", CheckSquare],
            ["proposal", "Proposal", FileCheck],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
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
