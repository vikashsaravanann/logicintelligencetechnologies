import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status | Admin",
};

export default function StatusPage() {
  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-black text-white mb-6">System Status</h1>
      <p className="text-zinc-400">Monitor system health, error logs, and performance.</p>
      
      <div className="mt-8 p-12 border border-dashed border-neutral-800 rounded-2xl text-center flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-emerald-500 mb-4 animate-pulse" />
        <p className="text-emerald-400 font-bold mb-2">All Systems Operational</p>
        <p className="text-zinc-500 text-sm">Real-time log viewer coming soon.</p>
      </div>
    </div>
  );
}
