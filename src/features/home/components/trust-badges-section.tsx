"use client";
import { Clock, Code2, Rocket, Presentation } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TrustBadgesSection() {
  const trustElements = [
    { 
      icon: Code2, 
      title: "Modern Tech Stack",
      desc: "Built with Next.js, React, and modern databases."
    },
    { 
      icon: Clock, 
      title: "24h Response Time",
      desc: "We commit to responding to all queries within 24 hours."
    },
    { 
      icon: Rocket, 
      title: "Transparent Process",
      desc: "Clear milestones, daily updates, no hidden charges."
    },
    { 
      icon: Presentation, 
      title: "Free Demo Available",
      desc: "See your website design before you pay anything.",
      isLink: true,
      href: "/free-demo"
    }
  ];

  return (
    <section className="py-16 bg-[#0A0F1E] border-t border-b border-white/5 relative z-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustElements.map((item, i) => {
            const content = (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mb-4 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
              </>
            );

            const containerClass = "group flex flex-col p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 h-full text-left";

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                {item.isLink ? (
                  <Link href={item.href!} className={`${containerClass} ring-1 ring-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] hover:ring-primary/40 shadow-[0_0_20px_rgba(0,191,255,0.05)] hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]`}>
                    {content}
                    <div className="mt-4 text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Claim Free Demo &rarr;
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
