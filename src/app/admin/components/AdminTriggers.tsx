"use client";

import { useState, type ReactNode } from "react";
import {
  Send,
  FileText,
  CheckCircle2,
  Rocket,
  FileCheck,
  CheckSquare,
  Loader2,
  Zap,
  AlertCircle,
} from "lucide-react";

type TriggerType =
  | "invoice"
  | "payment"
  | "kickoff"
  | "delivered"
  | "proposal";

interface TriggerTab {
  id: TriggerType;
  label: string;
  icon: ReactNode;
  description: string;
}

const TABS: TriggerTab[] = [
  {
    id: "invoice",
    label: "Send Invoice",
    icon: <FileText className="w-4 h-4" />,
    description: "Issue a new billing statement notice with payment link.",
  },
  {
    id: "payment",
    label: "Payment Received",
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: "Confirm receipt of client milestone or retainer payment.",
  },
  {
    id: "kickoff",
    label: "Project Kickoff",
    icon: <Rocket className="w-4 h-4" />,
    description: "Welcome client and initiate project sprint onboarding.",
  },
  {
    id: "delivered",
    label: "Project Delivered",
    icon: <CheckSquare className="w-4 h-4" />,
    description: "Notify client of milestone completion and live deployment handover.",
  },
  {
    id: "proposal",
    label: "Send Proposal",
    icon: <FileCheck className="w-4 h-4" />,
    description: "Transmit formal commercial proposal link to prospective client.",
  },
];

export function AdminTriggers() {
  const [activeTab, setActiveTab] = useState<TriggerType>("invoice");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    invoiceUrl: "",
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
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          data: formData,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to queue trigger email"
        );
      }

      const status = String(data.status || data.message || "queued");
      const verb = status.toLowerCase().includes("sent") ? "sent" : "queued";
      setSuccessMsg(`Trigger email ${verb} (${activeTab}) → ${formData.email.trim()}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const currentTabInfo = TABS.find((t) => t.id === activeTab);

  return (
    <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Manual Operational Triggers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Dispatch lifecycle transactional emails directly. Authenticated via active admin session.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[var(--lit-text-muted,#52677C)] text-xs font-mono font-medium self-start sm:self-auto">
          Role-Gated Trigger Action
        </span>
      </div>

      {/* Trigger Tabs */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Email trigger type"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                  : "bg-slate-100 text-[var(--lit-text-muted,#52677C)] hover:bg-slate-200 hover:text-[var(--lit-navy,#0B2545)]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {currentTabInfo && (
        <div className="p-3 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-text-muted,#52677C)]">
          <strong className="text-[var(--lit-navy,#0B2545)] mr-1">Action:</strong>
          {currentTabInfo.description}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSend} className="space-y-4">
        {/* Recipient Coordinates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="trigger-email"
              className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5"
            >
              Recipient Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="trigger-email"
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. client@company.com"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="trigger-name"
              className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5"
            >
              Full Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="trigger-name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Tab-Specific Fields */}
        {activeTab === "invoice" && (
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="e.g. INV-1002"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Invoice Amount
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 50,000"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                placeholder="e.g. Due on Receipt, or Net 15"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Invoice / Payment Link
              </label>
              <input
                type="url"
                name="invoiceUrl"
                value={formData.invoiceUrl}
                onChange={handleChange}
                placeholder="https://logicintelligencetechnologies.com/invoices/..."
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Amount Received
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 50,000"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Invoice Reference Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="e.g. INV-1002"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {(activeTab === "kickoff" || activeTab === "delivered") && (
          <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g. Enterprise Application Redesign"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
        )}

        {activeTab === "delivered" && (
          <div>
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              Live Application URL
            </label>
            <input
              type="url"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleChange}
              placeholder="https://client-production-domain.com"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
        )}

        {activeTab === "proposal" && (
          <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              Proposal URL
            </label>
            <input
              type="url"
              name="proposalUrl"
              value={formData.proposalUrl}
              onChange={handleChange}
              placeholder="https://logicintelligencetechnologies.com/proposal/..."
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
        )}

        {/* Feedback banners */}
        {errorMsg && (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-2xs flex items-center gap-2"
            role="status"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Queueing Trigger…</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Dispatch Trigger</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
