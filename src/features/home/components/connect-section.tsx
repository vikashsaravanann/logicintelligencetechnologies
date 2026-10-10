"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { COMPANY } from "@/config/company";

export default function ConnectSection() {
  const channels = [
    {
      icon: MessageCircle,
      label: "Direct WhatsApp",
      val: COMPANY.whatsappNumber,
      href: `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g, "")}`,
      desc: "Fastest response from engineering",
    },
    {
      icon: Mail,
      label: "Official Email",
      val: COMPANY.email,
      href: `mailto:${COMPANY.email}`,
      desc: "Direct RFP & technical enquiries",
    },
    {
      icon: Phone,
      label: "Direct Phone",
      val: COMPANY.phone,
      href: `tel:${COMPANY.phone}`,
      desc: "Engineering desk in Coimbatore",
    },
    {
      icon: Calendar,
      label: "Discovery Booking",
      val: "Schedule 30-Min Slot",
      href: "/book-consultation",
      desc: "Architecture scoping session",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#07090D] border-t border-white/[0.08]">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(69,217,210,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden
      />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2]" />
            Direct Communications Desk
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4 tracking-tight leading-[1.08]">
            Connect Directly With Engineering
          </h2>
          <p className="text-[#B5BECC] text-base leading-relaxed">
            Reach out directly to systems engineering and leadership through your preferred channel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-[#0E121B] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center hover:bg-[#131722] hover:border-[#45D9D2]/40 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#141923] border border-white/10 flex items-center justify-center text-[#45D9D2] mb-4 group-hover:border-[#45D9D2]/30 group-hover:bg-[#45D9D2]/10 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold text-base mb-1">{item.label}</h3>
                <p className="text-xs font-mono text-[#45D9D2] truncate max-w-[220px] mb-1 font-semibold">{item.val}</p>
                <p className="text-[11px] text-[#B5BECC]/80">{item.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#45D9D2] group-hover:translate-x-0.5 transition-transform">
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
