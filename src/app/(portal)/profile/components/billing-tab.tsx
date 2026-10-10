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
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[320px] p-10 text-center border rounded-3xl bg-white border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
      >
        <div className="w-16 h-16 bg-[var(--lit-light-blue,#E7F3FF)] border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Receipt className="w-8 h-8 text-[var(--lit-blue,#1565C0)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-2">No Invoices</h3>
        <p className="text-[var(--lit-text-muted,#52677C)] max-w-md text-sm leading-relaxed">
          You don't have any invoices issued yet. Billed milestone statements will appear here with downloadable receipts.
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
      {invoices.map((invoice) => (
        <motion.div 
          key={invoice.id}
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs gap-6 hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all duration-200"
        >
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <div className={`p-3.5 rounded-xl border ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold font-mono text-[var(--lit-navy,#0B2545)] mb-1 tracking-tight">{invoice.invoice_code}</h4>
              <p className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                Due: <span className="font-mono text-[var(--lit-navy,#0B2545)]">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[var(--lit-border-light,#DFE7EF)] pt-4 sm:pt-0">
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)] tracking-tight mb-1">${Number(invoice.amount).toFixed(2)}</p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                invoice.status === 'Paid' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {invoice.status}
              </span>
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
              className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-navy,#0B2545)] text-[var(--lit-navy,#0B2545)] hover:text-white transition-all shadow-2xs"
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
