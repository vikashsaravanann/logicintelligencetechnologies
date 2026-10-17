import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import ManageWorkspaceClient from "./ManageWorkspaceClient";

export const metadata: Metadata = {
  title: "Manage Workspace | Staff Workspace | Logic Intelligence Technologies",
  description: "Super Admin controls for staff workspace status, invitation resend, and access governance.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ManageWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Strictly require team.manage (Super Admin only capability)
  const session = await requireCapabilityPage("team.manage", `/admin/workspaces/${id}/manage`);

  let workspace;
  try {
    workspace = await getStaffWorkspace(id, session.userId);
  } catch (err: any) {
    if (err?.message?.includes("NOT_FOUND")) notFound();
    throw err;
  }

  return <ManageWorkspaceClient workspace={workspace} />;
}
