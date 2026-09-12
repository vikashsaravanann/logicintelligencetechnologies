import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Layers, ShieldCheck, User } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Project Milestone Details | Client Portal",
};

export default async function ClientProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/client/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-1">
            {project.project_code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Client: {project.client_name}</p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/30 self-start sm:self-auto">
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Overall Progress</span>
          <span className="text-3xl font-black text-white">{project.progress}%</span>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Project Value</span>
          <span className="text-3xl font-black text-white">₹{Number(project.value).toLocaleString()}</span>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Target Completion</span>
          <span className="text-xl font-bold text-zinc-200">{project.due_date || "Continuous Sprint"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Standard Engineering Milestones
        </h2>
        <div className="space-y-3">
          {[
            { title: "M1: Architecture, Database & API Specifications", status: project.progress >= 25 ? "Done" : "In Progress" },
            { title: "M2: Front-End UI Components & Design Verification", status: project.progress >= 50 ? "Done" : "Scheduled" },
            { title: "M3: Backend Logic, Integrations & Auth Isolation", status: project.progress >= 75 ? "Done" : "Scheduled" },
            { title: "M4: Full UAT, Production Deployment & Code Handover", status: project.progress === 100 ? "Done" : "Scheduled" },
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">{m.title}</span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${m.status === "Done" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-zinc-400"}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
