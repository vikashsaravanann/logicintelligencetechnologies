"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { createSupportTicket } from "../actions/portal";
import { toast } from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } as any
  }
};

export function SupportTab({ tickets }: { tickets: any[] }) {
  const list = tickets ?? [];
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await createSupportTicket(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success("Support ticket created.");
      (document.getElementById("ticket-form") as HTMLFormElement)?.reset();
    } else {
      toast.error(result.error || "Failed to create ticket");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Create Ticket Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full min-h-[360px] p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">Create a Support Ticket</h3>
        <form id="ticket-form" action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">Subject</label>
            <input 
              name="subject" 
              required 
              className="w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all text-sm"
              placeholder="E.g., Assistance required with domain configuration"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">Message</label>
            <textarea 
              name="message" 
              required 
              rows={5}
              className="w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all text-sm resize-none"
              placeholder="Describe your issue or technical request in detail..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-blue,#1565C0)] rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Ticket
          </button>
        </form>
      </motion.div>

      {/* Ticket History */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="h-full min-h-[360px] p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs flex flex-col"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">Previous Tickets</h3>
        {list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] rounded-2xl text-center">
            <MessageSquare className="w-10 h-10 text-[var(--lit-text-muted,#52677C)]/40 mx-auto mb-3" />
            <p className="text-[var(--lit-text-muted,#52677C)] text-sm">No support tickets found.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 flex-1"
          >
            {list.map((ticket) => (
              <motion.div key={ticket.id} variants={itemVariants} className="p-4 sm:p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white transition-colors">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="text-[var(--lit-navy,#0B2545)] font-bold tracking-tight text-base">{ticket.subject}</h4>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    ticket.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] line-clamp-2 leading-relaxed">{ticket.message}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
