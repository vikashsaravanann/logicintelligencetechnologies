"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Server } from "lucide-react";

export default function WhyUsSection() {
  const points = [
    {
      title: "Enterprise-Grade Architecture",
      desc: "We build scalable, secure, and robust digital foundations that grow with your business.",
      icon: Server,
    },
    {
      title: "Performance Optimized",
      desc: "Lightning-fast load times and seamless user experiences engineered from the ground up.",
      icon: Zap,
    },
    {
      title: "Uncompromising Security",
      desc: "Data protection and secure infrastructure are at the core of everything we deploy.",
      icon: ShieldCheck,
    },
    {
      title: "Future-Proof Solutions",
      desc: "Using the latest tech stack ensuring your project remains relevant and maintainable.",
      icon: CheckCircle2,
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#0A0F1E] relative overflow-hidden">
      {/* Background blueprint/grid styling */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dbuznxrrm/image/upload/v1704285811/grid-pattern_q5aocu.svg')] opacity-5" />
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-primary" strokeWidth="0.5" fill="none">
          <path d="M0,100 L20,80 L20,20 L40,0 L60,20 L60,60 L80,40 L100,60" />
          <path d="M20,80 L40,60 L40,20" />
          <path d="M60,60 L80,80 L100,60" />
          <path d="M20,20 L60,60" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Digital Infrastructure</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Why businesses <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">choose us.</span>
              </h2>
            </div>
            
            <p className="text-zinc-400 text-lg leading-relaxed">
              You get a direct line to the founder — an AI &amp; Data Science student who writes code, not sales decks. Every project starts with understanding your workflow, then building something that works on day one and stays maintainable long after launch.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              {points.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{point.title}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative h-[500px] w-full lg:h-[600px] rounded-2xl border border-primary/20 bg-black/40 overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <Server className="w-24 h-24 text-primary/40 mb-8 animate-pulse" />
              <div className="space-y-4 w-3/4">
                <div className="h-2 w-full bg-primary/10 rounded overflow-hidden">
                  <div className="h-full bg-primary w-2/3 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                <div className="h-2 w-full bg-primary/10 rounded overflow-hidden">
                  <div className="h-full bg-primary/60 w-4/5 animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
                <div className="h-2 w-full bg-primary/10 rounded overflow-hidden">
                  <div className="h-full bg-accent/80 w-1/2 animate-[pulse_2.5s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-zinc-300">System Status: Online</span>
              </div>
              <span className="text-xs font-mono text-primary">100% Uptime Architecture</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
