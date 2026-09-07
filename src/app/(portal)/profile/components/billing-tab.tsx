"use client";

import { motion } from "framer-motion";
import { Receipt, Download, AlertCircle } from "lucide-react";

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

export function BillingTab({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[320px] p-10 text-center border rounded-3xl bg-white/[0.05] border-white/15 backdrop-blur-xl"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
          <Receipt className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Invoices</h3>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
          You don't have any invoices yet.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {invoices.map((invoice, idx) => (
        <motion.div 
          key={invoice.id}
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-white/[0.08] bg-[rgba(10,15,30,0.6)] backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_0_80px_rgba(255,255,255,0.02)] gap-6 hover:border-white/[0.15] hover:shadow-[0_10px_40px_rgba(0,191,255,0.15)] transition-all duration-300"
        >
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <div className={`p-4 rounded-xl shadow-inner ${invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'}`}>
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1 tracking-tight">{invoice.invoice_code}</h4>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Due: <span className="text-zinc-400">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-white tracking-tight mb-1">${Number(invoice.amount).toFixed(2)}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${invoice.status === 'Paid' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {invoice.status}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob(
                  [`Invoice ${invoice.invoice_code || invoice.id}\nClient: ${invoice.client_name}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}\n`],
                  { type: "text/plain;charset=utf-8" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${invoice.invoice_code || "invoice"}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/40 text-zinc-400 hover:text-cyan-400 transition-all hover:shadow-[0_0_15px_rgba(0,191,255,0.2)]"
              title="Download invoice summary"
              aria-label="Download invoice summary"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
