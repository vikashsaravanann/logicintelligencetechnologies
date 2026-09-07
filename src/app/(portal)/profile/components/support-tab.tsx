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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* Create Ticket Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full min-h-[360px] p-6 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Create a Ticket</h3>
        <form id="ticket-form" action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Subject</label>
            <input 
              name="subject" 
              required 
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              placeholder="E.g., Need help with my domain"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Message</label>
            <textarea 
              name="message" 
              required 
              rows={5}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none shadow-inner custom-scrollbar"
              placeholder="Describe your issue or request..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Submit Ticket
          </button>
        </form>
      </motion.div>

      {/* Ticket History */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="h-full min-h-[360px] p-6 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl flex flex-col"
      >
        <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Previous Tickets</h3>
        {list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border border-white/5 bg-white/[0.02] rounded-2xl text-center">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No support tickets found.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1"
          >
            {list.map((ticket) => (
              <motion.div key={ticket.id} variants={itemVariants} className="p-5 rounded-2xl border border-white/[0.05] bg-black/20 hover:bg-black/40 transition-colors">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <h4 className="text-white font-bold tracking-tight">{ticket.subject}</h4>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border ${
                    ticket.status === 'Open' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                    ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-zinc-400 border-white/10'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{ticket.message}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
