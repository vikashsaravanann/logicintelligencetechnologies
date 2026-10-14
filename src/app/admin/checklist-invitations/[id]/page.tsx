import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";
import ChecklistDetailClient from "./checklist-detail-client";
import { AdminBackLink } from "../../components/AdminBackLink";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Checklist Review & Technical Scoping | Admin | Logic Intelligence Technologies",
  description: "Review client 50-point checklist selections and generate aligned proposal drafts.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminChecklistDetailPage({ params }: Props) {
  await requireCapabilityPage("checklists.read", "/admin/checklist-invitations");
  const { id } = await params;

  // 1. Fetch invitation
  const { data: invitation, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select(
      `id, recipient_name, recipient_email, recipient_company, status, expires_at, sent_at,
       sent_count, viewed_at, submitted_at, created_at, proposal_id, internal_notes`
    )
    .eq("id", id)
    .single();

  if (error || !invitation) {
    notFound();
  }

  // 2. Fetch response (if submitted)
  let responseData = null;
  const { data: response } = await supabaseAdmin
    .from("enterprise_checklist_responses")
    .select("id, confirmation_reference, selected_count, submitted_at, client_notes")
    .eq("invitation_id", id)
    .maybeSingle();

  if (response) {
    const { data: items } = await supabaseAdmin
      .from("enterprise_checklist_response_items")
      .select("point_number")
      .eq("response_id", response.id)
      .order("point_number", { ascending: true });

    responseData = {
      ...response,
      selectedPoints: (items || []).map((i) => i.point_number),
    };
  }

  // 3. Fetch reviews
  const { data: reviews } = await supabaseAdmin
    .from("enterprise_checklist_reviews")
    .select("id, reviewed_by, review_notes, created_at")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminBackLink href="/admin/checklist-invitations" label="Checklist Invitations" />
      <ChecklistDetailClient
        invitation={invitation}
        response={responseData}
        reviews={reviews || []}
        checkpoints={ENTERPRISE_CHECKPOINTS}
        phases={ENTERPRISE_PHASES}
      />
    </div>
  );
}
