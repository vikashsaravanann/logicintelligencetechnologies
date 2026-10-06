"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Create (or reuse) a client from an Approved proposal, then start a draft SOW
 * contract and a draft SOW document. Audited at each step; redirects to the new
 * client detail page on success.
 */
export async function startContractFromProposal(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("clients.write", "client.start_contract");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const proposalId = String(formData.get("proposalId") ?? "");
  if (!UUID.test(proposalId)) throw new Error("Invalid proposal id");

  let clientId = "";
  try {
    const { data: proposal, error: propErr } = await supabaseAdmin
      .from("proposals")
      .select("id, client_name, client_email, client_company, status")
      .eq("id", proposalId)
      .maybeSingle();
    if (propErr) throw new Error("Could not load the proposal.");
    if (!proposal) throw new Error("Proposal not found.");
    if (proposal.status !== "Approved") throw new Error("Only an approved proposal can start a contract.");

    const legalName = proposal.client_company || proposal.client_name || "Unnamed client";

    // Reuse an existing client for this proposal if one exists.
    const { data: existing } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("source_proposal_id", proposalId)
      .maybeSingle();

    if (existing) {
      clientId = existing.id;
    } else {
      const { data: clientCode, error: codeErr } = await supabaseAdmin.rpc("next_reference", { p_prefix: "LIT-CLI" });
      if (codeErr || !clientCode) throw new Error("Could not allocate a client code.");
      const { data: created, error: createErr } = await supabaseAdmin
        .from("clients")
        .insert({
          client_code: clientCode,
          legal_name: legalName,
          display_name: proposal.client_name,
          contact_email: proposal.client_email,
          status: "prospect",
          source_proposal_id: proposalId,
        })
        .select("id")
        .single();
      if (createErr || !created) throw new Error("Could not create the client.");
      clientId = created.id;
    }

    // Contract reference, reused as the document reference.
    const { data: contractRef, error: refErr } = await supabaseAdmin.rpc("next_reference", { p_prefix: "LIT-SOW" });
    if (refErr || !contractRef) throw new Error("Could not allocate a contract reference.");

    const { data: contract, error: contractErr } = await supabaseAdmin
      .from("client_contracts")
      .insert({
        client_id: clientId,
        reference: contractRef,
        contract_type: "SOW",
        status: "draft",
        created_by: session.userId,
      })
      .select("id")
      .single();
    if (contractErr || !contract) throw new Error("Could not create the contract.");

    const { error: docErr } = await supabaseAdmin.from("client_documents").insert({
      client_id: clientId,
      contract_id: contract.id,
      doc_type: "sow",
      reference: contractRef,
      title: `SOW for ${legalName}`,
      status: "draft",
      classification: "client_confidential",
      author_id: session.userId,
    });
    if (docErr) throw new Error("Could not create the SOW document.");

    await recordAdminAction({
      actor,
      action: "client.start_contract",
      capability: "clients.write",
      target: { type: "client", id: clientId },
      outcome: "succeeded",
      metadata: { proposalId, contractId: contract.id },
    });
  } catch (err) {
    await recordAdminAction({
      actor,
      action: "client.start_contract",
      capability: "clients.write",
      target: { type: "proposal", id: proposalId },
      outcome: "failed",
      errorCode: "start_contract_failed",
    });
    throw err instanceof Error ? err : new Error("Could not start the contract.");
  }

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${clientId}`);
}
