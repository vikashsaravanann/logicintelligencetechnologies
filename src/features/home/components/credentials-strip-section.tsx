"use client";
import { Building2, Code2, Clock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CredentialsStripSection() {
  const credentials = [
    { icon: Building2, text: "Technology Startup · Coimbatore" },
    { icon: Code2, text: "Enterprise Architecture & Modern Stack" },
    { icon: Clock, text: "Direct Response within 24 Hours" },
    { icon: PlayCircle, text: "Free Prototype Demo Before Payment" },
  ];

  return (
    <section className="border-y border-white/[0.08] bg-[#10131A]/70 py-6 relative backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {credentials.map((cred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-[#151922] group"
            >
              <div className="h-9 w-9 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center shrink-0 text-[#45D9D2] group-hover:scale-105 transition-transform">
                <cred.icon className="w-4 h-4" />
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-[#F8FAFC] group-hover:text-white leading-snug">
                {cred.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
