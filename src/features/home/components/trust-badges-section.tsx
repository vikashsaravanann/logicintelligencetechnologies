"use client";

import { Clock, Code2, Rocket, Presentation, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TrustBadgesSection() {
  const trustElements = [
    { 
      icon: Code2, 
      title: "Modern Architecture",
      desc: "Engineered with Next.js App Router, TypeScript, and hardened backends."
    },
    { 
      icon: Clock, 
      title: "24h Direct Response",
      desc: "Committed communication directly with systems engineering within 24 hours."
    },
    { 
      icon: Rocket, 
      title: "Deterministic Milestones",
      desc: "Transparent scope, daily development updates, and zero unexpected charges."
    },
    { 
      icon: Presentation, 
      title: "Free Prototype Demo",
      desc: "Review your functional system architecture before financial commitment.",
      isLink: true,
      href: "/free-demo"
    }
  ];

  return (
    <section className="py-16 bg-[#07090D] border-t border-b border-white/[0.08] relative z-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustElements.map((item, i) => {
            const content = (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center shrink-0 text-[#45D9D2] mb-4 group-hover:bg-[#45D9D2] group-hover:text-[#07090D] transition-colors duration-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-display font-bold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-[#B5BECC] font-medium leading-relaxed">{item.desc}</p>
              </>
            );

            const containerClass = "group flex flex-col p-6 rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] hover:border-[#45D9D2]/30 transition-all duration-300 h-full text-left";

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
                className="h-full"
              >
                {item.isLink ? (
                  <Link href={item.href!} className={`${containerClass} ring-1 ring-[#45D9D2]/30 bg-[#10131A] hover:bg-[#151922] hover:ring-[#45D9D2]/60`}>
                    {content}
                    <div className="mt-4 text-xs font-mono font-bold text-[#45D9D2] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      Claim Free Demo <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ) : (
                  <div className={containerClass}>
                    {content}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
