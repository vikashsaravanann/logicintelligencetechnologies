import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-black text-white mb-6">Analytics Dashboard</h1>
      <p className="text-zinc-400">View traffic, engagement, and conversion metrics.</p>
      
      <div className="mt-8 p-12 border border-dashed border-neutral-800 rounded-2xl text-center">
        <p className="text-zinc-500 mb-4">Detailed analytics charts will be available here.</p>
      </div>
    </div>
  );
}
