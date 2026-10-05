import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Broadcasts | Admin",
};

export default function EmailsPage() {
  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-black text-white mb-6">Email Broadcasts</h1>
      <p className="text-zinc-400">Manage your email campaigns and broadcast messages here.</p>
      
      <div className="mt-8 p-12 border border-dashed border-neutral-800 rounded-2xl text-center">
        <p className="text-zinc-500 mb-4">No recent broadcasts found.</p>
        <a href="/admin/emails/new" className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors">
          Create New Campaign
        </a>
      </div>
    </div>
  );
}
