import { redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";

export const dynamic = "force-dynamic";

export default async function AdminProfileRedirectPage() {
  const session = await requireCapabilityPage("dashboard.view", "/admin/profile");
  const self = await getSelfStaffWorkspace(session.userId);

  if (self.workspaceId) {
    redirect(`/admin/workspaces/${self.workspaceId}/profile`);
  }

  if (self.isSuperAdmin) {
    redirect("/admin/workspaces");
  }

  redirect("/admin/command-center");
}
