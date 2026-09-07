"use client";

import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } as any
  }
};

export function ProjectsTab({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[320px] p-10 text-center border rounded-3xl bg-white/[0.05] border-white/15 backdrop-blur-xl"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
          <Briefcase className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Active Projects</h3>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
          You don't have any active software projects with us yet. When you purchase a package or start a project, it will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {projects.map((project, idx) => (
        <motion.div 
          key={project.id}
          variants={itemVariants}
          className="p-8 rounded-3xl border border-white/[0.08] bg-[rgba(10,15,30,0.6)] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.02)] relative overflow-hidden group"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">{project.name}</h3>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Code: <span className="text-zinc-400">{project.project_code}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border ${
              project.status === "Completed" 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                : "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            }`}>
              {project.status === "Completed" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
              {project.status}
            </div>
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Progress</span>
              <span className="text-lg font-black text-white">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,191,255,0.6)]"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
