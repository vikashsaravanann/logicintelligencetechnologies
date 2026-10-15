import { redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";

export default async function ChecklistsRedirectPage() {
  await requireCapabilityPage("checklists.read", "/admin/checklists");
  redirect("/admin/checklist-invitations");
}
