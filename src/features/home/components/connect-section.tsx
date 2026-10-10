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
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      icon: Mail,
      label: "Official Email",
      val: COMPANY.email,
      href: `mailto:${COMPANY.email}`,
      desc: "Direct RFP & technical enquiries",
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      icon: Phone,
      label: "Direct Phone",
      val: COMPANY.phone,
      href: `tel:${COMPANY.phone}`,
      desc: "Engineering desk in Coimbatore",
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
    {
      icon: Calendar,
      label: "Discovery Booking",
      val: "Schedule 30-Min Slot",
      href: "/book-consultation",
      desc: "Architecture scoping session",
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[var(--lit-cloud)] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-blue)] border border-[#BFDBFE] text-[var(--lit-blue)] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)]" />
            Direct Communications Desk
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] mb-4 tracking-tight leading-[1.08]">
            Connect Directly With Engineering
          </h2>

          <p className="font-serif italic text-[var(--lit-blue)] text-lg mb-3">
            &ldquo;Engineers on call. Direct accountability.&rdquo;
          </p>

          <p className="text-[var(--lit-text-muted)] text-base leading-relaxed">
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
              className="group bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center justify-between text-center hover:border-[#CBD5E1] hover:shadow-xl transition-all duration-300 shadow-sm hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.accent} mb-4 transition-transform group-hover:scale-105`}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[var(--lit-ink)] font-display font-bold text-base mb-1">{item.label}</h3>
                <p className="text-xs font-mono text-[var(--lit-blue)] truncate max-w-[220px] mb-1 font-semibold">
                  {item.val}
                </p>
                <p className="text-[11px] text-[var(--lit-text-muted)]">{item.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] w-full flex items-center justify-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[var(--lit-blue)] font-bold group-hover:translate-x-0.5 transition-transform">
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
