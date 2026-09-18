"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/config/company";

export default function AboutSection() {
  const capabilities = [
    "Enterprise-grade Web Applications",
    "Custom Software Engineering",
    "High-Performance Cloud Infrastructure",
    "Data-Driven UX/UI Design",
    "E-Commerce & Hospitality Platforms",
    "End-to-End System Integration"
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-transparent border-y border-white/5 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">About Us</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Our Story
              </h2>
            </div>
            
            <p className="text-zinc-400 text-lg leading-relaxed">
              Logic Intelligence Technologies is a technology startup based in Coimbatore. We were founded to give local businesses access to modern web development and true AI integration — without the fluff, template recycling, or opaque pricing common in the industry.
            </p>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Our process is straightforward: transparent costs, a clear technical roadmap, and a free demo before you commit. We build everything from e-commerce platforms to custom enterprise tools, entirely in-house. <Link href="/work" className="text-primary hover:underline font-medium">See our recent work here.</Link>
            </p>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">Core Capabilities</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {capabilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Link href="/contact" className="inline-flex px-8 py-4 rounded-xl text-sm font-bold text-white neon-btn">
                Partner With Us
              </Link>
            </div>
          </motion.div>

          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative h-[600px] w-full rounded-3xl overflow-hidden bg-black border border-white/10"
          >
            {/* Abstract Tech Graphic */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-black to-accent/20 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
              <div className="w-full h-full border border-white/5 rounded-full animate-[spin_60s_linear_infinite] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(0,191,255,1)]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(238,42,123,1)]" />
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(0,191,255,1)]" />
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(238,42,123,1)]" />
              </div>
              <div className="absolute w-[60%] h-[60%] border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute w-[30%] h-[30%] bg-gradient-to-tr from-primary to-accent rounded-full blur-3xl opacity-30 animate-pulse" />
            </div>
            
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-black p-[2px] border border-primary/30 shadow-[0_0_15px_rgba(0,191,255,0.2)] relative">
                  <Image
                    src={COMPANY.logoIconPath}
                    alt="Logic Intelligence Technologies Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Logic Intelligence Technologies</h4>
                  <p className="text-sm text-zinc-400">Technology Startup · Coimbatore, Tamil Nadu</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
