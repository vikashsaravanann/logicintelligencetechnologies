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
  const { data: leads } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .ilike("message", "%VoiceShield%")
    .order("created_at", { ascending: false });

  return (
    <>
      <BackToHome href="/admin/command-center" label="Back to Command Center" inline />
      <VoiceShieldRequestsClient leads={leads ?? []} />
    </>
  );
}
