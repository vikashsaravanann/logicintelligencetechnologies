"use client";
import { motion } from "framer-motion";
import { Monitor, Code, ArrowRight, ShoppingCart, Brain } from "lucide-react";
import Link from "next/link";

export default function ServicesSection() {
  const services = [
    {
      title: "Full Stack Web Development",
      description: "Custom websites and web apps built from scratch — scoped to your business, not a template.",
      icon: Monitor,
      features: ["Custom front-end design", "Back-end & database setup", "API integrations", "Deployment & hosting setup", "Post-launch support"],
      link: "/contact?service=full-stack",
      accent: "from-blue-500/20 to-cyan-500/20",
      borderHover: "group-hover:border-blue-500/50",
      shadowHover: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
      iconColor: "text-blue-400"
    },
    {
      title: "E-Commerce Websites",
      description: "Online stores with secure checkout, inventory tools, and admin dashboards you can actually use.",
      icon: ShoppingCart,
      features: ["Custom storefront design", "Secure payment gateways", "Inventory management system", "Admin dashboard", "Mobile shopping optimized"],
      link: "/contact?service=ecommerce",
      accent: "from-purple-500/20 to-pink-500/20",
      borderHover: "group-hover:border-purple-500/50",
      shadowHover: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]",
      iconColor: "text-purple-400"
    },
    {
      title: "Custom Software Development",
      description: "CRMs, booking systems, and internal tools designed around how your team already works.",
      icon: Code,
      features: ["Requirement analysis", "Custom CRM / ERP builds", "Workflow automation", "Secure data architecture", "Ongoing maintenance"],
      link: "/contact?service=software",
      accent: "from-emerald-500/20 to-teal-500/20",
      borderHover: "group-hover:border-emerald-500/50",
      shadowHover: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]",
      iconColor: "text-emerald-400"
    },
    {
      title: "AI-Powered Solutions",
      description: "Practical AI features — chatbots, dashboards, and automations — integrated into your existing product or workflow.",
      icon: Brain,
      features: ["AI chatbot integration", "Data dashboards & analytics", "ML-powered features", "Automation workflows", "API integration with AI models"],
      link: "/contact?service=ai-solutions",
      accent: "from-amber-500/20 to-orange-500/20",
      borderHover: "group-hover:border-amber-500/50",
      shadowHover: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
      iconColor: "text-amber-400"
    }
  ];

  return (
    <section id="services" className="relative py-20 md:py-32 bg-[#0A0F1E] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="h-px w-8 bg-white/20" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">Our Expertise</span>
            <span className="h-px w-8 bg-white/20" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6"
          >
            Comprehensive Digital <br />
            <span className="text-white opacity-90 font-light">Solutions for Real Businesses</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            From storefronts and booking systems to AI chatbots and custom software — pick a service or tell us what you need on a free demo call.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.1  }}
              className={`group relative bg-[#12172B]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-6 md:p-10 transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-2 ${service.borderHover} ${service.shadowHover}`}
            >
              {/* Unique gradient hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="relative z-10 flex-grow">
                <div className={`w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner group-hover:border-white/20`}>
                  <service.icon className={`w-8 h-8 ${service.iconColor} transition-transform duration-500 group-hover:scale-110`} />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">
                  {service.title}
                </h3>
                
                <p className="text-sm text-zinc-400 leading-relaxed mb-8 font-medium border-b border-white/10 pb-6">
                  {service.description}
                </p>

                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">What's Included</h4>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm font-medium text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                <Link href={service.link} className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl py-3 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300 shadow-lg">
                  Get This Service
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
