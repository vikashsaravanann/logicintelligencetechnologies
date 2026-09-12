import { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Projects & Sprints | Client Portal",
};

export const revalidate = 0;

export default async function ClientProjectsPage() {
  const { data: projects } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Assigned Projects
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Detailed sprint progress, milestone statuses, and delivery tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">
                    {p.project_code}
                  </span>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                  {p.status}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Development Progress</span>
                  <span className="font-bold text-white">{p.progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Value: ₹{Number(p.value).toLocaleString()}</span>
                <Link
                  href={`/client/projects/${p.id}`}
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Sprint Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center text-zinc-500 text-xs">
            No projects found in this client tenant workspace.
          </div>
        )}
      </div>
    </div>
  );
}
