"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { COMPANY } from "@/config/company";

export default function ConnectSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-transparent border-t border-white/[0.08]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(69,217,210,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-14 max-w-2xl mx-auto"
        >
          <span className="lit-eyebrow mb-4 block">Direct Communications</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Connect Directly
          </h2>
          <p className="text-[#B5BECC] text-base">
            Reach out directly to engineering and leadership through your preferred channel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, label: "WhatsApp", val: COMPANY.whatsappNumber, href: `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g, "")}` },
            { icon: Mail, label: "Official Email", val: COMPANY.email, href: `mailto:${COMPANY.email}` },
            { icon: Phone, label: "Direct Phone", val: COMPANY.phone, href: `tel:${COMPANY.phone}` },
            { icon: Calendar, label: "Consultation", val: "Book Technical Slot", href: "/book-consultation" }
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-[#10131A] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center hover:bg-[#151922] hover:border-[#45D9D2]/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#151922] border border-white/10 flex items-center justify-center text-[#45D9D2] mb-4 group-hover:border-[#45D9D2]/30 group-hover:bg-[#45D9D2]/10 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold text-base mb-1">{item.label}</h3>
                <p className="text-xs font-mono text-[#B5BECC] truncate max-w-[200px]">{item.val}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#45D9D2]">
                <span>Open Channel</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
