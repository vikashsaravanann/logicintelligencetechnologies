import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import ProfileManagerClient from "./ProfileManagerClient";

export const metadata: Metadata = {
  title: "Staff Profile | Logic Intelligence Technologies",
  description: "Official staff member identity, professional portrait, and contact details.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCapabilityPage("dashboard.view", `/admin/workspaces/${id}/profile`);

  let workspace;
  try {
    workspace = await getStaffWorkspace(id, session.userId);
  } catch (err: any) {
    if (err?.message?.includes("NOT_FOUND")) notFound();
    if (err?.message?.includes("FORBIDDEN")) {
      redirect("/admin/forbidden?need=workspace_ownership_or_super_admin");
    }
    throw err;
  }

  return <ProfileManagerClient workspace={workspace} />;
}
