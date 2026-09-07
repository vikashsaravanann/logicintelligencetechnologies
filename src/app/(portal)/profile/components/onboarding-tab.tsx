"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { submitOnboardingForm } from "../actions/portal";
import { toast } from "react-hot-toast";

export function OnboardingTab({ onboarding }: { onboarding: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const hasSubmitted = Array.isArray(onboarding) && onboarding.length > 0;

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    const answers = {
      projectGoals: formData.get("goals"),
      targetAudience: formData.get("audience"),
      brandColors: formData.get("colors"),
      competitors: formData.get("competitors"),
      additionalInfo: formData.get("additional")
    };

    const result = await submitOnboardingForm(answers);
    setIsLoading(false);

    if (result.success) {
      toast.success("Onboarding form submitted!");
    } else {
      toast.error(result.error || "Failed to submit form");
    }
  };

  if (hasSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="flex flex-col items-center justify-center p-16 text-center border rounded-3xl bg-[rgba(10,15,30,0.6)] border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.02)]"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[30px]" />
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative z-10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <ClipboardList className="w-10 h-10 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight mb-3">Onboarding Complete</h3>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
          Thank you! We've securely received your project details. Our team is reviewing the information and will get back to you shortly to begin the next phase.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl w-full"
    >
      <div className="mb-8 flex items-start gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-blue-500/10 text-cyan-400 rounded-xl shadow-inner">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Project Intake Form</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Help us understand your exact vision so we can build the perfect, custom solution for you.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {[
            { name: "goals", label: "What are the primary goals of this project?", placeholder: "E.g., Increase sales, establish brand presence...", type: "textarea", rows: 3 },
            { name: "audience", label: "Who is your target audience?", placeholder: "E.g., Local homeowners, tech startups...", type: "textarea", rows: 2 },
            { name: "colors", label: "Do you have preferred brand colors or existing branding?", placeholder: "E.g., Navy Blue and Gold, or link to brand guidelines", type: "input" },
            { name: "competitors", label: "Are there any competitors or websites you admire?", placeholder: "List URLs here...", type: "textarea", rows: 2 },
            { name: "additional", label: "Any additional information or specific features you need?", placeholder: "Anything else we should know?", type: "textarea", rows: 3 }
          ].map((field, i) => (
            <motion.div 
              key={field.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
            >
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea 
                  name={field.name} 
                  required={field.name === "goals" || field.name === "audience"} 
                  rows={field.rows} 
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none shadow-inner custom-scrollbar" 
                  placeholder={field.placeholder} 
                />
              ) : (
                <input 
                  name={field.name} 
                  type="text" 
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner" 
                  placeholder={field.placeholder} 
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="pt-6 border-t border-white/5 mt-8 flex justify-end"
        >
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            Submit Project Details
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
