import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import { getPortalContext } from "@/lib/client-portal/data";
import { listClientMessages } from "@/lib/client-portal/messages";
import ClientMessagesView from "./client-messages-view";

export const metadata: Metadata = {
  title: "Team Communications | Client Portal | Logic Intelligence Technologies",
  description: "Direct asynchronous messaging channel with your assigned lead solutions architect.",
};

export const revalidate = 0;

export default async function ClientMessagesPage() {
  const portal = await getPortalContext("/client/messages");
  const thread = await listClientMessages(portal.user.email || "");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/dashboard" label="Back to Dashboard" inline />
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
            Direct Channel
          </span>
          <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
            {portal.user.email}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
          Direct Engineering Communications
        </h1>
        <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
          Direct asynchronous messaging channel with your assigned lead solutions architect and engineering team.
        </p>
      </div>

      {/* Interactive Chat Stream */}
      <ClientMessagesView
        userEmail={portal.user.email || "Client Representative"}
        initialMessages={thread.messages}
      />
    </div>
  );
}
