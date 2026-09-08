"use client";
import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Discovery & Strategy",
      desc: "We analyze your requirements, industry landscape, and goals to blueprint a scalable digital strategy.",
      icon: Search,
    },
    {
      id: "02",
      title: "UI/UX Design",
      desc: "Our design team crafts intuitive, premium interfaces that guarantee user engagement and high conversion rates.",
      icon: PenTool,
    },
    {
      id: "03",
      title: "Development",
      desc: "We build your platform using cutting-edge technologies, ensuring robust performance and strict security.",
      icon: Code,
    },
    {
      id: "04",
      title: "Testing & Launch",
      desc: "After rigorous QA testing, we deploy your project and provide a comprehensive live demo.",
      icon: Rocket,
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#060B18] border-y border-white/5 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Process</span>
          <h2 className="text-3xl md:text-5xl font-black text-white">
            The Roadmap to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Launch.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2" />
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
          
          <div className="grid md:grid-cols-4 gap-6 md:p-12 md:gap-6 relative">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.2 }}
                className="relative group"
              >
                {/* Visual Node */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-black border-2 border-white/10 flex items-center justify-center relative z-10 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,191,255,0.4)] transition-all duration-300 transform group-hover:-translate-y-2">
                    <step.icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black shadow-lg">
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center mt-8 px-2">
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
