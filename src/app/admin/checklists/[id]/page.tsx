import { redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChecklistDetailRedirectPage({ params }: Props) {
  const { id } = await params;
  await requireCapabilityPage("checklists.read", `/admin/checklists/${id}`);
  redirect(`/admin/checklist-invitations/${id}`);
}
