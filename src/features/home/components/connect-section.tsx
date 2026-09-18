"use client";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Calendar } from "lucide-react";
import { COMPANY } from "@/config/company";

export default function ConnectSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,191,255,0.05)_0%,transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Let's Connect</h2>
          <p className="text-zinc-400">Reach out to us directly through any of these channels.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: MessageCircle, label: "WhatsApp", val: COMPANY.whatsappNumber, href: `https://wa.me/${COMPANY.whatsappNumber}` },
            { icon: Mail, label: "Email", val: COMPANY.email, href: `mailto:${COMPANY.email}` },
            { icon: Phone, label: "Call Us", val: COMPANY.phone, href: `tel:${COMPANY.phone}` },
            { icon: Calendar, label: "Book Meeting", val: "Schedule a slot", href: "/contact" }
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-6 flex flex-col items-center hover:bg-white/10 transition-colors"
            >
              <item.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-white font-bold mb-2">{item.label}</h3>
              <p className="text-sm text-zinc-400 truncate w-full">{item.val}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
