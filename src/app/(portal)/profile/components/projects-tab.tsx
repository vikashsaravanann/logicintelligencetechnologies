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
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[320px] p-10 text-center border rounded-3xl bg-white border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
      >
        <div className="w-16 h-16 bg-[var(--lit-light-blue,#E7F3FF)] border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Briefcase className="w-8 h-8 text-[var(--lit-blue,#1565C0)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-2">No Active Projects</h3>
        <p className="text-[var(--lit-text-muted,#52677C)] max-w-md text-sm leading-relaxed">
          You don't have any active software projects with us yet. When you purchase a package or initiate an engagement, your project track will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {projects.map((project) => (
        <motion.div 
          key={project.id}
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs relative overflow-hidden group hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-1">{project.name}</h3>
              <p className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
                Project Code: <span className="font-mono text-[var(--lit-navy,#0B2545)] font-bold">{project.project_code}</span>
              </p>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
              project.status === "Completed" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {project.status === "Completed" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600 animate-pulse" />}
              {project.status}
            </div>
          </div>
          
          <div className="relative z-10 space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Delivery Progress</span>
              <span className="text-lg font-bold font-mono text-[var(--lit-navy,#0B2545)]">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                className="h-full bg-gradient-to-r from-[var(--lit-blue,#1565C0)] to-[var(--lit-teal,#1FA9A2)] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
