"use client";

import { User, Building, Phone, Mail, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileFormProps {
  initialFullName: string;
  email: string;
  initialCompanyName?: string;
  initialPhoneNumber?: string;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function ProfileForm({
  initialFullName,
  email,
  initialCompanyName = "",
  initialPhoneNumber = "",
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateProfile(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully. Your details are up to date.' });
        setTimeout(() => setMessage(null), 6000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[rgba(10,15,30,0.6)] border border-white/[0.08] rounded-3xl p-6 md:p-6 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.02)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        
        <motion.div variants={itemVariants} className="pb-4 border-b border-white/5">
          <h2 className="text-xl font-black text-white tracking-tight mb-2">Personal Details</h2>
          <p className="text-xs text-zinc-400">Update your contact information and company details.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Full Name */}
          <motion.div variants={itemVariants} className="space-y-2 group">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-cyan-400 transition-colors">
              <User size={14} /> Full Name
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="fullName"
                defaultValue={initialFullName}
                placeholder="John Doe"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3.5 text-base md:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/20 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants} className="space-y-2 opacity-70 cursor-not-allowed">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
              <Mail size={14} /> Email ID
            </label>
            <div className="relative">
              <input 
                type="email" 
                defaultValue={email}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-base md:text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>
          </motion.div>

          {/* Company / College Name */}
          <motion.div variants={itemVariants} className="space-y-2 group">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-blue-400 transition-colors">
              <Building size={14} /> Company / College Name
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="companyName"
                defaultValue={initialCompanyName}
                placeholder="Logic Intelligence"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3.5 text-base md:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-950/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </motion.div>

          {/* Phone Number */}
          <motion.div variants={itemVariants} className="space-y-2 group">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-purple-400 transition-colors">
              <Phone size={14} /> Phone Number
            </label>
            <div className="relative">
              <input 
                type="tel" 
                name="phoneNumber"
                defaultValue={initialPhoneNumber}
                placeholder="+91 90000 00000"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3.5 text-base md:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-950/20 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {isLoading ? "Saving Profile..." : "Save Changes"}
          </button>
        </motion.div>
      </form>

      <motion.form variants={itemVariants} action="/auth/signout" method="POST" className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-20 hidden sm:block">
        <button type="submit" className="px-5 py-2.5 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all border border-rose-500/20 hover:border-rose-500/40 flex items-center gap-2 group hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Sign Out
        </button>
      </motion.form>
      
      {/* Mobile sign out */}
      <motion.form variants={itemVariants} action="/auth/signout" method="POST" className="mt-6 sm:hidden border-t border-white/5 pt-6 relative z-20">
        <button type="submit" className="w-full px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-2">
          <LogOut size={16} /> Sign Out
        </button>
      </motion.form>
    </motion.div>
  );
}
