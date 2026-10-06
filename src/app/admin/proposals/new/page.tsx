import { requireCapabilityPage } from "@/lib/auth/session";
import NewProposalForm from "./proposal-form";

export default async function NewProposalPage() {
  await requireCapabilityPage("proposals.write", "/admin/proposals/new");
  return <NewProposalForm />;
}
