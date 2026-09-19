import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { VoiceShieldRequestsClient } from "./client";

export const metadata: Metadata = {
  title: "VoiceShield Access Requests | Admin Command Center",
};

export const revalidate = 0;

export default async function VoiceShieldRequestsPage() {
  const { data: leads } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .ilike("message", "%VoiceShield%")
    .order("created_at", { ascending: false });

  return <VoiceShieldRequestsClient leads={leads ?? []} />;
}
