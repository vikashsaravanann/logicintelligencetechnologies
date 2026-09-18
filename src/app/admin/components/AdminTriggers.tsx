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
        body: JSON.stringify({
          type: activeTab,
          email: formData.email,
          fullName: formData.fullName,
          data: formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      
      const status = data.status || "queued";
      setSuccessMsg(`Email ${status} to ${formData.email} (${activeTab})`);
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
        <p className="text-sm text-neutral-400">Instantly dispatch transactional emails to clients.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button type="button" onClick={() => setActiveTab('invoice')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'invoice' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent'}`}>
          <FileText size={16} /> Send Invoice
        </button>
        <button type="button" onClick={() => setActiveTab('payment')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'payment' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent'}`}>
          <CheckCircle size={16} /> Payment Received
        </button>
        <button type="button" onClick={() => setActiveTab('kickoff')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'kickoff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent'}`}>
          <Rocket size={16} /> Project Kickoff
        </button>
        <button type="button" onClick={() => setActiveTab('delivered')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'delivered' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent'}`}>
          <CheckSquare size={16} /> Project Delivered
        </button>
        <button type="button" onClick={() => setActiveTab('proposal')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'proposal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-neutral-800/50 text-neutral-400 hover:text-white border border-transparent'}`}>
          <FileCheck size={16} /> Send Proposal
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Client Email *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="client@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Client Full Name *</label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="John Doe" />
          </div>
        </div>

        {(activeTab === 'invoice' || activeTab === 'payment') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Invoice Number</label>
              <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Amount</label>
              <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Due Date</label>
              <input type="text" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Link</label>
              <input type="url" name="paymentLink" value={formData.paymentLink} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {(activeTab === 'kickoff' || activeTab === 'delivered') && (
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Project Name</label>
            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        )}

        {activeTab === 'delivered' && (
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Live URL</label>
            <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        )}

        {activeTab === 'proposal' && (
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Proposal URL</label>
            <input type="url" name="proposalUrl" value={formData.proposalUrl} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 mt-2 border-t border-neutral-800">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Dispatch Email
          </button>
          {successMsg && <span className="text-emerald-400 text-sm font-medium">{successMsg}</span>}
          {errorMsg && <span className="text-rose-400 text-sm font-medium">{errorMsg}</span>}
        </div>
      </form>
    </div>
  );
}
