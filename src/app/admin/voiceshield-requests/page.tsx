import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { VoiceShieldRequestsClient } from "./client";

export const metadata: Metadata = {
  title: "VoiceShield Access Requests | Admin Command Center",
};

export const revalidate = 0;

import BackToHome from "@/components/ui/back-to-home";

export default async function VoiceShieldRequestsPage() {
  await requireCapabilityPage("voiceshield.read", "/admin/voiceshield-requests");
  // Match the structured project_type first (the VoiceShield request form sets
  // it), with a message fallback for older free-text leads.
  const { data: leads } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .or("project_type.eq.VoiceShield Access Request,message.ilike.*VoiceShield*")
    .order("created_at", { ascending: false });

  return (
    <>
      <BackToHome href="/admin/command-center" label="Back to Command Center" inline />
      <VoiceShieldRequestsClient leads={leads ?? []} />
    </>
  );
}
