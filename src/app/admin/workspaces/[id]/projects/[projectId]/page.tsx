import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import {
  getEngagementByRef,
  getEngagementStages,
} from "@/lib/engagements/db";
import {
  redactJourneyForStaff,
  redactChangeRequestsForStaff,
} from "@/lib/engagements/redaction";
import { getProjectTeamMembers } from "@/lib/collaboration/project-collaboration-service";
import { listProjectChangeRequests } from "@/lib/client-portal/v4-actions";
import { listClientMessages } from "@/lib/client-portal/messages";
import StaffProjectDetailClient from "./StaffProjectDetailClient";

export const metadata: Metadata = {
  title: "Project Delivery Inspection | Staff Workspace | Logic Intelligence Technologies",
  description: "Assigned client engagement lifecycle gates and engineering collaboration.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceProjectInspectionPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const session = await requireCapabilityPage(
    "dashboard.view",
    `/admin/workspaces/${id}/projects/${projectId}`
  );

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

  const engagement = await getEngagementByRef(projectId);
  if (!engagement) {
    notFound();
  }

  const isSuperAdmin = session.role === "super_admin";
  const isAssigned = workspace.assignedEngagements.some(
    (e) => e.engagementId === engagement.id
  );

  if (!isSuperAdmin && !isAssigned) {
    redirect("/admin/forbidden?need=project_assignment_or_super_admin");
  }

  const rawStages = await getEngagementStages(engagement.id);
  const redactedStages = redactJourneyForStaff(rawStages, isSuperAdmin);

  const teamMembers = await getProjectTeamMembers(engagement.id);
  const rawProjectRfcs = await listProjectChangeRequests(engagement.engagement_ref);
  const redactedRfcs = redactChangeRequestsForStaff(rawProjectRfcs, isSuperAdmin);
  const threadResult = await listClientMessages(engagement.contact_email);

  // Check if caller can invite collaborators (primary lead or super admin)
  const userAssignment = teamMembers.find((m) => m.userId === session.userId);
  const canInvite = isSuperAdmin || Boolean(userAssignment?.canInviteCollaborators);

  return (
    <StaffProjectDetailClient
      workspace={workspace}
      engagement={engagement}
      stages={redactedStages}
      teamMembers={teamMembers}
      changeRequests={redactedRfcs}
      initialMessages={threadResult.messages}
      canInvite={canInvite}
      callerUserId={session.userId}
    />
  );
}
