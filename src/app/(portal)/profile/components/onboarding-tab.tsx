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
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="flex flex-col items-center justify-center p-12 sm:p-16 text-center border rounded-3xl bg-white border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
      >
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-5">
          <ClipboardList className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-2">Onboarding Complete</h3>
        <p className="text-[var(--lit-text-muted,#52677C)] max-w-md text-sm leading-relaxed">
          Thank you! We have received your project details. Our delivery architecture team is reviewing your intake data and will follow up shortly to commence discovery.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs w-full"
    >
      <div className="mb-6 flex items-start gap-4 border-b border-[var(--lit-border-light,#DFE7EF)] pb-6">
        <div className="p-3 bg-[var(--lit-light-blue,#E7F3FF)] border border-blue-100 text-[var(--lit-blue,#1565C0)] rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-1">Project Intake Form</h3>
          <p className="text-[var(--lit-text-muted,#52677C)] text-sm leading-relaxed">Help us understand your core goals and requirements so we can architect your project with precision.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-5">
          {[
            { name: "goals", label: "What are the primary goals of this project?", placeholder: "E.g., Increase sales conversions, modernize enterprise architecture...", type: "textarea", rows: 3 },
            { name: "audience", label: "Who is your target audience?", placeholder: "E.g., Enterprise B2B customers, clinical providers, university researchers...", type: "textarea", rows: 2 },
            { name: "colors", label: "Do you have preferred brand colors or existing branding guidelines?", placeholder: "E.g., Deep navy and cyan, or link to brand guidelines", type: "input" },
            { name: "competitors", label: "Are there any competitors or reference platforms you admire?", placeholder: "List benchmark URLs or references...", type: "textarea", rows: 2 },
            { name: "additional", label: "Any additional requirements or technical integrations needed?", placeholder: "E.g., SSO authentication, EHR integration, custom CRM sync...", type: "textarea", rows: 3 }
          ].map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 + (i * 0.04) }}
            >
              <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.name === "goals" || field.name === "audience"}
                  rows={field.rows}
                  className="w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all text-sm resize-none"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  name={field.name}
                  type="text"
                  className="w-full px-4 py-3 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all text-sm"
                  placeholder={field.placeholder}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] mt-6 flex justify-end"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-blue,#1565C0)] rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            Submit Project Details
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
