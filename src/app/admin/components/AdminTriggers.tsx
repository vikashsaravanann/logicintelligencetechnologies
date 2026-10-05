"use client";

import { useState, type ReactNode } from "react";
import {
  Send,
  FileText,
  CheckCircle,
  Rocket,
  FileCheck,
  CheckSquare,
  Loader2,
} from "lucide-react";

type TriggerType =
  | "invoice"
  | "payment"
  | "kickoff"
  | "delivered"
  | "proposal";

const TABS: { id: TriggerType; label: string; icon: ReactNode }[] = [
  { id: "invoice", label: "Send Invoice", icon: <FileText size={16} /> },
  { id: "payment", label: "Payment Received", icon: <CheckCircle size={16} /> },
  { id: "kickoff", label: "Project Kickoff", icon: <Rocket size={16} /> },
  { id: "delivered", label: "Project Delivered", icon: <CheckSquare size={16} /> },
  { id: "proposal", label: "Send Proposal", icon: <FileCheck size={16} /> },
];

export function AdminTriggers() {
  const [activeTab, setActiveTab] = useState<TriggerType>("invoice");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    invoiceNumber: "INV-2026-001",
    amount: "₹1,500.00",
    dueDate: "2026-09-30",
    invoiceUrl: "https://www.logicintelligencetechnologies.in/client/dashboard",
    projectName: "Logic Intel Web App",
    liveUrl: "https://www.logicintelligencetechnologies.in",
    proposalUrl: "https://www.logicintelligencetechnologies.in/client/dashboard",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        credentials: "include",
        body: JSON.stringify({
          type: activeTab,
          email: formData.email,
          fullName: formData.fullName,
          data: formData,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to queue email"
        );
      }

      const status = String(data.status || data.message || "queued");
      const verb = status.toLowerCase().includes("sent") ? "sent" : "queued";
      setSuccessMsg(`Email ${verb} (${activeTab}) → ${formData.email}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold text-white">Manual Email Triggers</h2>
        <p className="text-sm text-neutral-400">
          Dispatch transactional emails. Authorized via admin session — no machine
          secrets in the browser.
        </p>
      </div>

      <div
        className="mb-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Email trigger type"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
              activeTab === tab.id
                ? "border-indigo-500/30 bg-indigo-500/20 text-indigo-300"
                : "border-transparent bg-neutral-800/50 text-neutral-400 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400" htmlFor="trigger-email">
              Recipient email *
            </label>
            <input
              id="trigger-email"
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400" htmlFor="trigger-name">
              Full name
            </label>
            <input
              id="trigger-name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {activeTab === "invoice" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Invoice number</label>
              <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Amount</label>
              <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Due date</label>
              <input type="text" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Invoice / pay URL</label>
              <input type="url" name="invoiceUrl" value={formData.invoiceUrl} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Amount</label>
              <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">Invoice number</label>
              <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        )}

        {(activeTab === "kickoff" || activeTab === "delivered") && (
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Project name</label>
            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
        )}

        {activeTab === "delivered" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Live URL</label>
            <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
        )}

        {activeTab === "proposal" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Proposal URL</label>
            <input type="url" name="proposalUrl" value={formData.proposalUrl} onChange={handleChange} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-neutral-800 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-semibold text-black transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
            {loading ? "Queueing…" : "Dispatch email"}
          </button>
          {successMsg ? (
            <span className="text-sm text-emerald-400" role="status">{successMsg}</span>
          ) : null}
          {errorMsg ? (
            <span className="text-sm text-rose-400" role="alert">{errorMsg}</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
