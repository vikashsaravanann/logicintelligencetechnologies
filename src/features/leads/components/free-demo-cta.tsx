"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FreeDemoCTA() {
  return (
    <section className="py-16 md:py-24 bg-[#0A1530] relative border-t border-white/5 overflow-hidden">

      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="p-6 md:p-10 md:p-16 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden"
        >

          <Sparkles aria-hidden className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            🚀 Want to See YOUR Website Before Paying Anything?
          </h2>
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
            We build you a FREE demo — no payment required. Just share your idea.
          </p>
          
          <Link href="/free-demo" className="lit-btn lit-btn-primary lit-btn-lg">
            Request Free Demo <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
