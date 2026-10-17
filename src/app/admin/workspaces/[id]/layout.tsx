import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import WorkspaceHeaderTabs from "./WorkspaceHeaderTabs";

export const dynamic = "force-dynamic";

export default async function WorkspaceDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireStaffPage(`/admin/workspaces/${id}`);

  let workspace;
  try {
    workspace = await getStaffWorkspace(id, session.userId);
  } catch (err: any) {
    if (err?.message?.includes("NOT_FOUND")) {
      notFound();
    }
    if (err?.message?.includes("FORBIDDEN")) {
      redirect("/admin/forbidden?need=workspace_ownership_or_super_admin");
    }
    throw err;
  }

  return (
    <div className="space-y-6">
      <AdminBackLink
        href={session.role === "super_admin" ? "/admin/workspaces" : "/admin/command-center"}
        label={session.role === "super_admin" ? "Staff Workspaces Directory" : "Command Center"}
      />

      <WorkspaceHeaderTabs workspace={workspace} />

      <main>{children}</main>
    </div>
  );
}
