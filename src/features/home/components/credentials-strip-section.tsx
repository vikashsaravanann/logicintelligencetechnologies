"use client";
import { Building2, Code2, Clock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CredentialsStripSection() {
  const credentials = [
    { icon: Building2, text: "Technology Startup · Coimbatore" },
    { icon: Code2, text: "Modern Technology Stack" },
    { icon: Clock, text: "Response within 24 Hours" },
    { icon: PlayCircle, text: "Free Demo Before Payment" },
  ];

  return (
    <section className="border-y border-white/[0.07] bg-[#0A1530]/60 py-6 relative">
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {credentials.map((cred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 px-2 py-2 group"
            >
              <cred.icon className="w-6 h-6 shrink-0 text-primary" />
              <span className="text-[13px] font-medium text-zinc-200 leading-snug">{cred.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
