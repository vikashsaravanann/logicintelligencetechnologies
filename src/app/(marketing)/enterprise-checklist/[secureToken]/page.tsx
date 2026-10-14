import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvitationByToken } from "@/lib/enterprise-checklist/invitations";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";
import EnterpriseChecklistClient from "./components/EnterpriseChecklistClient";
import BackButton from "@/components/navigation/back-button";

interface Props {
  params: Promise<{ secureToken: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secureToken } = await params;
  return {
    title: "50-Point Enterprise Deployment Checklist | Logic Intelligence Technologies",
    description: "Interactive technical deployment checklist and scope selection.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EnterpriseChecklistPage({ params }: Props) {
  const { secureToken } = await params;
  const result = await getInvitationByToken(secureToken);

  if (result.state === "invalid" || !result.invitation) {
    notFound();
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-24 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Return to Home" inline />
        </div>
        <EnterpriseChecklistClient
          token={secureToken}
          initialState={result.state}
          invitation={result.invitation}
          initialResponse={result.response}
          checkpoints={ENTERPRISE_CHECKPOINTS}
          phases={ENTERPRISE_PHASES}
        />
      </div>
    </main>
  );
}
