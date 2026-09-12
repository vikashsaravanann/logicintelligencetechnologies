import { Metadata } from "next";
import { MessageSquare, Send, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Team Communications | Client Portal",
};

export default function ClientMessagesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Direct Communications
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Direct asynchronous messaging channel with your assigned project lead.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 h-[400px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto pr-2">
          {/* Mock message from team */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              LIT
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 max-w-lg text-xs leading-relaxed text-zinc-200">
              <p className="font-bold text-white mb-1">Engineering Dispatch</p>
              Welcome to your dedicated portal! Sprint milestones are tracked under the Projects tab. You can leave questions here or open a ticket in the Support desk.
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="pt-4 border-t border-white/5 flex gap-2">
          <input
            type="text"
            placeholder="Type message to lead architect..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,191,255,0.3)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
