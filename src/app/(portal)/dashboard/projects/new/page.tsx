"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) {
      toast.error("Project name and client name are required.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const project_code = `LIT-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("projects").insert({
        name: name.trim(),
        client_name: clientName.trim(),
        project_code,
        status: "Planning",
        progress: 0,
      });
      if (error) throw error;
      toast.success("Project created.");
      router.push("/dashboard/projects");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Initialize New Project</h2>
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="project-name" className="text-xs font-bold text-zinc-400 mb-1 block">Project Name</label>
            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A1530]/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label htmlFor="client-name" className="text-xs font-bold text-zinc-400 mb-1 block">Client Name</label>
            <input
              id="client-name"
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-[#0A1530]/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl mt-4 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
