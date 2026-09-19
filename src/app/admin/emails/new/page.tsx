import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compose Broadcast | Admin",
};

export default function NewEmailPage() {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-black text-white mb-6">Compose Broadcast</h1>
      <p className="text-zinc-400 mb-8">Send an email campaign to your contacts.</p>
      
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <form className="space-y-4 flex flex-col">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">To</label>
            <input type="text" placeholder="Select audience segment..." className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Subject</label>
            <input type="text" placeholder="Email subject..." className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Message</label>
            <textarea placeholder="Write your message here..." rows={8} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <a href="/admin/emails" className="px-6 py-3 rounded-xl border border-neutral-700 text-white font-bold text-sm hover:bg-neutral-800 transition-colors">
              Cancel
            </a>
            <button type="button" className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors">
              Send Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
