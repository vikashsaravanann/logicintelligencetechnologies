import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import NewProposalForm from "./proposal-form";

export const metadata: Metadata = {
  title: "Digital Proposal Creator | Admin | Logic Intelligence Technologies",
  description: "Create and dispatch a new client proposal, SOW, and digital commercial contract.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewProposalPage() {
  await requireCapabilityPage("proposals.write", "/admin/proposals/new");
  return <NewProposalForm />;
}
