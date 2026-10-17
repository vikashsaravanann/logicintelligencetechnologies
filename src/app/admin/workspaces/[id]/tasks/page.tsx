import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import TasksManagerClient from "./TasksManagerClient";

export const metadata: Metadata = {
  title: "Assigned Tasks | Staff Workspace | Logic Intelligence Technologies",
  description: "Track and manage assigned technical tasks and delivery milestones.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCapabilityPage("dashboard.view", `/admin/workspaces/${id}/tasks`);

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

  return (
    <TasksManagerClient
      workspaceId={id}
      initialTasks={workspace.tasks || []}
    />
  );
}
